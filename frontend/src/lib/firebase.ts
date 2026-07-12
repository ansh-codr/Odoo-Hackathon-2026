import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZzH23Z-SiSl0Wc6rMdkblT9U3GibXZ2M",
  authDomain: "odoo-hack-bc2bd.firebaseapp.com",
  projectId: "odoo-hack-bc2bd",
  storageBucket: "odoo-hack-bc2bd.firebasestorage.app",
  messagingSenderId: "756277398800",
  appId: "1:756277398800:web:c08318ee4137c29a97e995",
  measurementId: "G-CDB3JY8TE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth };
