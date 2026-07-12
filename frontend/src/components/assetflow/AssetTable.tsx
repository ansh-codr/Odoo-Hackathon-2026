import { useState } from "react";
import type { Asset } from "./types";
import { canAllocate, canTransfer } from "./assetUtils";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { AssetDetailDialog } from "./AssetDetailDialog";

type Props = {
  assets: Asset[];
  onAllocate: (asset: Asset) => void;
  onTransfer: (asset: Asset) => void;
};

export function AssetTable({
  assets,
  onAllocate,
  onTransfer,
}: Props) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-border p-10 text-center text-muted-foreground">
        No Assets Found
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-700";

      case "Allocated":
        return "bg-blue-100 text-blue-700";

      case "Maintenance":
        return "bg-yellow-100 text-yellow-700";

      case "Retired":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Tag</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[280px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.assetTag}</TableCell>

                <TableCell>{asset.name}</TableCell>

                <TableCell>{asset.category}</TableCell>

                <TableCell>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </TableCell>

                <TableCell>
                  {asset.assignedTo || "-"}
                </TableCell>

                <TableCell>{asset.location}</TableCell>

                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setDetailOpen(true);
                    }}
                  >
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!canAllocate(asset.status)}
                    title={
                      !canAllocate(asset.status)
                        ? "Only available assets can be allocated"
                        : ""
                    }
                    onClick={() => onAllocate(asset)}
                  >
                    Allocate
                  </Button>

                  <Button
                    size="sm"
                    disabled={!canTransfer(asset.status)}
                    title={
                      !canTransfer(asset.status)
                        ? "Only allocated assets can be transferred"
                        : ""
                    }
                    onClick={() => onTransfer(asset)}
                  >
                    Transfer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AssetDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        asset={selectedAsset}
      />
    </>
  );
}