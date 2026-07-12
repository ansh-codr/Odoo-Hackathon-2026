import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Sidebar, type Role } from "@/components/assetflow/Sidebar";
import { Topbar } from "@/components/assetflow/Topbar";
import { Dashboard } from "@/components/assetflow/Dashboard";
import { ResourceBookings } from "@/components/assetflow/ResourceBookings";
import { MaintenanceManagement } from "@/components/assetflow/MaintenanceManagement";
import { ApprovalCenter } from "@/components/assetflow/ApprovalCenter";
import { AssetAudits } from "@/components/assetflow/AssetAudits";
import { NotificationsLogs } from "@/components/assetflow/NotificationsLogs";
import { Assets } from "@/components/assetflow/Assets";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  const [role, setRole] = useState<Role>("admin");
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        role={role}
        active={active}
        onNavigate={setActive}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          onRoleChange={setRole}
        />

        <main className="flex-1 overflow-y-auto">
          {active === "dashboard" ? (
            <Dashboard />
          ) : active === "assets" ? (
            <Assets />
          ) : active === "bookings" ? (
            <ResourceBookings />
          ) : active === "maintenance" ? (
            <MaintenanceManagement />
          ) : active === "approvals" ? (
            <ApprovalCenter />
          ) : active === "audits" ? (
            <AssetAudits />
          ) : active === "notifications" ? (
            <NotificationsLogs role={role} />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-display text-lg font-semibold text-foreground capitalize">
                  {active.replace("_", " ")}
                </div>

                <div className="mt-1">
                  Section preview — dashboard shown as the primary example.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}