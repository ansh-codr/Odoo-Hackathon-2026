import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { Asset } from "./types";

import { AssetTable } from "./AssetTable";
import { RegisterAssetDialog } from "./RegisterAssetDialog";
import { AllocateAssetPage } from "./AllocateAssetPage";
import { TransferAssetPage } from "./TransferAssetPage";

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

  const [selectedAsset, setSelectedAsset] =
    useState<Asset | null>(null);

  const [page, setPage] = useState<
    "list" | "allocate" | "transfer"
  >("list");

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
    setPage("allocate");
  }

  function handleTransfer(asset: Asset) {
    setSelectedAsset(asset);
    setPage("transfer");
  }

  async function allocateAsset(data: {
    employee: string;
    department: string;
    allocationDate: string;
    returnDate: string;
  }) {
    if (!selectedAsset) return;

    try {
      const empId = data.employee === "none" ? null : data.employee;
      const deptId = data.department === "none" ? null : data.department;
      
      await allocateAssetService(
        selectedAsset.id,
        empId,
        deptId,
        data.returnDate || null
      );
      
      await fetchAssets();
      toast.success("Asset allocated successfully");
      setSelectedAsset(null);
      setPage("list");
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
      toast.success("Transfer requested successfully");
      setSelectedAsset(null);
      setPage("list");
    } catch (err: any) {
      toast.error(err.message || "Failed to request transfer");
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

      {page === "list" && (
        <>
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
        </>
      )}

      {page === "allocate" && selectedAsset && (
        <AllocateAssetPage
          asset={selectedAsset}
          onBack={() => {
            setSelectedAsset(null);
            setPage("list");
          }}
          onAllocate={allocateAsset}
        />
      )}

      {page === "transfer" && selectedAsset && (
        <TransferAssetPage
          asset={selectedAsset}
          onBack={() => {
            setSelectedAsset(null);
            setPage("list");
          }}
          onTransfer={transferAsset}
        />
      )}
    </div>
  );
}