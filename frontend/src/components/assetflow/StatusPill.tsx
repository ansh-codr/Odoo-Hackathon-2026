import { cn } from "@/lib/utils";

export type AssetStatus =
  | "available"
  | "allocated"
  | "reserved"
  | "maintenance"
  | "lost"
  | "retired"
  | "disposed"
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "pending"
  | "approved"
  | "rejected"
  | "escalated"
  | "technician_assigned"
  | "in_progress"
  | "resolved"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "scheduled"
  | "active"
  | "closed"
  | "verified"
  | "missing"
  | "damaged";

const STATUS_META: Record<AssetStatus, { label: string; cls: string; dot: string }> = {
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
  cancelled: {
    label: "Cancelled",
    cls: "bg-status-lost-bg text-status-lost",
    dot: "bg-status-lost",
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
  pending: {
    label: "Pending",
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  approved: {
    label: "Approved",
    cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  escalated: {
    label: "Escalated",
    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  technician_assigned: {
    label: "Technician Assigned",
    cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  resolved: {
    label: "Resolved",
    cls: "bg-status-available-bg text-status-available",
    dot: "bg-status-available",
  },
  low: {
    label: "Low Priority",
    cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dot: "bg-gray-500",
  },
  medium: {
    label: "Medium Priority",
    cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  high: {
    label: "High Priority",
    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  critical: {
    label: "Critical",
    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  scheduled: {
    label: "Scheduled",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  active: {
    label: "Active",
    cls: "bg-status-available-bg text-status-available",
    dot: "bg-status-available",
  },
  closed: {
    label: "Closed",
    cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dot: "bg-gray-500",
  },
  verified: {
    label: "Verified",
    cls: "bg-status-available-bg text-status-available",
    dot: "bg-status-available",
  },
  missing: {
    label: "Missing",
    cls: "bg-status-lost-bg text-status-lost",
    dot: "bg-status-lost",
  },
  damaged: {
    label: "Damaged",
    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-500",
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: AssetStatus | string;
  className?: string;
}) {
  // Normalize status string just in case it comes directly from DB with different casing or formatting
  const normalizedStatus = (status || "").toString().toLowerCase().replace(/_/g, " ") as AssetStatus;
  
  // Try to find an exact match, or fallback to a default
  let meta = STATUS_META[status as AssetStatus] || STATUS_META[normalizedStatus];

  // If still not found, try to do some fuzzy matching or provide a generic fallback
  if (!meta) {
    if (normalizedStatus.includes("pending")) meta = STATUS_META.pending;
    else if (normalizedStatus.includes("approv")) meta = STATUS_META.approved;
    else if (normalizedStatus.includes("reject")) meta = STATUS_META.rejected;
    else if (normalizedStatus.includes("maintenance")) meta = STATUS_META.maintenance;
    else {
      meta = {
        label: status ? status.toString().replace(/_/g, " ") : "Unknown",
        cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        dot: "bg-gray-500",
      };
    }
  }

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
