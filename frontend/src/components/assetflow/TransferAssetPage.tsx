import { useState } from "react";
import type { Asset } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [employee, setEmployee] = useState(asset.assignedTo);
  const [department, setDepartment] = useState(asset.location);

  function submit() {
    if (!employee || !department) {
      alert("Please fill all fields.");
      return;
    }

    onTransfer(asset.id, employee, department);
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-6"
      >
        ← Back
      </Button>

      <h1 className="text-3xl font-bold">
        Transfer Asset
      </h1>

      <p className="mt-2 text-muted-foreground">
        Transfer asset to another employee or department.
      </p>

      <div className="mt-8 rounded-xl border p-6 space-y-6">

        <div>
          <h2 className="text-lg font-semibold">
            Asset Information
          </h2>

          <div className="grid grid-cols-2 gap-4 mt-4">

            <Input value={asset.assetTag} disabled />

            <Input value={asset.name} disabled />

            <Input value={asset.category} disabled />

            <Input value={asset.location} disabled />

          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            New Assignment
          </h2>

          <div className="grid grid-cols-2 gap-4 mt-4">

            <Input
              placeholder="Employee"
              value={employee}
              onChange={(e) =>
                setEmployee(e.target.value)
              }
            />

            <Input
              placeholder="Department"
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
            />

          </div>
        </div>

        <div className="flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onBack}
          >
            Cancel
          </Button>

          <Button
            onClick={submit}
          >
            Transfer Asset
          </Button>

        </div>

      </div>
    </div>
  );
}