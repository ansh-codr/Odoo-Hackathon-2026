import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/services/authService";

import { Sidebar, type Role } from "@/components/assetflow/Sidebar";
import { Topbar } from "@/components/assetflow/Topbar";
import { Dashboard } from "@/components/assetflow/Dashboard";
import { ResourceBookings } from "@/components/assetflow/ResourceBookings";
import { MaintenanceManagement } from "@/components/assetflow/MaintenanceManagement";
import { ApprovalCenter } from "@/components/assetflow/ApprovalCenter";
import { AssetAudits } from "@/components/assetflow/AssetAudits";
import { NotificationsLogs } from "@/components/assetflow/NotificationsLogs";
import { ReportsAnalytics } from "@/components/assetflow/ReportsAnalytics";
import { OrganizationSetup } from "@/components/assetflow/OrganizationSetup";
import { Assets } from "@/components/assetflow/Assets";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  const [role, setRole] = useState<Role>("employee");
  const [active, setActive] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.role) {
          setRole(profile.role as Role);
        }
      } else {
        navigate({ to: "/login" });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        role={role}
        active={active}
        onNavigate={(key) => {
          setActive(key);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          onRoleChange={setRole}
          onNavigate={setActive}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          ) : active === "reports" ? (
            <ReportsAnalytics />
          ) : active === "org" ? (
            <OrganizationSetup role={role} />
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