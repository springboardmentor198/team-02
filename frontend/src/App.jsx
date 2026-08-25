import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/login";
import Register from "./pages/register/Register";

import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import PropertySearch from "./pages/PropertySearch";
import PropertyVerification from "./pages/PropertyVerification";
import AddressValidation from "./pages/AddressValidation";
import Profile from "./pages/Profile";
import TaxHistory from "./pages/TaxHistory";
import FloodZone from "./pages/FloodZone";

// Forgot Password Pages
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import AnalyticsWorkspace from "./pages/AnalyticsWorkspace";
import DueDiligenceReport from "./pages/DueDiligenceReport";
import Notifications from "./pages/Notifications";
import AuditHistory from "./pages/AuditHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-property"
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/property-search"
          element={
            <ProtectedRoute>
              <PropertySearch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/property-verification"
          element={
            <ProtectedRoute>
              <PropertyVerification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/address-validation"
          element={
            <ProtectedRoute>
              <AddressValidation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tax-history"
          element={
            <ProtectedRoute>
              <TaxHistory />
            </ProtectedRoute>
          }
        />

        {/* Flood Zone Verification */}
        <Route
          path="/properties/:id/flood-zone"
          element={
            <ProtectedRoute>
              <FloodZone />
            </ProtectedRoute>
          }
        />
        {/* Risk Assessment + Comparable Analysis + Valuation Comparison now
            live together as tabs in one Analytics workspace. Old paths
            redirect so any existing links/bookmarks still land somewhere
            sensible instead of 404-ing. */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsWorkspace />
            </ProtectedRoute>
          }
        />
        <Route path="/risk-assessment" element={<Navigate to="/analytics?tab=risk" replace />} />
        <Route
          path="/comparable-analysis"
          element={<Navigate to="/analytics?tab=comparables" replace />}
        />
        <Route
          path="/valuation-comparison"
          element={<Navigate to="/analytics?tab=valuation" replace />}
        />

        {/* Due Diligence Report (Task 4 + 5) */}
        <Route
          path="/reports/:propertyId"
          element={
            <ProtectedRoute>
              <DueDiligenceReport />
            </ProtectedRoute>
          }
        />

        {/* Notifications (Task 6) */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Audit & History (Task 7) — admin-only. The backend is the real
            boundary (SecurityConfig: /api/audit-logs/** -> hasRole("ADMIN")),
            this just stops a non-admin from seeing the page shell before its
            API calls 403. */}
        <Route
          path="/audit-history"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AuditHistory />
            </ProtectedRoute>
          }
        />

        {/* Admin (ADMIN role only -- see ProtectedRoute allowedRoles) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;