// components/valuation/valuationConfig.js
//
// Same shape/pattern as risk/riskConfig.js: a normalize() + a lookup table,
// kept in-palette with the rest of the app (green/blue/red family already
// used by StatusBadge.jsx & Dashboard.jsx pills) rather than generic
// Tailwind indigo/emerald defaults.

export const VALUATION_STATUSES = {
  UNDERVALUED: {
    label: "Undervalued",
    color: "#2F6449",
    bg: "#EDF5EE",
    border: "#CFE3D4",
    glow: "rgba(63,118,87,0.35)",
    headline: "Excellent investment opportunity",
    points: [
      "Market value exceeds the asking price.",
      "Consider purchasing before the price adjusts upward.",
    ],
  },
  "FAIR VALUE": {
    label: "Fair Value",
    color: "#3E63C2",
    bg: "#ECF0FB",
    border: "#CBD8F2",
    glow: "rgba(62,99,194,0.35)",
    headline: "Property is fairly priced",
    points: [
      "The asking price closely matches the estimated market value.",
      "No strong pricing pressure in either direction.",
    ],
  },
  OVERVALUED: {
    label: "Overvalued",
    color: "#B3402F",
    bg: "#FBEDE9",
    border: "#EFD3CB",
    glow: "rgba(179,64,47,0.35)",
    headline: "Negotiate before buying",
    points: [
      "The asking price exceeds the estimated market value.",
      "Consider negotiating the price down before proceeding.",
    ],
  },
};

// Normalizes whatever the backend sends ("FAIR_VALUE", "Fair Value",
// "fair-value", etc.) to a key in VALUATION_STATUSES above.
export function normalizeValuationStatus(raw) {
  if (!raw) return "FAIR VALUE";
  const key = String(raw).toUpperCase().replace(/[_-]/g, " ").trim();
  return VALUATION_STATUSES[key] ? key : "FAIR VALUE";
}

export function getValuationConfig(raw) {
  return VALUATION_STATUSES[normalizeValuationStatus(raw)];
}
