import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);

    if (
      allowedRoles &&
      !allowedRoles.includes(user.role)
    ) {
      if (user.role === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
      }

      if (user.role === 'worker') {
        return <Navigate to="/worker-dashboard" replace />;
      }

      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;