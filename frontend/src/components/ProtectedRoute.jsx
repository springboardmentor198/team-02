// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

// Wrap any route that needs a logged-in user. The backend itself still
// enforces auth (401 -> api.js redirects to /login), this just avoids
// flashing a protected page before that round-trip happens.
//
// Pass allowedRoles (e.g. ["ADMIN"]) to also gate a route by role -- the
// backend is the real authority here too (SecurityConfig maps /api/admin/**
// etc. to hasRole(...)), this just stops a non-admin user from briefly
// seeing an admin page's shell before its API calls start failing with 403.
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = localStorage.getItem("role");
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
