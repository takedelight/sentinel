"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@sentinel/ui/components/chart";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import type { TelemetryPoint } from "@/shared/mock/types";

import { formatPercent, formatRate } from "@/shared/lib/format";
import { TICK_SECONDS } from "@/shared/mock/data";

const CPU_CONFIG = {
  cpu: { label: "ЦП", color: "oklch(0.72 0.15 250)" },
} satisfies ChartConfig;

const RAM_CONFIG = {
  ram: { label: "Пам’ять", color: "oklch(0.74 0.14 165)" },
} satisfies ChartConfig;

const NETWORK_CONFIG = {
  netIn: { label: "Вхідний", color: "oklch(0.75 0.13 210)" },
  netOut: { label: "Вихідний", color: "oklch(0.72 0.15 305)" },
} satisfies ChartConfig;

interface ChartPoint extends TelemetryPoint {
  i: number;
}

function toPoints(history: TelemetryPoint[]): ChartPoint[] {
  return history.map((point, index) => ({ ...point, i: index }));
}

function secondsAgo(index: number, total: number): number {
  return Math.round((total - 1 - index) * TICK_SECONDS);
}

function agoLabel(index: number, total: number): string {
  const seconds = secondsAgo(index, total);
  return seconds === 0 ? "зараз" : `${seconds} с тому`;
}

export function CpuHistoryChart({ history }: { history: TelemetryPoint[] }) {
  const data = toPoints(history);

  return (
    <ChartContainer config={CPU_CONFIG} className="aspect-auto h-55 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fill-cpu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cpu)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-cpu)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="i"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={56}
          tickFormatter={(value: number) => `${secondsAgo(value, data.length)} с`}
        />
        <YAxis
          width={40}
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ReferenceLine
          y={85}
          stroke="oklch(0.8 0.13 85)"
          strokeDasharray="4 4"
          strokeOpacity={0.55}
          label={{
            value: "поріг 85 %",
            position: "insideTopRight",
            fontSize: 10,
            fill: "oklch(0.8 0.13 85)",
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => agoLabel(Number(value), data.length)}
              formatter={(value) => formatPercent(Number(value))}
            />
          }
        />
        <Area
          dataKey="cpu"
          type="monotone"
          stroke="var(--color-cpu)"
          strokeWidth={2}
          fill="url(#fill-cpu)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function RamHistoryChart({ history }: { history: TelemetryPoint[] }) {
  const data = toPoints(history);

  return (
    <ChartContainer config={RAM_CONFIG} className="aspect-auto h-55 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fill-ram" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-ram)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-ram)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="i"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={56}
          tickFormatter={(value: number) => `${secondsAgo(value, data.length)} с`}
        />
        <YAxis
          width={40}
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ReferenceLine
          y={85}
          stroke="oklch(0.8 0.13 85)"
          strokeDasharray="4 4"
          strokeOpacity={0.55}
          label={{
            value: "поріг 85 %",
            position: "insideTopRight",
            fontSize: 10,
            fill: "oklch(0.8 0.13 85)",
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => agoLabel(Number(value), data.length)}
              formatter={(value) => formatPercent(Number(value))}
            />
          }
        />
        <Area
          dataKey="ram"
          type="monotone"
          stroke="var(--color-ram)"
          strokeWidth={2}
          fill="url(#fill-ram)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function NetworkHistoryChart({ history }: { history: TelemetryPoint[] }) {
  const data = toPoints(history);

  return (
    <ChartContainer config={NETWORK_CONFIG} className="aspect-auto h-55 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fill-net-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-netIn)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-netIn)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fill-net-out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-netOut)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-netOut)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="i"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={56}
          tickFormatter={(value: number) => `${secondsAgo(value, data.length)} с`}
        />
        <YAxis
          width={44}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => formatRate(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => agoLabel(Number(value), data.length)}
              formatter={(value) => formatRate(Number(value))}
            />
          }
        />
        <Area
          dataKey="netIn"
          type="monotone"
          stroke="var(--color-netIn)"
          strokeWidth={2}
          fill="url(#fill-net-in)"
          dot={false}
          isAnimationActive={false}
        />
        <Area
          dataKey="netOut"
          type="monotone"
          stroke="var(--color-netOut)"
          strokeWidth={2}
          fill="url(#fill-net-out)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
