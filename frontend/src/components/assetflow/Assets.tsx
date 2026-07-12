import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { RegisterAssetDialog } from "./RegisterAssetDialog";
import { AssetTable } from "./AssetTable";
import { initialAssets } from "./data";
import type { Asset } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  function handleSave(asset: Asset) {
    setAssets((prev) => [...prev, asset]);
  }

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase();

    return assets.filter((asset) =>
      [
        asset.assetTag,
        asset.name,
        asset.category,
        asset.location,
        asset.status,
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

        <Button onClick={() => setOpen(true)}>
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

      <AssetTable assets={filteredAssets} />

      <RegisterAssetDialog
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
      />
    </div>
  );
}