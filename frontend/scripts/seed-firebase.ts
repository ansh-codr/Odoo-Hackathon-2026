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
  getDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
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
  { id: "it", name: "IT & Technology", description: "Information Technology and Software Engineering Support", headId: "EMP-1000", status: "active" },
  { id: "hr", name: "Human Resources", description: "Human Capital, Recruiting, and Employee Relations", headId: "EMP-1001", status: "active" },
  { id: "finance", name: "Finance & Accounts", description: "Financial Planning, Audits, and Accounting Control", headId: "EMP-1002", status: "active" },
  { id: "operations", name: "Operations & Logistics", description: "Facilities Management and Supply Chains", headId: "EMP-1003", status: "active" },
  { id: "marketing", name: "Marketing & Public Relations", description: "Communications and Outreach Development", headId: "EMP-1004", status: "active" },
];

const CATEGORIES = [
  { id: "laptops", name: "Laptops & Notebooks", description: "Developer and general-purpose workstation computers", warrantyPeriod: "3 Years", status: "active" },
  { id: "servers", name: "Server Racks & Routers", description: "Data center networks and networking accessories", warrantyPeriod: "5 Years", status: "active" },
  { id: "monitors", name: "Display Monitors", description: "Ultra-wide screen monitors and office displays", warrantyPeriod: "3 Years", status: "active" },
  { id: "furniture", name: "Office Chairs & Desks", description: "Ergonomic furniture and meeting room desks", warrantyPeriod: "5 Years", status: "active" },
  { id: "vehicles", name: "Company Vans & Cars", description: "General transportation and delivery fleets", warrantyPeriod: "4 Years", status: "active" },
  { id: "mobile_devices", name: "Smartphones & Tablets", description: "Test mobile devices and executive communication", warrantyPeriod: "2 Years", status: "active" },
  { id: "projectors", name: "Meeting Room Projectors", description: "Short-throw projectors and presentation screens", warrantyPeriod: "3 Years", status: "active" },
  { id: "security", name: "Access Badges & Cameras", description: "IP security cameras and facility access controllers", warrantyPeriod: "2 Years", status: "active" },
];

// Employee Names
const NAMES = [
  "James Smith", "John Jones", "Robert Miller", "Michael Davis", "William Rodriguez",
  "David Martinez", "Richard Hernandez", "Charles Lopez", "Joseph Gonzalez", "Thomas Wilson",
  "Patricia Anderson", "Jennifer Thomas", "Linda Taylor", "Elizabeth Moore", "Barbara Jackson",
  "Susan Martin", "Jessica Lee", "Sarah Perez", "Karen Thompson", "Nancy White",
  "Lisa Harris", "Betty Sanchez", "Margaret Clark", "Sandra Ramirez", "Ashley Lewis",
  "Dorothy Robinson", "Kimberly Walker", "Emma Young", "Donna Allen", "Carol King",
  "Michelle Wright", "Emily Scott", "Amanda Torres", "Helen Nguyen", "Melissa Hill",
  "Deborah Flores", "Stephanie Green", "Rebecca Adams", "Laura Nelson", "Sharon Baker"
];

