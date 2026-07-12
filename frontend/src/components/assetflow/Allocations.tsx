import { useState, useEffect } from "react";
import { ArrowLeftRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getAllocations, returnAsset } from "../../services/assetService";
import type { Allocation } from "../../services/types";
import { StatusPill } from "./StatusPill";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function Allocations() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [checkInNotes, setCheckInNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllocations();
      // Sort: Active first, then by date descending
      data.sort((a, b) => {
        if (a.status === "Active" && b.status !== "Active") return -1;
        if (a.status !== "Active" && b.status === "Active") return 1;
        return b.allocatedAt - a.allocatedAt;
      });
      setAllocations(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturnClick = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCheckInNotes("");
    setReturnDialogOpen(true);
  };

  const submitReturn = async () => {
    if (!selectedAssetId) return;
    try {
      await returnAsset(selectedAssetId, checkInNotes);
      toast.success("Asset returned successfully");
      setReturnDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to return asset");
    }
  };

  const getStatusDisplay = (allocation: Allocation) => {
    if (allocation.status === "Returned") {
      return <StatusPill status="Returned" />;
    }
    
    // Check if overdue
    if (allocation.dueDate && allocation.dueDate < Date.now()) {
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          Overdue
        </div>
      );
    }

    return <StatusPill status="Allocated" />;
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading allocations...</div>;
  }

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Allocations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage asset assignments, track overdue items, and process returns.
          </p>
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[180px]">Asset ID</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Allocated Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No allocations found.
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((alloc) => (
                <TableRow key={alloc.id}>
                  <TableCell className="font-medium">{alloc.assetId}</TableCell>
                  <TableCell>
                    {alloc.type === "department" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        Dept: {alloc.departmentId}
                      </span>
                    ) : (
                      alloc.userId
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(alloc.allocatedAt, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {alloc.dueDate ? format(alloc.dueDate, "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>{getStatusDisplay(alloc)}</TableCell>
                  <TableCell className="text-right">
                    {alloc.status === "Active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnClick(alloc.assetId)}
                        className="h-8"
                      >
                        <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
                        Return
                      </Button>
                    )}
                    {alloc.status === "Returned" && alloc.returnedAt && (
                      <span className="text-xs text-muted-foreground">
                        Returned {format(alloc.returnedAt, "MMM d")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>
              Record the return of asset <strong>{selectedAssetId}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium leading-none">
                Condition / Check-in Notes
              </label>
              <Textarea
                id="notes"
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                placeholder="e.g. Screen is cracked, or Good condition."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReturn}>Process Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
