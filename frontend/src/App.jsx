import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login";
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
import RiskAssessment from "./pages/RiskAssessment";
import ComparableAnalysis from "./pages/ComparableAnalysis";
import ValuationComparison from "./pages/ValuationComparison";

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
        <Route
        path="/risk-assessment"
        element={
            <ProtectedRoute>
                <RiskAssessment />
            </ProtectedRoute>
           }
         />

        <Route
          path="/comparable-analysis"
          element={
            <ProtectedRoute>
              <ComparableAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/valuation-comparison"
          element={
            <ProtectedRoute>
              <ValuationComparison />
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