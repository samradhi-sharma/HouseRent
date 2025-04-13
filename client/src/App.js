import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import RenterDashboard from './components/renter/RenterDashboard';
import PropertyDetail from './components/properties/PropertyDetail';
import Dashboard from './components/Dashboard'; // Fallback dashboard
import AdminDashboard from './components/admin/AdminDashboard'; // Admin dashboard
import OwnerDashboard from './components/owner/OwnerDashboard'; // Owner dashboard
import PropertyForm from './components/owner/PropertyForm'; // Property form for add/edit
import Troubleshoot from './components/Troubleshoot'; // Add troubleshooting component
import RoleProtectedRoute from './components/common/RoleProtectedRoute';
import { redirectToDashboard } from './utils/authRedirect';

// Dashboard component to redirect based on role
const DashboardRouter = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  console.log("DashboardRouter - User:", user);
  console.log("DashboardRouter - isAuthenticated:", isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated in DashboardRouter");
      navigate('/login');
      return;
    }
    
    if (!user) {
      console.log("No user data in DashboardRouter");
      return;
    }
    
    // Use the redirect utility to handle role-based redirection
    redirectToDashboard(user, navigate);
  }, [user, isAuthenticated, navigate]);
  
  // Show loading while redirecting
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/troubleshoot" element={<Troubleshoot />} />
            
            {/* Dashboard router */}
            <Route path="/dashboard" element={
              <RoleProtectedRoute>
                <DashboardRouter />
              </RoleProtectedRoute>
            } />
            
            {/* Renter routes */}
            <Route path="/renter-dashboard" element={
              <RoleProtectedRoute requiredRoles="renter" redirectTo="/dashboard">
                <RenterDashboard />
              </RoleProtectedRoute>
            } />
            
            {/* Owner routes */}
            <Route path="/owner-dashboard" element={
              <RoleProtectedRoute requiredRoles="owner" redirectTo="/dashboard">
                <OwnerDashboard />
              </RoleProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin-panel" element={
              <RoleProtectedRoute requiredRoles="admin" redirectTo="/dashboard">
                <AdminDashboard />
              </RoleProtectedRoute>
            } />
            
            {/* Property management routes */}
            <Route path="/properties/add" element={
              <RoleProtectedRoute requiredRoles={['owner', 'admin']} redirectTo="/dashboard">
                <PropertyForm />
              </RoleProtectedRoute>
            } />
            <Route path="/properties/edit/:id" element={
              <RoleProtectedRoute requiredRoles={['owner', 'admin']} redirectTo="/dashboard">
                <PropertyForm />
              </RoleProtectedRoute>
            } />
            
            {/* Property detail route - must come after more specific routes */}
            <Route path="/properties/:id" element={<PropertyDetail />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 