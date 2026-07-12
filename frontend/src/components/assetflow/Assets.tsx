import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { Asset } from "./types";

import { AssetTable } from "./AssetTable";
import { RegisterAssetDialog } from "./RegisterAssetDialog";
import { AllocateAssetDialog } from "./AllocateAssetDialog";
import { TransferAssetDialog } from "./TransferAssetDialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Services integration
import { 
  getAssets, 
  registerAsset, 
  allocateAsset as allocateAssetService,
  requestTransfer 
} from "../../services/assetService";

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  async function fetchAssets() {
    try {
      setLoading(true);
      const list = await getAssets();
      const mappedList: Asset[] = list.map((a) => ({
        id: a.id,
        assetTag: a.assetTag,
        name: a.name,
        category: a.categoryId,
        serialNumber: a.serialNumber,
        purchaseDate: a.purchaseDate,
        purchaseCost: a.purchaseCost.toString(),
        vendor: a.vendor,
        location: a.location,
        status: a.status,
        assignedTo: a.assignedToName || "—",
        description: a.description,
        sharedResource: a.sharedResource,
        photoUrl: a.photoUrl
      }));
      setAssets(mappedList);
    } catch (err) {
      toast.error("Failed to load assets from database");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("assets-update", { detail: assets.length }));
  }, [assets.length]);

  async function handleSave(newAssetData: Asset) {
    try {
      await registerAsset({
        name: newAssetData.name,
        assetTag: newAssetData.assetTag,
        categoryId: newAssetData.category,
        description: newAssetData.description,
        serialNumber: newAssetData.serialNumber,
        purchaseDate: newAssetData.purchaseDate,
        purchaseCost: parseFloat(newAssetData.purchaseCost) || 0,
        vendor: newAssetData.vendor,
        location: newAssetData.location,
        sharedResource: newAssetData.sharedResource,
        photoUrl: newAssetData.photoUrl
      });
      await fetchAssets();
      toast.success("Asset registered successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to register asset");
    }
  }

  function handleAllocate(asset: Asset) {
    setSelectedAsset(asset);
    setAllocateOpen(true);
  }

  function handleTransfer(asset: Asset) {
    setSelectedAsset(asset);
    setTransferOpen(true);
  }

  async function allocateAsset(data: {
    employee: string;
    department: string;
    allocationDate: string;
    returnDate: string;
  }) {
    if (!selectedAsset) return;
    try {
      await allocateAssetService(
        selectedAsset.id,
        data.employee || null,
        data.department || null,
        data.returnDate || null
      );
      await fetchAssets();
      setAllocateOpen(false);
      toast.success("Asset allocated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to allocate asset");
    }
  }

  async function transferAsset(
    assetId: string,
    employee: string,
    department: string
  ) {
    try {
      await requestTransfer(assetId, employee);
      await fetchAssets();
      setTransferOpen(false);
      toast.success("Transfer request raised successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate transfer");
    }
  }

  const filteredAssets = useMemo(() => {
    const queryStr = search.toLowerCase();

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
        .includes(queryStr)
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
          placeholder="Search assets by tag, name, category, location, assignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Loading assets from database...
        </div>
      ) : (
        <AssetTable
          assets={filteredAssets}
          onAllocate={handleAllocate}
          onTransfer={handleTransfer}
        />
      )}

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