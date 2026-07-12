import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import type { Asset } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export function AssetDetailDialog({
  open,
  onOpenChange,
  asset,
}: Props) {
  if (!asset) return null;

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="grid grid-cols-3 gap-4 border-b py-3">
      <div className="font-medium text-muted-foreground">{label}</div>

      <div className="col-span-2">{value}</div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">

          <Row label="Asset Name" value={asset.name} />

          <Row label="Asset Tag" value={asset.assetTag} />

          <Row label="Category" value={asset.category} />

          <Row label="Serial Number" value={asset.serialNumber} />

          <Row label="Purchase Date" value={asset.purchaseDate} />

          <Row label="Purchase Cost" value={`₹${asset.purchaseCost}`} />

          <Row label="Vendor" value={asset.vendor} />

          <Row label="Location" value={asset.location} />

          <Row label="Assigned To" value={asset.assignedTo || "-"} />

          <Row
            label="Status"
            value={<Badge>{asset.status}</Badge>}
          />

          <Row
            label="Description"
            value={asset.description || "-"}
          />

        </div>
      </DialogContent>
    </Dialog>
  );
}