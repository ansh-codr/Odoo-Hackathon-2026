import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Paperclip,
} from "lucide-react";
import { StatusPill } from "./StatusPill";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";
type Priority = "low" | "medium" | "high" | "critical";
type RequestType = "maintenance" | "transfer" | "return" | "allocation";

type ApprovalRequest = {
  id: string;
  type: RequestType;
  assetTag: string;
  assetName: string;
  requestedBy: string;
  department: string;
  priority: Priority;
  status: ApprovalStatus;
  submittedOn: string;
  
  // Specific details
  description?: string;
  currentHolder?: string;
  requestedHolder?: string;
  reason?: string;
  conditionCheck?: string;
  expectedReturnDate?: string;
};

const STATS = [
  { label: "Pending Approvals", value: "14", delta: "4", trend: "up", icon: ClipboardCheck, sub: "needs attention" },
  { label: "Approved Today", value: "28", delta: "12%", trend: "up", icon: CheckCircle2, sub: "processed" },
  { label: "Rejected Today", value: "3", delta: "1", trend: "down", icon: XCircle, sub: "declined requests" },
  { label: "Avg. Approval Time", value: "4.2h", delta: "0.5h", trend: "up", icon: Clock, sub: "last 7 days" },
];

const INITIAL_REQUESTS: ApprovalRequest[] = [
  {
    id: "REQ-2001",
    type: "maintenance",
    assetTag: "AF-0112",
    assetName: "MacBook Pro M2",
    requestedBy: "Sarah Jenkins",
    department: "Marketing",
    priority: "high",
    status: "pending",
    submittedOn: "2026-07-12",
    description: "Screen flickering sporadically during use. Needs urgent repair.",
  },
  {
    id: "REQ-2002",
    type: "transfer",
    assetTag: "AF-0240",
    assetName: "Office Chair v2",
    requestedBy: "David Chen",
    department: "Engineering",
    priority: "medium",
    status: "pending",
    submittedOn: "2026-07-11",
    currentHolder: "Mike Ross",
    requestedHolder: "David Chen",
    reason: "Current chair is broken, need a replacement while mine is repaired.",
  },
  {
    id: "REQ-2003",
    type: "return",
    assetTag: "AF-0050",
    assetName: "Projector X1",
    requestedBy: "Mike Ross",
    department: "Logistics",
    priority: "low",
    status: "pending",
    submittedOn: "2026-07-10",
    conditionCheck: "Good working condition. Minor scratch on the lens cover.",
  },
  {
    id: "REQ-2004",
    type: "allocation",
    assetTag: "AF-0899",
    assetName: "Company iPad Pro",
    requestedBy: "Emily Davis",
    department: "Sales",
    priority: "high",
    status: "approved",
    submittedOn: "2026-07-09",
    expectedReturnDate: "2026-08-01",
  },
];

