import { STATUS_COLORS, STATUS_LABELS } from "@/types/outreach";
import type { OutreachStatus } from "@/types/outreach";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: OutreachStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
