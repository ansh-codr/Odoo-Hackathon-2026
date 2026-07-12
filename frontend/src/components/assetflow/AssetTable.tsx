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

type Props = {
  assets: Asset[];
};

export function AssetTable({ assets }: Props) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-border p-10 text-center text-muted-foreground">
        No Assets Found
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Tag</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-[220px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>{asset.assetTag}</TableCell>

              <TableCell>{asset.name}</TableCell>

              <TableCell>{asset.category}</TableCell>

              <TableCell>{asset.status}</TableCell>

              <TableCell>{asset.location}</TableCell>

              <TableCell className="space-x-2">
                <Button size="sm" variant="outline">
                  View
                </Button>

                <Button size="sm" variant="outline">
                  Allocate
                </Button>

                <Button size="sm">
                  Transfer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}