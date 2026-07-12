import { useState } from "react";
import type { Asset } from "./types";

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
};

export function AssetTable({ assets, onAllocate }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [open, setOpen] = useState(false);

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-border p-10 text-center text-muted-foreground">
        No Assets Found
      </div>
    );
  }

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
              <TableHead className="w-[260px]">Actions</TableHead>
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
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      asset.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : asset.status === "Allocated"
                        ? "bg-blue-100 text-blue-700"
                        : asset.status === "Maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
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
                      setOpen(true);
                    }}
                  >
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={asset.status !== "Available"}
                    onClick={() => onAllocate(asset)}
                  >
                    Allocate
                  </Button>

                  <Button
                    size="sm"
                    disabled={asset.status !== "Allocated"}
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
        open={open}
        onOpenChange={setOpen}
        asset={selectedAsset}
      />
    </>
  );
}