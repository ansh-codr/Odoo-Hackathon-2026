import React, { useState, useEffect } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Plus,
  Filter,
  ArrowUpDown,
  UserCheck,
} from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

// Integration imports
import { 
  getMaintenanceRequests, 
  createMaintenanceRequest, 
  approveMaintenanceRequest, 
  rejectMaintenanceRequest, 
  assignTechnician, 
  startMaintenance, 
  resolveMaintenanceRequest 
} from "../../services/maintenanceService";
import { getAssets } from "../../services/assetService";
import { Asset } from "../../services/types";

type MaintenanceStatus = "pending" | "approved" | "rejected" | "technician_assigned" | "in_progress" | "resolved";
type Priority = "low" | "medium" | "high" | "critical";

type MaintenanceRequest = {
  id: string;
  assetId?: string;
  assetTag: string;
  assetName: string;
  category: string;
  raisedBy: string;
  department: string;
  priority: Priority;
  status: MaintenanceStatus;
  technician: string;
  createdDate: string;
  description: string;
};

export const INITIAL_REQUESTS: MaintenanceRequest[] = [];

export function MaintenanceManagement() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assetsList, setAssetsList] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

  // Form State
  const [newAssetId, setNewAssetId] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [formError, setFormError] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      const [list, allAssets] = await Promise.all([
        getMaintenanceRequests(),
        getAssets()
      ]);
      setAssetsList(allAssets);

      const mappedList: MaintenanceRequest[] = list.map((m) => {
        let statusVal: MaintenanceStatus = "pending";
        if (m.status === "Approved") statusVal = "approved";
        else if (m.status === "Rejected") statusVal = "rejected";
        else if (m.status === "Technician_Assigned") statusVal = "technician_assigned";
        else if (m.status === "In_Progress") statusVal = "in_progress";
        else if (m.status === "Resolved") statusVal = "resolved";

        let priorityVal: Priority = "medium";
        if (m.priority === "Low") priorityVal = "low";
        else if (m.priority === "High") priorityVal = "high";
        else if (m.priority === "Critical") priorityVal = "critical";

        const asset = allAssets.find(a => a.id === m.assetId);

        return {
          id: m.id,
          assetId: m.assetId,
          assetTag: m.assetTag,
          assetName: m.assetName,
          category: asset ? asset.categoryId : "Electronics",
          raisedBy: m.userName,
          department: "Operations",
          priority: priorityVal,
          status: statusVal,
          technician: m.technician || "—",
          createdDate: new Date(m.createdAt).toISOString().split("T")[0],
          description: m.issueDescription
        };
      });

      setRequests(mappedList);
    } catch (err) {
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const inProgressCount = requests.filter(r => r.status === "in_progress" || r.status === "technician_assigned").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("maintenance-update", { detail: pendingCount }));
  }, [pendingCount]);

  const STATS = [
    { label: "Total Requests", value: totalRequests.toString(), delta: "this month", trend: "up", icon: Wrench, sub: "all requests" },
    { label: "Pending Approval", value: pendingCount.toString(), delta: "needs review", trend: "down", icon: Clock, sub: "awaiting dispatch" },
    { label: "In Progress", value: inProgressCount.toString(), delta: "active repairs", trend: "up", icon: UserCheck, sub: "currently open" },
    { label: "Resolved Tasks", value: resolvedCount.toString(), delta: "fixed items", trend: "up", icon: CheckCircle2, sub: "completed" },
  ];

  const handleRaiseRequest = async () => {
    setFormError("");

    if (!newAssetId || !newDesc || !newPriority) {
      setFormError("Please fill in all mandatory fields (Asset, Description, Priority).");
      return;
    }

    const targetAsset = assetsList.find(a => a.id === newAssetId);
    if (!targetAsset) {
      setFormError("Invalid asset selection.");
      return;
    }

    // Check for duplicate active requests
    const hasActiveDuplicate = requests.some(
      (r) => r.assetId === newAssetId && r.status !== "resolved" && r.status !== "rejected"
    );

    if (hasActiveDuplicate) {
      setFormError("This asset already has an active maintenance request.");
      return;
    }

    let priVal: "Low" | "Medium" | "High" | "Critical" = "Medium";
    if (newPriority === "low") priVal = "Low";
    else if (newPriority === "high") priVal = "High";
    else if (newPriority === "critical") priVal = "Critical";

    try {
      await createMaintenanceRequest(targetAsset.id, newDesc, priVal);
      await loadRequests();
      setIsNewModalOpen(false);
      toast.success("Maintenance Request Submitted");

      setNewAssetId("");
      setNewDesc("");
      setNewPriority("medium");
    } catch (err: any) {
      setFormError(err.message || "Failed to submit request");
    }
  };

  const handleManagerAction = async (action: "approve" | "reject" | "assign" | "progress" | "resolve") => {
    if (!selectedRequest) return;

    try {
      if (action === "approve") {
        await approveMaintenanceRequest(selectedRequest.id);
        toast.success("Request Approved");
      } else if (action === "reject") {
        await rejectMaintenanceRequest(selectedRequest.id);
        toast.success("Request Rejected");
      } else if (action === "assign") {
        const name = prompt("Enter Technician Name:");
        if (!name) return;
        await assignTechnician(selectedRequest.id, name);
        toast.success("Technician Assigned");
      } else if (action === "progress") {
        await startMaintenance(selectedRequest.id);
        toast.success("Repair Started");
      } else if (action === "resolve") {
        const costStr = prompt("Enter Maintenance Cost ($):", "0");
        if (costStr === null) return;
        const costVal = parseFloat(costStr) || 0;
        const notes = prompt("Enter Resolution Notes:", "Repair completed successfully.");
        if (notes === null) return;

        await resolveMaintenanceRequest(selectedRequest.id, costVal, notes);
        toast.success("Request Resolved");
      }

      await loadRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Maintenance · Workspace
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Maintenance Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track, approve, assign and resolve asset maintenance requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Raise Maintenance Request
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading maintenance dashboard...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => {
              const Icon = s.icon;
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
                    placeholder="Search requests..."
                    className="h-8 w-[200px] rounded-md border border-input bg-background pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {requests.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Th>Request ID</Th>
                      <Th>Asset</Th>
                      <Th>Raised By</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th>Technician</Th>
                      <Th>Created Date</Th>
                      <Th className="text-right pr-4">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] font-medium text-foreground">
                          {r.id}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-foreground">{r.assetName}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{r.assetTag}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <div className="font-medium text-foreground">{r.raisedBy}</div>
                          <div className="text-[11px] text-muted-foreground">{r.department}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusPill status={r.priority as any} />
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusPill status={r.status as any} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-foreground">
                          {r.technician}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground tabular">
                          {r.createdDate}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 pr-4 text-right">
                          <button 
                            onClick={() => setSelectedRequest(r)}
                            className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">No maintenance requests found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Get started by raising a new request.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Raise Request Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Raise Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="asset">Select Asset *</Label>
              <Select value={newAssetId} onValueChange={setNewAssetId}>
                <SelectTrigger id="asset">
                  <SelectValue placeholder="Select existing asset" />
                </SelectTrigger>
                <SelectContent>
                  {assetsList.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} ({asset.assetTag})
                    </SelectItem>
                  ))}
                  {assetsList.length === 0 && (
                    <div className="text-xs text-muted-foreground p-2">No assets registered yet.</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="desc">Issue Description *</Label>
              <Input 
                id="desc" 
                value={newDesc} 
                onChange={(e) => setNewDesc(e.target.value)} 
                placeholder="Detailed description of the problem..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={newPriority} onValueChange={(val: Priority) => setNewPriority(val)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRaiseRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Drawer */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Request Details</SheetTitle>
            <SheetDescription>
              {selectedRequest?.id}
            </SheetDescription>
          </SheetHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Asset Information</h4>
                <div className="rounded-md border border-border p-3 text-sm grid gap-1">
                  <div className="font-medium">{selectedRequest.assetName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{selectedRequest.assetTag}</div>
                  <div className="text-xs text-muted-foreground mt-1">Category: {selectedRequest.category}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Request Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Raised By</span>
                    <span className="font-medium">{selectedRequest.raisedBy} ({selectedRequest.department})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedRequest.createdDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Priority</span>
                    <StatusPill status={selectedRequest.priority as any} />
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <StatusPill status={selectedRequest.status as any} />
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Technician</span>
                    <span className="font-medium">{selectedRequest.technician}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-1">Description</span>
                    <p className="text-sm">{selectedRequest.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Timeline</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">Maintenance Request Created</div>
                      <div className="text-xs text-muted-foreground">{selectedRequest.createdDate}</div>
                    </div>
                  </div>
                  {(selectedRequest.status === "approved" || selectedRequest.status === "technician_assigned" || selectedRequest.status === "in_progress" || selectedRequest.status === "resolved") && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Approved</div>
                        <div className="text-xs text-muted-foreground">Pending technician assignment</div>
                      </div>
                    </div>
                  )}
                  {selectedRequest.status === "rejected" && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-destructive bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-destructive">Rejected</div>
                      </div>
                    </div>
                  )}
                  {(selectedRequest.status === "technician_assigned" || selectedRequest.status === "in_progress" || selectedRequest.status === "resolved") && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Technician Assigned</div>
                      </div>
                    </div>
                  )}
                  {(selectedRequest.status === "in_progress" || selectedRequest.status === "resolved") && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Repair Started</div>
                      </div>
                    </div>
                  )}
                  {selectedRequest.status === "resolved" && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-foreground">Resolved</div>
                        <div className="text-xs text-muted-foreground">Asset status updated to Available</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.status !== "resolved" && selectedRequest.status !== "rejected" && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold mb-3">Manager Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.status === "pending" && (
                      <>
                        <Button onClick={() => handleManagerAction("approve")} variant="default">Approve Request</Button>
                        <Button onClick={() => handleManagerAction("reject")} variant="destructive">Reject Request</Button>
                      </>
                    )}
                    {selectedRequest.status === "approved" && (
                      <Button onClick={() => handleManagerAction("assign")} variant="outline" className="col-span-2">Assign Technician</Button>
                    )}
                    {selectedRequest.status === "technician_assigned" && (
                      <Button onClick={() => handleManagerAction("progress")} variant="outline" className="col-span-2">Update Progress (Start)</Button>
                    )}
                    {selectedRequest.status === "in_progress" && (
                      <Button onClick={() => handleManagerAction("resolve")} variant="default" className="col-span-2 bg-green-600 hover:bg-green-700">Mark as Resolved</Button>
                    )}
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
