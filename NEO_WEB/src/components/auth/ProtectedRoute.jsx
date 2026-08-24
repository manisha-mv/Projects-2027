// components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A wrapper for routes that require authentication.
 * Optional `allowedRoles` array restricts access to specific roles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // 1. Not authenticated -> redirect to login
  if (!isAuthenticated) {
    // Save the attempted location so we can redirect back after login (optional enhancement later)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated, but role is restricted
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Authorized -> render child routes (Outlet or specific component)
  return children;
};

export default ProtectedRoute;
