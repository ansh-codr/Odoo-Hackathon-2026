import { cn } from "@/lib/utils";

export type AssetStatus =
  | "available"
  | "allocated"
  | "reserved"
  | "maintenance"
  | "lost"
  | "retired"
  | "disposed";

const STATUS_META: Record<AssetStatus | "upcoming" | "ongoing" | "completed" | "cancelled", { label: string; cls: string; dot: string }> = {
  available: {
    label: "Available",
    cls: "bg-status-available-bg text-status-available",
    dot: "bg-status-available",
  },
  allocated: {
    label: "Allocated",
    cls: "bg-status-allocated-bg text-status-allocated",
    dot: "bg-status-allocated",
  },
  reserved: {
    label: "Reserved",
    cls: "bg-status-reserved-bg text-status-reserved",
    dot: "bg-status-reserved",
  },
  maintenance: {
    label: "Under Maintenance",
    cls: "bg-status-maintenance-bg text-status-maintenance",
    dot: "bg-status-maintenance",
  },
  lost: {
    label: "Lost",
    cls: "bg-status-lost-bg text-status-lost",
    dot: "bg-status-lost",
  },
  retired: {
    label: "Retired",
    cls: "bg-status-retired-bg text-status-retired",
    dot: "bg-status-retired",
  },
  disposed: {
    label: "Disposed",
    cls: "bg-status-disposed-bg text-status-disposed",
    dot: "bg-status-disposed",
  },
  upcoming: {
    label: "Upcoming",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  ongoing: {
    label: "Ongoing",
    cls: "bg-status-available-bg text-status-available",
    dot: "bg-status-available",
  },
  completed: {
    label: "Completed",
    cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dot: "bg-gray-500",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-status-lost-bg text-status-lost",
    dot: "bg-status-lost",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: AssetStatus | "upcoming" | "ongoing" | "completed" | "cancelled";
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent px-2 py-0.5 text-xs font-medium tracking-tight",
        meta.cls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
