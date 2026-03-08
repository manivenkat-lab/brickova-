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

const COLLECTION_NAME = "properties";

/* -------------------------------- */
/* Subscribe to properties */
/* -------------------------------- */

export const subscribeToProperties = (callback: any) => {
  const q = query(collection(db, COLLECTION_NAME));

  return onSnapshot(q, (snapshot) => {
    const properties = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    callback(properties);
  });
};

/* -------------------------------- */
/* Create property */
/* -------------------------------- */

export const createProperty = async (propertyData: any) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...propertyData,
    createdAt: serverTimestamp(),
    status: "active"
  });

  return docRef.id;
};

/* -------------------------------- */
/* Get all properties */
/* -------------------------------- */

export const getProperties = async () => {
  const q = query(collection(db, COLLECTION_NAME));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

/* -------------------------------- */
/* Get property by id */
/* -------------------------------- */

export const getPropertyById = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);

  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data()
  };
};

/* -------------------------------- */
/* Update property */
/* -------------------------------- */

export const updateProperty = async (id: string, data: any) => {
  const docRef = doc(db, COLLECTION_NAME, id);

  await updateDoc(docRef, data);
};

/* -------------------------------- */
/* Delete property */
/* -------------------------------- */

export const deleteProperty = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);

  await deleteDoc(docRef);
};
