import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth to check auth status

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Get authentication status from context

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes/components
  return <Outlet />;
};

export default ProtectedRoute;