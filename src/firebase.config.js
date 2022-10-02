// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCw21QGGo_ufNnclia91FMIWuv_A7VUOY",
  authDomain: "house-marketplace-app-fc3ff.firebaseapp.com",
  projectId: "house-marketplace-app-fc3ff",
  storageBucket: "house-marketplace-app-fc3ff.appspot.com",
  messagingSenderId: "1010070140270",
  appId: "1:1010070140270:web:86e5322068f9435610bd7f"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore() 