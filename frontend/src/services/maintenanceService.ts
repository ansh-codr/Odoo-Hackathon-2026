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
import { MaintenanceRequest, Asset } from "./types";
import { logActivity } from "./logService";
import { sendNotification } from "./notificationService";
import { recordAssetHistory } from "./assetService";

export async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  const colRef = collection(db, "maintenanceRequests");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as MaintenanceRequest);
}

export async function createMaintenanceRequest(
  assetId: string, 
  issueDescription: string, 
  priority: "Low" | "Medium" | "High" | "Critical"
): Promise<MaintenanceRequest> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  // Fetch current user role
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";

  // Fetch Asset details & validate business rules
  const assetRef = doc(db, "assets", assetId);
  const assetSnap = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(assetRef);
    if (!snap.exists()) throw new Error("Asset does not exist");
    
    const asset = snap.data() as Asset;

    // Rule 5: Retired or Disposed assets cannot enter maintenance
    if (asset.status === "Retired" || asset.status === "Disposed") {
      throw new Error(`Asset is in state ${asset.status} and cannot enter maintenance.`);
    }

    // Rule 1: Only the current asset holder or authorized users (admin/asset_manager) can create a maintenance request
    const isAuthorized = userRole === "admin" || userRole === "asset_manager";
    const isHolder = asset.assignedToId === currentUser.uid;

    if (!isAuthorized && !isHolder) {
      throw new Error("Only the current asset custodian or an Asset Manager can request maintenance for this asset.");
    }

    return asset;
  });

  const id = "MNT-" + Date.now().toString().slice(-6);
  const req: MaintenanceRequest = {
    id,
    assetId,
    assetName: assetSnap.name,
    assetTag: assetSnap.assetTag,
    userId: currentUser.uid,
    userName: currentUser.displayName || currentUser.email || "Employee",
    issueDescription,
    priority,
    status: "Pending_Approval",
    cost: null,
    createdAt: Date.now(),
    actionedById: null,
    actionedAt: null,
    technician: "—",
    resolutionNotes: ""
  };

  await runTransaction(db, async (transaction) => {
    // Write request doc
    transaction.set(doc(db, "maintenanceRequests", id), req);

    // Record asset history
    recordAssetHistory(
      transaction,
      assetId,
      "Audit",
      `Maintenance requested by ${req.userName}. Issue: ${issueDescription}`
    );
  });

  await logActivity("Request Created", `Raised maintenance request ${id} for ${assetSnap.name}`);
  await sendNotification(
    currentUser.uid, 
    "Maintenance Requested", 
    `Your maintenance request for ${assetSnap.name} is pending review.`
  );

  return req;
}

export async function approveMaintenanceRequest(requestId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  // Fetch current user role
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";

  // Rule 3: Only Asset Manager (or Admin) can Approve
  if (userRole !== "admin" && userRole !== "asset_manager") {
    throw new Error("Only Asset Managers are authorized to approve maintenance requests.");
  }

  let requesterId = "";
  let assetId = "";
  let assetName = "";

  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "maintenanceRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    
    const r = reqSnap.data() as MaintenanceRequest;
    if (r.status !== "Pending_Approval") {
      throw new Error(`Request cannot be approved. Current status: ${r.status}`);
    }

    requesterId = r.userId;
    assetId = r.assetId;
    assetName = r.assetName;

    // Update request status
    transaction.update(reqRef, {
      status: "Approved",
      actionedAt: Date.now(),
      actionedById: currentUser.uid
    });

    // Update asset status to Under_Maintenance on approval
    const assetRef = doc(db, "assets", assetId);
    transaction.update(assetRef, { status: "Under_Maintenance" });

    // Record asset history
    recordAssetHistory(
      transaction,
      assetId,
      "Audit",
      `Maintenance request ${requestId} approved by manager.`
    );
  });

  await logActivity("Approved", `Approved maintenance request ${requestId}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Maintenance Approved", 
      `Your request ${requestId} for ${assetName} has been approved.`
    );
  }
}

export async function rejectMaintenanceRequest(requestId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  // Fetch current user role
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";

  // Rule 3: Only Asset Manager (or Admin) can Reject
  if (userRole !== "admin" && userRole !== "asset_manager") {
    throw new Error("Only Asset Managers are authorized to reject maintenance requests.");
  }

  let requesterId = "";
  let assetId = "";
  let assetName = "";

  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "maintenanceRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    
    const r = reqSnap.data() as MaintenanceRequest;
    if (r.status !== "Pending_Approval") {
      throw new Error(`Request cannot be rejected. Current status: ${r.status}`);
    }

    requesterId = r.userId;
    assetId = r.assetId;
    assetName = r.assetName;

    transaction.update(reqRef, {
      status: "Rejected",
      actionedAt: Date.now(),
      actionedById: currentUser.uid
    });

    // Record asset history
    recordAssetHistory(
      transaction,
      assetId,
      "Audit",
      `Maintenance request ${requestId} rejected by manager.`
    );
  });

  await logActivity("Rejected", `Rejected maintenance request ${requestId}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Maintenance Rejected", 
      `Your maintenance request for ${assetName} was rejected.`
    );
  }
}

