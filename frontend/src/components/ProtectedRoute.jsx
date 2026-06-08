import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Requires the user to be logged in. Otherwise redirects to /login.
 */
export function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/**
 * Requires the user to be an Admin (Nhà Sản Xuất).
 * Customers or unauthenticated users are redirected.
 */
export function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    // Logged-in customer tries to access admin page → send to their page
    return <Navigate to="/experience" replace />;
  }
  return children;
}

/**
 * Requires the user to be a Customer (Người Trải Nghiệm).
 * Admins are redirected to the formula page.
 */
export function RequireCustomer({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (isAdmin) {
    return <Navigate to="/formula-decl" replace />;
  }
  return children;
}
