import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  runTransaction,
  addDoc
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { Asset, AssetStatus, Allocation, TransferRequest } from "./types";
import { logActivity } from "./logService";
import { sendNotification } from "./notificationService";

export async function getAssets(): Promise<Asset[]> {
  const colRef = collection(db, "assets");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as Asset);
}

export async function registerAsset(data: Omit<Asset, "id" | "status" | "assignedToId" | "assignedToName" | "departmentId" | "createdAt">): Promise<Asset> {
  const assetsRef = collection(db, "assets");
  
  // Enforce uniqueness of assetTag
  const q = query(assetsRef, where("assetTag", "==", data.assetTag));
  const querySnap = await getDocs(q);
  if (!querySnap.empty) {
    throw new Error(`Asset Tag "${data.assetTag}" is already registered.`);
  }

  // Enforce uniqueness of serialNumber (if provided)
  if (data.serialNumber) {
    const qSerial = query(assetsRef, where("serialNumber", "==", data.serialNumber));
    const querySerialSnap = await getDocs(qSerial);
    if (!querySerialSnap.empty) {
      throw new Error(`Serial Number "${data.serialNumber}" is already registered.`);
    }
  }
  
  const id = "AST-" + Date.now().toString().slice(-6);
  const asset: Asset = {
    ...data,
    id,
    status: "Available",
    assignedToId: null,
    assignedToName: null,
    departmentId: null,
    createdAt: Date.now()
  };
  
  await setDoc(doc(db, "assets", id), asset);
  await logActivity("Register Asset", `Registered new asset ${asset.name} with tag ${asset.assetTag}`);
  return asset;
}

// Phase 4: Allocations & Transfers

export async function allocateAsset(
  assetId: string, 
  userId: string | null, 
  departmentId: string | null, 
  dueDateStr: string | null
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  await runTransaction(db, async (transaction) => {
    const assetRef = doc(db, "assets", assetId);
    const assetSnap = await transaction.get(assetRef);
    if (!assetSnap.exists()) throw new Error("Asset does not exist");
    
    const assetData = assetSnap.data() as Asset;
    if (assetData.status !== "Available") {
      throw new Error(`Asset is not available for allocation. Current status: ${assetData.status}`);
    }

    // Resolve name of assignee
    let assigneeName = null;
    if (userId) {
      const userRef = doc(db, "users", userId);
      const userSnap = await transaction.get(userRef);
      if (userSnap.exists()) {
        assigneeName = userSnap.data().displayName || userSnap.data().email;
      }
    }

    const allocId = "ALC-" + Date.now().toString().slice(-6);
    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : null;
    
    const allocation: Allocation = {
      id: allocId,
      assetId,
      userId,
      departmentId,
      type: userId ? "user" : "department",
      status: "Active",
      allocatedById: currentUser.uid,
      allocatedByName: currentUser.displayName || currentUser.email || "System",
      allocatedAt: Date.now(),
      dueDate,
      returnedAt: null
    };

    // Update Asset status and assignee details
    transaction.update(assetRef, {
      status: "Allocated",
      assignedToId: userId,
      assignedToName: assigneeName,
      departmentId: departmentId,
      expectedReturnDate: dueDateStr || null
    });

    // Write new allocation record
    transaction.set(doc(db, "allocations", allocId), allocation);
  });

  await logActivity("Allocate Asset", `Allocated asset ${assetId} to ${userId || departmentId}`);
  
  if (userId) {
    await sendNotification(
      userId, 
      "Asset Allocated", 
      `Asset ${assetId} has been successfully checked out to you.`
    );
  }
}

