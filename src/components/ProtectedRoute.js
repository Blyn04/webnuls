// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ element, ...rest }) => {
//   const userEmail = localStorage.getItem("userEmail");

//   return userEmail ? element : <Navigate to="/" replace />;
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles = ["user", "admin", "super-admin", "super-user"] }) => {
  const userEmail = localStorage.getItem("userEmail");
  const userRole = (localStorage.getItem("userPosition") || "").trim().toLowerCase();
  console.log("Allowed roles:", allowedRoles);
  console.log("Role Check:", allowedRoles.includes(userRole)); 
  console.log("userRole:", userRole);

  if (!userEmail || !userRole) {
    return <Navigate to="/" replace />;
  }
  
  if (!Array.isArray(allowedRoles)) {
    return <Navigate to="/not-authorized" replace />;
  }
  
  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/main/not-authorized" replace />;
  
};

export default ProtectedRoute;
