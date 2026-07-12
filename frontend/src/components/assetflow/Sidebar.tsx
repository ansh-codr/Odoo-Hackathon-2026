import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initialAssets } from "./data";

import { INITIAL_REQUESTS } from "./MaintenanceManagement";
import { INITIAL_APPROVAL_REQUESTS } from "./ApprovalCenter";
import { MOCK_NOTIFICATIONS } from "./NotificationsLogs";

export type Role = "admin" | "asset_manager" | "department_head" | "employee";

type NavItem = {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge: string | null;
  allowedRoles: Role[];
};

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "assets", label: "Assets", icon: Package, badge: "1,284", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "allocations", label: "Allocations", icon: ArrowLeftRight, badge: null, allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "bookings", label: "Bookings", icon: CalendarClock, badge: "12", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "maintenance", label: "Maintenance", icon: Wrench, badge: "4", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "approvals", label: "Approvals", icon: ClipboardCheck, badge: "14", allowedRoles: ["asset_manager", "department_head"] },
  { key: "audits", label: "Audits", icon: ClipboardCheck, badge: null, allowedRoles: ["admin", "asset_manager"] },
  { key: "reports", label: "Reports", icon: BarChart3, badge: null, allowedRoles: ["admin", "department_head"] },
  { key: "notifications", label: "Notifications", icon: Bell, badge: "3", allowedRoles: ["admin", "asset_manager", "department_head", "employee"] },
  { key: "org", label: "Organization Setup", icon: Building2, badge: null, allowedRoles: ["admin"] },
];

export function Sidebar({
  role,
  active,
  onNavigate,
  mobileOpen,
  setMobileOpen,
}: {
  role: Role;
  active: string;
  onNavigate: (key: string) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length);
  const [assetsCount, setAssetsCount] = useState<number | null>(initialAssets.length);
  const [bookingsCount, setBookingsCount] = useState<number | null>(0);
  const [maintenanceCount, setMaintenanceCount] = useState<number | null>(INITIAL_REQUESTS.filter(r => r.status === "pending").length);
  const [approvalsCount, setApprovalsCount] = useState<number | null>(INITIAL_APPROVAL_REQUESTS.filter(r => r.status === "pending").length);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setUnreadNotifications(customEvent.detail);
    };
    
    const handleAssets = (e: Event) => setAssetsCount((e as CustomEvent<number>).detail);
    const handleBookings = (e: Event) => setBookingsCount((e as CustomEvent<number>).detail);
    const handleMaintenance = (e: Event) => setMaintenanceCount((e as CustomEvent<number>).detail);
    const handleApprovals = (e: Event) => setApprovalsCount((e as CustomEvent<number>).detail);

    window.addEventListener("notifications-update", handleUpdate);
    window.addEventListener("assets-update", handleAssets);
    window.addEventListener("bookings-update", handleBookings);
    window.addEventListener("maintenance-update", handleMaintenance);
    window.addEventListener("approvals-update", handleApprovals);
    
    return () => {
      window.removeEventListener("notifications-update", handleUpdate);
      window.removeEventListener("assets-update", handleAssets);
      window.removeEventListener("bookings-update", handleBookings);
      window.removeEventListener("maintenance-update", handleMaintenance);
      window.removeEventListener("approvals-update", handleApprovals);
    };
  }, []);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:relative",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-[64px]" : "w-[240px]",
        )}
      >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src="/Fevicon.png" alt="Assera Logo" className="h-7 w-7 shrink-0 object-contain rounded-md" />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[15px] font-bold tracking-tight text-foreground">
              Assera
            </div>
            <div className="truncate text-[11px] font-medium text-muted-foreground">
              Northwind Corp.
            </div>
          </div>
        )}
        {mobileOpen && (
          <button 
            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen?.(false)}
          >
            <X className="h-4 w-4" />
          </button>
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
            if (!item.allowedRoles.includes(role)) return null;
            const Icon = item.icon;
            const isActive = active === item.key;
            
            // Override notification badge
            let displayBadge = item.badge;
            if (item.key === "notifications") {
              displayBadge = unreadNotifications > 0 ? unreadNotifications.toString() : null;
            } else if (item.key === "assets") {
              displayBadge = assetsCount !== null ? assetsCount.toLocaleString() : null;
            } else if (item.key === "bookings") {
              displayBadge = bookingsCount !== null ? bookingsCount.toLocaleString() : null;
            } else if (item.key === "maintenance") {
              displayBadge = maintenanceCount !== null ? maintenanceCount.toLocaleString() : null;
            } else if (item.key === "approvals") {
              displayBadge = approvalsCount !== null ? approvalsCount.toLocaleString() : null;
            }

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
                      {displayBadge && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular text-muted-foreground">
                          {displayBadge}
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
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-8 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
    </>
  );
}
