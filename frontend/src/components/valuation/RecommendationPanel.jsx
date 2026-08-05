// components/valuation/RecommendationPanel.jsx
//
// Same shell as risk/RecommendationPanel.jsx (gradient accent edge, icon
// chip, headline), with the in-palette navy → status-color gradient edge
// and an auto-generated bullet list from valuationConfig.js instead of a
// single backend-supplied sentence.
import { Sparkles } from "lucide-react";
import { getValuationConfig } from "./valuationConfig";

function RecommendationPanel({ status }) {
  const cfg = getValuationConfig(status);

  return (
    <div className="relative bg-white border border-[#E3DDCE] rounded-2xl p-7 overflow-hidden">
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
          <h3 className="text-[15px] font-semibold text-[#1B2338]">Recommendation</h3>
          <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400">
            Generated from the current valuation
          </p>
        </div>
      </div>
      <p className="font-serif text-[19px] leading-8 text-[#1B2338]">{cfg.headline}</p>
      <ul className="mt-4 space-y-2">
        {cfg.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-gray-500 leading-6">
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: cfg.color }}
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationPanel;
