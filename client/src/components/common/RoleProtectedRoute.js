import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasRequiredRole } from '../../utils/authRedirect';

/**
 * A component that protects routes based on user role
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string|Array<string>} props.requiredRoles - Required role(s) to access this route
 * @param {string} [props.redirectTo='/login'] - Where to redirect if access is denied
 */
const RoleProtectedRoute = ({ children, requiredRoles, redirectTo = '/login' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // If roles are specified, check if user has required role
  if (requiredRoles && !hasRequiredRole(user, requiredRoles)) {
    console.log(`User role ${user?.role} not in required roles:`, requiredRoles);
    return <Navigate to={redirectTo} />;
  }
  
  // User has permission, render the protected content
  return children;
};

export default RoleProtectedRoute; 