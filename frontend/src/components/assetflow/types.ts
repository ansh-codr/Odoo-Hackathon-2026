export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Maintenance"
  | "Retired";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: string;
  vendor: string;
  location: string;
  status: AssetStatus;
  assignedTo: string;
  description: string;
}