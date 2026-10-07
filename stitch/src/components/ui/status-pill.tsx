import { cn } from "@/lib/utils";

type Status =
  | "draft" | "waiting" | "ready" | "done" | "canceled"
  | "in_stock" | "low_stock" | "out_of_stock"
  | "completed" | "pending" | "in_transit" | "flagged"
  | "optimal" | "reorder_soon" | "urgent_reorder"
  | "active" | "inactive";

const CONFIG: Record<Status, { label: string; className: string }> = {
  draft:         { label: "DRAFT",         className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700" },
  waiting:       { label: "WAITING",       className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800" },
  ready:         { label: "READY",         className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  done:          { label: "DONE",          className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  canceled:      { label: "CANCELED",      className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
  in_stock:      { label: "In Stock",      className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  low_stock:     { label: "Low Stock",     className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800" },
  out_of_stock:  { label: "Out of Stock",  className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
  completed:     { label: "COMPLETED",     className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  pending:       { label: "PENDING",       className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800" },
  in_transit:    { label: "IN TRANSIT",    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  flagged:       { label: "FLAGGED",       className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
  optimal:       { label: "Optimal",       className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  reorder_soon:  { label: "Reorder Soon",  className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-800" },
  urgent_reorder:{ label: "Urgent Reorder",className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
  active:        { label: "ACTIVE",        className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  inactive:      { label: "INACTIVE",      className: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700" },
};

interface StatusPillProps {
  status: Status;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const cfg = CONFIG[status] ?? { label: status.toUpperCase(), className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
      cfg.className, className
    )}>
      {cfg.label}
    </span>
  );
}
