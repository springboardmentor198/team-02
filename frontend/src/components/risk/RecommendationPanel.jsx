// components/risk/RecommendationPanel.jsx
import { Sparkles } from "lucide-react";
import { getRiskConfig } from "./riskConfig";

function RecommendationPanel({ recommendation, riskLevel }) {
  const cfg = getRiskConfig(riskLevel);

  return (
    <div className="relative bg-white border border-[#E3DDCE] rounded-2xl p-7 overflow-hidden">
      {/* thin gradient accent edge, the one place this page allows itself a
          gradient — kept in-palette (navy → risk color) rather than a
          generic indigo/violet SaaS gradient */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: `linear-gradient(180deg, #1B2338, ${cfg.color})` }}
      />
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${cfg.color}1A` }}
        >
          <Sparkles size={15} style={{ color: cfg.color }} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#1B2338]">AI Recommendation</h3>
          <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400">
            Generated from current risk signals
          </p>
        </div>
      </div>
      <p className="font-serif text-[19px] leading-8 text-[#1B2338]">
        {recommendation || "No recommendation available."}
      </p>
    </div>
  );
}

export default RecommendationPanel;
