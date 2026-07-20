import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";

import Dashboard from "./pages/Dashboard";
import PropertySearch from "./pages/PropertySearch";
import AddProperty from "./pages/AddProperty";
import AddressValidation from "./pages/AddressValidation";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
          path="/property-search"
          element={
            <ProtectedRoute>
              <PropertySearch />
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
          path="/address-validation"
          element={
            <ProtectedRoute>
              <AddressValidation />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;