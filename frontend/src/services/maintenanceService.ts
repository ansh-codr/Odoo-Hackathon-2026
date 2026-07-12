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
import { MaintenanceRequest, Asset } from "./types";
import { logActivity } from "./logService";
import { sendNotification } from "./notificationService";

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

  // Fetch Asset details
  const assetRef = doc(db, "assets", assetId);
  const assetSnap = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(assetRef);
    if (!snap.exists()) throw new Error("Asset does not exist");
    return snap.data() as Asset;
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
    actionedAt: null
  };

  await setDoc(doc(db, "maintenanceRequests", id), req);
  await logActivity("Create Maintenance Request", `Raised repair request for ${assetSnap.name} (${assetSnap.assetTag})`);
  
  // Notification to managers (mocking broadcast/notifications)
  // For standard employee, we also notify them that request was received
  await sendNotification(
    currentUser.uid, 
    "Maintenance Request Submitted", 
    `Your request for ${assetSnap.name} is pending review.`
  );

  return req;
}

export async function approveMaintenanceRequest(requestId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  let requesterId = "";
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
    assetName = r.assetName;

    // Update request
    transaction.update(reqRef, {
      status: "Approved",
      actionedAt: Date.now(),
      actionedById: currentUser.uid
    });

    // Flip asset to Under_Maintenance
    const assetRef = doc(db, "assets", r.assetId);
    transaction.update(assetRef, { status: "Under_Maintenance" });
  });

  await logActivity("Approve Maintenance", `Approved maintenance request ${requestId}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Maintenance Request Approved", 
      `Your request for ${assetName} has been approved. The asset is now under maintenance.`
    );
  }
}

export async function rejectMaintenanceRequest(requestId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  let requesterId = "";
  let assetName = "";

  const reqRef = doc(db, "maintenanceRequests", requestId);
  await runTransaction(db, async (transaction) => {
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    const r = reqSnap.data() as MaintenanceRequest;
    requesterId = r.userId;
    assetName = r.assetName;

    transaction.update(reqRef, {
      status: "Rejected",
      actionedAt: Date.now(),
      actionedById: currentUser.uid
    });
  });

  await logActivity("Reject Maintenance", `Rejected maintenance request ${requestId}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Maintenance Request Rejected", 
      `Your request for ${assetName} has been rejected.`
    );
  }
}

export async function resolveMaintenanceRequest(requestId: string, cost: number): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  let requesterId = "";
  let assetName = "";

  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "maintenanceRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Request does not exist");
    
    const r = reqSnap.data() as MaintenanceRequest;
    requesterId = r.userId;
    assetName = r.assetName;

    // Update request to Resolved
    transaction.update(reqRef, {
      status: "Resolved",
      cost
    });

    // Update asset back to Available
    const assetRef = doc(db, "assets", r.assetId);
    transaction.update(assetRef, { status: "Available" });
  });

  await logActivity("Resolve Maintenance", `Resolved maintenance request ${requestId} with cost $${cost}`);
  if (requesterId) {
    await sendNotification(
      requesterId, 
      "Maintenance Request Resolved", 
      `Repair works for ${assetName} are completed. The asset is available again.`
    );
  }
}
