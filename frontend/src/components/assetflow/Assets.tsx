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
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/services/authService";

// Services integration
import { 
  getAssets, 
  registerAsset, 
  allocateAsset as allocateAssetService,
  requestTransfer,
  executeDirectTransfer 
} from "../../services/assetService";

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("employee");

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
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const profile = await getUserProfile(currentUser.uid);
      const role = profile?.role || "employee";
      const deptId = profile?.departmentId;
      setUserRole(role);

      const list = await getAssets();
      let filteredList = list;

      if (role === "department_head") {
        filteredList = list.filter(a => a.departmentId === deptId);
      } else if (role === "employee") {
        filteredList = list.filter(a => a.assignedToId === currentUser.uid || a.sharedResource);
      }

      const mappedList: Asset[] = filteredList.map((a) => ({
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
        photoUrl: a.photoUrl,
        assignedToId: a.assignedToId,
        departmentId: a.departmentId
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
      if (userRole === "admin" || userRole === "asset_manager") {
        await executeDirectTransfer(assetId, employee);
      } else {
        await requestTransfer(assetId, employee);
      }
      await fetchAssets();
      toast.success(userRole === "admin" || userRole === "asset_manager" ? "Asset transferred successfully" : "Transfer requested successfully");
      setSelectedAsset(null);
      setPage("list");
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer asset");
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

          </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-5">
        <Input
          placeholder="Filter assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-background"
        />
        {(userRole === "admin" || userRole === "asset_manager") && (
          <Button
            onClick={() => setRegisterOpen(true)}
            className="ml-auto flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Register Asset
          </Button>
        )}
      </div>

      <AssetTable
        assets={filteredAssets}
        onAllocate={handleAllocate}
        onTransfer={handleTransfer}
        userRole={userRole}
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
            setPage("list");
            setSelectedAsset(null);
          }}
          onAllocate={allocateAsset}
          onTransferRequest={() => setPage("transfer")}
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