import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function RequireRole({ allow = [] }) {
  const { isAuthenticated, role } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allow.length > 0 && !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

