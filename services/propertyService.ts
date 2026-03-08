import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  deleteDoc,
  limit,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { Property, SearchFilters } from "../types";

const COLLECTION_NAME = "properties";

export const subscribeToProperties = (filters: { ownerId?: string, agencyId?: string }, callback: (properties: Property[]) => void) => {
  if (!db) return () => {};
  try {
    let q;
    if (filters.ownerId) {
      q = query(collection(db, COLLECTION_NAME), where("createdBy", "==", filters.ownerId));
    } else if (filters.agencyId) {
      q = query(collection(db, COLLECTION_NAME), where("agencyId", "==", filters.agencyId));
    } else {
      q = query(collection(db, COLLECTION_NAME));
    }

    return onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Property));
      
      // Sort in memory
      properties.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      
      callback(properties);
    });
  } catch (error) {
    console.error("Error subscribing to properties:", error);
    return () => {};
  }
};

export const createProperty = async (propertyData: any, userId: string, agencyId: string | null): Promise<string> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...propertyData,
      createdBy: userId,
      agencyId: agencyId || null,
      createdAt: serverTimestamp(),
      postedAt: new Date().toISOString(),
      lastConfirmedAt: new Date().toISOString(),
      status: "active"
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
};

export const getProperties = async (filters?: SearchFilters): Promise<Property[]> => {
  if (!db) {
    console.warn("Firestore not initialized. Returning mock data.");
    return [];
  }
  try {
    let q = query(collection(db, COLLECTION_NAME));

    if (filters) {
      const constraints = [];
      if (filters.category !== 'ALL') {
        constraints.push(where("category", "==", filters.category));
      }
      if (filters.type !== 'ALL') {
        constraints.push(where("type", "==", filters.type));
      }
      if (filters.bhk !== 'ALL') {
        constraints.push(where("bhk", "==", filters.bhk));
      }
      if (filters.minPrice > 0) {
        constraints.push(where("price", ">=", filters.minPrice));
      }
      if (filters.maxPrice < 2000000000) {
        constraints.push(where("price", "<=", filters.maxPrice));
      }
      
      if (constraints.length > 0) {
        q = query(collection(db, COLLECTION_NAME), ...constraints);
      }
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Property));
  } catch (error) {
    console.error("Error getting properties:", error);
    throw error;
  }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Property;
    }
    return null;
  } catch (error) {
    console.error("Error getting property by id:", error);
    return null;
  }
};

export const getMyProperties = async (userId: string): Promise<Property[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("ownerId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Property));
  } catch (error) {
    console.error("Error getting my properties:", error);
    throw error;
  }
};

export const updateProperty = async (id: string, data: Partial<Property>): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      lastConfirmedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

export const deleteProperty = async (id: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};
