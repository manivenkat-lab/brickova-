import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { UserRole, AppUser } from "../types";

export const loginWithGoogle = async (): Promise<AppUser | null> => {
  if (!auth) {
    alert("Firebase Authentication is not initialized. Please check your configuration.");
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user document
      const newUser: AppUser = {
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        email: user.email || "",
        photo: user.photoURL || "",
        phone: user.phoneNumber || "",
        role: UserRole.BUYER, // Default role as per request
        agencyId: null,
        agencyCode: null,
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, newUser);
      return newUser;
    }
    
    return userDoc.data() as AppUser;
  } catch (error) {
    console.error("Error logging in with Google:", error);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getCurrentUserDoc = async (uid: string): Promise<AppUser | null> => {
  if (!db) return null;
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }
    return null;
  } catch (error) {
    console.error("Error getting user doc:", error);
    return null;
  }
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};
