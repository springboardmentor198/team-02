// services/api.js
import axios from "axios";

// Backend runs on :8080 by default (Spring Boot) and only allows CORS from
// localhost:5173 / 5174 (Vite defaults) per SecurityConfig.java — update
// VITE_API_BASE_URL if you deploy elsewhere.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// Attach the JWT from login to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is missing/expired, the backend returns 401 — clear the
// session and bounce to login instead of leaving the app in a broken state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Interceptor Status:", error.response?.status);
    return Promise.reject(error);
  }
);

/* ===========================
   Flood Zone API
   =========================== */

export const getFloodZone = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/flood-zone`);
  return response.data;
};

export default api;