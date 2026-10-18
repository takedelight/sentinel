"use client";

import type { ReactNode } from "react";

import { Button } from "@sentinel/ui/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@sentinel/ui/components/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@sentinel/ui/components/empty";
import { Skeleton } from "@sentinel/ui/components/skeleton";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Cpu,
  HardDrive,
  Loader2,
  MemoryStick,
  Network,
  SearchX,
  Server,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { StatusBadge } from "@/entities/device/ui/status-badge";
import {
  CpuHistoryChart,
  NetworkHistoryChart,
  RamHistoryChart,
} from "@/entities/device/ui/telemetry-charts";
import { RestartDeviceButton } from "@/features/device-restart/ui/restart-device-button";
import { ProcessTable } from "@/features/process-manager/ui/process-table";
import {
  formatGb,
  formatNumber,
  formatPercent,
  formatRate,
  formatUptime,
  plural,
} from "@/shared/lib/format";
import { useFakeLoading } from "@/shared/lib/use-fake-loading";
import { GROUPS, TICK_SECONDS } from "@/shared/mock/data";
import { useDevice, useProcesses, useRebooting, useTelemetry } from "@/shared/mock/simulator";
import { MetricBar } from "@/shared/ui/metric-bar";

const TILE_SKELETONS = [0, 1, 2, 3];

export default function DevicePage() {
  const params = useParams<{ id: string }>();
  const deviceId = params.id;
  const device = useDevice(deviceId);
  const processes = useProcesses(deviceId);
  const history = useTelemetry(deviceId);
  const loading = useFakeLoading();
  const rebooting = useRebooting(deviceId);

  if (loading) {
    return <DeviceSkeleton />;
  }

  if (!device) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Вузол не знайдено</EmptyTitle>
          <EmptyDescription>Можливо, його видали або посилання некоректне.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard" />}>
            <ArrowLeft aria-hidden="true" />
            До всіх вузлів
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const groupName = GROUPS.find((group) => group.id === device.groupId)?.name ?? device.groupId;
  const ramUsedGb = (device.ram / 100) * device.ramTotalGb;
  const diskUsedGb = (device.disk / 100) * device.diskTotalGb;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="-ml-2 w-fit text-muted-foreground"
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft aria-hidden="true" />
          До всіх вузлів
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Server className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-2xl font-semibold tracking-tight">{device.name}</h1>
              <StatusBadge status={device.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {device.ip} · {device.os} · {groupName} · аптайм {formatUptime(device.uptimeSec)}
            </p>
          </div>
          <div className="ml-auto">
            <RestartDeviceButton device={device} />
          </div>
        </div>

        {rebooting ? (
          <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-400">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Триває перезавантаження — вузол повернеться в мережу за кілька секунд.
          </div>
        ) : device.status === "offline" ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <WifiOff className="size-4" aria-hidden="true" />
            Вузол офлайн — метрики заморожені, дані не оновлюються.
          </div>
        ) : null}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="ЦП" icon={Cpu}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {formatPercent(device.cpu)}
            </span>
            <span className="text-xs text-muted-foreground">
              {device.cores} {plural(device.cores, "ядро", "ядра", "ядер")}
            </span>
          </div>
          <MetricBar value={device.cpu} />
        </StatTile>

        <StatTile label="Пам’ять" icon={MemoryStick}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {formatGb(ramUsedGb)}
            </span>
            <span className="text-xs text-muted-foreground">
              з {formatGb(device.ramTotalGb)} · {formatPercent(device.ram)}
            </span>
          </div>
          <MetricBar value={device.ram} />
        </StatTile>

        <StatTile label="Диск" icon={HardDrive}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {formatGb(diskUsedGb)}
            </span>
            <span className="text-xs text-muted-foreground">
              з {formatGb(device.diskTotalGb)} · {formatPercent(device.disk)}
            </span>
          </div>
          <MetricBar value={device.disk} />
        </StatTile>

        <StatTile label="Мережа" icon={Network}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ArrowDown className="size-3.5" aria-hidden="true" />
                Вхідний
              </span>
              <span className="font-mono tabular-nums">{formatRate(device.netIn)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <ArrowUp className="size-3.5" aria-hidden="true" />
                Вихідний
              </span>
              <span className="font-mono tabular-nums">{formatRate(device.netOut)}</span>
            </div>
          </div>
        </StatTile>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Історія телеметрії</h2>
          <p className="text-xs text-muted-foreground">
            Останні {history.length} вимірювань · кожні {formatNumber(TICK_SECONDS)} с
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="ЦП" value={formatPercent(device.cpu)}>
            <CpuHistoryChart history={history} />
          </ChartCard>
          <ChartCard title="Пам’ять" value={formatPercent(device.ram)}>
            <RamHistoryChart history={history} />
          </ChartCard>
          <ChartCard
            className="lg:col-span-2"
            title="Мережа"
            value={`↓ ${formatRate(device.netIn)} · ↑ ${formatRate(device.netOut)}`}
          >
            <NetworkHistoryChart history={history} />
          </ChartCard>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Процеси</h2>
          <p className="text-xs text-muted-foreground">
            Сортування та пошук · завершення через SIGTERM / SIGKILL
          </p>
        </div>
        <ProcessTable
          deviceId={device.id}
          processes={processes}
          disabled={device.status === "offline"}
        />
      </section>
    </div>
  );
}

function StatTile({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  value,
  className,
  children,
}: {
  title: string;
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <CardAction className="font-mono text-sm tabular-nums">{value}</CardAction>
      </CardHeader>
      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}

function DeviceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-32" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TILE_SKELETONS.map((key) => (
          <Skeleton key={key} className="h-33 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-75 rounded-xl" />
        <Skeleton className="h-75 rounded-xl" />
      </div>
      <Skeleton className="h-105 rounded-xl" />
    </div>
  );
}
