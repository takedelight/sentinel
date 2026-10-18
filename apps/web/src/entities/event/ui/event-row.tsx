import Link from "next/link";

import type { SentinelEvent } from "@/shared/mock/types";

import { cn } from "@/shared/lib/cn";
import { formatClockTime, formatRelativeTime } from "@/shared/lib/format";

import { EVENT_KIND_LABEL, SEVERITY_META } from "../model";

export function EventRow({ event, compact = false }: { event: SentinelEvent; compact?: boolean }) {
  const meta = SEVERITY_META[event.severity];
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className={cn("mt-0.5 size-4 shrink-0", meta.className)} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn("text-sm leading-snug", compact && "truncate")}>{event.message}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {event.deviceId && event.deviceName ? (
            <>
              <Link
                href={`/devices/${event.deviceId}`}
                className="font-mono transition-colors hover:text-foreground hover:underline"
              >
                {event.deviceName}
              </Link>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <span>{EVENT_KIND_LABEL[event.kind]}</span>
        </div>
      </div>
      <time
        className="shrink-0 text-xs text-muted-foreground tabular-nums"
        dateTime={new Date(event.at).toISOString()}
        title={formatClockTime(event.at)}
      >
        {formatRelativeTime(event.at)}
      </time>
    </div>
  );
}
