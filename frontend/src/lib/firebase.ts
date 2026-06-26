import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3QHiDtRZsbO-tsfcyWTAn8IHVWMQWddI",
  authDomain: "rfcs-etad.firebaseapp.com",
  projectId: "rfcs-etad",
  storageBucket: "rfcs-etad.firebasestorage.app",
  messagingSenderId: "812312811959",
  appId: "1:812312811959:web:ded5e07bdb00bb6a93b032",
  measurementId: "G-4LQ2YL6H8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
