import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OfficerLogin from "./pages/OfficerLogin";
import ForgotPassword from "./pages/ForgotPassword";
import DebugForgotPassword from "./pages/DebugForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import ComplaintForm from "./pages/ComplaintForm";
import ComplaintDetail from "./pages/ComplaintDetail";
import Success from "./pages/Success";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import RequestOfficerRole from "./pages/RequestOfficerRole";
import ManageOfficerRequests from "./pages/ManageOfficerRequests";
import AuthProvider from "./context/AuthContext";

// Protected Route Component
function ProtectedRoute({ children, requiredRole = null }) {
  const { auth, hasRole } = useContext(AuthContext);
  
  if (!auth.token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

// Role-based Route Component
function RoleBasedRoute({ children }) {
  const { auth, isOfficer, isAdmin } = useContext(AuthContext);
  
  if (!auth.token) {
    return <Navigate to="/login" />;
  }
  
  if (isOfficer() || isAdmin()) {
    return <Navigate to="/officer-dashboard" />;
  }
  
  return children;
}

function AppRoutes() {
  const { auth } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={
        auth.token ? <Navigate to="/dashboard" /> : <Login />
      } />
      <Route path="/register" element={
        auth.token ? <Navigate to="/dashboard" /> : <Register />
      } />
      <Route path="/officer-login" element={
        auth.token ? <Navigate to="/officer-dashboard" /> : <OfficerLogin />
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/debug-forgot-password" element={<DebugForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <RoleBasedRoute>
            <Dashboard />
          </RoleBasedRoute>
        </ProtectedRoute>
      } />

      <Route path="/officer-dashboard" element={
        <ProtectedRoute requiredRole="ROLE_OFFICER">
          <OfficerDashboard />
        </ProtectedRoute>
      } />

      <Route path="/complaint-form" element={
        <ProtectedRoute>
          <ComplaintForm />
        </ProtectedRoute>
      } />

      <Route path="/complaint/:id" element={
        <ProtectedRoute>
          <ComplaintDetail />
        </ProtectedRoute>
      } />

      <Route path="/success/:id" element={
        <ProtectedRoute>
          <Success />
        </ProtectedRoute>
      } />

      {/* Notifications */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />

      {/* Reports */}
      <Route path="/reports" element={
        <ProtectedRoute requiredRole="ROLE_OFFICER">
          <ReportsPage />
        </ProtectedRoute>
      } />

      {/* Officer Request - For Citizens */}
      <Route path="/request-officer-role" element={
        <ProtectedRoute>
          <RequestOfficerRole />
        </ProtectedRoute>
      } />

      {/* Manage Officer Requests - For Super Admin Only */}
      <Route path="/manage-officer-requests" element={
        <ProtectedRoute requiredRole="ROLE_ADMIN">
          <ManageOfficerRequests />
        </ProtectedRoute>
      } />

      {/* Legacy route redirect */}
      <Route path="/complaint" element={<Navigate to="/complaint-form" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
