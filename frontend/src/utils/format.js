// utils/format.js
// Matches the "$" + toLocaleString() convention PropertySearch.jsx already
// uses for prices, so Comparable Analysis / Valuation pages read the same
// numbers the same way as the rest of the app.

export function formatCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  return `$${Number(value).toLocaleString()}`;
}

export function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString();
}

export function formatArea(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  return `${Number(value).toLocaleString()} sqft`;
}

export function formatPercent(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

// Task 7: Audit Logging & Report History — used for AuditLog.actionTime and
// DueDiligenceReport.generatedAt/lastAccessedAt, which the backend sends as
// plain ISO LocalDateTime strings.
export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Task 7: DueDiligenceReport.fileSizeBytes is null until a report is
// actually downloaded once (see ExportController / ReportHistoryController).
export function formatBytes(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}
