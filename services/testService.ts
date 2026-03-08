import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const runConnectionTest = async () => {
  if (!db) {
    console.warn("⚠️ Firebase Firestore not initialized. Connection test skipped.");
    return false;
  }
  try {
    const docRef = await addDoc(collection(db, "connection_tests"), {
      timestamp: serverTimestamp(),
      message: "Backend connection verified successfully."
    });
    console.log("✅ Firebase Connection Test Success! Doc ID:", docRef.id);
    return true;
  } catch (error) {
    console.error("❌ Firebase Connection Test Failed:", error);
    return false;
  }
};
