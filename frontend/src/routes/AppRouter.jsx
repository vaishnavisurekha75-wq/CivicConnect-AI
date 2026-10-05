import React from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

// Common
import Welcome from "../pages/common/Welcome";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import OTP from "../pages/auth/OTP";
import OfficerLogin from "../pages/auth/OfficerLogin";
import AdminLogin from "../pages/auth/AdminLogin";

// Role Selection
import RoleSelection from "../pages/RoleSelection";

// Citizen
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import ReportComplaint from "../pages/citizen/ReportComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import TrackResolution from "../pages/citizen/TrackResolution";
import Notifications from "../pages/citizen/Notifications";

// Officer
import OfficerDashboard from "../pages/officer/OfficerDashboard";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";


// ======================================================
// NORMAL PROTECTED ROUTE
// ======================================================

const ProtectedRoute = ({ children }) => {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};


// ======================================================
// ROLE SELECTION PROTECTION
// ======================================================

const RoleSelectionRoute = () => {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <RoleSelection />;
};


// ======================================================
// OFFICER LOGIN PROTECTION
// ======================================================

const OfficerLoginRoute = () => {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <OfficerLogin />;
};


// ======================================================
// ADMIN LOGIN PROTECTION
// ======================================================

const AdminLoginRoute = () => {
  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <AdminLogin />;
};


// ======================================================
// ROUTER
// ======================================================

const AppRouter = () => {
  const location = useLocation();

  return (
    <Routes>

      {/* ================================================
          PUBLIC
      ================================================= */}

      <Route
        path="/"
        element={<Welcome />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/otp"
        element={<OTP />}
      />


      {/* ================================================
          ROLE SELECTION
      ================================================= */}

      <Route
        path="/role-selection"
        element={<RoleSelectionRoute />}
      />


      {/* ================================================
          OFFICER SECURE LOGIN
      ================================================= */}

      <Route
        path="/officer-login"
        element={<OfficerLoginRoute />}
      />


      {/* ================================================
          ADMIN SECURE LOGIN
      ================================================= */}

      <Route
        path="/admin-login"
        element={<AdminLoginRoute />}
      />


      {/* ================================================
          CITIZEN
      ================================================= */}

      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report-complaint"
        element={
          <ProtectedRoute>
            <ReportComplaint />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-complaints"
        element={
          <ProtectedRoute>
            <MyComplaints />
          </ProtectedRoute>
        }
      />

      <Route
        path="/track-resolution"
        element={
          <ProtectedRoute>
            <TrackResolution />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />


      {/* ================================================
          OFFICER DASHBOARD
      ================================================= */}

      <Route
        path="/officer/dashboard"
        element={
          <ProtectedRoute>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />


      {/* ================================================
          ADMIN DASHBOARD
      ================================================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* ================================================
          FALLBACK
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};

export default AppRouter;