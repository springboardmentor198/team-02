// components/risk/RiskScoreGauge.jsx
//
// Same construction as Dashboard.jsx's ScoreRing (SVG circle, stroke-dasharray
// animated on mount) but sized up for a hero placement and colored by risk
// level instead of a flat verification-score threshold.
import { useEffect, useState } from "react";

function RiskScoreGauge({ value = 0, color = "#3E63C2", size = 176, stroke = 12, label = "RISK SCORE" }) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(Number(value) || 0, 0), 100);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[40px] font-bold text-white leading-none tabular-nums">
          {Math.round(animated)}
        </span>
        <span className="text-[10px] text-white/50 mt-1.5 tracking-[1.5px]">/ 100</span>
      </div>
      {label && (
        <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/50 uppercase tracking-[2px] font-medium">
          {label}
        </p>
      )}
    </div>
  );
}

export default RiskScoreGauge;
