import { useState } from "react";
import type { Asset, AssetStatus } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (asset: Asset) => void;
};

export function RegisterAssetDialog({
  open,
  onOpenChange,
  onSave,
}: Props) {
  const [form, setForm] = useState({
    assetTag: "",
    name: "",
    category: "",
    serialNumber: "",
    purchaseDate: "",
    purchaseCost: "",
    vendor: "",
    location: "",
    status: "Available" as AssetStatus,
    assignedTo: "",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function save() {
    if (!form.name || !form.assetTag) return;

    onSave({
      id: crypto.randomUUID(),
      ...form,
    });

    setForm({
      assetTag: "",
      name: "",
      category: "",
      serialNumber: "",
      purchaseDate: "",
      purchaseCost: "",
      vendor: "",
      location: "",
      status: "Available",
      assignedTo: "",
      description: "",
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Register Asset</DialogTitle>

          <DialogDescription>
            Add a new company asset.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <Label>Asset Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Asset Tag</Label>
            <Input
              name="assetTag"
              value={form.assetTag}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Input
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Serial Number</Label>
            <Input
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Purchase Date</Label>
            <Input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Purchase Cost</Label>
            <Input
              name="purchaseCost"
              value={form.purchaseCost}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Vendor</Label>
            <Input
              name="vendor"
              value={form.vendor}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Assigned To</Label>
            <Input
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Input
              name="status"
              value={form.status}
              onChange={handleChange}
            />
          </div>

          <div className="col-span-2">
            <Label>Description</Label>

            <Textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button onClick={save}>
            Save Asset
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}