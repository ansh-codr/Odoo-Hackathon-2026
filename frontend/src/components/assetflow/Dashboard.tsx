import { useEffect, useState } from "react";
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
import { getAssets } from "../../services/assetService";
import { getBookings } from "../../services/bookingService";
import { getActivityLogs } from "../../services/logService";
import type { Asset, Booking, ActivityLog } from "../../services/types";

export function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetsData, bookingsData, logsData] = await Promise.all([
          getAssets(),
          getBookings(),
          getActivityLogs()
        ]);
        setAssets(assetsData);
        setBookings(bookingsData.filter(b => b.status === "Reserved").slice(0, 5)); // Show next 5 upcoming
        setLogs(logsData.slice(0, 10)); // Show last 10 activities
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalAssets = assets.length;
  const allocatedAssets = assets.filter(a => a.status === "Allocated").length;
  const maintenanceAssets = assets.filter(a => a.status === "Under_Maintenance").length;
  // Let's identify overdue returns simply by checking if ExpectedReturnDate (or any custom logic) is past
  const overdueReturns = assets.filter(a => a.status === "Allocated" && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date()).length;

  const STATS = [
    { label: "Total Assets", value: totalAssets.toString(), delta: "fleet size", trend: "up", icon: Package, sub: "all items" },
    { label: "Currently Allocated", value: allocatedAssets.toString(), delta: overdueReturns > 0 ? `${overdueReturns} overdue` : "all good", trend: overdueReturns > 0 ? "down" : "up", icon: ArrowLeftRight, sub: "in use" },
    { label: "Under Maintenance", value: maintenanceAssets.toString(), delta: "needs repair", trend: "down", icon: Wrench, sub: "being fixed" },
    { label: "Upcoming Bookings", value: bookings.length.toString(), delta: "scheduled", trend: "up", icon: AlertTriangle, sub: "next 7 days" },
  ];

  const statusMap = {
    available: assets.filter(a => a.status === "Available").length,
    allocated: allocatedAssets,
    reserved: assets.filter(a => a.status === "Reserved").length,
    maintenance: maintenanceAssets,
    lost: assets.filter(a => a.status === "Lost").length,
    retired: assets.filter(a => a.status === "Retired" || a.status === "Disposed").length,
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {overdueReturns > 0 ? (
              <span className="text-destructive font-medium">{overdueReturns} asset(s) are overdue for return.</span>
            ) : (
              "No items need attention today."
            )}
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
            <div key={s.label} className={`card-surface p-4 ${!up ? "border-destructive/30" : ""}`}>
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
                    up ? "text-status-available" : "text-destructive"
                  }`}
                >
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
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
                Showing {Math.min(assets.length, 10)} of {assets.length}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Th>Asset Tag</Th>
                  <Th>Name</Th>
                  <Th>Assignee</Th>
                  <Th>Location</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 10).map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] font-medium text-foreground">
                      {a.assetTag}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">{a.categoryId}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-foreground">
                      {a.assignedToName || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                      {a.location || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill status={a.status} />
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && !loading && (
                   <tr>
                     <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No assets found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-6">
          {/* Status breakdown */}
          <div className="card-surface p-4">
            <div className="font-display text-sm font-semibold text-foreground">
              Fleet Status
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{totalAssets} tracked assets</div>

            <ul className="mt-4 space-y-2 text-sm">
              {[
                { s: "available" as AssetStatus, n: statusMap.available },
                { s: "allocated" as AssetStatus, n: statusMap.allocated },
                { s: "reserved" as AssetStatus, n: statusMap.reserved },
                { s: "maintenance" as AssetStatus, n: statusMap.maintenance },
                { s: "lost" as AssetStatus, n: statusMap.lost },
                { s: "retired" as AssetStatus, n: statusMap.retired },
              ].map((row) => (
                <li key={row.s} className="flex items-center justify-between">
                  <StatusPill status={row.s === "maintenance" ? "Under_Maintenance" as any : row.s} />
                  <div className="flex items-baseline gap-2 tabular">
                    <span className="text-sm font-semibold text-foreground">{row.n}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {totalAssets > 0 ? Math.round((row.n / totalAssets) * 100) : 0}%
                    </span>
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
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{b.assetName}</div>
                    <div className="text-[11px] text-muted-foreground tabular">{b.date} {b.startTime}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">· {b.userName}</div>
                  </div>
                  <StatusPill status={b.status} />
                </li>
              ))}
              {bookings.length === 0 && (
                <div className="py-2 text-xs text-muted-foreground">No upcoming bookings.</div>
              )}
            </ul>
          </div>

          {/* Activity */}
          <div className="card-surface p-4">
            <div className="font-display text-sm font-semibold text-foreground">
              Recent Activity
            </div>
            <ul className="mt-3 space-y-3">
              {logs.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 text-sm">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1 leading-snug">
                    <span className="font-medium text-foreground">{a.userEmail || "System"}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <div className="font-mono text-[11px] text-muted-foreground mt-0.5">{a.details}</div>
                  </div>
                </li>
              ))}
              {logs.length === 0 && (
                <div className="py-2 text-xs text-muted-foreground">No recent activity.</div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-2.5 text-left font-semibold ${className}`}>
      <span className="inline-flex items-center gap-1">
        {children}
      </span>
    </th>
  );
}
