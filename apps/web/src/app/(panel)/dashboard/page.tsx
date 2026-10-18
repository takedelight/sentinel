"use client";

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
  ChevronRight,
  CircleCheck,
  CircleX,
  SearchX,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { DeviceStatus } from "@/shared/mock/types";

import { DeviceCard } from "@/entities/device/ui/device-card";
import { EventRow } from "@/entities/event/ui/event-row";
import { DeviceFilters } from "@/features/device-filters/ui/device-filters";
import { cn } from "@/shared/lib/cn";
import { plural } from "@/shared/lib/format";
import { useFakeLoading } from "@/shared/lib/use-fake-loading";
import { GROUPS } from "@/shared/mock/data";
import { useDevices, useEvents } from "@/shared/mock/simulator";

const STAT_CARDS: Array<{
  status: DeviceStatus;
  label: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    status: "online",
    label: "Онлайн",
    icon: CircleCheck,
    tone: "text-emerald-400",
  },
  {
    status: "warning",
    label: "Увага",
    icon: TriangleAlert,
    tone: "text-amber-400",
  },
  { status: "offline", label: "Офлайн", icon: CircleX, tone: "text-red-400" },
];

const STAT_SKELETONS = [0, 1, 2];
const CARD_SKELETONS = [0, 1, 2, 3, 4, 5];

export default function DashboardPage() {
  const devices = useDevices();
  const events = useEvents();
  const loading = useFakeLoading();
  const [groupId, setGroupId] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const byStatus: Record<DeviceStatus, number> = {
      online: 0,
      warning: 0,
      offline: 0,
    };
    const byGroup: Record<string, number> = {};

    for (const device of devices) {
      byStatus[device.status] += 1;
      byGroup[device.groupId] = (byGroup[device.groupId] ?? 0) + 1;
    }

    return { byStatus, byGroup };
  }, [devices]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return devices.filter((device) => {
      if (groupId !== "all" && device.groupId !== groupId) return false;
      if (!needle) return true;

      return device.name.toLowerCase().includes(needle) || device.ip.includes(needle);
    });
  }, [devices, groupId, query]);

  const groupNames = useMemo(() => new Map(GROUPS.map((group) => [group.id, group.name])), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          {devices.length} {plural(devices.length, "вузол", "вузли", "вузлів")} · онлайн{" "}
          {counts.byStatus.online} · увага {counts.byStatus.warning} · офлайн{" "}
          {counts.byStatus.offline}
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {STAT_CARDS.map((item) => (
              <StatCard
                key={item.status}
                label={item.label}
                value={counts.byStatus[item.status]}
                icon={item.icon}
                tone={item.tone}
              />
            ))}
          </div>

          <DeviceFilters
            groups={GROUPS}
            groupId={groupId}
            onGroupChange={setGroupId}
            query={query}
            onQueryChange={setQuery}
            counts={counts.byGroup}
            totalCount={devices.length}
          />

          {filtered.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>Нічого не знайдено</EmptyTitle>
                <EmptyDescription>Спробуйте змінити запит або скинути фільтри.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setGroupId("all");
                  }}
                >
                  Скинути фільтри
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  groupName={groupNames.get(device.groupId) ?? device.groupId}
                />
              ))}
            </div>
          )}

          {events.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Останні події</CardTitle>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/events" />}
                  >
                    Усі події
                    <ChevronRight aria-hidden="true" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="divide-y">
                {events.slice(0, 5).map((event) => (
                  <EventRow key={event.id} event={event} compact />
                ))}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={cn("font-mono text-2xl font-semibold tabular-nums", tone)}>{value}</span>
        </div>
        <Icon className={cn("size-5", tone)} aria-hidden="true" />
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {STAT_SKELETONS.map((key) => (
          <Skeleton key={key} className="h-22 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-9 w-full max-w-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARD_SKELETONS.map((key) => (
          <Skeleton key={key} className="h-49 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
