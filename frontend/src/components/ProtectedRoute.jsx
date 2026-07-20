// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

// Wrap any route that needs a logged-in user. The backend itself still
// enforces auth (401 → api.js redirects to /login), this just avoids
// flashing a protected page before that round-trip happens.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
