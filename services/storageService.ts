import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/*
-----------------------------------------
UPLOAD IMAGE
-----------------------------------------
*/

export const uploadImage = async (file: any, path: string): Promise<string> => {
  try {
    if (!file) {
      throw new Error("No file selected");
    }

    const fileName = `${Date.now()}-${file.name}`;
    const fullPath = `${path}/${fileName}`;

    const storageRef = ref(storage, fullPath);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get public URL
    const url = await getDownloadURL(storageRef);

    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/*
-----------------------------------------
UPLOAD MULTIPLE IMAGES
-----------------------------------------
*/

export const uploadMultipleImages = async (
  files: any[],
  path: string
): Promise<string[]> => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploads = files.map((file) => uploadImage(file, path));

    const urls = await Promise.all(uploads);

    return urls;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  }
};
