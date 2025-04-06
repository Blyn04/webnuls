import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, ...rest }) => {
  const userEmail = localStorage.getItem("userEmail");

  return userEmail ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
