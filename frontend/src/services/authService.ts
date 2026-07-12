import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserDocument, UserRole } from "./types";
import { logActivity } from "./logService";

export async function registerUser(email: string, password: string, name: string): Promise<User> {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;
  
  await updateProfile(user, { displayName: name });
  
  // Create user document in Firestore with default 'employee' role
  const userDocRef = doc(db, "users", user.uid);
  const userDoc: UserDocument = {
    uid: user.uid,
    email: user.email || email,
    displayName: name,
    role: email.toLowerCase() === "admin@assetflow.com" ? "admin" : "employee",
    departmentId: null,
    createdAt: Date.now()
  };
  await setDoc(userDocRef, userDoc);
  
  await logActivity("User Registered", `Registered new employee user ${email} (${name})`);
  return user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  await logActivity("User Login", `Logged in user ${email}`);
  return userCred.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const userCred = await signInWithPopup(auth, provider);
  const user = userCred.user;
  
  // Check if user doc exists
  const userDocRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userDocRef);
  
  if (!docSnap.exists()) {
    // Create new user document
    const userDoc: UserDocument = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "Google User",
      role: (user.email || "").toLowerCase() === "admin@assetflow.com" ? "admin" : "employee",
      departmentId: null,
      createdAt: Date.now()
    };
    await setDoc(userDocRef, userDoc);
    await logActivity("User Registered", `Registered new Google user ${user.email}`);
  } else {
    await logActivity("User Login", `Logged in Google user ${user.email}`);
  }
  
  return user;
}

export async function logoutUser(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await logActivity("User Logout", `Logged out user ${user.email}`);
  }
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserDocument | null> {
  const userDocRef = doc(db, "users", uid);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserDocument;
  }
  return null;
}

export async function promoteUser(uid: string, newRole: UserRole, departmentId: string | null = null): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  
  // Fetch current profile to log details
  const profileSnap = await getDoc(userDocRef);
  if (!profileSnap.exists()) {
    throw new Error("User does not exist");
  }
  const oldProfile = profileSnap.data() as UserDocument;
  
  await updateDoc(userDocRef, { 
    role: newRole,
    departmentId: departmentId !== undefined ? departmentId : oldProfile.departmentId
  });
  
  await logActivity(
    "User Promoted", 
    `Promoted user ${oldProfile.email} from ${oldProfile.role} to ${newRole}`
  );
}
