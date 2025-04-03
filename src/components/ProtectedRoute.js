import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../backend/firebase/FirebaseConfig";

const ProtectedRoute = ({ element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && localStorage.getItem("userEmail")) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (isLoading) return <p>Loading...</p>; // Prevent redirecting before checking auth

  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
