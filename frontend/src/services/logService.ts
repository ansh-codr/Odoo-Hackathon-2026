import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

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
