import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  getDoc,
  updateDoc, 
  query, 
  where,
  runTransaction 
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { getAssets, recordAssetHistory } from "./assetService";
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

export interface DiscrepancyReport {
  id: string;
  cycleId: string;
  cycleName: string;
  generatedAt: number;
  discrepancies: {
    assetId: string;
    assetTag: string;
    assetName: string;
    type: "Missing" | "Damaged";
    remarks: string;
  }[];
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

  // Fetch current user role
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";

  // Rule 1: Only Admin creates Audit Cycles
  if (userRole !== "admin") {
    throw new Error("Only Administrators are authorized to create audit cycles.");
  }

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
  const auditors = auditorsStr.split(",").map(a => a.trim());

  const newCycle: AuditCycle = {
    id: cycleId,
    name,
    department,
    location,
    auditors,
    startDate,
    endDate,
    status: "active", // default to active to allow immediate processing
    assets: auditAssets,
    createdAt: Date.now()
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(doc(db, "auditCycles", cycleId), newCycle);

    // Save history for each asset
    filteredAssets.forEach(a => {
      recordAssetHistory(
        transaction,
        a.id,
        "Audit",
        `Asset assigned to audit cycle: ${name} (Auditors: ${auditors.join(", ")})`
      );
    });
  });

  await logActivity("Create Audit Cycle", `Created audit cycle ${name} with ${auditAssets.length} assets`);

  // Send notifications to all assigned auditors
  for (const auditor of auditors) {
    // If auditor is registered as email/user, notify them
    const uq = query(collection(db, "users"), where("displayName", "==", auditor));
    const usnap = await getDocs(uq);
    usnap.forEach(async (udoc) => {
      await sendNotification(
        udoc.id,
        "Audit Assigned",
        `You have been assigned to audit cycle ${name}. Please start verifications.`
      );
    });
  }

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

  // Fetch current user details
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";
  const userDisplayName = userSnap.exists() ? userSnap.data().displayName : "";
  const userEmail = currentUser.email || "";

  await runTransaction(db, async (transaction) => {
    const cycleRef = doc(db, "auditCycles", cycleId);
    const cycleSnap = await transaction.get(cycleRef);
    if (!cycleSnap.exists()) throw new Error("Audit cycle does not exist");

    const cycle = cycleSnap.data() as AuditCycle;

    // Rule 6: Completed/Closed Audit Cycles become read-only
    if (cycle.status === "closed") {
      throw new Error("Cannot verify assets inside a closed audit cycle.");
    }

    // Rule 3: Only assigned auditors may verify assets (admin has superuser bypass)
    const isAssigned = 
      cycle.auditors.includes(userDisplayName) || 
      cycle.auditors.includes(userEmail) || 
      cycle.auditors.some(a => a.toLowerCase() === userEmail.toLowerCase()) ||
      userRole === "admin";

    if (!isAssigned) {
      throw new Error("Access Denied: You are not assigned as an auditor for this cycle.");
    }

    const updatedAssets = cycle.assets.map((ast) => {
      if (ast.id === assetId) {
        return {
          ...ast,
          status,
          remarks,
          verifiedBy: currentUser.displayName || currentUser.email || "Auditor",
          verifiedAt: new Date().toLocaleString()
        };
      }
      return ast;
    });

    // Update status in the cycle assets array
    transaction.update(cycleRef, { assets: updatedAssets });

    // Record asset verification event in history
    recordAssetHistory(
      transaction,
      assetId,
      "Audit",
      `Asset verified as ${status} by auditor ${currentUser.displayName || currentUser.email}. Notes: ${remarks || "None"}`
    );
  });

  await logActivity(
    "Verify Audit Asset", 
    `Verified asset ${assetId} in cycle ${cycleId} as ${status}`
  );
}

export async function closeAuditCycle(cycleId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  // Fetch current user role
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";

  // Only Admin or Asset Manager can close the cycle
  if (userRole !== "admin" && userRole !== "asset_manager") {
    throw new Error("Only Administrators or Asset Managers can close audit cycles.");
  }

  await runTransaction(db, async (transaction) => {
    const cycleRef = doc(db, "auditCycles", cycleId);
    const cycleSnap = await transaction.get(cycleRef);
    if (!cycleSnap.exists()) throw new Error("Audit cycle does not exist");

    const cycle = cycleSnap.data() as AuditCycle;

    // Rule 4: Audit cannot close until all assets are verified
    const hasPending = cycle.assets.some(a => a.status === "pending");
    if (hasPending) {
      throw new Error("Cannot close audit. Some assets are still pending verification.");
    }

    // 1. Update cycle status to closed
    transaction.update(cycleRef, { status: "closed" });

    // 2. Process asset updates, discrepancies, and histories
    const discrepanciesList: DiscrepancyReport["discrepancies"] = [];

    for (const a of cycle.assets) {
      const assetRef = doc(db, "assets", a.id);
      
      if (a.status === "missing") {
        // Rule 5: Mark missing assets as Lost
        transaction.update(assetRef, { status: "Lost" });
        discrepanciesList.push({
          assetId: a.id,
          assetTag: a.tag,
          assetName: a.name,
          type: "Missing",
          remarks: a.remarks || "Not found during audit"
        });

        // Log history
        recordAssetHistory(
          transaction,
          a.id,
          "Audit",
          `Audit closed. Asset status updated to Lost.`
        );
      } else if (a.status === "damaged") {
        // Rule 5: Updates Asset Status to Under_Maintenance
        transaction.update(assetRef, { status: "Under_Maintenance" });
        discrepanciesList.push({
          assetId: a.id,
          assetTag: a.tag,
          assetName: a.name,
          type: "Damaged",
          remarks: a.remarks || "Damaged during audit"
        });

        // Auto-create a pending maintenance request
        const mntId = "MNT-" + Date.now().toString().slice(-6);
        transaction.set(doc(db, "maintenanceRequests", mntId), {
          id: mntId,
          assetId: a.id,
          assetName: a.name,
          assetTag: a.tag,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email || "System",
          issueDescription: `Auto-generated from audit cycle discrepancy: ${a.remarks}`,
          priority: "High",
          status: "Pending_Approval",
          cost: null,
          createdAt: Date.now(),
          actionedById: null,
          actionedAt: null,
          technician: "—",
          resolutionNotes: ""
        });

        // Log history
        recordAssetHistory(
          transaction,
          a.id,
          "Audit",
          `Audit closed. Asset status updated to Under Maintenance. Auto-created repair request ${mntId}.`
        );
      } else {
        // Log history
        recordAssetHistory(
          transaction,
          a.id,
          "Audit",
          `Audit closed. Verification confirmed asset as in good standing.`
        );
      }
    }

    // 3. Generates Discrepancy Report document if discrepancies exist
    if (discrepanciesList.length > 0) {
      const repId = "DISC-" + Date.now().toString().slice(-6);
      const report: DiscrepancyReport = {
        id: repId,
        cycleId,
        cycleName: cycle.name,
        generatedAt: Date.now(),
        discrepancies: discrepanciesList
      };
      transaction.set(doc(db, "discrepancyReports", repId), report);
    }
  });

  await logActivity("Audit Closed", `Closed audit cycle ${cycleId}`);
  await sendNotification(
    currentUser.uid, 
    "Audit Completed", 
    `Audit cycle ${cycleId} has been successfully closed.`
  );
}