export function ApprovalCenter() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<RequestType | "all">("all");
  
  // Drawer State
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const filteredRequests = requests.filter(r => activeTab === "all" || r.type === activeTab);

  const handleApprove = (req: ApprovalRequest) => {
    // In a real app, we might open a modal for optional comments here.
    // For this implementation, we'll auto-approve if clicked from table, or from drawer.
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r))
    );
    if (selectedRequest?.id === req.id) {
      setSelectedRequest({ ...selectedRequest, status: "approved" });
    }
    toast.success("Request Approved", { description: `${req.id} has been approved.` });
  };

  const handleOpenRejectModal = (req: ApprovalRequest) => {
    setSelectedRequest(req); // Ensure it's selected
    setRejectReason("");
    setRejectError("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is mandatory.");
      return;
    }
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "rejected" } : r))
      );
      setSelectedRequest({ ...selectedRequest, status: "rejected" });
      setIsRejectModalOpen(false);
      toast.success("Request Rejected", { description: `${selectedRequest.id} has been rejected.` });
    }
  };

  const handleEscalate = (req: ApprovalRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: "escalated" } : r))
    );
    if (selectedRequest?.id === req.id) {
      setSelectedRequest({ ...selectedRequest, status: "escalated" });
    }
    toast.success("Request Escalated", { description: `${req.id} has been escalated for further review.` });
  };

  const handleRequestInfo = () => {
    toast.success("Additional Information Requested", { description: "An email has been sent to the requester." });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace · Centralized Hub
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Manager Approval Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, approve and track operational requests across the organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted">
            <Download className="h-3.5 w-3.5" />
            Export Log
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          const up = s.trend === "up";
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
                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular ${
                    up ? "text-status-available" : "text-status-lost"
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
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <div className="border-b border-border px-4 pt-3">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b-0 rounded-none w-full justify-start overflow-x-auto hide-scrollbar">
              <TabsTrigger 
                value="all" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none"
              >
                All Requests
              </TabsTrigger>
              <TabsTrigger 
                value="maintenance" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none"
              >
                Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="transfer" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none"
              >
                Asset Transfers
              </TabsTrigger>
              <TabsTrigger 
                value="return" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none"
              >
                Asset Returns
              </TabsTrigger>
              <TabsTrigger 
                value="allocation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-none"
              >
                Allocations
              </TabsTrigger>
            </TabsList>
          </div>

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
              <Select>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Clear Filters
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0 border-0 p-0 outline-none">
            <div className="overflow-x-auto">
              {filteredRequests.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Th>Request ID</Th>
                      <Th>Type</Th>
                      <Th>Asset</Th>
                      <Th>Requested By</Th>
                      <Th>Submitted On</Th>
                      <Th>Priority</Th>
                      <Th>Status</Th>
                      <Th className="text-right pr-4">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] font-medium text-foreground">
                          {r.id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-foreground capitalize">
                          {r.type}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-foreground">{r.assetName}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{r.assetTag}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <div className="font-medium text-foreground">{r.requestedBy}</div>
                          <div className="text-[11px] text-muted-foreground">{r.department}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground tabular">
                          {r.submittedOn}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusPill status={r.priority as any} />
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusPill status={r.status as any} />
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
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">No pending approvals</h3>
                  <p className="mt-1 text-sm text-muted-foreground">You're all caught up for this category.</p>
                  <Button onClick={() => {}} className="mt-4" size="sm" variant="outline">
                    Refresh Requests
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {rejectError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {rejectError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason (Required) *</Label>
              <Textarea 
                id="reason" 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                placeholder="Please provide a reason for rejecting this request..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmReject}>Reject Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Drawer */}
      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Request Details</SheetTitle>
            <SheetDescription>
              {selectedRequest?.id} · <span className="capitalize">{selectedRequest?.type}</span>
            </SheetDescription>
          </SheetHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Request Information</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Submitted By</span>
                    <span className="font-medium">{selectedRequest.requestedBy} ({selectedRequest.department})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedRequest.submittedOn}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Priority</span>
                    <StatusPill status={selectedRequest.priority as any} />
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <StatusPill status={selectedRequest.status as any} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Asset Information</h4>
                <div className="rounded-md border border-border p-3 text-sm grid gap-1">
                  <div className="font-medium">{selectedRequest.assetName}</div>
                  <div className="font-mono text-xs text-muted-foreground">{selectedRequest.assetTag}</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Specific Details</h4>
                <div className="rounded-md bg-muted/40 p-3 text-sm grid gap-2">
                  {selectedRequest.type === "maintenance" && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Issue Description</span>
                      <p className="mt-1">{selectedRequest.description}</p>
                    </div>
                  )}
                  {selectedRequest.type === "transfer" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground block text-xs">Current Holder</span>
                          <p className="mt-1 font-medium">{selectedRequest.currentHolder}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Requested Holder</span>
                          <p className="mt-1 font-medium">{selectedRequest.requestedHolder}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <span className="text-muted-foreground block text-xs">Reason</span>
                        <p className="mt-1">{selectedRequest.reason}</p>
                      </div>
                    </>
                  )}
                  {selectedRequest.type === "return" && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Condition Check</span>
                      <p className="mt-1">{selectedRequest.conditionCheck}</p>
                    </div>
                  )}
                  {selectedRequest.type === "allocation" && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Expected Return Date</span>
                      <p className="mt-1 font-medium tabular">{selectedRequest.expectedReturnDate}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Attachments</h4>
                <div className="flex items-center gap-2 rounded border border-border p-2">
                  <div className="grid h-8 w-8 place-items-center rounded bg-muted text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-sm">supporting_document.pdf</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Timeline</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                      <div className="font-medium text-foreground">Request Submitted</div>
                      <div className="text-xs text-muted-foreground">{selectedRequest.submittedOn}</div>
                    </div>
                  </div>
                  
                  {selectedRequest.status === "pending" && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-muted-foreground">Manager Review</div>
                        <div className="text-xs text-muted-foreground">Pending action</div>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === "approved" && (
                    <>
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                          <div className="font-medium text-foreground">Manager Review</div>
                          <div className="text-xs text-muted-foreground">Approved by Current User</div>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-3 h-3 rounded-full border border-primary bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                          <div className="font-medium text-foreground">Completed</div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRequest.status === "rejected" && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-destructive bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-destructive">Rejected</div>
                        <div className="text-xs text-muted-foreground">Review concluded</div>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === "escalated" && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-orange-500 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] text-sm ml-4 md:ml-0 md:group-odd:text-right">
                        <div className="font-medium text-orange-600">Escalated</div>
                        <div className="text-xs text-muted-foreground">Sent for higher review</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold mb-3">Manager Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleApprove(selectedRequest)} variant="default" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                    <Button onClick={() => handleOpenRejectModal(selectedRequest)} variant="destructive">
                      Reject
                    </Button>
                    <Button onClick={handleRequestInfo} variant="outline" className="col-span-1">
                      Request More Info
                    </Button>
                    <Button onClick={() => handleEscalate(selectedRequest)} variant="outline" className="col-span-1">
                      Escalate
                    </Button>
                  </div>
                </div>
              )}
              {selectedRequest.status !== "pending" && (
                <div className="pt-4 border-t border-border">
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground text-center">
                    This request is {selectedRequest.status} and cannot be modified.
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
