// components/valuation/StatusCard.jsx
import ValuationStatusBadge from "./ValuationStatusBadge";
import { getValuationConfig } from "./valuationConfig";

function StatusCard({ status }) {
  const cfg = getValuationConfig(status);

  return (
    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-6 h-full flex flex-col justify-center">
      <p className="text-[11px] uppercase tracking-[2px] text-gray-500 mb-5">Valuation Status</p>
      <ValuationStatusBadge status={status} size="lg" />
      <p className="text-[12.5px] text-gray-500 mt-3 leading-5">{cfg.headline}</p>
    </div>
  );
}

export default StatusCard;
