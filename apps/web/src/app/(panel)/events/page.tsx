"use client";

import { Card, CardContent } from "@sentinel/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@sentinel/ui/components/empty";
import { Input } from "@sentinel/ui/components/input";
import { Skeleton } from "@sentinel/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@sentinel/ui/components/tabs";
import { Search, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { EventKind } from "@/shared/mock/types";

import { EventRow } from "@/entities/event/ui/event-row";
import { plural } from "@/shared/lib/format";
import { useFakeLoading } from "@/shared/lib/use-fake-loading";
import { markEventsSeen, useEvents } from "@/shared/mock/simulator";

const ROW_SKELETONS = [0, 1, 2, 3, 4, 5, 6, 7];

const KIND_TABS: Array<{ value: "all" | EventKind; label: string }> = [
  { value: "all", label: "Усі" },
  { value: "status", label: "Статуси" },
  { value: "process", label: "Процеси" },
  { value: "system", label: "Система" },
];

export default function EventsPage() {
  const events = useEvents();
  const loading = useFakeLoading();
  const [kind, setKind] = useState<"all" | EventKind>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    markEventsSeen();
  }, [events]);

  const counts = useMemo(() => {
    const byKind: Record<EventKind, number> = { status: 0, process: 0, system: 0 };

    for (const event of events) {
      byKind[event.kind] += 1;
    }

    return byKind;
  }, [events]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return events.filter((event) => {
      if (kind !== "all" && event.kind !== kind) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return (
        event.message.toLowerCase().includes(needle) ||
        (event.deviceName ?? "").toLowerCase().includes(needle)
      );
    });
  }, [events, kind, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Журнал подій</h1>
        <p className="text-sm text-muted-foreground">
          {events.length} {plural(events.length, "подія", "події", "подій")} · оновлюється в
          реальному часі
        </p>
      </div>

      {loading ? (
        <EventsSkeleton />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={kind}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setKind(value as "all" | EventKind);
                }
              }}
            >
              <TabsList>
                {KIND_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label} · {tab.value === "all" ? events.length : counts[tab.value]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full max-w-xs">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                placeholder="Пошук за текстом або вузлом…"
                aria-label="Пошук у журналі подій"
                className="pl-8"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>Нічого не знайдено</EmptyTitle>
                <EmptyDescription>Спробуйте змінити запит або категорію.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Card>
              <CardContent className="divide-y">
                {filtered.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-full max-w-xs" />
      <div className="flex flex-col gap-3 rounded-xl border p-4">
        {ROW_SKELETONS.map((key) => (
          <Skeleton key={key} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
