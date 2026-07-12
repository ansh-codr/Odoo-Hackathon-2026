import { useState, useEffect } from "react";
import type { Asset } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  asset: Asset | null;
  onOpenChange: (open: boolean) => void;
  onTransfer: (
    assetId: string,
    employee: string,
    department: string
  ) => void;
}

export function TransferAssetDialog({
  open,
  asset,
  onOpenChange,
  onTransfer,
}: Props) {
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (asset) {
      setEmployee(asset.assignedTo || "");
      setDepartment(asset.location || "");
    }
  }, [asset]);

  if (!asset) return null;

  function submit() {
    if (!asset) return;
    onTransfer(asset.id, employee, department);

    setEmployee("");
    setDepartment("");

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="New Employee"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          />

          <Input
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button onClick={submit}>
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}