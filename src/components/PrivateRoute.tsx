import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  portalType: 'business' | 'staff';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, portalType }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const employeeId = localStorage.getItem('employeeId');

  // Wait for auth state to be determined
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    localStorage.removeItem('userRole');
    localStorage.removeItem('employeeId');
    return <Navigate to="/auth/login" state={{ from: location, portalType }} replace />;
  }

  // Super admin check for business portal
  if (portalType === 'business') {
    if (userRole === 'super_admin' || userRole === 'admin') {
      return <>{children}</>;
    }
    return <Navigate to="/auth/unauthorized" replace />;
  }

  // Staff portal check
  if (portalType === 'staff') {
    if (userRole === 'employee' && employeeId) {
      return <>{children}</>;
    }
    return <Navigate to="/auth/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;