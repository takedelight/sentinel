import { CircleCheck, Info, OctagonX, TriangleAlert, type LucideIcon } from "lucide-react";

import type { EventKind, EventSeverity } from "@/shared/mock/types";

export interface SeverityMeta {
  icon: LucideIcon;
  className: string;
}

export const SEVERITY_META: Record<EventSeverity, SeverityMeta> = {
  info: { icon: Info, className: "text-sky-400" },
  success: { icon: CircleCheck, className: "text-emerald-400" },
  warning: { icon: TriangleAlert, className: "text-amber-400" },
  error: { icon: OctagonX, className: "text-red-400" },
};

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  status: "Статус",
  process: "Процес",
  system: "Система",
};
