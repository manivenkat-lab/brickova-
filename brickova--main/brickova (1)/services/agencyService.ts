
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  runTransaction,
  limit
} from "firebase/firestore";
import { db } from "../firebase";
import { Agency, UserRole, AgencyMember } from "../types";

/**
 * Generates a unique 6-8 character uppercase alphanumeric join code
 */
const generateJoinCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const length = 6 + Math.floor(Math.random() * 3); // 6 to 8 characters
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Ensures the generated code is unique in the agencies collection
 */
const getUniqueJoinCode = async (): Promise<string> => {
  let code = generateJoinCode();
  let isUnique = false;
  
  while (!isUnique) {
    const q = query(collection(db, "agencies"), where("code", "==", code), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      isUnique = true;
    } else {
      code = generateJoinCode();
    }
  }
  return code;
};

/**
 * Creates a new agency and sets the creator as admin
 */
export const createAgency = async (formData: { name: string, adminUid: string }) => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const code = await getUniqueJoinCode();
    const agencyId = doc(collection(db, "agencies")).id;
    const agencyRef = doc(db, "agencies", agencyId);
    const userRef = doc(db, "users", formData.adminUid);

    const agencyData: Omit<Agency, 'id'> = {
      name: formData.name,
      adminUid: formData.adminUid,
      code: code,
      slotLimit: 15,
      slotUsed: 1,
      createdAt: serverTimestamp(),
      active: true
    };

    await runTransaction(db, async (transaction) => {
      // Create Agency Doc
      transaction.set(agencyRef, agencyData);

      // Add Admin as Member
      const memberRef = doc(db, `agencies/${agencyId}/members`, formData.adminUid);
      const memberData: AgencyMember = {
        uid: formData.adminUid,
        role: 'admin',
        joinedAt: serverTimestamp()
      };
      transaction.set(memberRef, memberData);

      // Update User Doc
      transaction.update(userRef, {
        role: UserRole.AGENCY_ADMIN,
        agencyId: agencyId,
        agencyCode: code
      });
    });

    return { id: agencyId, ...agencyData };
  } catch (error) {
    console.error("Error creating agency:", error);
    throw error;
  }
};

/**
 * Joins an agency using a unique join code
 */
export const joinAgencyByCode = async (uid: string, code: string) => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    const q = query(collection(db, "agencies"), where("code", "==", code.toUpperCase()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid join code. Agency not found.");
    }

    const agencyDoc = querySnapshot.docs[0];
    const agencyData = agencyDoc.data() as Agency;
    const agencyId = agencyDoc.id;

    if (agencyData.slotUsed >= agencyData.slotLimit) {
      throw new Error("Agency full. Slot limit reached.");
    }

    const agencyRef = doc(db, "agencies", agencyId);
    const userRef = doc(db, "users", uid);
    const memberRef = doc(db, `agencies/${agencyId}/members`, uid);

    await runTransaction(db, async (transaction) => {
      // Add Member to Subcollection
      const memberData: AgencyMember = {
        uid: uid,
        role: 'agent',
        joinedAt: serverTimestamp()
      };
      transaction.set(memberRef, memberData);

      // Update User Doc
      transaction.update(userRef, {
        role: UserRole.AGENT,
        agencyId: agencyId,
        agencyCode: code.toUpperCase()
      });

      // Increment Slot Used
      transaction.update(agencyRef, {
        slotUsed: increment(1)
      });
    });

    return { agencyId, agencyName: agencyData.name };
  } catch (error) {
    console.error("Error joining agency:", error);
    throw error;
  }
};

/**
 * Fetches all members of an agency
 */
export const getAgencyMembers = async (agencyId: string) => {
  if (!db) return [];
  try {
    const membersRef = collection(db, `agencies/${agencyId}/members`);
    const snapshot = await getDocs(membersRef);
    const members: AgencyMember[] = [];
    
    // We might want to fetch user details for each member
    const memberPromises = snapshot.docs.map(async (memberDoc) => {
      const memberData = memberDoc.data() as AgencyMember;
      const userDoc = await getDoc(doc(db, "users", memberData.uid));
      return {
        ...memberData,
        userDetails: userDoc.exists() ? userDoc.data() : null
      };
    });

    return await Promise.all(memberPromises);
  } catch (error) {
    console.error("Error fetching agency members:", error);
    return [];
  }
};

/**
 * Fetches an agency by admin UID
 */
export const getAgencyByAdmin = async (adminUid: string) => {
  if (!db) return null;
  try {
    const q = query(collection(db, "agencies"), where("adminUid", "==", adminUid), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Agency;
  } catch (error) {
    console.error("Error fetching agency by admin:", error);
    return null;
  }
};
