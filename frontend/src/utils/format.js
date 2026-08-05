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