async function seed() {
  try {
    console.log("Seeding process started...");

    // 1. Create or login Admin Auth User
    let adminUid = "";
    try {
      console.log(`Creating Admin user auth record: ${ADMIN_EMAIL}...`);
      const userCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      await updateProfile(userCred.user, { displayName: "System Admin" });
      adminUid = userCred.user.uid;
      console.log("Admin auth user created successfully.");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        console.log("Admin user auth already exists. Signing in to fetch UID...");
        const userCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        adminUid = userCred.user.uid;
        console.log("Signed in successfully. Admin UID:", adminUid);
      } else {
        throw err;
      }
    }

    // 2. Write Admin document to users collection FIRST to satisfy isManagerOrAdmin security rules
    console.log("Writing Admin profile to Firestore...");
    await setDoc(doc(db, "users", adminUid), {
      uid: adminUid,
      email: ADMIN_EMAIL,
      displayName: "System Admin",
      role: "admin",
      departmentId: "it",
      status: "active",
      createdAt: Date.now()
    });
    console.log("Admin profile document written successfully.");

    // 3. Seed Departments
    console.log("Seeding 5 Departments...");
    for (const dept of DEPARTMENTS) {
      const docRef = doc(db, "departments", dept.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, { 
          ...dept, 
          headId: dept.id === "it" ? adminUid : dept.headId, 
          createdAt: Date.now() 
        });
        console.log(`Seeded Department: ${dept.name}`);
      }
    }

    // 4. Seed Categories
    console.log("Seeding 8 Categories...");
    for (const cat of CATEGORIES) {
      const docRef = doc(db, "assetCategories", cat.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, { ...cat, createdAt: Date.now() });
        console.log(`Seeded Category: ${cat.name}`);
      }
    }

    // 5. Seed 40 Employees
    console.log("Seeding 40 Employees...");
    const employees: any[] = [];
    const deptIds = ["it", "hr", "finance", "operations", "marketing"];

    // Push the admin employee first
    employees.push({
      uid: adminUid,
      displayName: "System Admin",
      email: ADMIN_EMAIL,
      role: "admin",
      departmentId: "it"
    });

    for (let i = 1; i < 40; i++) {
      const uid = `EMP-${1000 + i}`;
      const name = NAMES[i];
      const email = `${name.toLowerCase().replace(" ", ".")}@assetflow.com`;
      const role = i === 1 ? "asset_manager" : (i < 6 ? "department_head" : "employee");
      const departmentId = deptIds[i % deptIds.length];

      const empData = {
        uid,
        displayName: name,
        email,
        role,
        departmentId,
        status: "active",
        createdAt: Date.now() - (i * 24 * 60 * 60 * 1000)
      };

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, empData);
        employees.push(empData);
      } else {
        employees.push(docSnap.data());
      }
    }
    console.log(`Successfully seeded/verified ${employees.length} employee documents.`);

    // 6. Seed 80 Assets
    console.log("Seeding 80 Assets...");
    const assets: any[] = [];
    const locations = ["HQ - Floor 1", "HQ - Floor 2", "HQ - Floor 3", "Regional Office", "Warehouse"];
    const assetModels = [
      { category: "laptops", name: "MacBook Pro M3", cost: 2499, tagPrefix: "LAP" },
      { category: "laptops", name: "Dell XPS 15", cost: 1899, tagPrefix: "LAP" },
      { category: "servers", name: "Cisco Catalyst Switch", cost: 5400, tagPrefix: "NET" },
      { category: "servers", name: "Dell PowerEdge R760", cost: 8900, tagPrefix: "SVR" },
      { category: "monitors", name: "LG UltraFine 27K", cost: 699, tagPrefix: "MON" },
      { category: "furniture", name: "Herman Miller Aeron Chair", cost: 1200, tagPrefix: "FUR" },
      { category: "vehicles", name: "Ford Transit Cargo Van", cost: 35000, tagPrefix: "VEH" },
      { category: "mobile_devices", name: "iPad Pro 12.9", cost: 1099, tagPrefix: "MOB" },
      { category: "projectors", name: "Epson PowerLite Short Throw", cost: 1490, tagPrefix: "PRJ" },
      { category: "security", name: "Ubiquiti Security Camera Pack", cost: 850, tagPrefix: "SEC" },
    ];

    for (let i = 0; i < 80; i++) {
      const id = `AST-${1000 + i}`;
      const model = assetModels[i % assetModels.length];
      const serialNumber = `SN-${Date.now().toString().slice(-4)}-${i}`;
      const assetTag = `AF-${model.tagPrefix}-${(200 + i)}`;
      
      const sharedResource = ["vehicles", "projectors"].includes(model.category) || (i % 8 === 0 && model.category === "furniture");
      
      const assetData = {
        id,
        name: `${model.name} (Unit ${i + 1})`,
        categoryId: model.category,
        assetTag,
        serialNumber,
        purchaseDate: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
        purchaseCost: model.cost,
        vendor: "Enterprise Logistics Group",
        location: locations[i % locations.length],
        status: i < 20 ? "Allocated" : (i === 20 || i === 21 ? "Under_Maintenance" : (i === 22 ? "Lost" : "Available")),
        sharedResource,
        photoUrl: "",
        assignedToId: i < 20 ? employees[i].uid : null,
        assignedToName: i < 20 ? employees[i].displayName : null,
        departmentId: i < 20 ? employees[i].departmentId : null,
        createdAt: Date.now() - (i * 24 * 60 * 60 * 1000)
      };

      const docRef = doc(db, "assets", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, assetData);
        assets.push(assetData);
      } else {
        assets.push(docSnap.data());
      }
    }
    console.log(`Successfully seeded/verified ${assets.length} asset documents.`);

    // 7. Seed 20 Active Allocations
    console.log("Seeding 20 Active Allocations...");
    for (let i = 0; i < 20; i++) {
      const allocId = `ALC-100${i}`;
      const asset = assets[i];
      const emp = employees[i];
      const docRef = doc(db, "allocations", allocId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: allocId,
          assetId: asset.id,
          userId: emp.uid,
          departmentId: emp.departmentId,
          type: "user",
          status: i === 19 ? "Overdue" : "Active",
          allocatedById: adminUid,
          allocatedByName: "System Admin",
          allocatedAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
          dueDate: i === 19 ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          returnedAt: null,
          conditionNotes: "In perfect working condition."
        });
      }
    }

    // 8. Seed 12 Transfer Requests
    console.log("Seeding 12 Transfer Requests...");
    const statuses = ["Pending", "Approved", "Rejected"];
    for (let i = 0; i < 12; i++) {
      const reqId = `TRF-100${i}`;
      const asset = assets[i % 20];
      const fromEmp = employees[i % 10];
      const toEmp = employees[(i + 1) % 20];
      const docRef = doc(db, "transferRequests", reqId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: reqId,
          assetId: asset.id,
          fromUserId: fromEmp.uid,
          fromUserName: fromEmp.displayName,
          toUserId: toEmp.uid,
          toUserName: toEmp.displayName,
          requestedById: fromEmp.uid,
          status: statuses[i % statuses.length],
          requestedAt: Date.now() - (i * 12 * 60 * 60 * 1000),
          actionedAt: i % statuses.length === 0 ? null : Date.now(),
          actionedById: i % statuses.length === 0 ? null : adminUid
        });
      }
    }

    // 9. Seed 18 Bookings
    console.log("Seeding 18 Resource Bookings...");
    const bookableAssets = assets.filter(a => a.sharedResource);
    const bookingStatuses = ["Reserved", "CheckedIn", "Completed", "Cancelled"];
    for (let i = 0; i < 18; i++) {
      const bkgId = `BKG-100${i}`;
      const asset = bookableAssets[i % bookableAssets.length];
      const emp = employees[i % employees.length];
      const docRef = doc(db, "bookings", bkgId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: bkgId,
          assetId: asset.id,
          assetName: asset.name,
          userId: emp.uid,
          userName: emp.displayName,
          departmentId: emp.departmentId,
          date: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "11:00",
          purpose: "Team sync and general operational reviews.",
          status: bookingStatuses[i % bookingStatuses.length],
          createdAt: Date.now() - (24 * 60 * 60 * 1000)
        });
      }
    }

    // 10. Seed 15 Maintenance Requests
    console.log("Seeding 15 Maintenance Tickets...");
    const mntStatuses = ["Pending_Approval", "Approved", "Technician_Assigned", "In_Progress", "Resolved"];
    const priorities = ["Low", "Medium", "High", "Critical"];
    for (let i = 0; i < 15; i++) {
      const mntId = `MNT-100${i}`;
      const asset = assets[i % assets.length];
      const emp = employees[i % employees.length];
      const docRef = doc(db, "maintenanceRequests", mntId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          id: mntId,
          assetId: asset.id,
          assetName: asset.name,
          assetTag: asset.assetTag,
          userId: emp.uid,
          userName: emp.displayName,
          issueDescription: "Screen flickering continuously when HDMI cable connected.",
          priority: priorities[i % priorities.length],
          status: mntStatuses[i % mntStatuses.length],
          cost: i % mntStatuses.length === 4 ? 120 : null,
          createdAt: Date.now() - (i * 2 * 24 * 60 * 60 * 1000),
          actionedById: i % mntStatuses.length === 0 ? null : adminUid,
          actionedAt: i % mntStatuses.length === 0 ? null : Date.now(),
          technician: i >= 6 ? "Alex Wong" : "—",
          resolutionNotes: i % mntStatuses.length === 4 ? "Replaced screen connection adapter cables." : ""
        });
      }
    }

    // 11. Seed 2 Audit Cycles
    console.log("Seeding 2 Audit Cycles...");
    const cycle1Id = "AUD-100001";
    const cycle1Ref = doc(db, "auditCycles", cycle1Id);
    const cycle1Snap = await getDoc(cycle1Ref);
    if (!cycle1Snap.exists()) {
      await setDoc(cycle1Ref, {
        id: cycle1Id,
        name: "Q3 Engineering Asset Audit",
        department: "Engineering",
        location: "HQ - Floor 3",
        auditors: ["Alex Wong", "Sarah Jenkins"],
        startDate: "2026-07-01",
        endDate: "2026-07-20",
        status: "active",
        assets: [
          { id: assets[0].id, tag: assets[0].assetTag, name: assets[0].name, department: "Engineering", status: "verified", verifiedBy: "Alex Wong", verifiedAt: "2026-07-10 10:00 AM" },
          { id: assets[1].id, tag: assets[1].assetTag, name: assets[1].name, department: "Engineering", status: "missing", remarks: "Not located in locker cabin" },
          { id: assets[2].id, tag: assets[2].assetTag, name: assets[2].name, department: "Engineering", status: "damaged", remarks: "Keyboard missing keys" },
          { id: assets[3].id, tag: assets[3].assetTag, name: assets[3].name, department: "Engineering", status: "pending" }
        ],
        createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000)
      });
    }

    const cycle2Id = "AUD-100002";
    const cycle2Ref = doc(db, "auditCycles", cycle2Id);
    const cycle2Snap = await getDoc(cycle2Ref);
    if (!cycle2Snap.exists()) {
      await setDoc(cycle2Ref, {
        id: cycle2Id,
        name: "Q2 IT Department Audit",
        department: "IT",
        location: "Warehouse",
        auditors: ["EMP-1000"],
        startDate: "2026-04-01",
        endDate: "2026-04-15",
        status: "closed",
        assets: [
          { id: assets[4].id, tag: assets[4].assetTag, name: assets[4].name, department: "IT", status: "verified", verifiedBy: "System Admin", verifiedAt: "2026-04-05 11:30 AM" }
        ],
        createdAt: Date.now() - (90 * 24 * 60 * 60 * 1000)
      });
    }

    // 12. Seed 150 Activity Logs in batch
    console.log("Seeding 150 Activity Logs in batch...");
    const batch = writeBatch(db);
    const actions = ["Register Asset", "Allocate Asset", "Return Asset", "Request Transfer", "Approve Transfer", "Create Booking", "Cancel Booking", "Create Maintenance Request", "Resolve Maintenance", "Create Audit Cycle", "Verify Audit Asset"];
    const details = [
      "Registered new asset MacBook Pro M3",
      "Allocated asset to developer",
      "Returned asset in good condition",
      "Requested transfer to Operations",
      "Approved transfer request",
      "Reserved conference room A1",
      "Cancelled booking slot",
      "Raised maintenance ticket for screen repair",
      "Resolved hardware ticket",
      "Created annual audit cycle",
      "Verified assets in the IT warehouse"
    ];

    for (let i = 0; i < 150; i++) {
      const logId = `LOG-SEED-${1000 + i}`;
      const logRef = doc(db, "activityLogs", logId);
      batch.set(logRef, {
        id: logId,
        action: actions[i % actions.length],
        details: `${details[i % details.length]} (Instance ${i})`,
        userId: employees[i % employees.length].uid,
        userName: employees[i % employees.length].displayName,
        createdAt: Date.now() - (i * 2 * 60 * 60 * 1000)
      });
    }
    await batch.commit();
    console.log("Successfully seeded 150 Activity Logs.");

    // 13. Seed 40 Notifications in batch
    console.log("Seeding 40 Alert Notifications in batch...");
    const notifBatch = writeBatch(db);
    const titles = ["Booking Confirmed", "Transfer Requested", "Maintenance Approved", "Audit Cycle Scheduled", "Overdue Return Alert"];
    const bodies = [
      "Your reservation for Meeting Room A1 has been approved.",
      "A custodian has requested to transfer an asset to your pool.",
      "Your maintenance ticket has been approved by the manager.",
      "A compliance audit cycle has been scheduled for your department.",
      "An asset you hold is past its return deadline. Please return it."
    ];

    for (let i = 0; i < 40; i++) {
      const notifId = `NTF-SEED-${1000 + i}`;
      const emp = employees[i % employees.length];
      const notifRef = doc(db, "notifications", notifId);
      notifBatch.set(notifRef, {
        id: notifId,
        userId: emp.uid,
        title: titles[i % titles.length],
        body: bodies[i % bodies.length],
        read: i % 3 === 0,
        createdAt: Date.now() - (i * 4 * 60 * 60 * 1000)
      });
    }
    await notifBatch.commit();
    console.log("Successfully seeded 40 Notifications.");

    console.log("All enterprise demo data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

seed();
