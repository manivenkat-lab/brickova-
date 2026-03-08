import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { Property, SearchFilters } from "../types";

const COLLECTION_NAME = "properties";

export const subscribeToProperties = (
  filters: { ownerId?: string; agencyId?: string },
  callback: (properties: Property[]) => void
) => {
  try {
    let q;

    if (filters.ownerId) {
      q = query(
        collection(db, COLLECTION_NAME),
        where("createdBy", "==", filters.ownerId)
      );
    } else if (filters.agencyId) {
      q = query(
        collection(db, COLLECTION_NAME),
        where("agencyId", "==", filters.agencyId)
      );
    } else {
      q = query(collection(db, COLLECTION_NAME));
    }

    return onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Property[];

      properties.sort((a: any, b: any) => {
        const timeA =
          a?.createdAt?.toMillis?.() ?? new Date(a?.createdAt ?? 0).getTime();
        const timeB =
          b?.createdAt?.toMillis?.() ?? new Date(b?.createdAt ?? 0).getTime();
        return timeB - timeA;
      });

      callback(properties);
    });
  } catch (error) {
    console.error("Error subscribing to properties:", error);
    return () => {};
  }
};

export const createProperty = async (
  propertyData: any,
  userId: string,
  agencyId: string | null
): Promise<string> => {
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
};

export const getProperties = async (
  filters?: SearchFilters
): Promise<Property[]> => {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    if (filters) {
      const constraints: any[] = [];

      if (filters.category && filters.category !== "ALL") {
        constraints.push(where("category", "==", filters.category));
      }

      if (filters.type && filters.type !== "ALL") {
        constraints.push(where("type", "==", filters.type));
      }

      if (filters.bhk && filters.bhk !== "ALL") {
        constraints.push(where("bhk", "==", filters.bhk));
      }

      if (typeof filters.minPrice === "number" && filters.minPrice > 0) {
        constraints.push(where("price", ">=", filters.minPrice));
      }

      if (
        typeof filters.maxPrice === "number" &&
        filters.maxPrice < 2000000000
      ) {
        constraints.push(where("price", "<=", filters.maxPrice));
      }

      if (constraints.length > 0) {
        q = query(collection(db, COLLECTION_NAME), ...constraints);
      }
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as Property[];
  } catch (error) {
    console.error("Error getting properties:", error);
    return [];
  }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const ref = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data()
    } as Property;
  } catch (error) {
    console.error("Error getting property by id:", error);
    return null;
  }
};

export const getMyProperties = async (userId: string): Promise<Property[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("createdBy", "==", userId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    })) as Property[];
  } catch (error) {
    console.error("Error getting my properties:", error);
    return [];
  }
};

export const updateProperty = async (
  id: string,
  data: Partial<Property>
): Promise<void> => {
  const ref = doc(db, COLLECTION_NAME, id);

  await updateDoc(ref, {
    ...data,
    lastConfirmedAt: new Date().toISOString()
  });
};

export const deleteProperty = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION_NAME, id);
  await deleteDoc(ref);
};
