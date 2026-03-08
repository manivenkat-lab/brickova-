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
  Timestamp,
  arrayUnion,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { Lead, LeadStatus, LeadNote } from "../types";

const COLLECTION_NAME = "leads";

export const subscribeToLeads = (filters: { agentId?: string, agencyId?: string }, callback: (leads: Lead[]) => void) => {
  if (!db) return () => {};
  try {
    let q;
    if (filters.agentId) {
      q = query(collection(db, COLLECTION_NAME), where("assignedTo", "==", filters.agentId));
    } else if (filters.agencyId) {
      q = query(collection(db, COLLECTION_NAME), where("agencyId", "==", filters.agencyId));
    } else {
      q = query(collection(db, COLLECTION_NAME));
    }

    return onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
      } as Lead));
      
      // Sort in memory
      leads.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      
      callback(leads);
    });
  } catch (error) {
    console.error("Error subscribing to leads:", error);
    return () => {};
  }
};

export const checkDuplicatePhone = async (phone: string): Promise<boolean> => {
  if (!db) return false;
  try {
    const q = query(collection(db, COLLECTION_NAME), where("phone", "==", phone), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking duplicate phone:", error);
    return false;
  }
};

export const createLead = async (leadData: any, userId: string, agencyId: string | null): Promise<string> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...leadData,
      status: "New",
      createdBy: userId,
      agencyId: agencyId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
};

export const getLeads = async (filters: { agentId?: string, agencyId?: string }): Promise<Lead[]> => {
  if (!db) return [];
  try {
    let q;
    if (filters.agentId) {
      q = query(collection(db, COLLECTION_NAME), where("assignedTo", "==", filters.agentId));
    } else if (filters.agencyId) {
      q = query(collection(db, COLLECTION_NAME), where("agencyId", "==", filters.agencyId));
    } else {
      q = query(collection(db, COLLECTION_NAME));
    }

    const querySnapshot = await getDocs(q);
    const leads = querySnapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    } as Lead));

    // Sort in memory to avoid composite index requirement
    return leads.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting leads:", error);
    return [];
  }
};

export const updateLeadStatus = async (leadId: string, status: LeadStatus): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, leadId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating lead status:", error);
    throw error;
  }
};

export const updateLead = async (leadId: string, data: Partial<Lead>): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, leadId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
};

export const deleteLead = async (leadId: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, leadId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const addLeadNote = async (leadId: string, noteText: string): Promise<void> => {
  if (!db) throw new Error("Firestore not initialized");
  try {
    const docRef = doc(db, COLLECTION_NAME, leadId);
    const newNote: LeadNote = {
      text: noteText,
      createdAt: new Date().toISOString()
    };
    await updateDoc(docRef, {
      notes: arrayUnion(newNote),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error adding lead note:", error);
    throw error;
  }
};
