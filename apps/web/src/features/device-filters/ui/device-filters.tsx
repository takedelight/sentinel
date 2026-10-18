"use client";

import { Input } from "@sentinel/ui/components/input";
import { Tabs, TabsList, TabsTrigger } from "@sentinel/ui/components/tabs";
import { Search } from "lucide-react";

import type { DeviceGroup } from "@/shared/mock/types";

interface DeviceFiltersProps {
  groups: DeviceGroup[];
  groupId: string;
  onGroupChange: (groupId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  counts: Record<string, number>;
  totalCount: number;
}

export function DeviceFilters({
  groups,
  groupId,
  onGroupChange,
  query,
  onQueryChange,
  counts,
  totalCount,
}: DeviceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 overflow-x-auto">
        <Tabs
          value={groupId}
          onValueChange={(value) => {
            if (typeof value === "string") {
              onGroupChange(value);
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="all">Усі · {totalCount}</TabsTrigger>
            {groups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.name} · {counts[group.id] ?? 0}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="relative w-full lg:max-w-xs">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          placeholder="Пошук за назвою або IP…"
          aria-label="Пошук вузлів"
          className="pl-8"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </div>
  );
}
