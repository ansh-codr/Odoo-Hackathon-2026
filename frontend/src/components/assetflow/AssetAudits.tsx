import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Plus,
} from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

type AuditStatus = "scheduled" | "active" | "completed" | "closed";
type VerificationStatus = "pending" | "verified" | "missing" | "damaged";

type AuditAsset = {
  id: string;
  tag: string;
  name: string;
  department: string;
  status: VerificationStatus;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
};

type AuditCycle = {
  id: string;
  name: string;
  department: string;
  location: string;
  auditors: string[];
  startDate: string;
  endDate: string;
  status: AuditStatus;
  assets: AuditAsset[];
};

const STATS = [
  { label: "Active Audit Cycles", value: "3", delta: "1", trend: "up", icon: ClipboardCheck, sub: "in progress" },
  { label: "Assets Verified", value: "842", delta: "12%", trend: "up", icon: CheckCircle2, sub: "this month" },
  { label: "Missing Assets", value: "12", delta: "2", trend: "down", icon: XCircle, sub: "unresolved" },
  { label: "Damaged Assets", value: "8", delta: "0", trend: "up", icon: AlertTriangle, sub: "needs repair" },
];

const MOCK_ASSETS: AuditAsset[] = [
  { id: "A-1", tag: "AF-0112", name: "MacBook Pro M2", department: "Engineering", status: "pending" },
  { id: "A-2", tag: "AF-0240", name: "Office Chair v2", department: "Engineering", status: "verified", verifiedBy: "Alex Wong", verifiedAt: "2026-07-11 10:30 AM" },
  { id: "A-3", tag: "AF-0050", name: "Projector X1", department: "Engineering", status: "missing", remarks: "Not found in meeting room A" },
  { id: "A-4", tag: "AF-0899", name: "Company iPad Pro", department: "Engineering", status: "damaged", remarks: "Screen cracked" },
];

const INITIAL_AUDITS: AuditCycle[] = [
  {
    id: "AUD-2026-01",
    name: "Q3 Engineering Asset Verification",
    department: "Engineering",
    location: "HQ - Floor 3",
    auditors: ["Alex Wong", "Sarah Jenkins"],
    startDate: "2026-07-10",
    endDate: "2026-07-20",
    status: "active",
    assets: [...MOCK_ASSETS],
  },
  {
    id: "AUD-2026-02",
    name: "Annual IT Hardware Check",
    department: "IT",
    location: "Global",
    auditors: ["Mike Ross"],
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    status: "scheduled",
    assets: [
      { id: "A-5", tag: "AF-0900", name: "Dell Server Rack", department: "IT", status: "pending" },
      { id: "A-6", tag: "AF-0901", name: "Cisco Router", department: "IT", status: "pending" },
    ],
  },
  {
    id: "AUD-2026-00",
    name: "Q2 Sales Equipment Audit",
    department: "Sales",
    location: "Regional Office",
    auditors: ["Emily Davis"],
    startDate: "2026-04-01",
    endDate: "2026-04-10",
    status: "closed",
    assets: [
      { id: "A-7", tag: "AF-0910", name: "Sales Laptop 1", department: "Sales", status: "verified" },
      { id: "A-8", tag: "AF-0911", name: "Sales Laptop 2", department: "Sales", status: "verified" },
    ],
  },
];

