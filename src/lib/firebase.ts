import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDg2r25RhQHIWUbDlKi2Uo4JxNM2DSi9KQ",
  authDomain: "subcription-v2.firebaseapp.com",
  projectId: "subcription-v2",
  storageBucket: "subcription-v2.firebasestorage.app",
  messagingSenderId: "902654067012",
  appId: "1:902654067012:web:94d71ce1adeea07506d711"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);