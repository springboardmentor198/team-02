// components/valuation/DifferenceCard.jsx
//
// Same white/border-[#E3DDCE]/rounded-lg StatCard shell risk/StatCard.jsx
// uses, split into two stacked figures since this card needs to show both
// the absolute and percentage difference together.
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatPercent } from "../../utils/format";

function DifferenceCard({ priceDifference, percentageDifference, color }) {
  const n = Number(priceDifference) || 0;
  const Icon = n < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="group bg-white border border-[#E3DDCE] rounded-lg p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(27,35,56,0.15)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[2px] text-gray-500">Price Difference</p>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <h2 className="text-[28px] mt-5 text-[#1B2338] tabular-nums">
        {formatCurrency(Math.abs(n))}
      </h2>
      <p className="text-sm font-semibold mt-1 tabular-nums" style={{ color }}>
        {formatPercent(percentageDifference)}
      </p>
    </div>
  );
}

export default DifferenceCard;
