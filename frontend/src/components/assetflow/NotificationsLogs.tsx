import React, { useState } from "react";
import {
  Bell,
  Activity,
  AlertCircle,
  Filter,
  CheckCircle2,
  Trash2,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  ArrowLeftRight,
  MonitorPlay,
  Settings,
  ArrowUpDown
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import { type Role } from "./Sidebar";

type Priority = "low" | "medium" | "high" | "critical";

type AppNotification = {
  id: string;
  type: string; // e.g. "booking", "maintenance", "approval", "audit"
  title: string;
  description: string;
  timestamp: string;
  priority: Priority;
  isRead: boolean;
};

type ActivityLog = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  target: string;
  status: "success" | "failed" | "warning";
  ipAddress: string;
};

const STATS = [
  { label: "Unread Notifications", value: "3", icon: Bell, cls: "text-blue-500 bg-blue-50" },
  { label: "Notifications Today", value: "12", icon: Bell, cls: "text-muted-foreground bg-muted" },
  { label: "Activities Today", value: "156", icon: Activity, cls: "text-muted-foreground bg-muted" },
  { label: "Critical Alerts", value: "1", icon: AlertCircle, cls: "text-red-500 bg-red-50" },
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "N-01",
    type: "audit",
    title: "Audit Discrepancy Flagged",
    description: "MacBook Pro M2 (AF-0112) reported missing during Q3 Hardware Verification.",
    timestamp: "10 mins ago",
    priority: "critical",
    isRead: false,
  },
  {
    id: "N-02",
    type: "approval",
    title: "Transfer Request Approved",
    description: "Asset Transfer #TR-1049 (Dell XPS 15) has been approved by Emily Davis.",
    timestamp: "1 hour ago",
    priority: "high",
    isRead: false,
  },
  {
    id: "N-03",
    type: "maintenance",
    title: "Maintenance Completed",
    description: "Technician resolved issue on Projector X1 (AF-0050) in Meeting Room A.",
    timestamp: "3 hours ago",
    priority: "low",
    isRead: false,
  },
  {
    id: "N-04",
    type: "booking",
    title: "Booking Reminder",
    description: "Your booking for Conference Room B starts in 15 minutes.",
    timestamp: "Yesterday, 02:45 PM",
    priority: "medium",
    isRead: true,
  },
  {
    id: "N-05",
    type: "approval",
    title: "Maintenance Approved",
    description: "Maintenance request #MR-2022 (Office Chair) approved and assigned to IT.",
    timestamp: "Yesterday, 10:15 AM",
    priority: "medium",
    isRead: true,
  },
];

const MOCK_LOGS: ActivityLog[] = [
  { id: "L-01", timestamp: "2026-07-12 11:45 AM", user: "Alex Wong", role: "Asset Manager", action: "Flagged Missing", module: "Audit", target: "AF-0112 (MacBook Pro)", status: "warning", ipAddress: "192.168.1.45" },
  { id: "L-02", timestamp: "2026-07-12 10:30 AM", user: "Emily Davis", role: "Department Head", action: "Approved Request", module: "Approvals", target: "Transfer #TR-1049", status: "success", ipAddress: "192.168.1.12" },
  { id: "L-03", timestamp: "2026-07-12 09:15 AM", user: "System", role: "System", action: "Auto-Assigned", module: "Maintenance", target: "Technician John to MR-2022", status: "success", ipAddress: "127.0.0.1" },
  { id: "L-04", timestamp: "2026-07-11 04:20 PM", user: "Rahul Sharma", role: "Employee", action: "Created Booking", module: "Resource Booking", target: "Conference Room B", status: "success", ipAddress: "192.168.1.88" },
  { id: "L-05", timestamp: "2026-07-11 02:10 PM", user: "Admin User", role: "Admin", action: "Failed Login", module: "Authentication", target: "Admin Account", status: "failed", ipAddress: "10.0.0.5" },
];

