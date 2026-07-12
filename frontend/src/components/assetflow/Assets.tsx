import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";

import type { Asset } from "./types";
import { initialAssets } from "./data";

import { AssetTable } from "./AssetTable";
import { RegisterAssetDialog } from "./RegisterAssetDialog";
import { AllocateAssetDialog } from "./AllocateAssetDialog";
import { TransferAssetDialog } from "./TransferAssetDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  const [search, setSearch] = useState("");

  const [registerOpen, setRegisterOpen] = useState(false);

  const [allocateOpen, setAllocateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("assets-update", { detail: assets.length }));
  }, [assets.length]);

  function handleSave(asset: Asset) {
    setAssets((prev) => [...prev, asset]);
  }

  function handleAllocate(asset: Asset) {
    setSelectedAsset(asset);
    setAllocateOpen(true);
  }

  function handleTransfer(asset: Asset) {
    setSelectedAsset(asset);
    setTransferOpen(true);
  }

 function allocateAsset(data: {
  employee: string;
  department: string;
  allocationDate: string;
  returnDate: string;
}) {
  if (!selectedAsset) return;

  setAssets((prev) =>
    prev.map((asset) =>
      asset.id === selectedAsset.id
        ? {
            ...asset,
            assignedTo: data.employee,
            location: data.department,
            status: "Allocated",
          }
        : asset
    )
  );

  setAllocateOpen(false);
}

  function transferAsset(
    assetId: string,
    employee: string,
    department: string
  ) {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              assignedTo: employee,
              location: department,
            }
          : asset
      )
    );

    setTransferOpen(false);
  }

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase();

    return assets.filter((asset) =>
      [
        asset.assetTag,
        asset.name,
        asset.category,
        asset.status,
        asset.location,
        asset.assignedTo,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [assets, search]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Asset Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Register, allocate and manage company assets.
          </p>
        </div>

        <Button onClick={() => setRegisterOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Asset
        </Button>
      </div>

      <div className="mb-5">
        <Input
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AssetTable
        assets={filteredAssets}
        onAllocate={handleAllocate}
        onTransfer={handleTransfer}
      />

      <RegisterAssetDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSave={handleSave}
      />

      <AllocateAssetDialog
        open={allocateOpen}
        asset={selectedAsset}
        onOpenChange={setAllocateOpen}
        onAllocate={allocateAsset}
      />

      <TransferAssetDialog
        open={transferOpen}
        asset={selectedAsset}
        onOpenChange={setTransferOpen}
        onTransfer={transferAsset}
      />

    </div>
  );
}