export async function assignTechnician(requestId: string, technicianName: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  // Fetch current user role
  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const userRole = userSnap.exists() ? userSnap.data().role : "employee";

  // Rule 3: Only Asset Manager (or Admin) can Assign Technician
  if (userRole !== "admin" && userRole !== "asset_manager") {
    throw new Error("Only Asset Managers are authorized to assign technicians.");
  }

  let requesterId = "";
  let assetId = "";
  let assetName = "";

  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "maintenanceRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    
    const r = reqSnap.data() as MaintenanceRequest;
    if (r.status !== "Approved") {
      throw new Error(`Cannot assign technician. Request must be approved first.`);
    }

    requesterId = r.userId;
    assetId = r.assetId;
    assetName = r.assetName;

    transaction.update(reqRef, {
      status: "Technician_Assigned",
      technician: technicianName
    });

    recordAssetHistory(
      transaction,
      assetId,
      "Audit",
      `Technician ${technicianName} assigned to request ${requestId}.`
    );
  });

  await logActivity("Technician Assigned", `Assigned technician ${technicianName} to request ${requestId}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Technician Assigned", 
      `Technician ${technicianName} has been assigned to repair your asset ${assetName}.`
    );
  }
}

export async function startMaintenance(requestId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "maintenanceRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    
    const r = reqSnap.data() as MaintenanceRequest;
    if (r.status !== "Technician_Assigned") {
      throw new Error(`Cannot start repair. Current status: ${r.status}`);
    }

    transaction.update(reqRef, { status: "In_Progress" });

    // Flip asset status to Under_Maintenance
    const assetRef = doc(db, "assets", r.assetId);
    transaction.update(assetRef, { status: "Under_Maintenance" });

    recordAssetHistory(
      transaction,
      r.assetId,
      "Audit",
      `Repair work started (In Progress) for request ${requestId}.`
    );
  });

  await logActivity("Repair Started", `Maintenance repair started for request ${requestId}`);
}

export async function resolveMaintenanceRequest(
  requestId: string, 
  cost: number, 
  resolutionNotes: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  let requesterId = "";
  let assetId = "";
  let assetName = "";

  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "maintenanceRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    
    const r = reqSnap.data() as MaintenanceRequest;
    
    // Rule 6: Resolved requests cannot be edited & must be In Progress to be resolved
    if (r.status !== "In_Progress") {
      throw new Error("Maintenance request must be In Progress to be resolved.");
    }

    requesterId = r.userId;
    assetId = r.assetId;
    assetName = r.assetName;

    // Update request to Resolved
    transaction.update(reqRef, {
      status: "Resolved",
      cost,
      resolutionNotes
    });

    // Update asset back to Available
    const assetRef = doc(db, "assets", r.assetId);
    transaction.update(assetRef, { status: "Available" });

    recordAssetHistory(
      transaction,
      assetId,
      "Audit",
      `Maintenance resolved. Cost: $${cost}. Notes: ${resolutionNotes}`
    );
  });

  await logActivity("Resolved", `Resolved maintenance request ${requestId} with cost $${cost}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Maintenance Resolved", 
      `Repair works for ${assetName} are completed. Status set back to Available.`
    );
  }
}