function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  }[priority];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${meta}`}>
      {priority}
    </span>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case "booking": return <CalendarClock className="h-4 w-4" />;
    case "maintenance": return <Wrench className="h-4 w-4" />;
    case "approval": return <ArrowLeftRight className="h-4 w-4" />;
    case "audit": return <ClipboardCheck className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
}

export function NotificationsLogs({ role }: { role: Role }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const canViewLogs = role === "admin" || role === "asset_manager" || role === "department_head";

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace · Activity
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Notifications & Activity Logs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated with system events and track every important action across the organization.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6 flex-shrink-0">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card-surface p-4 flex items-center gap-4">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${s.cls}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-foreground leading-none mb-1">{s.value}</div>
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card-surface flex-1 flex flex-col min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-border px-4 py-2 flex-shrink-0">
            <TabsList>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="flex-1 flex flex-col min-h-0 m-0 outline-none p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="h-8 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Select>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Bookings</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="approval">Approvals</SelectItem>
                    <SelectItem value="audit">Audits</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="h-8 w-[130px] text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Clear Filters
                </Button>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={markAllRead}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Mark All as Read
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mb-3 opacity-20" />
                  <p className="text-sm">No notifications available</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${n.isRead ? 'bg-background border-border hover:bg-muted/30' : 'bg-muted/20 border-primary/20 shadow-sm'}`}>
                    <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${n.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      {getIconForType(n.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</h4>
                            {!n.isRead && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{n.description}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground/80 font-medium">{n.timestamp}</span>
                            <PriorityBadge priority={n.priority} />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ opacity: 1 }}>
                          {!n.isRead && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => markAsRead(n.id)}>
                              Mark Read
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(n.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 flex flex-col min-h-0 m-0 outline-none p-0">
            {!canViewLogs ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500 mb-4">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  You do not have the necessary permissions to view organization-wide activity logs. This area is restricted to Admins, Asset Managers, and Department Heads.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        className="h-8 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue placeholder="Module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auth">Authentication</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="approvals">Approvals</SelectItem>
                        <SelectItem value="audit">Audits</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background z-10">
                      <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Th>Timestamp</Th>
                        <Th>User</Th>
                        <Th>Action</Th>
                        <Th>Module</Th>
                        <Th>Target</Th>
                        <Th>Status</Th>
                        <Th className="text-right pr-4">Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_LOGS.map(log => (
                        <tr key={log.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                          <td className="whitespace-nowrap px-4 py-3 text-xs tabular text-muted-foreground">{log.timestamp}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{log.user}</div>
                            <div className="text-[10px] text-muted-foreground">{log.role}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">{log.action}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{log.module}</td>
                          <td className="px-4 py-3 font-mono text-xs">{log.target}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                              log.status === 'success' ? 'bg-green-100 text-green-700' :
                              log.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {log.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                              {log.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                              {log.status === 'warning' && <AlertCircle className="h-3 w-3" />}
                              {log.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 pr-4 text-right">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedLog(log)}>
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Activity Log Details Drawer */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Activity Details</SheetTitle>
            <SheetDescription>Log ID: {selectedLog?.id}</SheetDescription>
          </SheetHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
                  <h4 className="text-sm font-semibold">User Information</h4>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Name</span>
                    <span className="font-medium">{selectedLog.user}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Role</span>
                    <span>{selectedLog.role}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
                  <h4 className="text-sm font-semibold">Action Information</h4>
                </div>
                <div className="p-4 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1">Module</span>
                      <span className="font-medium">{selectedLog.module}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground mb-1">Action Performed</span>
                      <span className="font-medium">{selectedLog.action}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Resource / Target</span>
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{selectedLog.target}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Date & Time</span>
                    <span className="tabular">{selectedLog.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
                  <h4 className="text-sm font-semibold">Metadata</h4>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">IP Address</span>
                    <span className="font-mono text-xs">{selectedLog.ipAddress}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground mb-1">Device / Browser</span>
                    <span className="text-muted-foreground">Chrome / Windows</span>
                  </div>
                </div>
              </div>

              {/* Timeline Context (Mock Context around the action) */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Session Context Timeline</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-50">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-gray-300 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-xs ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">User Login</div>
                      <div className="text-[10px] text-muted-foreground">5 mins before action</div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className={`flex items-center justify-center w-3 h-3 rounded-full border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                      selectedLog.status === 'success' ? 'border-green-500' :
                      selectedLog.status === 'failed' ? 'border-red-500' : 'border-orange-500'
                    }`} />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-xs ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">{selectedLog.action}</div>
                      <div className="text-[10px] text-muted-foreground">{selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
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
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </span>
    </th>
  );
}
