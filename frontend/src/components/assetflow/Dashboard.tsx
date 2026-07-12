import {
  Package,
  ArrowLeftRight,
  Wrench,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Filter,
  Download,
  ArrowUpDown,
} from "lucide-react";
import { StatusPill, type AssetStatus } from "./StatusPill";

const STATS = [
  { label: "Total Assets", value: "0", delta: "0", trend: "up", icon: Package, sub: "this month" },
  { label: "Currently Allocated", value: "0", delta: "0%", trend: "up", icon: ArrowLeftRight, sub: "of fleet" },
  { label: "Under Maintenance", value: "0", delta: "0", trend: "down", icon: Wrench, sub: "vs last week" },
  { label: "Overdue Returns", value: "0", delta: "0", trend: "up", icon: AlertTriangle, sub: "needs action" },
];

const ASSETS: {
  tag: string;
  name: string;
  category: string;
  assignee: string;
  location: string;
  status: AssetStatus;
  updated: string;
}[] = [];

const ACTIVITY: { who: string; action: string; target: string; time: string; tone: AssetStatus }[] = [];

const BOOKINGS: { room: string; when: string; who: string; status: AssetStatus }[] = [];

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overview · Monday, Jul 12
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Good morning
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No items need attention today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95">
            <Plus className="h-3.5 w-3.5" />
            New Asset
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          const up = s.trend === "up";
          return (
            <div key={s.label} className="card-surface p-4">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                <div className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold tracking-tight tabular text-foreground">
                  {s.value}
                </div>
                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular ${
                    up ? "text-status-available" : "text-status-lost"
                  }`}
                >
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.delta}
                </div>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Grid: table + side col */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Asset table */}
        <div className="card-surface xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <div className="font-display text-sm font-semibold text-foreground">
                Recent Assets
              </div>
              <div className="text-[11px] text-muted-foreground">
                Showing 0 of 0
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                <Filter className="h-3 w-3" />
                Filter
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Th sortable>Asset Tag</Th>
                  <Th sortable>Name</Th>
                  <Th>Assignee</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-4">Updated</Th>
                </tr>
              </thead>
              <tbody>
                {ASSETS.map((a) => (
                  <tr
                    key={a.tag}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] font-medium text-foreground">
                      {a.tag}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">{a.category}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-foreground">
                      {a.assignee === "—" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        a.assignee
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                      {a.location}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 pr-4 text-right text-[12px] text-muted-foreground tabular">
                      {a.updated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span className="tabular">0 of 0</span>
            <div className="flex items-center gap-1">
              <button className="h-7 rounded border border-border px-2 hover:bg-muted">Prev</button>
              <button className="h-7 rounded border border-border bg-background px-2 hover:bg-muted">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          {/* Status breakdown */}
          <div className="card-surface p-4">
            <div className="font-display text-sm font-semibold text-foreground">
              Fleet Status
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">0 tracked assets</div>

            <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-muted">
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {[
                { s: "available" as AssetStatus, n: 0, p: "0%" },
                { s: "allocated" as AssetStatus, n: 0, p: "0%" },
                { s: "reserved" as AssetStatus, n: 0, p: "0%" },
                { s: "maintenance" as AssetStatus, n: 0, p: "0%" },
                { s: "lost" as AssetStatus, n: 0, p: "0%" },
                { s: "retired" as AssetStatus, n: 0, p: "0%" },
              ].map((row) => (
                <li key={row.s} className="flex items-center justify-between">
                  <StatusPill status={row.s} />
                  <div className="flex items-baseline gap-2 tabular">
                    <span className="text-sm font-semibold text-foreground">{row.n}</span>
                    <span className="text-[11px] text-muted-foreground">{row.p}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Upcoming bookings */}
          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-sm font-semibold text-foreground">
                  Upcoming Bookings
                </div>
                <div className="text-[11px] text-muted-foreground">Next 72 hours</div>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">View all</button>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {BOOKINGS.map((b) => (
                <li key={b.room} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{b.room}</div>
                    <div className="text-[11px] text-muted-foreground tabular">{b.when}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">· {b.who}</div>
                  </div>
                  <StatusPill status={b.status} />
                </li>
              ))}
            </ul>
          </div>

          {/* Activity */}
          <div className="card-surface p-4">
            <div className="font-display text-sm font-semibold text-foreground">
              Recent Activity
            </div>
            <ul className="mt-3 space-y-3">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <div
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-status-${a.tone}`}
                  />
                  <div className="min-w-0 flex-1 leading-snug">
                    <span className="font-medium text-foreground">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-mono text-[12px] text-foreground">{a.target}</span>
                    <div className="text-[11px] text-muted-foreground tabular">{a.time} ago</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  sortable,
  className = "",
}: {
  children: React.ReactNode;
  sortable?: boolean;
  className?: string;
}) {
  return (
    <th className={`px-4 py-2.5 text-left font-semibold ${className}`}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </span>
    </th>
  );
}
