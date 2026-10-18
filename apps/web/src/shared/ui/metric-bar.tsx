import { cn } from "@/shared/lib/cn";

export function MetricBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const tone =
    clamped >= 85 ? "bg-red-500" : clamped >= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          tone,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
