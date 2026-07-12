import { useState } from "react";

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
  onOpenChange: (open: boolean) => void;

  onAllocate: (data: {
    employee: string;
    department: string;
    allocationDate: string;
    returnDate: string;
  }) => void;
}

export function AllocateAssetDialog({
  open,
  onOpenChange,
  onAllocate,
}: Props) {
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [allocationDate, setAllocationDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  function submit() {
    onAllocate({
      employee,
      department,
      allocationDate,
      returnDate,
    });

    setEmployee("");
    setDepartment("");
    setAllocationDate("");
    setReturnDate("");

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Allocate Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <Input
            placeholder="Employee Name"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
          />

          <Input
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <Input
            type="date"
            value={allocationDate}
            onChange={(e) => setAllocationDate(e.target.value)}
          />

          <Input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
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
            Allocate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}