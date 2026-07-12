import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { ActivityLog } from "./types";

export async function logActivity(action: string, details: string): Promise<void> {
  try {
    const user = auth.currentUser;
    const logRef = collection(db, "activityLogs");
    await addDoc(logRef, {
      userId: user ? user.uid : null,
      userEmail: user ? user.email : "anonymous@assetflow.com",
      action,
      details,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const colRef = collection(db, "activityLogs");
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }) as ActivityLog);
}

