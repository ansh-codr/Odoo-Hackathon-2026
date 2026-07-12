import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function cleanUsers() {
  console.log("Fetching users...");
  const snapshot = await getDocs(collection(db, "users"));
  let deleted = 0;
  
  for (const userDoc of snapshot.docs) {
    if (userDoc.id.startsWith("EMP-")) {
      console.log(`Deleting mock user: ${userDoc.id}`);
      await deleteDoc(doc(db, "users", userDoc.id));
      deleted++;
    }
  }
  
  console.log(`Finished. Deleted ${deleted} mock users.`);
  process.exit(0);
}

cleanUsers().catch(console.error);
