// components/risk/RiskLevelBadge.jsx
//
// Same pill shape/weight as StatusBadge.jsx and the BoolPill/StatusPill
// family in Dashboard.jsx: rounded-full, small caps text, color at /10
// opacity background. `tone="dark"` variant is for use on the navy hero
// panel (solid color chip instead of tinted-on-white).
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { getRiskConfig, normalizeRiskLevel } from "./riskConfig";

function iconFor(level) {
  if (level === "LOW" || level === "VERY LOW") return ShieldCheck;
  if (level === "MEDIUM") return AlertTriangle;
  return ShieldAlert;
}

function RiskLevelBadge({ level, tone = "light", size = "md" }) {
  const key = normalizeRiskLevel(level);
  const cfg = getRiskConfig(level);
  const Icon = iconFor(key);

  const sizeCls = size === "lg" ? "text-[13px] px-4 py-1.5 gap-2" : "text-[11px] px-3 py-1 gap-1.5";

  if (tone === "dark") {
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold ${sizeCls}`}
        style={{ backgroundColor: cfg.color, color: "#fff" }}
      >
        <Icon size={size === "lg" ? 14 : 12} />
        {cfg.label.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeCls}`}
      style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
    >
      <Icon size={size === "lg" ? 14 : 12} />
      {cfg.label.toUpperCase()}
    </span>
  );
}

export default RiskLevelBadge;
