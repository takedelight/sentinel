import type { DeviceStatus } from "@/shared/mock/types";

export interface StatusMeta {
  label: string;
  dotClass: string;
  badgeClass: string;
}

export const STATUS_META: Record<DeviceStatus, StatusMeta> = {
  online: {
    label: "Онлайн",
    dotClass: "bg-emerald-500",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  warning: {
    label: "Увага",
    dotClass: "bg-amber-500",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  offline: {
    label: "Офлайн",
    dotClass: "bg-red-500",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

export function statusMeta(status: DeviceStatus): StatusMeta {
  return STATUS_META[status];
}
