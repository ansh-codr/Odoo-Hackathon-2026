import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  runTransaction 
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { getAssets } from "./assetService";
import { logActivity } from "./logService";
import { sendNotification } from "./notificationService";

export type AuditStatus = "scheduled" | "active" | "completed" | "closed";
export type VerificationStatus = "pending" | "verified" | "missing" | "damaged";

export interface AuditAsset {
  id: string;
  tag: string;
  name: string;
  department: string;
  status: VerificationStatus;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  department: string;
  location: string;
  auditors: string[];
  startDate: string;
  endDate: string;
  status: AuditStatus;
  assets: AuditAsset[];
  createdAt: number;
}

export async function getAudits(): Promise<AuditCycle[]> {
  const colRef = collection(db, "auditCycles");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as AuditCycle);
}

export async function createAuditCycle(
  name: string,
  department: string,
  location: string,
  startDate: string,
  endDate: string,
  auditorsStr: string
): Promise<AuditCycle> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  // Fetch all registered assets to include in audit cycle
  const allAssets = await getAssets();
  const filteredAssets = department === "Global" || department === "All"
    ? allAssets
    : allAssets.filter(a => a.location === department || a.departmentId === department.toLowerCase());

  const auditAssets: AuditAsset[] = filteredAssets.map((a) => ({
    id: a.id,
    tag: a.assetTag,
    name: a.name,
    department: a.location || department,
    status: "pending"
  }));

  const cycleId = "AUD-" + Date.now().toString().slice(-6);
  const newCycle: AuditCycle = {
    id: cycleId,
    name,
    department,
    location,
    auditors: auditorsStr.split(",").map(a => a.trim()),
    startDate,
    endDate,
    status: "active", // default to active to allow immediate processing
    assets: auditAssets,
    createdAt: Date.now()
  };

  await setDoc(doc(db, "auditCycles", cycleId), newCycle);
  await logActivity("Create Audit Cycle", `Created audit cycle ${name} with ${auditAssets.length} assets`);
  
  return newCycle;
}

export async function verifyAuditAsset(
  cycleId: string,
  assetId: string,
  status: VerificationStatus,
  remarks: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  await runTransaction(db, async (transaction) => {
    const cycleRef = doc(db, "auditCycles", cycleId);
    const cycleSnap = await transaction.get(cycleRef);
    if (!cycleSnap.exists()) throw new Error("Audit cycle does not exist");

    const cycle = cycleSnap.data() as AuditCycle;
    let assetName = "";
    let assetTag = "";

    const updatedAssets = cycle.assets.map((ast) => {
      if (ast.id === assetId) {
        assetName = ast.name;
        assetTag = ast.tag;
        return {
          ...ast,
          status,
          remarks,
          verifiedBy: currentUser.displayName || currentUser.email || "Auditor",
          verifiedAt: new Date().toISOString()
        };
      }
      return ast;
    });

    // Update status in the cycle assets array
    transaction.update(cycleRef, { assets: updatedAssets });

    // Transition original asset state based on audit results
    const assetRef = doc(db, "assets", assetId);
    if (status === "missing") {
      transaction.update(assetRef, { status: "Lost" });
    } else if (status === "damaged") {
      transaction.update(assetRef, { status: "Under_Maintenance" });
      
      // Auto-create a pending maintenance request
      const mntId = "MNT-" + Date.now().toString().slice(-6);
      transaction.set(doc(db, "maintenanceRequests", mntId), {
        id: mntId,
        assetId,
        assetName,
        assetTag,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || "Auditor",
        issueDescription: `Auto-generated from audit cycle: ${remarks}`,
        priority: "High",
        status: "Pending_Approval",
        cost: null,
        createdAt: Date.now(),
        actionedById: null,
        actionedAt: null
      });
    }
  });

  await logActivity(
    "Verify Audit Asset", 
    `Verified asset ${assetId} in cycle ${cycleId} as ${status}`
  );
}

export async function updateAuditCycleStatus(cycleId: string, status: AuditStatus): Promise<void> {
  const cycleRef = doc(db, "auditCycles", cycleId);
  await updateDoc(cycleRef, { status });
  await logActivity("Update Audit Status", `Updated audit cycle ${cycleId} status to ${status}`);
}
