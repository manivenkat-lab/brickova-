import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdI-PdsiYOLkFrbgK8gM3K3s12rvONCj4",
  authDomain: "m-homes1.firebaseapp.com",
  projectId: "m-homes1",
  storageBucket: "m-homes1.firebasestorage.app",
  messagingSenderId: "759137259473",
  appId: "1:759137259473:web:1275fb062bad4d77b21af0",
  measurementId: "G-D9FW9833H6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);






