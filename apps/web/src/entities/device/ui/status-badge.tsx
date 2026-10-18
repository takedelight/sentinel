import { Badge } from "@sentinel/ui/components/badge";

import type { DeviceStatus } from "@/shared/mock/types";

import { cn } from "@/shared/lib/cn";

import { statusMeta } from "../model";

export function StatusBadge({ status, className }: { status: DeviceStatus; className?: string }) {
  const meta = statusMeta(status);

  return (
    <Badge variant="outline" className={cn(meta.badgeClass, className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </Badge>
  );
}
