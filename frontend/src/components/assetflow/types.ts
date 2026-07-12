export type AssetStatus =
  | "Available"
  | "Allocated"
  | "Reserved"
  | "Under_Maintenance"
  | "Lost"
  | "Retired"
  | "Disposed";

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
  sharedResource?: boolean;
  photoUrl?: string;
}