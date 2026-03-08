import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

const getEnv = (key: string) => {
  return import.meta.env[key] || (process.env as any)[key];
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

// Only initialize if API key is present and not a placeholder
const isValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== "PASTE_HERE" && firebaseConfig.apiKey !== "";

if (!isValidConfig) {
  console.error("❌ Firebase Configuration is MISSING or INVALID. Please check your .env file.");
  console.log("Current Config:", { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? "REDACTED" : "MISSING" });
}

const app = isValidConfig ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null as any;
export const auth = app ? getAuth(app) : null as any;

if (auth) {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Auth persistence error:", err);
  });
}

export const storage = app ? getStorage(app) : null as any;
export const googleProvider = new GoogleAuthProvider();

if (app) {
  console.log("🚀 Firebase initialized successfully for project:", firebaseConfig.projectId);
}

export default app;
