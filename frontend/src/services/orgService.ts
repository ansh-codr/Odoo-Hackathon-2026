import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Department, AssetCategory, UserDocument } from "./types";
import { logActivity } from "./logService";

// Departments
export async function getDepartments(): Promise<Department[]> {
  const colRef = collection(db, "departments");
  const q = query(colRef, orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Department);
}

export async function createDepartment(name: string, headId: string | null, parentId: string | null, description: string): Promise<Department> {
  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
  const deptDoc: Department = {
    id,
    name,
    description,
    headId,
    status: "active",
    createdAt: Date.now()
  };
  await setDoc(doc(db, "departments", id), deptDoc);
  await logActivity("Create Department", `Created department ${name}`);
  return deptDoc;
}

export async function updateDepartment(id: string, data: Partial<Omit<Department, "id" | "createdAt">>): Promise<void> {
  const docRef = doc(db, "departments", id);
  await updateDoc(docRef, data);
  await logActivity("Update Department", `Updated department ${id} properties: ${JSON.stringify(data)}`);
}

// Asset Categories
export async function getCategories(): Promise<AssetCategory[]> {
  const colRef = collection(db, "assetCategories");
  const q = query(colRef, orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as AssetCategory);
}

export async function createCategory(name: string, description: string, warrantyPeriod: string): Promise<AssetCategory> {
  const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
  const catDoc: AssetCategory = {
    id,
    name,
    description,
    warrantyPeriod,
    status: "active",
    createdAt: Date.now()
  };
  await setDoc(doc(db, "assetCategories", id), catDoc);
  await logActivity("Create Category", `Created asset category ${name}`);
  return catDoc;
}

export async function updateCategory(id: string, data: Partial<Omit<AssetCategory, "id" | "createdAt">>): Promise<void> {
  const docRef = doc(db, "assetCategories", id);
  await updateDoc(docRef, data);
  await logActivity("Update Category", `Updated asset category ${id} properties: ${JSON.stringify(data)}`);
}

// Employees / Users Directory
export async function getEmployees(): Promise<UserDocument[]> {
  const colRef = collection(db, "users");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => doc.data() as UserDocument);
}

export async function updateEmployee(uid: string, data: Partial<Omit<UserDocument, "uid" | "createdAt">>): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
  await logActivity("Update Employee", `Updated employee profile ${uid}`);
}
