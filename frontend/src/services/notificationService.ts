import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  addDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { AppNotification } from "./types";

export async function sendNotification(userId: string, title: string, message: string): Promise<void> {
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userId,
      title,
      message,
      isRead: false,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef, 
    where("userId", "==", userId), 
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }) as AppNotification);
}

export async function markAsRead(notificationId: string): Promise<void> {
  const docRef = doc(db, "notifications", notificationId);
  await updateDoc(docRef, { isRead: true });
}


export async function deleteNotification(notificationId: string): Promise<void> {
  const docRef = doc(db, "notifications", notificationId);
  await deleteDoc(docRef);
}