export async function returnAsset(assetId: string, checkInNotes?: string, condition?: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const assetRef = doc(db, "assets", assetId);
    const assetSnap = await transaction.get(assetRef);
    if (!assetSnap.exists()) throw new Error("Asset does not exist");
    
    const assetData = assetSnap.data() as Asset;
    if (assetData.status !== "Allocated") {
      throw new Error("Asset is not currently allocated.");
    }

    const oldUserId = assetData.assignedToId;

    // Find active allocation for this asset
    const allocationsRef = collection(db, "allocations");
    const activeQuery = query(allocationsRef, where("assetId", "==", assetId), where("status", "==", "Active"));
    const querySnap = await getDocs(activeQuery);
    
    querySnap.forEach((doc) => {
      transaction.update(doc.ref, {
        status: "Returned",
        returnedAt: Date.now()
      });
    });

    // Update Asset back to Available
    transaction.update(assetRef, {
      status: "Available",
      assignedToId: null,
      assignedToName: null,
      departmentId: null
    });

    if (oldUserId) {
      // Send notification inside transaction callback trigger (run after commit is safest, but queued here)
      sendNotification(
        oldUserId,
        "Asset Returned",
        `Asset ${assetData.name} (${assetData.assetTag}) has been returned successfully.`
      );
    }
    
    // If checkInNotes provided, append to the asset description for now
    if (checkInNotes) {
      transaction.update(assetRef, { description: assetData.description + "\\nCheck-in Notes: " + checkInNotes });
    }
  });
  await logActivity("Return Asset", `Returned asset ${assetId}`);
}

export async function requestTransfer(assetId: string, toUserId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  const assetRef = doc(db, "assets", assetId);
  const assetSnap = await getDocs(query(collection(db, "assets"), where("id", "==", assetId)));
  if (assetSnap.empty) throw new Error("Asset does not exist");
  
  const assetData = assetSnap.docs[0].data() as Asset;
  if (assetData.status !== "Allocated") throw new Error("Asset must be allocated to initiate transfer");
  
  const fromUserId = assetData.assignedToId;
  if (!fromUserId) throw new Error("Asset is not currently assigned to anyone");

  const toUserSnap = await getDocs(query(collection(db, "users"), where("uid", "==", toUserId)));
  if (toUserSnap.empty) throw new Error("Target user does not exist");
  const toUserData = toUserSnap.docs[0].data();

  const fromUserSnap = await getDocs(query(collection(db, "users"), where("uid", "==", fromUserId)));
  const fromUserData = fromUserSnap.empty ? { displayName: "Previous Custodian" } : fromUserSnap.docs[0].data();

  const reqId = "TRF-" + Date.now().toString().slice(-6);
  const request: TransferRequest = {
    id: reqId,
    assetId,
    fromUserId,
    fromUserName: fromUserData.displayName || fromUserData.email || "",
    toUserId,
    toUserName: toUserData.displayName || toUserData.email || "",
    requestedById: currentUser.uid,
    status: "Pending",
    requestedAt: Date.now(),
    actionedAt: null,
    actionedById: null
  };

  await setDoc(doc(db, "transferRequests", reqId), request);
  await logActivity("Request Transfer", `Requested transfer of asset ${assetId} from ${fromUserId} to ${toUserId}`);
  
  // Notify target user
  await sendNotification(
    toUserId,
    "Asset Transfer Request",
    `A transfer request has been raised to assign asset ${assetData.name} to you.`
  );
}

