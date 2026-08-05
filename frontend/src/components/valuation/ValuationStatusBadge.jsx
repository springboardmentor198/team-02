// components/valuation/ValuationStatusBadge.jsx
//
// Same pill shape/weight as risk/RiskLevelBadge.jsx & StatusBadge.jsx —
// rounded-full, small caps, color at /10 opacity on white, solid on dark.
import { TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { getValuationConfig, normalizeValuationStatus } from "./valuationConfig";

function iconFor(key) {
  if (key === "UNDERVALUED") return TrendingDown;
  if (key === "OVERVALUED") return TrendingUp;
  return CheckCircle2;
}

function ValuationStatusBadge({ status, tone = "light", size = "md" }) {
  const key = normalizeValuationStatus(status);
  const cfg = getValuationConfig(status);
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

export default ValuationStatusBadge;
