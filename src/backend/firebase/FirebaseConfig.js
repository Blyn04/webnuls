// src/backend/firebase/FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALjlpbo1i5vgCmXLxkIEe-ydsw-Rx6mSI",
  authDomain: "nuls-8c12b.firebaseapp.com",
  projectId: "nuls-8c12b",
  storageBucket: "nuls-8c12b.appspot.com", // Corrected storage URL
  messagingSenderId: "107113670988",
  appId: "1:107113670988:web:b12a5dbda7937af3e487e9",
  measurementId: "G-9048NY7E4D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