export async function executeDirectTransfer(assetId: string, toUserId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  await runTransaction(db, async (transaction) => {
    const assetRef = doc(db, "assets", assetId);
    const assetSnap = await transaction.get(assetRef);
    if (!assetSnap.exists()) throw new Error("Asset does not exist");
    
    const assetData = assetSnap.data() as Asset;
    if (assetData.status !== "Allocated") {
      throw new Error("Asset is not currently allocated.");
    }

    let toUserName = "";
    if (toUserId) {
      const toUserSnap = await getDocs(query(collection(db, "users"), where("uid", "==", toUserId)));
      if (toUserSnap.empty) throw new Error("Target user does not exist");
      const toUserData = toUserSnap.docs[0].data();
      toUserName = toUserData.displayName || toUserData.email || "";
    }

    // 1. Close current active allocation
    const allocationsRef = collection(db, "allocations");
    const activeQuery = query(allocationsRef, where("assetId", "==", assetId), where("status", "==", "Active"));
    const querySnap = await getDocs(activeQuery);
    querySnap.forEach((docSnap) => {
      transaction.update(docSnap.ref, {
        status: "Returned",
        returnedAt: Date.now()
      });
    });

    // 2. Create new allocation
    if (toUserId) {
      const allocId = "ALC-" + Date.now().toString().slice(-6);
      const allocation: Allocation = {
        id: allocId,
        assetId: assetId,
        userId: toUserId,
        departmentId: assetData.departmentId,
        type: "user",
        status: "Active",
        allocatedById: currentUser.uid,
        allocatedByName: currentUser.displayName || currentUser.email || "System",
        allocatedAt: Date.now(),
        dueDate: null,
        returnedAt: null
      };
      transaction.set(doc(db, "allocations", allocId), allocation);
    }

    // 3. Update asset details
    transaction.update(assetRef, {
      assignedToId: toUserId,
      assignedToName: toUserName,
      status: "Allocated"
    });
  });

  await logActivity("Transfer Asset", `Directly transferred asset ${assetId} to ${toUserId}`);
}

export async function getTransferRequests(): Promise<TransferRequest[]> {
  const colRef = collection(db, "transferRequests");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as TransferRequest);
}

export async function approveTransfer(requestId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, "transferRequests", requestId);
    const reqSnap = await transaction.get(reqRef);
    if (!reqSnap.exists()) throw new Error("Transfer request does not exist");
    
    const reqData = reqSnap.data() as TransferRequest;
    if (reqData.status !== "Pending") throw new Error("Transfer request is not pending");

    const assetRef = doc(db, "assets", reqData.assetId);
    const assetSnap = await transaction.get(assetRef);
    if (!assetSnap.exists()) throw new Error("Asset does not exist");
    const assetData = assetSnap.data() as Asset;

    // 1. Close current active allocation
    const allocationsRef = collection(db, "allocations");
    const activeQuery = query(allocationsRef, where("assetId", "==", reqData.assetId), where("status", "==", "Active"));
    const querySnap = await getDocs(activeQuery);
    querySnap.forEach((doc) => {
      transaction.update(doc.ref, {
        status: "Returned",
        returnedAt: Date.now()
      });
    });

    // 2. Create new allocation
    const allocId = "ALC-" + Date.now().toString().slice(-6);
    const allocation: Allocation = {
      id: allocId,
      assetId: reqData.assetId,
      userId: reqData.toUserId,
      departmentId: assetData.departmentId,
      type: "user",
      status: "Active",
      allocatedById: currentUser.uid,
      allocatedByName: currentUser.displayName || currentUser.email || "System",
      allocatedAt: Date.now(),
      dueDate: null,
      returnedAt: null
    };
    transaction.set(doc(db, "allocations", allocId), allocation);

    // 3. Update asset details
    transaction.update(assetRef, {
      assignedToId: reqData.toUserId,
      assignedToName: reqData.toUserName
    });

    // 4. Update request status
    transaction.update(reqRef, {
      status: "Approved",
      actionedAt: Date.now(),
      actionedById: currentUser.uid
    });
  });

  await logActivity("Approve Transfer", `Approved transfer request ${requestId}`);
}

export async function rejectTransfer(requestId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  const reqRef = doc(db, "transferRequests", requestId);
  await updateDoc(reqRef, {
    status: "Rejected",
    actionedAt: Date.now(),
    actionedById: currentUser.uid
  });

  await logActivity("Reject Transfer", `Rejected transfer request ${requestId}`);
}

export function recordAssetHistory(
  transaction: any,
  assetId: string,
  type: string,
  description: string
) {
  const historyRef = doc(collection(db, "assets", assetId, "history"));
  transaction.set(historyRef, {
    id: historyRef.id,
    type,
    description,
    timestamp: Date.now()
  });
}


export async function getAllocations(): Promise<Allocation[]> {
  const colRef = collection(db, "allocations");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as Allocation);
}
