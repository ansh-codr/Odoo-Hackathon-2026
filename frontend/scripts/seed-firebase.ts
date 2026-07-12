import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env to get Firebase configuration
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {

  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      // Remove surrounding quotes if any
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("Initializing Firebase with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@assetflow.com";
const ADMIN_PASSWORD = "Admin123@";

const DEPARTMENTS = [
  { id: "it", name: "IT", description: "Information Technology and Systems", headId: null, status: "active" as const },
  { id: "hr", name: "HR", description: "Human Resources", headId: null, status: "active" as const },
  { id: "finance", name: "Finance", description: "Financial Planning and accounting", headId: null, status: "active" as const },
  { id: "operations", name: "Operations", description: "General Operations and facilities", headId: null, status: "active" as const },
];

const CATEGORIES = [
  { id: "electronics", name: "Electronics", description: "Computers, tablets, phones, and peripherals", warrantyPeriod: "2 Years", status: "active" as const },
  { id: "furniture", name: "Furniture", description: "Desks, chairs, cabinets, and tables", warrantyPeriod: "5 Years", status: "active" as const },
  { id: "vehicles", name: "Vehicles", description: "Company vans, cars, and delivery trucks", warrantyPeriod: "3 Years", status: "active" as const },
];

async function seed() {
  try {
    console.log("Seeding started...");
    
    // 1. Create or login Admin Auth User
    let userUid = "";
    try {
      console.log(`Creating Admin user auth record: ${ADMIN_EMAIL}...`);
      const userCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      await updateProfile(userCred.user, { displayName: "System Admin" });
      userUid = userCred.user.uid;
      console.log("Admin auth user created successfully.");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        console.log("Admin user auth already exists. Signing in to fetch UID...");
        const userCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        userUid = userCred.user.uid;
        console.log("Signed in successfully. Admin UID:", userUid);
      } else {
        throw err;
      }
    }

    // 2. Write Admin document to users collection with "admin" role
    console.log("Writing Admin profile to Firestore...");
    await setDoc(doc(db, "users", userUid), {
      uid: userUid,
      email: ADMIN_EMAIL,
      displayName: "System Admin",
      role: "admin",
      departmentId: "it",
      createdAt: Date.now()
    });
    console.log("Admin profile document written.");

    // 3. Seed Departments
    console.log("Seeding Departments...");
    for (const dept of DEPARTMENTS) {
      const deptRef = doc(db, "departments", dept.id);
      const deptSnap = await getDoc(deptRef);
      if (!deptSnap.exists()) {
        await setDoc(deptRef, {
          ...dept,
          headId: dept.id === "it" ? userUid : null, // Set Admin as IT Head
          createdAt: Date.now()
        });
        console.log(`Seeded department: ${dept.name}`);
      } else {
        console.log(`Department ${dept.name} already exists.`);
      }
    }

    // 4. Seed Categories
    console.log("Seeding Asset Categories...");
    for (const cat of CATEGORIES) {
      const catRef = doc(db, "assetCategories", cat.id);
      const catSnap = await getDoc(catRef);
      if (!catSnap.exists()) {
        await setDoc(catRef, {
          ...cat,
          createdAt: Date.now()
        });
        console.log(`Seeded category: ${cat.name}`);
      } else {
        console.log(`Category ${cat.name} already exists.`);
      }
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seed();
