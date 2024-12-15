import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const staffToken = localStorage.getItem('staffToken');
  const staffRole = localStorage.getItem('staffRole');

  console.log('PrivateRoute Debug:', {
    staffToken,
    staffRole,
    requiredRole
  });

  if (!staffToken) {
    // Not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (requiredRole && staffRole !== requiredRole) {
    console.warn(`Access denied. Required role: ${requiredRole}, Current role: ${staffRole}`);
    
    // Redirect based on current role
    if (staffRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (staffRole === 'receptionist') {
      return <Navigate to="/counter" replace />;
    }
    
    // If no matching role, redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;