export function AssetAudits() {
  const [audits, setAudits] = useState<AuditCycle[]>(INITIAL_AUDITS);
  
  // Drawer State
  const [selectedAudit, setSelectedAudit] = useState<AuditCycle | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    department: "",
    location: "",
    startDate: "",
    endDate: "",
    auditors: "",
    notes: ""
  });
  const [formError, setFormError] = useState("");

  const handleCreateAudit = () => {
    setFormError("");
    if (!newForm.name || !newForm.department || !newForm.startDate || !newForm.endDate || !newForm.auditors) {
      setFormError("Please fill in all mandatory fields (Name, Department, Dates, Auditors).");
      return;
    }

    if (new Date(newForm.endDate) <= new Date(newForm.startDate)) {
      setFormError("End Date must be after Start Date.");
      return;
    }

    const newAudit: AuditCycle = {
      id: `AUD-2026-0${audits.length + 1}`,
      name: newForm.name,
      department: newForm.department,
      location: newForm.location,
      auditors: newForm.auditors.split(",").map(a => a.trim()),
      startDate: newForm.startDate,
      endDate: newForm.endDate,
      status: "scheduled",
      assets: [], // empty for mock
    };

    setAudits((prev) => [newAudit, ...prev]);
    setIsCreateModalOpen(false);
    toast.success("Audit Cycle Created", { description: `${newAudit.name} scheduled.` });
    
    // Reset
    setNewForm({ name: "", department: "", location: "", startDate: "", endDate: "", auditors: "", notes: "" });
  };

  const handleVerifyAsset = (assetId: string, status: VerificationStatus, remarks?: string) => {
    if (!selectedAudit) return;

    const updatedAssets = selectedAudit.assets.map(a => 
      a.id === assetId ? { 
        ...a, 
        status, 
        remarks: remarks || a.remarks, 
        verifiedBy: "Current User", 
        verifiedAt: new Date().toLocaleString() 
      } : a
    );

    const isAllVerified = updatedAssets.every(a => a.status !== "pending");
    const updatedStatus = isAllVerified ? "completed" : selectedAudit.status;

    const updatedAudit = { ...selectedAudit, assets: updatedAssets, status: updatedStatus as AuditStatus };
    
    setSelectedAudit(updatedAudit);
    setAudits(prev => prev.map(a => a.id === updatedAudit.id ? updatedAudit : a));
    
    if (status === "missing" || status === "damaged") {
      toast.warning("Discrepancy Detected", { description: `Asset marked as ${status}.` });
    } else {
      toast.success("Asset Verified");
    }
  };

  const handleCloseAudit = () => {
    if (!selectedAudit) return;
    
    const hasPending = selectedAudit.assets.some(a => a.status === "pending");
    if (hasPending) {
      toast.error("Cannot close audit. Some assets are still pending verification.");
      return;
    }

    const updatedAudit = { ...selectedAudit, status: "closed" as AuditStatus };
    setSelectedAudit(updatedAudit);
    setAudits(prev => prev.map(a => a.id === updatedAudit.id ? updatedAudit : a));
    toast.success("Audit Closed", { description: `Audit ${updatedAudit.id} is now closed and locked.` });
  };

  const getProgress = (audit: AuditCycle) => {
    if (audit.assets.length === 0) return 0;
    const verified = audit.assets.filter(a => a.status !== "pending").length;
    return Math.round((verified / audit.assets.length) * 100);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace · Compliance
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Asset Audit
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan, execute and manage organizational asset verification cycles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Audit Cycle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          const up = s.trend === "up";
          const isWarning = s.label.includes("Missing") || s.label.includes("Damaged");
          return (
            <div key={s.label} className="card-surface p-4">
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                <div className={`grid h-7 w-7 place-items-center rounded-md text-muted-foreground ${isWarning ? 'bg-orange-50 text-orange-500' : 'bg-muted'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="font-display text-3xl font-bold tracking-tight tabular text-foreground">
                  {s.value}
                </div>
                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular ${
                    isWarning 
                      ? (up ? "text-status-lost" : "text-status-available")
                      : (up ? "text-status-available" : "text-status-lost")
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

      {/* Main Content */}
      <div className="mt-6 card-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search audits..."
                className="h-8 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Select>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {audits.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Th>Audit Cycle ID</Th>
                  <Th>Audit Name</Th>
                  <Th>Dept / Location</Th>
                  <Th>Assigned Auditors</Th>
                  <Th>Dates</Th>
                  <Th>Progress</Th>
                  <Th>Status</Th>
                  <Th className="text-right pr-4">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => {
                  const progress = getProgress(a);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] font-medium text-foreground">
                        {a.id}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {a.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{a.department}</div>
                        <div className="text-[11px] text-muted-foreground">{a.location}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {a.auditors.map((auditor, i) => (
                            <div key={i} className="inline-flex h-6 items-center justify-center rounded-full bg-muted px-2 text-[10px] font-medium text-foreground">
                              {auditor}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <div className="tabular text-foreground">{a.startDate}</div>
                        <div className="text-[11px] tabular text-muted-foreground">to {a.endDate}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div 
                              className="h-full rounded-full bg-primary transition-all" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium tabular text-muted-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={a.status as any} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 pr-4 text-right">
                        <button 
                          onClick={() => setSelectedAudit(a)}
                          className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">No audit cycles found</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first audit cycle.</p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4" size="sm">
                Create First Audit Cycle
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Audit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Audit Cycle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Audit Name *</Label>
              <Input 
                id="name" 
                value={newForm.name} 
                onChange={(e) => setNewForm({...newForm, name: e.target.value})} 
                placeholder="e.g. Q3 Hardware Verification"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dept">Department Scope *</Label>
                <Input 
                  id="dept" 
                  value={newForm.department} 
                  onChange={(e) => setNewForm({...newForm, department: e.target.value})} 
                  placeholder="e.g. IT"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loc">Location Scope</Label>
                <Input 
                  id="loc" 
                  value={newForm.location} 
                  onChange={(e) => setNewForm({...newForm, location: e.target.value})} 
                  placeholder="e.g. HQ - Floor 2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date *</Label>
                <Input 
                  id="start" 
                  type="date"
                  value={newForm.startDate} 
                  onChange={(e) => setNewForm({...newForm, startDate: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Date *</Label>
                <Input 
                  id="end" 
                  type="date"
                  value={newForm.endDate} 
                  onChange={(e) => setNewForm({...newForm, endDate: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="auditors">Assign Auditors (comma separated) *</Label>
              <Input 
                id="auditors" 
                value={newForm.auditors} 
                onChange={(e) => setNewForm({...newForm, auditors: e.target.value})} 
                placeholder="e.g. Alex Wong, Jane Doe"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={newForm.notes} 
                onChange={(e) => setNewForm({...newForm, notes: e.target.value})} 
                placeholder="Optional instructions for auditors..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAudit}>Create Audit Cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Details Drawer */}
      <Sheet open={!!selectedAudit} onOpenChange={(open) => !open && setSelectedAudit(null)}>
        <SheetContent className="w-[500px] sm:w-[700px] overflow-y-auto !max-w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>Audit Details</SheetTitle>
            <SheetDescription>
              {selectedAudit?.id} · {selectedAudit?.name}
            </SheetDescription>
          </SheetHeader>
          
          {selectedAudit && (
            <div className="space-y-8">
              {/* Audit Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-md border border-border p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Scope</span>
                  <div className="font-medium">{selectedAudit.department}</div>
                  <div className="text-muted-foreground">{selectedAudit.location}</div>
                </div>
                <div className="rounded-md border border-border p-3">
                  <span className="text-xs text-muted-foreground block mb-1">Schedule</span>
                  <div className="font-medium tabular">{selectedAudit.startDate} to {selectedAudit.endDate}</div>
                  <div className="mt-1"><StatusPill status={selectedAudit.status as any} /></div>
                </div>
              </div>

              {/* Assets List */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
                  <span>Assets Included ({selectedAudit.assets.length})</span>
                  <span className="text-xs font-normal text-muted-foreground">Progress: {getProgress(selectedAudit)}%</span>
                </h4>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-[11px] uppercase text-muted-foreground text-left">
                        <th className="px-3 py-2 font-medium">Asset</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAudit.assets.length === 0 ? (
                        <tr><td colSpan={3} className="p-4 text-center text-muted-foreground text-xs">No assets in this scope.</td></tr>
                      ) : selectedAudit.assets.map((asset) => (
                        <tr key={asset.id} className="border-b border-border/50 last:border-0">
                          <td className="px-3 py-2">
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{asset.tag}</div>
                          </td>
                          <td className="px-3 py-2">
                            <StatusPill status={asset.status as any} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            {selectedAudit.status === "closed" ? (
                              <span className="text-xs text-muted-foreground">Locked</span>
                            ) : asset.status !== "pending" ? (
                              <div className="text-xs text-muted-foreground flex flex-col items-end">
                                <span>by {asset.verifiedBy}</span>
                                <span className="tabular">{asset.verifiedAt}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <Button size="sm" variant="outline" className="h-7 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200" onClick={() => handleVerifyAsset(asset.id, "verified")}>
                                  Verify
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200" onClick={() => {
                                  const remarks = prompt("Enter remarks for missing asset:");
                                  if (remarks) handleVerifyAsset(asset.id, "missing", remarks);
                                }}>
                                  Missing
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200" onClick={() => {
                                  const remarks = prompt("Enter remarks for damaged asset:");
                                  if (remarks) handleVerifyAsset(asset.id, "damaged", remarks);
                                }}>
                                  Damage
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Discrepancy Report */}
              {selectedAudit.assets.some(a => a.status === "missing" || a.status === "damaged") && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-4 w-4" /> Discrepancy Report
                  </h4>
                  <div className="rounded-md border border-orange-200 bg-orange-50/50 p-0 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-orange-100/50 border-b border-orange-200 text-[11px] uppercase text-orange-800 text-left">
                          <th className="px-3 py-2 font-medium">Asset</th>
                          <th className="px-3 py-2 font-medium">Issue</th>
                          <th className="px-3 py-2 font-medium">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAudit.assets.filter(a => a.status === "missing" || a.status === "damaged").map((asset) => (
                          <tr key={`disc-${asset.id}`} className="border-b border-orange-200/50 last:border-0">
                            <td className="px-3 py-2">
                              <div className="font-medium text-orange-900">{asset.name}</div>
                              <div className="text-xs text-orange-700 font-mono">{asset.tag}</div>
                            </td>
                            <td className="px-3 py-2">
                              <StatusPill status={asset.status as any} />
                            </td>
                            <td className="px-3 py-2 text-xs text-orange-800">
                              {asset.remarks || "No remarks provided."}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Audit History</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">Audit Cycle Created</div>
                      <div className="text-xs text-muted-foreground">{selectedAudit.startDate}</div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">Auditors Assigned</div>
                      <div className="text-xs text-muted-foreground">{selectedAudit.auditors.join(", ")}</div>
                    </div>
                  </div>
                  
                  {getProgress(selectedAudit) > 0 && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Verification Started</div>
                        <div className="text-xs text-muted-foreground">{getProgress(selectedAudit)}% Complete</div>
                      </div>
                    </div>
                  )}

                  {selectedAudit.assets.some(a => a.status === "missing" || a.status === "damaged") && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-orange-500 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-orange-600">Discrepancy Detected</div>
                        <div className="text-xs text-muted-foreground">Report generated</div>
                      </div>
                    </div>
                  )}

                  {selectedAudit.status === "completed" || selectedAudit.status === "closed" ? (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Assets Verified</div>
                        <div className="text-xs text-muted-foreground">All assigned assets checked</div>
                      </div>
                    </div>
                  ) : null}

                  {selectedAudit.status === "closed" && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-gray-500 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Audit Closed</div>
                        <div className="text-xs text-muted-foreground">Cycle locked by manager</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Action */}
              {selectedAudit.status !== "closed" && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Close Audit Cycle</h4>
                      <p className="text-xs text-muted-foreground">Lock this cycle and mark as read-only. Requires 100% verification.</p>
                    </div>
                    <Button 
                      onClick={handleCloseAudit} 
                      disabled={selectedAudit.assets.some(a => a.status === "pending")}
                    >
                      Close Audit
                    </Button>
                  </div>
                </div>
              )}
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
