import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import AddProperty from "./pages/AddProperty";
import AddressValidation from "./pages/AddressValidation";
import DueDiligence from "./pages/DueDiligence";
import PermitHistory from "./pages/PermitHistory";
import EnvironmentalRecords from "./pages/EnvironmentalRecords";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/properties"
                    element={
                        <ProtectedRoute>
                            <Properties />
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
                    path="/address"
                    element={
                        <ProtectedRoute>
                            <AddressValidation />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/due-diligence"
                    element={
                        <ProtectedRoute>
                            <DueDiligence />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/permits"
                    element={
                        <ProtectedRoute>
                            <PermitHistory />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/environmental"
                    element={
                        <ProtectedRoute>
                            <EnvironmentalRecords />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;