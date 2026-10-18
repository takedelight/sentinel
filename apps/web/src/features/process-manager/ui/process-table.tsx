"use client";

import { Button } from "@sentinel/ui/components/button";
import { Input } from "@sentinel/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sentinel/ui/components/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@sentinel/ui/components/tooltip";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Skull } from "lucide-react";
import { useMemo, useState } from "react";

import type { ProcessInfo } from "@/shared/mock/types";

import { PROCESS_STATE_LABEL } from "@/entities/process/model";
import { cn } from "@/shared/lib/cn";
import { formatMb, formatPercent, plural } from "@/shared/lib/format";

import { KillProcessDialog } from "./kill-process-dialog";

type SortKey = "pid" | "name" | "cpu" | "ram";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

interface SortableHeadProps {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
}

function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
  className,
}: SortableHeadProps) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead
      className={cn(align === "right" && "text-right", className)}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <Icon className="size-3" aria-hidden="true" />
      </button>
    </TableHead>
  );
}

function compareBy(sort: SortState) {
  const factor = sort.dir === "asc" ? 1 : -1;

  return (a: ProcessInfo, b: ProcessInfo): number => {
    switch (sort.key) {
      case "pid":
        return (a.pid - b.pid) * factor;
      case "name":
        return a.name.localeCompare(b.name) * factor;
      case "cpu":
        return (a.cpu - b.cpu) * factor;
      case "ram":
        return (a.ramMb - b.ramMb) * factor;
    }
  };
}

function cpuClass(cpu: number): string {
  if (cpu >= 60) return "text-red-400";
  if (cpu >= 25) return "text-amber-400";
  return "text-foreground";
}

export function ProcessTable({
  deviceId,
  processes,
  disabled = false,
}: {
  deviceId: string;
  processes: ProcessInfo[];
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "cpu", dir: "desc" });
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ProcessInfo | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? processes.filter(
          (process) =>
            process.name.toLowerCase().includes(needle) ||
            process.user.toLowerCase().includes(needle) ||
            String(process.pid).includes(needle),
        )
      : processes;

    return matched.toSorted(compareBy(sort));
  }, [processes, query, sort]);

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            placeholder="Пошук: назва, користувач, PID…"
            aria-label="Пошук процесів"
            className="pl-8"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {query.trim()
            ? `${filtered.length} з ${processes.length} процесів`
            : `${processes.length} ${plural(processes.length, "процес", "процеси", "процесів")}`}
        </p>
      </div>

      <div className="relative max-h-135 overflow-y-auto rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="hover:bg-transparent">
              <SortableHead
                label="PID"
                sortKey="pid"
                sort={sort}
                onSort={handleSort}
                className="w-24"
              />
              <SortableHead label="Назва" sortKey="name" sort={sort} onSort={handleSort} />
              <TableHead className="text-xs font-medium text-muted-foreground">
                Користувач
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Стан</TableHead>
              <SortableHead
                label="ЦП"
                sortKey="cpu"
                sort={sort}
                onSort={handleSort}
                align="right"
              />
              <SortableHead
                label="Пам’ять"
                sortKey="ram"
                sort={sort}
                onSort={handleSort}
                align="right"
              />
              <TableHead className="w-14 text-right">
                <span className="sr-only">Дії</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((process) => (
              <TableRow key={process.pid}>
                <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                  {process.pid}
                </TableCell>
                <TableCell className="font-mono text-xs">{process.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{process.user}</TableCell>
                <TableCell
                  className={cn(
                    "text-xs",
                    process.state === "zombie" ? "text-red-400" : "text-muted-foreground",
                  )}
                >
                  {PROCESS_STATE_LABEL[process.state]}
                </TableCell>
                <TableCell
                  className={cn("text-right font-mono text-xs tabular-nums", cpuClass(process.cpu))}
                >
                  {formatPercent(process.cpu)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {formatMb(process.ramMb)}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={disabled}
                          aria-label={`Завершити процес ${process.name} (PID ${process.pid})`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setTarget(process);
                            setOpen(true);
                          }}
                        />
                      }
                    >
                      <Skull />
                    </TooltipTrigger>
                    <TooltipContent>
                      {disabled ? "Вузол недоступний" : "Завершити процес"}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  Нічого не знайдено
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <KillProcessDialog
        deviceId={deviceId}
        process={target}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setTarget(null);
          }
        }}
      />
    </div>
  );
}
