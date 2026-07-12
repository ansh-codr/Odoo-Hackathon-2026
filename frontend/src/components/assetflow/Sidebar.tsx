import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Building2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Role = "admin" | "asset_manager" | "department_head" | "employee";

type NavItem = {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge: string | null;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { key: "assets", label: "Assets", icon: Package, badge: "1,284" },
  { key: "allocations", label: "Allocations", icon: ArrowLeftRight, badge: null },
  { key: "bookings", label: "Bookings", icon: CalendarClock, badge: "12" },
  { key: "maintenance", label: "Maintenance", icon: Wrench, badge: "4" },
  { key: "audits", label: "Audits", icon: ClipboardCheck, badge: null },
  { key: "reports", label: "Reports", icon: BarChart3, badge: null },
  { key: "notifications", label: "Notifications", icon: Bell, badge: "3" },
  { key: "org", label: "Organization Setup", icon: Building2, badge: null, adminOnly: true },
];

export function Sidebar({
  role,
  active,
  onNavigate,
}: {
  role: Role;
  active: string;
  onNavigate: (key: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[240px]",
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M4 7l8-4 8 4-8 4-8-4z" />
            <path d="M4 12l8 4 8-4" />
            <path d="M4 17l8 4 8-4" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[15px] font-bold tracking-tight text-foreground">
              AssetFlow
            </div>
            <div className="truncate text-[11px] font-medium text-muted-foreground">
              Northwind Corp.
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
        )}
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            if (item.adminOnly && role !== "admin") return null;
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onNavigate(item.key)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-active text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-hover",
                    collapsed && "justify-center",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-sidebar-hover",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
