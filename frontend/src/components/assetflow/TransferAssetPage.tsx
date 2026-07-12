import { useState, useEffect } from "react";
import type { Asset } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmployees } from "../../services/orgService";
import { UserDocument } from "../../services/types";

type Props = {
  asset: Asset;
  onBack: () => void;
  onTransfer: (
    assetId: string,
    employee: string,
    department: string
  ) => void;
};

export function TransferAssetPage({
  asset,
  onBack,
  onTransfer,
}: Props) {
  const [employee, setEmployee] = useState(asset.assignedToId || "");
  const [employees, setEmployees] = useState<UserDocument[]>([]);

  useEffect(() => {
    async function load() {
      const emps = await getEmployees();
      setEmployees(emps);
    }
    load();
  }, []);

  function submit() {
    if (!employee || employee === "none") {
      alert("Please select a target employee.");
      return;
    }
    onTransfer(asset.id, employee, ""); // department is omitted because requestTransfer only takes userId
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Button variant="outline" onClick={onBack} className="mb-6">
        ← Back
      </Button>

      <h1 className="text-3xl font-bold">Transfer Asset</h1>
      <p className="mt-2 text-muted-foreground">
        Transfer asset to another employee.
      </p>

      <div className="mt-8 rounded-xl border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Asset Information</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input value={asset.assetTag} disabled />
            <Input value={asset.name} disabled />
            <Input value={asset.categoryId} disabled />
            <Input value={asset.location || "N/A"} disabled />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">New Assignment</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
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
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>Cancel</Button>
          <Button onClick={submit}>Transfer Asset</Button>
        </div>
      </div>
    </div>
  );
}