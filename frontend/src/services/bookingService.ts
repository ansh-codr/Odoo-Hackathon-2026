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
import { Booking } from "./types";
import { logActivity } from "./logService";
import { sendNotification } from "./notificationService";

export async function getBookings(): Promise<Booking[]> {
  const colRef = collection(db, "bookings");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as Booking);
}

export async function createBooking(data: Omit<Booking, "id" | "bookedBy" | "status" | "createdAt" | "userName">): Promise<Booking> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  const bookingId = "BKG-" + Date.now().toString().slice(-6);
  const newBooking: Booking = {
    ...data,
    id: bookingId,
    userId: currentUser.uid,
    userName: currentUser.displayName || currentUser.email || "Employee",
    status: "Reserved",
    createdAt: Date.now()
  };

  await runTransaction(db, async (transaction) => {
    // 1. Fetch bookings on same asset and same date to validate overlap
    const bookingsCol = collection(db, "bookings");
    const q = query(
      bookingsCol, 
      where("assetId", "==", data.assetId), 
      where("date", "==", data.date)
    );
    const snap = await getDocs(q);
    
    const overlap = snap.docs.some(docSnap => {
      const b = docSnap.data() as Booking;
      if (b.status === "Cancelled") return false;
      // Overlap check: (Start A < End B) and (End A > Start B)
      return newBooking.startTime < b.endTime && newBooking.endTime > b.startTime;
    });

    if (overlap) {
      throw new Error("This resource is already booked during the selected time slot.");
    }

    // 2. Set booking document
    transaction.set(doc(db, "bookings", bookingId), newBooking);

    // 3. Update asset status to Reserved
    const assetRef = doc(db, "assets", data.assetId);
    transaction.update(assetRef, { status: "Reserved" });
  });

  await logActivity("Create Booking", `Reserved resource ${data.assetName} on ${data.date} at ${data.startTime}-${data.endTime}`);
  await sendNotification(
    currentUser.uid, 
    "Booking Confirmed", 
    `Your reservation for ${data.assetName} on ${data.date} has been confirmed.`
  );

  return newBooking;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Authentication required");

  await runTransaction(db, async (transaction) => {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) throw new Error("Booking does not exist");
    
    const b = bookingSnap.data() as Booking;
    if (b.status === "Cancelled") return;

    // Update booking status
    transaction.update(bookingRef, { status: "Cancelled" });

    // Update asset back to Available
    const assetRef = doc(db, "assets", b.assetId);
    transaction.update(assetRef, { status: "Available" });
  });

  await logActivity("Cancel Booking", `Cancelled booking ${bookingId}`);
}
