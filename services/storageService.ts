import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/*
-----------------------------------
Upload single image
-----------------------------------
*/

export const uploadImage = async (file: any, path: string): Promise<string> => {
  try {
    if (!file) throw new Error("No file provided");

    const fileName = `${Date.now()}-${file.name}`;
    const fullPath = `${path}/${fileName}`;

    const storageRef = ref(storage, fullPath);

    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/*
-----------------------------------
Upload multiple images
-----------------------------------
*/

export const uploadMultipleImages = async (
  files: any[],
  path: string
): Promise<string[]> => {
  try {
    const uploads = files.map((file) => uploadImage(file, path));
    const urls = await Promise.all(uploads);
    return urls;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};
