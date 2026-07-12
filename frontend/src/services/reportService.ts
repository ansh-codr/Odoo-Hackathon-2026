import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Asset, MaintenanceRequest } from "./types";

export interface ReportStats {
  totalAssets: number;
  allocatedCount: number;
  maintenanceCount: number;
  reservedCount: number;
  totalMaintenanceCost: number;
  categoryDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export async function generateReport(): Promise<ReportStats> {
  const assetsSnap = await getDocs(collection(db, "assets"));
  const assets = assetsSnap.docs.map(doc => doc.data() as Asset);

  const maintenanceSnap = await getDocs(collection(db, "maintenanceRequests"));
  const maintenance = maintenanceSnap.docs.map(doc => doc.data() as MaintenanceRequest);

  const stats: ReportStats = {
    totalAssets: assets.length,
    allocatedCount: assets.filter(a => a.status === "Allocated").length,
    maintenanceCount: assets.filter(a => a.status === "Under_Maintenance").length,
    reservedCount: assets.filter(a => a.status === "Reserved").length,
    totalMaintenanceCost: maintenance.reduce((sum, r) => sum + (r.cost || 0), 0),
    categoryDistribution: {},
    statusDistribution: {}
  };

  assets.forEach((a) => {
    // Category distribution
    const cat = a.categoryId || "Uncategorized";
    stats.categoryDistribution[cat] = (stats.categoryDistribution[cat] || 0) + 1;

    // Status distribution
    const stat = a.status || "Available";
    stats.statusDistribution[stat] = (stats.statusDistribution[stat] || 0) + 1;
  });

  return stats;
}
