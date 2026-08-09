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

/* ===========================
   Risk Assessment API
   =========================== */

// Backend: RiskController → POST /api/risk/{propertyId}
// Response: { propertyId, totalScore, riskLevel, recommendation }
export const generateRiskAssessment = async (propertyId) => {
  const response = await api.post(`/risk/${propertyId}`);
  return response.data;
};

// Reuses the same property detail endpoint the Dashboard already calls, so
// the Risk Assessment page can show a Property Summary card + derive its
// Risk Breakdown from real landRegistry/legalRecord/zoning/environmental
// data instead of inventing numbers the backend doesn't return.
export const getPropertySummary = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}`);
  return response.data;
};

// Reuses the same "/properties" listing Dashboard.jsx & PropertySearch.jsx
// already call, so the Comparable / Valuation pickers show real tracked
// properties instead of asking the user to type an ID.
export const getAllProperties = async () => {
  const response = await api.get("/properties");
  return response.data;
};

/* ===========================
   Comparable Property Analysis API
   =========================== */

// Backend: ComparableController → GET /api/comparable/{propertyId}
export const getComparableAnalysis = async (propertyId) => {
  const response = await api.get(`/comparable/${propertyId}`);
  return response.data;
};

/* ===========================
   Property Valuation Comparison API
   =========================== */

// Backend: ValuationController → GET /api/valuation/{propertyId}
export const getValuationComparison = async (propertyId) => {
  const response = await api.get(`/valuation/${propertyId}`);
  return response.data;
};

/* ===========================
   Due Diligence Report API (Task 4)
   =========================== */

// Backend: DueDiligenceReportController → GET /api/reports/{propertyId}
// NOTE: this endpoint generates the report fresh on every call — there is
// no separate "create" step, so a report page is just this call keyed by
// propertyId.
export const getReport = async (propertyId) => {
  const response = await api.get(`/reports/${propertyId}`);
  return response.data;
};

// Backend: DueDiligenceReportController → GET /api/reports/{propertyId}/history
// Returns raw DueDiligenceReport rows (id, propertyId, propertyTitle,
// ownerName, totalRiskScore, riskLevel, recommendation, generatedAt).
export const getReportHistory = async (propertyId) => {
  const response = await api.get(`/reports/${propertyId}/history`);
  return response.data;
};

/* ===========================
   Report Export API (Task 5)
   =========================== */

// Backend: ExportController → GET /api/export/pdf/{propertyId} (raw bytes)
export const exportReportPdf = async (propertyId) => {
  const response = await api.get(`/export/pdf/${propertyId}`, {
    responseType: "blob",
  });
  return response.data;
};

// Backend: ExportController → GET /api/export/excel/{propertyId} (raw bytes)
export const exportReportExcel = async (propertyId) => {
  const response = await api.get(`/export/excel/${propertyId}`, {
    responseType: "blob",
  });
  return response.data;
};

// Shared helper: turns a blob response into a real browser download without
// leaking the created object URL.
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/* ===========================
   Current User (Task 6 dependency)
   =========================== */

// Backend: UserController → GET /api/users/profile → { id, fullName, email, role }
// The JWT itself only encodes email (JwtService/AuthResponse have no user
// id), so notifications — which are scoped by numeric userId — need this
// looked up once and cached, rather than a backend change.
export const getCurrentUserId = async () => {
  const cached = localStorage.getItem("userId");
  if (cached) return cached;
  const response = await api.get("/users/profile");
  const id = response.data?.id;
  if (id !== undefined && id !== null) {
    localStorage.setItem("userId", String(id));
  }
  return id;
};

/* ===========================
   Notification System API (Task 6)
   =========================== */

// Backend: NotificationController → GET /api/notifications?userId=
export const getNotifications = async (userId) => {
  const response = await api.get("/notifications", { params: { userId } });
  return response.data;
};

// Backend: NotificationController → GET /api/notifications/unread?userId=
export const getUnreadNotifications = async (userId) => {
  const response = await api.get("/notifications/unread", { params: { userId } });
  return response.data;
};

// Backend: NotificationController → GET /api/notifications/unread/count?userId=
// Response: { unreadCount: number }
export const getUnreadCount = async (userId) => {
  const response = await api.get("/notifications/unread/count", { params: { userId } });
  return response.data.unreadCount;
};

// Backend: NotificationController → PUT /api/notifications/{id}/read
export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

// Backend: NotificationController → PUT /api/notifications/read-all?userId=
export const markAllNotificationsRead = async (userId) => {
  await api.put("/notifications/read-all", null, { params: { userId } });
};

/* ===========================
   Audit Logging & Report History API (Task 7)
   =========================== */

// Backend: AuditLogController → GET /api/audit-logs (alias: /search)
// params: { user, property, reportNumber, action, role, status, dateFrom,
// dateTo, page, size } — axios drops any key whose value is undefined, so
// callers can pass a filters object as-is without pruning empty fields.
// Response: PageResponse<AuditLog> → { content, page, size, totalElements, totalPages }
export const getAuditLogs = async (params) => {
  const response = await api.get("/audit-logs", { params });
  return response.data;
};

// Backend: AuditLogController → GET /api/audit-logs/stats
// Response: { totalActivities, successfulActions, failedAttempts, todayActivity }
export const getAuditLogStats = async () => {
  const response = await api.get("/audit-logs/stats");
  return response.data;
};

// Backend: AuditLogController → GET /api/audit-logs/{id}
export const getAuditLogById = async (id) => {
  const response = await api.get(`/audit-logs/${id}`);
  return response.data;
};

// Backend: ReportHistoryController → GET /api/report-history (alias: /search)
// params: { reportNumber, property, requestedBy, reportType, status,
// dateFrom, dateTo, page, size }
// Response: PageResponse<DueDiligenceReport>
// NOTE: named distinctly from getReportHistory() above (Task 4's
// per-property /api/reports/{id}/history) — this is the global,
// cross-property Task 7 listing behind /api/report-history.
export const searchReportHistory = async (params) => {
  const response = await api.get("/report-history", { params });
  return response.data;
};

// Backend: ReportHistoryController → GET /api/report-history/stats
// Response: { totalReports, completedReports, todayReports }
export const getReportHistoryStats = async () => {
  const response = await api.get("/report-history/stats");
  return response.data;
};

// Backend: ReportHistoryController → GET /api/report-history/{id}
export const getReportHistoryById = async (id) => {
  const response = await api.get(`/report-history/${id}`);
  return response.data;
};

// Backend: ReportHistoryController → GET /api/report-history/{id}/pdf (raw bytes)
export const downloadReportHistoryPdf = async (id) => {
  const response = await api.get(`/report-history/${id}/pdf`, { responseType: "blob" });
  return response.data;
};

// Backend: ReportHistoryController → GET /api/report-history/{id}/excel (raw bytes)
export const downloadReportHistoryExcel = async (id) => {
  const response = await api.get(`/report-history/${id}/excel`, { responseType: "blob" });
  return response.data;
};

export default api;