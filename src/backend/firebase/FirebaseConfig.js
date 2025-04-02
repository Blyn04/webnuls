import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // Import Firebase Storage

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALjlpbo1i5vgCmXLxkIEe-ydsw-Rx6mSI",
  authDomain: "nuls-8c12b.firebaseapp.com",
  projectId: "nuls-8c12b",
  storageBucket: "nuls-8c12b.appspot.com", // Ensure the storage bucket is correct
  messagingSenderId: "107113670988",
  appId: "1:107113670988:web:b12a5dbda7937af3e487e9",
  measurementId: "G-9048NY7E4D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  // Initialize Firebase Storage

export { auth, db, storage };  // Export storage for use in other components
export default app;
