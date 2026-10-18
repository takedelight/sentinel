import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sentinel/ui/components/card";
import { ArrowDown, ArrowUp, Clock, Server } from "lucide-react";
import Link from "next/link";

import type { Device } from "@/shared/mock/types";

import { formatPercent, formatRate, formatUptime } from "@/shared/lib/format";
import { MetricBar } from "@/shared/ui/metric-bar";

import { StatusBadge } from "./status-badge";

export function DeviceCard({ device, groupName }: { device: Device; groupName: string }) {
  return (
    <Link
      href={`/devices/${device.id}`}
      className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-colors group-hover:border-ring/60 group-hover:bg-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Server className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-mono">{device.name}</span>
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            {device.ip} · {groupName}
          </CardDescription>
          <CardAction>
            <StatusBadge status={device.status} />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <MetricRow label="ЦП" value={device.cpu} />
          <MetricRow label="Пам’ять" value={device.ram} />
          <div className="flex items-center justify-between gap-2 pt-1 font-mono text-xs text-muted-foreground tabular-nums">
            <span className="inline-flex items-center gap-1">
              <ArrowDown className="size-3" aria-hidden="true" />
              {formatRate(device.netIn)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowUp className="size-3" aria-hidden="true" />
              {formatRate(device.netOut)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              {formatUptime(device.uptimeSec)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">{formatPercent(value)}</span>
      </div>
      <MetricBar value={value} />
    </div>
  );
}
