import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  ArrowUpDown,
  Plus,
} from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

// Integration imports
import { getAudits, createAuditCycle, verifyAuditAsset, closeAuditCycle, AuditCycle, VerificationStatus } from "../../services/auditService";

export function AssetAudits() {
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  async function loadAudits() {
    try {
      setLoading(true);
      const list = await getAudits();
      setAudits(list);
    } catch (err) {
      toast.error("Failed to load audit cycles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAudits();
  }, []);

  const activeAudits = audits.filter(a => a.status === "active").length;
  const verifiedAssets = audits.reduce((acc, a) => acc + a.assets.filter(ast => ast.status === "verified").length, 0);
  const missingAssets = audits.reduce((acc, a) => acc + a.assets.filter(ast => ast.status === "missing").length, 0);
  const damagedAssets = audits.reduce((acc, a) => acc + a.assets.filter(ast => ast.status === "damaged").length, 0);

  const STATS = [
    { label: "Active Audit Cycles", value: activeAudits.toString(), delta: "in progress", trend: "up", icon: ClipboardCheck, sub: "current cycles" },
    { label: "Assets Verified", value: verifiedAssets.toString(), delta: "satisfactory", trend: "up", icon: CheckCircle2, sub: "completed" },
    { label: "Missing Assets", value: missingAssets.toString(), delta: "unresolved", trend: "down", icon: XCircle, sub: "needs tracking" },
    { label: "Damaged Assets", value: damagedAssets.toString(), delta: "needs repair", trend: "up", icon: AlertTriangle, sub: "reported defects" },
  ];

  const handleCreateAudit = async () => {
    setFormError("");
    if (!newForm.name || !newForm.department || !newForm.startDate || !newForm.endDate || !newForm.auditors) {
      setFormError("Please fill in all mandatory fields (Name, Department Scope, Dates, Auditors).");
      return;
    }

    if (new Date(newForm.endDate) <= new Date(newForm.startDate)) {
      setFormError("End Date must be after Start Date.");
      return;
    }

    try {
      await createAuditCycle(
        newForm.name,
        newForm.department,
        newForm.location || "GlobalScope",
        newForm.startDate,
        newForm.endDate,
        newForm.auditors
      );

      await loadAudits();
      setIsCreateModalOpen(false);
      toast.success("Audit Cycle Created");
      
      // Reset
      setNewForm({ name: "", department: "", location: "", startDate: "", endDate: "", auditors: "", notes: "" });
    } catch (err: any) {
      setFormError(err.message || "Failed to create audit cycle");
    }
  };

  const handleVerifyAsset = async (assetId: string, status: VerificationStatus, remarks?: string) => {
    if (!selectedAudit) return;

    try {
      await verifyAuditAsset(selectedAudit.id, assetId, status, remarks || "Verified during cycle");
      
      // Reload lists and refresh selected drawer content
      const list = await getAudits();
      setAudits(list);
      
      const updatedCycle = list.find(c => c.id === selectedAudit.id);
      if (updatedCycle) {
        setSelectedAudit(updatedCycle);
      }

      if (status === "missing" || status === "damaged") {
        toast.warning("Discrepancy Logged");
      } else {
        toast.success("Asset Verified");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to verify asset");
    }
  };

  const handleCloseAudit = async () => {
    if (!selectedAudit) return;
    
    try {
      await closeAuditCycle(selectedAudit.id);
      
      const list = await getAudits();
      setAudits(list);
      
      const updatedCycle = list.find(c => c.id === selectedAudit.id);
      if (updatedCycle) {
        setSelectedAudit(updatedCycle);
      }

      toast.success("Audit Cycle Closed & Locked");
    } catch (err: any) {
      toast.error(err.message || "Failed to close audit cycle");
    }
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

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading audit cycles...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => {
              const Icon = s.icon;
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
                    <div className="text-xs font-semibold tabular text-muted-foreground">
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
                            <div className="flex flex-wrap items-center gap-1">
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
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
                  placeholder="e.g. IT (or Global)"
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
