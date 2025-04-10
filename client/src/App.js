import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import RenterDashboard from './components/renter/RenterDashboard';
import PropertyDetail from './components/properties/PropertyDetail';
import Dashboard from './components/Dashboard'; // Fallback dashboard
import Troubleshoot from './components/Troubleshoot'; // Add troubleshooting component

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  console.log('ProtectedRoute:', { isAuthenticated, loading, userRole: user?.role, allowedRoles });
  
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
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // Check if role is allowed (if roles are specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log(`User role ${user?.role} not in allowed roles:`, allowedRoles);
    return <Navigate to="/dashboard" />;
  }
  
  console.log('ProtectedRoute - access granted');
  return children;
};

// Dashboard component to redirect based on role
const DashboardRouter = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log("DashboardRouter - User:", user);
  console.log("DashboardRouter - isAuthenticated:", isAuthenticated);
  
  if (!isAuthenticated) {
    console.log("User not authenticated in DashboardRouter");
    return <Navigate to="/login" />;
  }
  
  if (!user) {
    console.log("No user data in DashboardRouter");
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }
  
  if (user.role === 'renter') {
    console.log("Directing to RenterDashboard");
    return <RenterDashboard />;
  } else if (user.role === 'owner') {
    console.log("Directing to Owner Dashboard");
    // Navigate to owner dashboard when implemented
    return <Dashboard />;
  } else if (user.role === 'admin') {
    console.log("Directing to Admin Dashboard");
    // Navigate to admin dashboard when implemented
    return <Dashboard />;
  }
  
  console.log("No role match, defaulting to generic Dashboard");
  // Default fallback
  return <Dashboard />;
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
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
            
            {/* Renter routes */}
            <Route path="/renter/dashboard" element={
              <ProtectedRoute allowedRoles={['renter']}>
                <RenterDashboard />
              </ProtectedRoute>
            } />
            
            {/* Property routes */}
            <Route path="/properties/:propertyId" element={
              <ProtectedRoute>
                <PropertyDetail />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 