import type {
  Device,
  DeviceGroup,
  DeviceProfile,
  DeviceStatus,
  ProcessInfo,
  ProcessState,
  SentinelEvent,
  TelemetryPoint,
} from "./types";

export const TICK_MS = 2500;
export const TICK_SECONDS = TICK_MS / 1000;
export const HISTORY_LENGTH = 60;
export const EVENTS_LIMIT = 200;
export const REBOOT_TICKS = 5;

export const GROUPS: DeviceGroup[] = [
  { id: "production", name: "Продакшн" },
  { id: "databases", name: "Бази даних" },
  { id: "staging", name: "Стейджинг" },
  { id: "edge", name: "Периметр" },
];

function mulberry32(seed: number): () => number {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface DeviceSeed {
  id: string;
  name: string;
  ip: string;
  os: string;
  groupId: string;
  profile: DeviceProfile;
  cores: number;
  ramTotalGb: number;
  diskTotalGb: number;
  disk: number;
  cpu: number;
  ram: number;
  netIn: number;
  netOut: number;
  uptimeSec: number;
  status: DeviceStatus;
}

const DEVICE_SEEDS: DeviceSeed[] = [
  {
    id: "web-01",
    name: "web-01",
    ip: "10.10.1.11",
    os: "Ubuntu 24.04 LTS",
    groupId: "production",
    profile: "web",
    cores: 8,
    ramTotalGb: 16,
    diskTotalGb: 240,
    disk: 47,
    cpu: 23,
    ram: 38,
    netIn: 140,
    netOut: 212,
    uptimeSec: 2_419_200,
    status: "online",
  },
  {
    id: "web-02",
    name: "web-02",
    ip: "10.10.1.12",
    os: "Ubuntu 24.04 LTS",
    groupId: "production",
    profile: "web",
    cores: 8,
    ramTotalGb: 16,
    diskTotalGb: 240,
    disk: 52,
    cpu: 27,
    ram: 41,
    netIn: 162,
    netOut: 236,
    uptimeSec: 3_024_000,
    status: "online",
  },
  {
    id: "api-01",
    name: "api-01",
    ip: "10.10.1.21",
    os: "Ubuntu 24.04 LTS",
    groupId: "production",
    profile: "api",
    cores: 8,
    ramTotalGb: 16,
    diskTotalGb: 240,
    disk: 63,
    cpu: 31,
    ram: 46,
    netIn: 244,
    netOut: 268,
    uptimeSec: 1_209_600,
    status: "online",
  },
  {
    id: "api-02",
    name: "api-02",
    ip: "10.10.1.22",
    os: "Ubuntu 24.04 LTS",
    groupId: "production",
    profile: "api",
    cores: 8,
    ramTotalGb: 16,
    diskTotalGb: 240,
    disk: 61,
    cpu: 28,
    ram: 44,
    netIn: 228,
    netOut: 252,
    uptimeSec: 1_036_800,
    status: "online",
  },
  {
    id: "worker-01",
    name: "worker-01",
    ip: "10.10.1.31",
    os: "Ubuntu 24.04 LTS",
    groupId: "production",
    profile: "worker",
    cores: 16,
    ramTotalGb: 32,
    diskTotalGb: 480,
    disk: 58,
    cpu: 62,
    ram: 66,
    netIn: 64,
    netOut: 42,
    uptimeSec: 4_838_400,
    status: "online",
  },
  {
    id: "db-primary",
    name: "db-primary",
    ip: "10.10.2.11",
    os: "Debian 12",
    groupId: "databases",
    profile: "database",
    cores: 16,
    ramTotalGb: 64,
    diskTotalGb: 1024,
    disk: 71,
    cpu: 44,
    ram: 72,
    netIn: 96,
    netOut: 148,
    uptimeSec: 9_676_800,
    status: "online",
  },
  {
    id: "db-replica",
    name: "db-replica",
    ip: "10.10.2.12",
    os: "Debian 12",
    groupId: "databases",
    profile: "database",
    cores: 16,
    ramTotalGb: 64,
    diskTotalGb: 1024,
    disk: 74,
    cpu: 37,
    ram: 69,
    netIn: 128,
    netOut: 58,
    uptimeSec: 6_912_000,
    status: "online",
  },
  {
    id: "cache-01",
    name: "cache-01",
    ip: "10.10.2.21",
    os: "Debian 12",
    groupId: "databases",
    profile: "cache",
    cores: 4,
    ramTotalGb: 8,
    diskTotalGb: 80,
    disk: 44,
    cpu: 18,
    ram: 55,
    netIn: 302,
    netOut: 384,
    uptimeSec: 1_728_000,
    status: "online",
  },
  {
    id: "staging-web",
    name: "staging-web",
    ip: "10.10.3.11",
    os: "Ubuntu 22.04 LTS",
    groupId: "staging",
    profile: "web",
    cores: 4,
    ramTotalGb: 8,
    diskTotalGb: 120,
    disk: 31,
    cpu: 12,
    ram: 24,
    netIn: 42,
    netOut: 66,
    uptimeSec: 259_200,
    status: "online",
  },
  {
    id: "staging-api",
    name: "staging-api",
    ip: "10.10.3.12",
    os: "Ubuntu 22.04 LTS",
    groupId: "staging",
    profile: "api",
    cores: 4,
    ramTotalGb: 8,
    diskTotalGb: 120,
    disk: 35,
    cpu: 16,
    ram: 33,
    netIn: 58,
    netOut: 74,
    uptimeSec: 172_800,
    status: "warning",
  },
  {
    id: "edge-kyiv",
    name: "edge-kyiv",
    ip: "10.10.4.11",
    os: "Debian 12",
    groupId: "edge",
    profile: "edge",
    cores: 4,
    ramTotalGb: 8,
    diskTotalGb: 80,
    disk: 22,
    cpu: 21,
    ram: 34,
    netIn: 186,
    netOut: 154,
    uptimeSec: 3_456_000,
    status: "online",
  },
  {
    id: "edge-lviv",
    name: "edge-lviv",
    ip: "10.10.4.12",
    os: "Debian 12",
    groupId: "edge",
    profile: "edge",
    cores: 4,
    ramTotalGb: 8,
    diskTotalGb: 80,
    disk: 18,
    cpu: 26,
    ram: 29,
    netIn: 92,
    netOut: 88,
    uptimeSec: 1_209_600,
    status: "offline",
  },
];

export interface ProcessTemplate {
  name: string;
  user: string;
  system: boolean;
  profiles?: DeviceProfile[];
  multiple?: boolean;
  cpu: [number, number];
  ram: [number, number];
}

export const PROCESS_TEMPLATES: ProcessTemplate[] = [
  { name: "systemd", user: "root", system: true, cpu: [0, 0.4], ram: [9, 14] },
  {
    name: "systemd-journald",
    user: "root",
    system: true,
    cpu: [0.2, 1.6],
    ram: [34, 58],
  },
  {
    name: "systemd-resolved",
    user: "systemd-resolve",
    system: true,
    cpu: [0, 0.5],
    ram: [10, 18],
  },
  { name: "sshd", user: "root", system: true, cpu: [0, 0.6], ram: [6, 11] },
  { name: "cron", user: "root", system: true, cpu: [0, 0.2], ram: [3, 5] },
  {
    name: "rsyslogd",
    user: "syslog",
    system: true,
    cpu: [0.1, 1.2],
    ram: [8, 16],
  },
  {
    name: "dbus-daemon",
    user: "messagebus",
    system: true,
    cpu: [0, 0.3],
    ram: [5, 9],
  },
  {
    name: "dockerd",
    user: "root",
    system: true,
    cpu: [0.4, 3.5],
    ram: [86, 148],
  },
  {
    name: "containerd",
    user: "root",
    system: true,
    cpu: [0.2, 2],
    ram: [42, 88],
  },
  {
    name: "kworker/u16:2",
    user: "root",
    system: true,
    multiple: true,
    cpu: [0.2, 2.4],
    ram: [1, 3],
  },
  {
    name: "ksoftirqd/0",
    user: "root",
    system: true,
    cpu: [0.1, 1.8],
    ram: [1, 3],
  },
  {
    name: "fail2ban-server",
    user: "root",
    system: true,
    cpu: [0, 1.4],
    ram: [18, 30],
  },
  {
    name: "unattended-upgr",
    user: "root",
    system: true,
    cpu: [0, 2.5],
    ram: [12, 24],
  },
  {
    name: "chronyd",
    user: "_chrony",
    system: true,
    cpu: [0, 0.3],
    ram: [3, 6],
  },
  {
    name: "nginx: master process",
    user: "root",
    system: false,
    profiles: ["web", "edge"],
    cpu: [0, 0.8],
    ram: [8, 15],
  },
  {
    name: "nginx: worker process",
    user: "www-data",
    system: false,
    profiles: ["web", "edge"],
    multiple: true,
    cpu: [0.4, 11],
    ram: [12, 44],
  },
  {
    name: "caddy",
    user: "caddy",
    system: false,
    profiles: ["web", "edge"],
    cpu: [0.4, 7],
    ram: [18, 58],
  },
  {
    name: "node",
    user: "deploy",
    system: false,
    profiles: ["web", "api"],
    multiple: true,
    cpu: [3, 30],
    ram: [180, 620],
  },
  {
    name: "bun",
    user: "deploy",
    system: false,
    profiles: ["web", "api"],
    multiple: true,
    cpu: [2, 24],
    ram: [95, 330],
  },
  {
    name: "gunicorn",
    user: "deploy",
    system: false,
    profiles: ["api"],
    multiple: true,
    cpu: [3, 26],
    ram: [150, 480],
  },
  {
    name: "uvicorn",
    user: "deploy",
    system: false,
    profiles: ["api", "web"],
    multiple: true,
    cpu: [2, 20],
    ram: [120, 380],
  },
  {
    name: "postgres",
    user: "postgres",
    system: false,
    profiles: ["database"],
    cpu: [2, 26],
    ram: [240, 880],
  },
  {
    name: "postgres: checkpointer",
    user: "postgres",
    system: false,
    profiles: ["database"],
    cpu: [0, 3],
    ram: [62, 170],
  },
  {
    name: "postgres: walwriter",
    user: "postgres",
    system: false,
    profiles: ["database"],
    cpu: [0.5, 4],
    ram: [44, 118],
  },
  {
    name: "postgres: autovacuum launcher",
    user: "postgres",
    system: false,
    profiles: ["database"],
    cpu: [0, 7],
    ram: [28, 84],
  },
  {
    name: "postgres: stats collector",
    user: "postgres",
    system: false,
    profiles: ["database"],
    cpu: [0, 2],
    ram: [20, 48],
  },
  {
    name: "redis-server *:6379",
    user: "redis",
    system: false,
    profiles: ["cache"],
    cpu: [1, 9],
    ram: [120, 460],
  },
  {
    name: "celery",
    user: "deploy",
    system: false,
    profiles: ["worker"],
    multiple: true,
    cpu: [4, 38],
    ram: [210, 700],
  },
  {
    name: "gitlab-runner",
    user: "gitlab-runner",
    system: false,
    cpu: [0.5, 11],
    ram: [55, 170],
  },
  {
    name: "prometheus",
    user: "prom",
    system: false,
    profiles: ["web", "api", "database"],
    cpu: [1, 7],
    ram: [140, 330],
  },
  {
    name: "node_exporter",
    user: "prom",
    system: false,
    cpu: [0, 1.2],
    ram: [12, 28],
  },
  {
    name: "telegraf",
    user: "telegraf",
    system: false,
    cpu: [0.2, 2.6],
    ram: [28, 80],
  },
  {
    name: "vector",
    user: "vector",
    system: false,
    cpu: [0.4, 4.6],
    ram: [38, 130],
  },
  {
    name: "containerd-shim",
    user: "root",
    system: false,
    multiple: true,
    cpu: [0, 1.8],
    ram: [9, 28],
  },
  {
    name: "backup-agent",
    user: "root",
    system: false,
    cpu: [0, 6],
    ram: [36, 110],
  },
];

function generateProcesses(seed: DeviceSeed, rng: () => number): ProcessInfo[] {
  const templates = PROCESS_TEMPLATES.filter(
    (template) => !template.profiles || template.profiles.includes(seed.profile),
  );
  const singles = templates.filter((template) => !template.multiple);
  const multis = templates.filter((template) => template.multiple);

  const target = 42 + Math.floor(rng() * 36);
  const items: ProcessInfo[] = [];
  let pid = 380 + Math.floor(rng() * 260);

  const nextPid = (): number => {
    pid += 1 + Math.floor(rng() * 6);
    return pid;
  };

  const build = (template: ProcessTemplate): ProcessInfo => {
    const cpu = template.cpu[0] + rng() * (template.cpu[1] - template.cpu[0]);
    const zombie = !template.system && rng() < 0.012;
    const state: ProcessState = zombie ? "zombie" : cpu > 8 ? "running" : "sleeping";

    return {
      pid: nextPid(),
      name: template.name,
      user: template.user,
      cpu: zombie ? 0 : cpu,
      ramMb: Math.round(template.ram[0] + rng() * (template.ram[1] - template.ram[0])),
      state,
      startedAgoSec: Math.floor(300 + rng() * 250_000),
      system: template.system,
    };
  };

  for (const template of singles) {
    items.push(build(template));
  }

  const fillers = multis.length > 0 ? multis : singles;
  let index = 0;

  while (items.length < target && fillers.length > 0) {
    const template = fillers[index % fillers.length];
    index += 1;

    if (!template) break;

    items.push(build(template));
  }

  return items.toSorted((a, b) => a.pid - b.pid);
}

function seedHistory(device: Device, rng: () => number): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  let cpu = device.cpu;
  let ram = device.ram;
  let netIn = device.netIn;
  let netOut = device.netOut;

  for (let index = 0; index < HISTORY_LENGTH; index += 1) {
    points.push({ cpu, ram, netIn, netOut });
    cpu = clamp(cpu + (rng() - 0.5) * 16, 2, 98);
    ram = clamp(ram + (rng() - 0.5) * 9, 3, 97);
    netIn = clamp(netIn + (rng() - 0.5) * 44, 1, 940);
    netOut = clamp(netOut + (rng() - 0.5) * 36, 1, 940);
  }

  return points.toReversed();
}

