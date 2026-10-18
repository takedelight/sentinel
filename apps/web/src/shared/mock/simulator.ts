"use client";

import { useSyncExternalStore } from "react";

import type { Device, DeviceStatus, ProcessInfo, SentinelEvent, TelemetryPoint } from "./types";

import {
  EVENTS_LIMIT,
  HISTORY_LENGTH,
  PROCESS_TEMPLATES,
  REBOOT_TICKS,
  TICK_MS,
  TICK_SECONDS,
  createInitialState,
  type ProcessTemplate,
  type SimulatorState,
} from "./data";

export type KillSignal = "SIGTERM" | "SIGKILL";

export type KillOutcome = { ok: true } | { ok: false; reason: "ignored" | "missing" };

export type Snapshot = SimulatorState;

type EventDraft = Omit<SentinelEvent, "id" | "at">;

const OUTAGE_CHANCE = 0.002;

let snapshot: Snapshot = createInitialState();
let nextPid = 95_000;
let nextEventId = 1_000;
let tickerStarted = false;

const listeners = new Set<() => void>();
const EMPTY_PROCESSES: ProcessInfo[] = [];
const EMPTY_TELEMETRY: TelemetryPoint[] = [];

function getSnapshot(): Snapshot {
  return snapshot;
}

function emit(next: Snapshot): void {
  snapshot = next;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  ensureTicker();

  return () => {
    listeners.delete(listener);
  };
}

