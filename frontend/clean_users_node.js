import { config } from "dotenv";
config();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
