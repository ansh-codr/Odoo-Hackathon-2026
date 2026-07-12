import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Package,
  Wrench,
  Users,
  Clock,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line
} from "recharts";

// Firestore imports
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Integration imports
import { getAssets } from "../../services/assetService";
import { getBookings } from "../../services/bookingService";
import { Asset, Booking } from "../../services/types";

type Report = {
  id: string;
  name: string;
  type: string;
  generatedBy: string;
  createdOn: string;
  format: string;
  details?: any;
};

const REPORTS_MOCK: Report[] = [
  { id: "R-01", name: "Q3 Asset Lifecycle Report", type: "Lifecycle", generatedBy: "System", createdOn: "2026-07-12", format: "PDF" },
  { id: "R-02", name: "Maintenance Costs - June", type: "Maintenance", generatedBy: "Alex Wong", createdOn: "2026-07-01", format: "Excel" },
];

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState(REPORTS_MOCK);
  const [loading, setLoading] = useState(true);

  // Firestore state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ report: "", frequency: "", format: "", recipients: "" });
  
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState<Report | null>(null);

  async function fetchReportData() {
    try {
      setLoading(true);
      const [assetsList, bookingsList, discSnap] = await Promise.all([
        getAssets(),
        getBookings(),
        getDocs(collection(db, "discrepancyReports"))
      ]);
      setAssets(assetsList);
      setBookings(bookingsList);
      setDiscrepancies(discSnap.docs.map(doc => doc.data()));
    } catch (err) {
      toast.error("Failed to load reports and analytics data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleScheduleReport = () => {
    if (!scheduleForm.report || !scheduleForm.frequency || !scheduleForm.recipients) {
      toast.error("Please fill in all mandatory fields (Report, Frequency, Recipients).");
      return;
    }
    toast.success("Report scheduled successfully!");
    setScheduleModalOpen(false);
    setScheduleForm({ report: "", frequency: "", format: "", recipients: "" });
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting dashboard data to ${format}...`);
  };

  // Calculations: Total Assets and status counts
  const totalAssets = assets.length;
  const availableCount = assets.filter(a => a.status === "Available").length;
  const allocatedCount = assets.filter(a => a.status === "Allocated").length;
  const reservedCount = assets.filter(a => a.status === "Reserved").length;
  const maintenanceCount = assets.filter(a => a.status === "Under_Maintenance").length;
  const retiredCount = assets.filter(a => a.status === "Retired" || a.status === "Disposed").length;
  const overdueCount = assets.filter(a => a.status === "Overdue").length;

  const utilizationRate = totalAssets > 0 ? Math.round(((allocatedCount + reservedCount) / totalAssets) * 100) : 0;

  const STATS = [
    { label: "Total Assets", value: totalAssets.toString(), delta: "registered size", trend: "up", icon: Package },
    { label: "Asset Utilization", value: `${utilizationRate}%`, delta: "active usage", trend: "up", icon: BarChart3 },
    { label: "Active Allocations", value: allocatedCount.toString(), delta: "checked out", trend: "up", icon: Users },
    { label: "Under Maintenance", value: maintenanceCount.toString(), delta: "needs repair", trend: "down", icon: Wrench },
    { label: "Active Bookings", value: bookings.filter(b => b.status === "CheckedIn").length.toString(), delta: "ongoing slots", trend: "up", icon: Clock },
    { label: "Overdue Items", value: overdueCount.toString(), delta: "past expected return", trend: "up", icon: Calendar },
  ];

  // Calculations: Weekly Booking Heatmap / Utilization trend (Mon - Sun)
  const bookingCountsByDay = [0, 0, 0, 0, 0, 0, 0];
  bookings.forEach((b) => {
    if (b.status !== "Cancelled") {
      const dayIndex = new Date(b.date).getDay();
      bookingCountsByDay[dayIndex]++;
    }
  });

  const UTILIZATION_DATA = [
    { name: 'Mon', value: bookingCountsByDay[1] },
    { name: 'Tue', value: bookingCountsByDay[2] },
    { name: 'Wed', value: bookingCountsByDay[3] },
    { name: 'Thu', value: bookingCountsByDay[4] },
    { name: 'Fri', value: bookingCountsByDay[5] },
    { name: 'Sat', value: bookingCountsByDay[6] },
    { name: 'Sun', value: bookingCountsByDay[0] },
  ];

  // Calculations: Lifecycle distribution
  const LIFECYCLE_DATA = [
    { name: 'Available', value: availableCount, color: '#10b981' },
    { name: 'Allocated', value: allocatedCount, color: '#3b82f6' },
    { name: 'Reserved', value: reservedCount, color: '#8b5cf6' },
    { name: 'Maintenance', value: maintenanceCount, color: '#f59e0b' },
    { name: 'Retired', value: retiredCount, color: '#6b7280' },
  ];

  // Calculations: Department Allocations
  const deptMap: Record<string, number> = {};
  assets.forEach((a) => {
    if (a.departmentId) {
      deptMap[a.departmentId] = (deptMap[a.departmentId] || 0) + 1;
    }
  });

  const DEPT_ALLOCATION_DATA = Object.keys(deptMap).map(key => ({
    name: key,
    assets: deptMap[key]
  })).slice(0, 5);

  const MAINTENANCE_COST_DATA = [
    { month: 'Jan', cost: 4000 }, { month: 'Feb', cost: 3000 }, { month: 'Mar', cost: 5000 },
    { month: 'Apr', cost: 4500 }, { month: 'May', cost: 6000 }, { month: 'Jun', cost: 3500 },
  ];

  const dynamicReports: Report[] = discrepancies.map(d => ({
    id: d.id,
    name: `Discrepancy Report - ${d.cycleName}`,
    type: "Discrepancy",
    generatedBy: "System",
    createdOn: new Date(d.generatedAt).toISOString().split("T")[0],
    format: "PDF",
    details: d
  }));

  const combinedReports = [...dynamicReports, ...reports];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace · Insights
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor shared resource utilization, booking heatmaps, and lifecycle analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export PDF
          </Button>
          <Button onClick={() => setScheduleModalOpen(true)} size="sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5" /> Schedule Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading report calculations...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-6 mb-6 flex-shrink-0">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="card-surface p-4">
                  <div className="flex items-start justify-between">
                    <div className="text-xs font-medium text-muted-foreground line-clamp-1">{s.label}</div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{s.value}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    {s.delta}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card-surface flex-1 flex flex-col min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b border-border px-4 py-2 flex-shrink-0">
                <TabsList>
                  <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
                  <TabsTrigger value="reports">Saved & Generated Reports</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
                {activeTab === "dashboard" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Weekly Utilization Heatmap */}
                    <div className="card-surface p-4 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Resource Booking Heatmap (Weekly)</h3>
                      <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={UTILIZATION_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Maintenance Cost Trend */}
                    <div className="card-surface p-4 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Maintenance Cost Trend ($)</h3>
                      <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={MAINTENANCE_COST_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Asset Lifecycle Status Pie */}
                    <div className="card-surface p-4 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Asset Lifecycle Distribution</h3>
                      <div className="flex-1 min-h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie data={LIFECYCLE_DATA} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                              {LIFECYCLE_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        {LIFECYCLE_DATA.map(d => (
                          <div key={d.name} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                            <span className="text-muted-foreground">{d.name} ({d.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dept Allocation */}
                    <div className="card-surface p-4 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Department Allocation Summary</h3>
                      <div className="flex-1 min-h-[250px]">
                        {DEPT_ALLOCATION_DATA.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No active allocations yet.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DEPT_ALLOCATION_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#111827' }} width={80} />
                              <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="assets" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reports" && (
                  <div className="bg-background rounded-md border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <Th>Report Name</Th>
                          <Th>Report Type</Th>
                          <Th>Generated By</Th>
                          <Th>Created On</Th>
                          <Th>Format</Th>
                          <Th className="text-right pr-4">Actions</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {combinedReports.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No reports available.</td></tr>
                        ) : combinedReports.map(r => (
                          <tr key={r.id} className="border-b border-border/60 hover:bg-muted/40">
                            <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{r.type}</td>
                            <td className="px-4 py-3">{r.generatedBy}</td>
                            <td className="px-4 py-3 tabular">{r.createdOn}</td>
                            <td className="px-4 py-3 font-mono text-xs">{r.format}</td>
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setPreviewDrawerOpen(r)}>View Preview</DropdownMenuItem>
                                  <DropdownMenuItem>Download</DropdownMenuItem>
                                  <DropdownMenuItem>Share</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Tabs>
          </div>

          {/* Schedule Report Modal */}
          <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Automatic Report</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Report to Schedule *</Label>
                  <Select value={scheduleForm.report} onValueChange={v => setScheduleForm({...scheduleForm, report: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Report" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset_lifecycle">Asset Lifecycle Report</SelectItem>
                      <SelectItem value="dept_allocation">Department Allocation Report</SelectItem>
                      <SelectItem value="maintenance_log">Maintenance Log Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Frequency *</Label>
                  <Select value={scheduleForm.frequency} onValueChange={v => setScheduleForm({...scheduleForm, frequency: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Frequency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Export Format</Label>
                  <Select value={scheduleForm.format} onValueChange={v => setScheduleForm({...scheduleForm, format: v})}>
                    <SelectTrigger><SelectValue placeholder="Select Format (Optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Recipients (Emails) *</Label>
                  <Input 
                    value={scheduleForm.recipients} 
                    onChange={e => setScheduleForm({...scheduleForm, recipients: e.target.value})} 
                    placeholder="Comma separated emails..." 
                  />
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button><Button onClick={handleScheduleReport}>Create Schedule</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Report Preview Drawer */}
          <Sheet open={!!previewDrawerOpen} onOpenChange={(open) => !open && setPreviewDrawerOpen(null)}>
            <SheetContent className="w-[500px] sm:w-[700px] overflow-y-auto !max-w-full">
              <SheetHeader className="mb-6">
                <SheetTitle>Report Preview</SheetTitle>
                <SheetDescription>{previewDrawerOpen?.name}</SheetDescription>
              </SheetHeader>
              {previewDrawerOpen && (
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Generated By</div>
                      <div className="font-medium">{previewDrawerOpen.generatedBy} on {previewDrawerOpen.createdOn}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Format</div>
                      <div className="font-mono">{previewDrawerOpen.format}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Report Summary</h4>
                    <div className="rounded-md border p-4 bg-muted/20 text-sm leading-relaxed text-muted-foreground">
                      This report summarizes {previewDrawerOpen.type.toLowerCase()} metrics across the selected date range. Data reflects organizational performance and active records within the AssetFlow system.
                    </div>
                  </div>

                  {previewDrawerOpen.type === "Discrepancy" && previewDrawerOpen.details?.discrepancies && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Discrepancy Details</h4>
                      <div className="rounded-md border overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-muted border-b">
                              <th className="p-2">Asset Tag</th>
                              <th className="p-2">Asset Name</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Auditor Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewDrawerOpen.details.discrepancies.map((d: any, idx: number) => (
                              <tr key={idx} className="border-b last:border-none">
                                <td className="p-2 font-mono font-medium">{d.assetTag}</td>
                                <td className="p-2">{d.assetName}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-0.5 rounded-full font-bold ${d.type === 'Missing' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{d.type}</span>
                                </td>
                                <td className="p-2 text-muted-foreground">{d.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPreviewDrawerOpen(null)}>Close Preview</Button>
                    <Button onClick={() => handleExport(previewDrawerOpen.format)}><Download className="mr-2 h-4 w-4" /> Download Full Report</Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={`px-4 py-2.5 text-left font-semibold ${className}`}>
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </span>
    </th>
  );
}
