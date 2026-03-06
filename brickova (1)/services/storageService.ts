import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { storage } from "../firebase";

export const uploadImage = async (file: File, path: string): Promise<string> => {
  if (!storage) throw new Error("Storage not initialized");
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const uploadMultipleImages = async (files: File[], path: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};
