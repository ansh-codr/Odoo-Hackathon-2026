import { useState } from "react";
import type { Asset } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  asset: Asset;
  onBack: () => void;
  onAllocate: (data: {
    employee: string;
    department: string;
    allocationDate: string;
    returnDate: string;
  }) => void;
};

export function AllocateAssetPage({
  asset,
  onBack,
  onAllocate,
}: Props) {
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [allocationDate, setAllocationDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  function submit() {
    if (
      !employee ||
      !department ||
      !allocationDate ||
      !returnDate
    ) {
      alert("Please fill all fields.");
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

      <Button
        variant="outline"
        onClick={onBack}
        className="mb-6"
      >
        ← Back
      </Button>

      <h1 className="text-3xl font-bold">
        Allocate Asset
      </h1>

      <p className="mt-2 text-muted-foreground">
        Allocate the selected asset to an employee.
      </p>

      <div className="mt-8 rounded-xl border p-6 space-y-6">

        <div>
          <h2 className="font-semibold text-lg">
            Asset Information
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4">

            <Input
              value={asset.assetTag}
              disabled
            />

            <Input
              value={asset.name}
              disabled
            />

            <Input
              value={asset.category}
              disabled
            />

            <Input
              value={asset.location}
              disabled
            />

          </div>
        </div>

        <div>
          <h2 className="font-semibold text-lg">
            Employee Information
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-4">

            <Input
              placeholder="Employee Name"
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

            <Input
              type="date"
              value={allocationDate}
              onChange={(e) =>
                setAllocationDate(e.target.value)
              }
            />

            <Input
              type="date"
              value={returnDate}
              onChange={(e) =>
                setReturnDate(e.target.value)
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
            Allocate Asset
          </Button>

        </div>

      </div>

    </div>
  );
}