export interface SimulatorState {
  devices: Device[];
  processes: Record<string, ProcessInfo[]>;
  history: Record<string, TelemetryPoint[]>;
  events: SentinelEvent[];
  unseenEvents: number;
  rebootTicks: Record<string, number>;
  paused: boolean;
}

function buildInitialEvents(): { events: SentinelEvent[]; unseenEvents: number } {
  const now = Date.now();

  const drafts: Array<{ agoMs: number; draft: Omit<SentinelEvent, "id" | "at"> }> = [
    {
      agoMs: 47 * 60_000,
      draft: {
        severity: "error",
        kind: "status",
        deviceId: "edge-lviv",
        deviceName: "edge-lviv",
        message: "Вузол edge-lviv втратив зв’язок — потрібне втручання",
      },
    },
    {
      agoMs: 31 * 60_000,
      draft: {
        severity: "warning",
        kind: "process",
        deviceId: "web-02",
        deviceName: "web-02",
        message: "Процес nginx: worker process (PID 512) проігнорував SIGTERM",
      },
    },
    {
      agoMs: 24 * 60_000,
      draft: {
        severity: "info",
        kind: "process",
        deviceId: "worker-01",
        deviceName: "worker-01",
        message: "Процес celery (PID 812) завершено сигналом SIGKILL",
      },
    },
    {
      agoMs: 16 * 60_000,
      draft: {
        severity: "warning",
        kind: "status",
        deviceId: "staging-api",
        deviceName: "staging-api",
        message: "Високе навантаження на staging-api: ЦП 87 %",
      },
    },
    {
      agoMs: 11 * 60_000,
      draft: {
        severity: "success",
        kind: "system",
        deviceId: "db-primary",
        deviceName: "db-primary",
        message: "Резервну копію db-primary створено успішно",
      },
    },
    {
      agoMs: 6 * 60_000,
      draft: {
        severity: "info",
        kind: "system",
        message: "Службу моніторингу оновлено до версії 1.4.2",
      },
    },
    {
      agoMs: 2 * 60_000,
      draft: {
        severity: "info",
        kind: "status",
        deviceId: "cache-01",
        deviceName: "cache-01",
        message: "Вузол cache-01 повернувся в мережу",
      },
    },
  ];

  const events: SentinelEvent[] = [];

  drafts.forEach((item, index) => {
    events.push({ ...item.draft, id: index + 1, at: now - item.agoMs });
  });

  return { events: events.toSorted((a, b) => b.at - a.at), unseenEvents: 2 };
}

export function createInitialState(): SimulatorState {
  const devices: Device[] = [];
  const processes: Record<string, ProcessInfo[]> = {};
  const history: Record<string, TelemetryPoint[]> = {};

  DEVICE_SEEDS.forEach((seed, index) => {
    const rng = mulberry32(0x5eed + index * 977);
    const device: Device = { ...seed };
    devices.push(device);
    processes[seed.id] = generateProcesses(seed, rng);
    history[seed.id] = seedHistory(device, rng);
  });

  const seededEvents = buildInitialEvents();

  return {
    devices,
    processes,
    history,
    events: seededEvents.events,
    unseenEvents: seededEvents.unseenEvents,
    rebootTicks: {},
    paused: false,
  };
}
