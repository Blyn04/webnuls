import { Navigate } from "react-router-dom";
import { auth } from "../backend/firebase/FirebaseConfig";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("userEmail");

  if (!isAuthenticated || !auth.currentUser) { // Check both localStorage & Firebase
    console.log("Auth Check Failed - Redirecting to Login");
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
