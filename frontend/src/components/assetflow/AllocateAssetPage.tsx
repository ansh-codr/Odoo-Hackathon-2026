import { useState, useEffect } from "react";
import type { Asset } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmployees, getDepartments } from "../../services/orgService";
import { UserDocument, Department } from "../../services/types";

type Props = {
  asset: Asset;
  onBack: () => void;
  onAllocate: (data: {
    employee: string;
    department: string;
    allocationDate: string;
    returnDate: string;
  }) => void;
  onTransferRequest: () => void;
};

export function AllocateAssetPage({
  asset,
  onBack,
  onAllocate,
  onTransferRequest,
}: Props) {
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [allocationDate, setAllocationDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [employees, setEmployees] = useState<UserDocument[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    async function load() {
      const [emps, depts] = await Promise.all([getEmployees(), getDepartments()]);
      setEmployees(emps);
      setDepartments(depts);
    }
    load();
  }, []);

  function submit() {
    if (!employee && !department) {
      alert("Please select either an employee or a department.");
      return;
    }

    onAllocate({
      employee,
      department,
      allocationDate,
      returnDate,
    });
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back
      </Button>

      <h1 className="text-3xl font-bold">Allocate Asset</h1>
      <p className="mt-2 text-muted-foreground">
        Allocate the selected asset to an employee or department.
      </p>

      {asset.status === "Allocated" && (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <h3 className="font-semibold text-lg">Allocation Conflict</h3>
          <p className="mt-1">
            This asset is currently held by <strong>{asset.assignedTo || "another employee"}</strong>.
            You cannot allocate an asset that is already taken.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="destructive" onClick={onTransferRequest}>
              Raise Transfer Request
            </Button>
          </div>
        </div>
      )}

      {asset.status !== "Allocated" && (
        <div className="mt-8 rounded-xl border p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-lg">Asset Information</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Input value={asset.assetTag} disabled />
            <Input value={asset.name} disabled />
            <Input value={asset.categoryId} disabled />
            <Input value={asset.location || "N/A"} disabled />
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-lg">Allocation Details</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to Employee</label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {employees.map(e => (
                    <SelectItem key={e.uid} value={e.uid}>{e.displayName} ({e.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to Department</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- None --</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Allocation Date</label>
              <Input
                type="date"
                value={allocationDate}
                onChange={(e) => setAllocationDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Return Date</label>
              <Input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={submit}>Allocate Asset</Button>
        </div>
      </div>
      )}
    </div>
  );
}