function ensureTicker(): void {
  if (tickerStarted || typeof window === "undefined") {
    return;
  }

  tickerStarted = true;
  window.setInterval(() => {
    const next = simulateTick(snapshot);

    if (next !== snapshot) {
      emit(next);
    }
  }, TICK_MS);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function makeEvent(draft: EventDraft): SentinelEvent {
  nextEventId += 1;

  return { ...draft, id: nextEventId, at: Date.now() };
}

function appendEvents(
  current: Snapshot,
  drafts: EventDraft[],
): Pick<SimulatorState, "events" | "unseenEvents"> {
  if (drafts.length === 0) {
    return { events: current.events, unseenEvents: current.unseenEvents };
  }

  const added = drafts.map(makeEvent);

  return {
    events: [...added.toReversed(), ...current.events].slice(0, EVENTS_LIMIT),
    unseenEvents: current.unseenEvents + added.length,
  };
}

function simulateDevice(device: Device): Device {
  if (device.status === "offline") {
    return device;
  }

  const cpu = clamp(
    device.cpu + randomBetween(-9, 9) + (Math.random() < 0.06 ? randomBetween(4, 22) : 0),
    2,
    98,
  );
  const ram = clamp(device.ram + randomBetween(-5, 5), 6, 97);
  const disk = clamp(device.disk + (Math.random() < 0.04 ? randomBetween(0.02, 0.12) : 0), 1, 97);
  const netIn = clamp(device.netIn + randomBetween(-26, 26), 2, 940);
  const netOut = clamp(device.netOut + randomBetween(-22, 22), 2, 940);
  const cpuThreshold = device.status === "warning" ? 80 : 85;
  const status: DeviceStatus = cpu >= cpuThreshold || ram >= 92 ? "warning" : "online";

  return {
    ...device,
    cpu,
    ram,
    disk,
    netIn,
    netOut,
    uptimeSec: device.uptimeSec + TICK_SECONDS,
    status,
  };
}

function jitterProcess(process: ProcessInfo): ProcessInfo {
  if (process.state === "zombie") {
    return { ...process, startedAgoSec: process.startedAgoSec + TICK_SECONDS };
  }

  const cpu = clamp(
    process.cpu * randomBetween(0.55, 1.45) + (Math.random() < 0.08 ? randomBetween(0, 14) : 0),
    0,
    99,
  );
  const ramMb = clamp(process.ramMb * randomBetween(0.96, 1.04), 2, 8192);

  return {
    ...process,
    cpu,
    ramMb,
    state: cpu > 8 ? "running" : "sleeping",
    startedAgoSec: process.startedAgoSec + TICK_SECONDS,
  };
}

function spawnProcess(device: Device): ProcessInfo {
  const pool = PROCESS_TEMPLATES.filter(
    (template) =>
      !template.system && (!template.profiles || template.profiles.includes(device.profile)),
  );
  const template =
    pool[Math.floor(Math.random() * pool.length)] ?? (PROCESS_TEMPLATES[0] as ProcessTemplate);

  nextPid += 1 + Math.floor(Math.random() * 6);

  const cpu = randomBetween(template.cpu[0], template.cpu[1]);

  return {
    pid: nextPid,
    name: template.name,
    user: template.user,
    cpu,
    ramMb: Math.round(randomBetween(template.ram[0], template.ram[1])),
    state: cpu > 8 ? "running" : "sleeping",
    startedAgoSec: Math.floor(randomBetween(5, 600)),
    system: template.system,
  };
}

function simulateProcesses(device: Device, processes: ProcessInfo[]): ProcessInfo[] {
  if (processes.length === 0) {
    return processes;
  }

  let next = processes.map(jitterProcess);

  if (next.length < 110 && Math.random() < 0.05) {
    next = [...next, spawnProcess(device)].toSorted((a, b) => a.pid - b.pid);
  }

  if (next.length > 40 && Math.random() < 0.04) {
    const candidates = next.filter((process) => !process.system);

    if (candidates.length > 0) {
      const victim = candidates[Math.floor(Math.random() * candidates.length)];
      next = next.filter((process) => process.pid !== victim?.pid);
    }
  }

  return next;
}

function simulateTick(current: Snapshot): Snapshot {
  if (current.paused) {
    return current;
  }

  const drafts: EventDraft[] = [];
  const rebootTicks: Record<string, number> = {};

  const devices = current.devices.map((device) => {
    const ticksLeft = current.rebootTicks[device.id] ?? 0;

    if (ticksLeft > 0) {
      if (ticksLeft > 1) {
        rebootTicks[device.id] = ticksLeft - 1;
        return device;
      }

      drafts.push({
        severity: "success",
        kind: "status",
        deviceId: device.id,
        deviceName: device.name,
        message: `Вузол ${device.name} знову в мережі після перезавантаження`,
      });

      return {
        ...device,
        status: "online" as const,
        cpu: Math.round(randomBetween(6, 18)),
        ram: Math.round(randomBetween(16, 28)),
        uptimeSec: 0,
      };
    }

    if (device.status === "offline") {
      return device;
    }

    const next = simulateDevice(device);

    if (device.status !== "warning" && next.status === "warning") {
      drafts.push({
        severity: "warning",
        kind: "status",
        deviceId: device.id,
        deviceName: device.name,
        message: `Високе навантаження на ${device.name}: ЦП ${Math.round(next.cpu)} %`,
      });
    } else if (device.status === "warning" && next.status === "online") {
      drafts.push({
        severity: "success",
        kind: "status",
        deviceId: device.id,
        deviceName: device.name,
        message: `Навантаження на ${device.name} нормалізувалося`,
      });
    }

    if (device.disk < 90 && next.disk >= 90) {
      drafts.push({
        severity: "warning",
        kind: "system",
        deviceId: device.id,
        deviceName: device.name,
        message: `Диск ${device.name} заповнено на ${Math.round(next.disk)} %`,
      });
    }

    if (next.status === "online" && Math.random() < OUTAGE_CHANCE) {
      drafts.push({
        severity: "error",
        kind: "status",
        deviceId: device.id,
        deviceName: device.name,
        message: `Вузол ${device.name} втратив зв’язок — очікується автоперезавантаження`,
      });

      rebootTicks[device.id] = REBOOT_TICKS;

      return { ...next, status: "offline" as const };
    }

    return next;
  });

  const processes: Record<string, ProcessInfo[]> = { ...current.processes };
  const history: Record<string, TelemetryPoint[]> = { ...current.history };

  for (const device of devices) {
    if (device.status === "offline") {
      continue;
    }

    processes[device.id] = simulateProcesses(device, processes[device.id] ?? EMPTY_PROCESSES);

    const point: TelemetryPoint = {
      cpu: device.cpu,
      ram: device.ram,
      netIn: device.netIn,
      netOut: device.netOut,
    };
    history[device.id] = [...(history[device.id] ?? []), point].slice(-HISTORY_LENGTH);
  }

  const { events, unseenEvents } = appendEvents(current, drafts);

  return { ...current, devices, processes, history, events, unseenEvents, rebootTicks };
}

export function killProcess(
  deviceId: string,
  pid: number,
  signal: KillSignal,
): Promise<KillOutcome> {
  return new Promise((resolve) => {
    const timeout = randomBetween(450, 950);

    window.setTimeout(() => {
      const processes = snapshot.processes[deviceId] ?? EMPTY_PROCESSES;
      const process = processes.find((item) => item.pid === pid);

      if (!process) {
        resolve({ ok: false, reason: "missing" });
        return;
      }

      const deviceName =
        snapshot.devices.find((device) => device.id === deviceId)?.name ?? deviceId;

      if (signal === "SIGTERM" && process.system && Math.random() < 0.45) {
        const { events, unseenEvents } = appendEvents(snapshot, [
          {
            severity: "warning",
            kind: "process",
            deviceId,
            deviceName,
            message: `Процес ${process.name} (PID ${process.pid}) проігнорував SIGTERM`,
          },
        ]);

        emit({ ...snapshot, events, unseenEvents });
        resolve({ ok: false, reason: "ignored" });
        return;
      }

      const { events, unseenEvents } = appendEvents(snapshot, [
        {
          severity: "success",
          kind: "process",
          deviceId,
          deviceName,
          message: `Процес ${process.name} (PID ${process.pid}) завершено сигналом ${signal}`,
        },
      ]);

      emit({
        ...snapshot,
        processes: {
          ...snapshot.processes,
          [deviceId]: processes.filter((item) => item.pid !== pid),
        },
        events,
        unseenEvents,
      });
      resolve({ ok: true });
    }, timeout);
  });
}

export function rebootDevice(deviceId: string): boolean {
  const device = snapshot.devices.find((item) => item.id === deviceId);

  if (!device || device.status === "offline" || (snapshot.rebootTicks[deviceId] ?? 0) > 0) {
    return false;
  }

  const { events, unseenEvents } = appendEvents(snapshot, [
    {
      severity: "info",
      kind: "system",
      deviceId: device.id,
      deviceName: device.name,
      message: `Ініційовано перезавантаження ${device.name}`,
    },
  ]);

  emit({
    ...snapshot,
    devices: snapshot.devices.map((item) =>
      item.id === deviceId ? { ...item, status: "offline" as const } : item,
    ),
    rebootTicks: { ...snapshot.rebootTicks, [deviceId]: REBOOT_TICKS },
    events,
    unseenEvents,
  });

  return true;
}

export function setPaused(paused: boolean): void {
  if (snapshot.paused === paused) {
    return;
  }

  emit({ ...snapshot, paused });
}

export function markEventsSeen(): void {
  if (snapshot.unseenEvents === 0) {
    return;
  }

  emit({ ...snapshot, unseenEvents: 0 });
}

export function useDevices(): Device[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).devices;
}

export function useDevice(deviceId: string): Device | undefined {
  return useDevices().find((device) => device.id === deviceId);
}

export function useProcesses(deviceId: string): ProcessInfo[] {
  const snapshotState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return snapshotState.processes[deviceId] ?? EMPTY_PROCESSES;
}

export function useTelemetry(deviceId: string): TelemetryPoint[] {
  const snapshotState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return snapshotState.history[deviceId] ?? EMPTY_TELEMETRY;
}

export function useEvents(): SentinelEvent[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).events;
}

export function useUnseenEvents(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).unseenEvents;
}

export function usePaused(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).paused;
}

export function useRebooting(deviceId: string): boolean {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return (state.rebootTicks[deviceId] ?? 0) > 0;
}
