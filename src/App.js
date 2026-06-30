// Step 10.1: Main App Component
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { Unauthorized } from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import LogoutButton from './components/auth/Logout';
import Dashboard from './components/dashboard/Dashboard';

// Step 10.2: Public routes
const PublicRoute = ({ children }) => {
  // If user is logged in, redirect to dashboard
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Step 10.3: App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes - All users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<div>Profile Page</div>} />
      </Route>
      
      {/* Protected Routes - Admin only */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<div>Admin Panel</div>} />
        <Route path="/admin/users" element={<div>User Management</div>} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Step 10.4: App Component
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;