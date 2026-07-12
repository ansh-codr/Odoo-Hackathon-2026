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
    sharedResource: false,
    photoUrl: ""
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      sharedResource: e.target.checked
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
      sharedResource: false,
      photoUrl: ""
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Register Asset</DialogTitle>
          <DialogDescription>
            Add a new company asset. Newly registered assets start as Available.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Asset Name *</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Asset Tag * (Unique)</Label>
            <Input
              name="assetTag"
              value={form.assetTag}
              onChange={handleChange}
              placeholder="e.g. AST-0001"
              required
            />
          </div>

          <div>
            <Label>Category</Label>
            <Input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Electronics, Furniture"
            />
          </div>

          <div>
            <Label>Serial Number (Unique)</Label>
            <Input
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Acquisition Date</Label>
            <Input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Acquisition Cost ($)</Label>
            <Input
              name="purchaseCost"
              value={form.purchaseCost}
              onChange={handleChange}
              placeholder="e.g. 1200"
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
              placeholder="e.g. HQ Floor 3"
            />
          </div>

          <div className="col-span-2">
            <Label>Photo / Document URL</Label>
            <Input
              name="photoUrl"
              value={form.photoUrl}
              onChange={handleChange}
              placeholder="e.g. https://example.com/asset-photo.jpg"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="sharedResource"
              name="sharedResource"
              checked={form.sharedResource}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="sharedResource" className="cursor-pointer">
              Shared Resource / Bookable (Available for booking by slots)
            </Label>
          </div>

          <div className="col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
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