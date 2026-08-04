// components/risk/riskConfig.js
//
// Extends the same muted, editorial risk palette FloodZone.jsx already
// established (LOW/MEDIUM/HIGH) to a 5-level scale, since the Risk
// Assessment API can also return VERY_LOW / VERY_HIGH. Colors are kept in
// the same family so this page reads as part of the same product.

export const RISK_LEVELS = {
  "VERY LOW": {
    label: "Very Low Risk",
    color: "#2F6449",
    bg: "#EDF5EE",
    border: "#CFE3D4",
    glow: "rgba(63,118,87,0.35)",
    score: 10,
  },
  LOW: {
    label: "Low Risk",
    color: "#3F7657",
    bg: "#EDF5EE",
    border: "#CFE3D4",
    glow: "rgba(63,118,87,0.35)",
    score: 30,
  },
  MEDIUM: {
    label: "Moderate Risk",
    color: "#A8752C",
    bg: "#FBF3E4",
    border: "#EEDFC3",
    glow: "rgba(168,117,44,0.35)",
    score: 55,
  },
  HIGH: {
    label: "High Risk",
    color: "#B3402F",
    bg: "#FBEDE9",
    border: "#EFD3CB",
    glow: "rgba(179,64,47,0.35)",
    score: 75,
  },
  "VERY HIGH": {
    label: "Very High Risk",
    color: "#8C2F22",
    bg: "#FBEDE9",
    border: "#EFD3CB",
    glow: "rgba(140,47,34,0.4)",
    score: 92,
  },
};

// Normalizes whatever the backend sends ("VERY HIGH", "very_high",
// "VeryHigh", etc.) to a key in RISK_LEVELS above.
export function normalizeRiskLevel(raw) {
  if (!raw) return "MEDIUM";
  const key = String(raw).toUpperCase().replace(/_/g, " ").trim();
  return RISK_LEVELS[key] ? key : "MEDIUM";
}

export function getRiskConfig(raw) {
  return RISK_LEVELS[normalizeRiskLevel(raw)];
}

// Score → color for gauges that only have a 0-100 number (no explicit
// level string), kept in the same palette bands as RISK_LEVELS.
export function colorForScore(score) {
  const s = Number(score) || 0;
  if (s >= 85) return RISK_LEVELS["VERY HIGH"].color;
  if (s >= 65) return RISK_LEVELS.HIGH.color;
  if (s >= 40) return RISK_LEVELS.MEDIUM.color;
  if (s >= 20) return RISK_LEVELS.LOW.color;
  return RISK_LEVELS["VERY LOW"].color;
}
