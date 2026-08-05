// components/comparable/PropertySummaryCard.jsx
//
// Same Row/card pattern as risk/PropertySummaryCard.jsx, sized down to the
// three fields the Comparable API actually returns for the subject
// property (title, price, area).
import { Building2, DollarSign, Ruler } from "lucide-react";
import { formatArea, formatCurrency } from "../../utils/format";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#F2EEE4] last:border-0">
      <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[1px] text-gray-400 font-medium shrink-0">
        <Icon size={12} className="text-[#9AA2B5]" strokeWidth={2} />
        {label}
      </span>
      <span className="text-sm text-[#1B2338] font-semibold text-right break-words">
        {value === undefined || value === null || value === "" ? "N/A" : String(value)}
      </span>
    </div>
  );
}

function PropertySummaryCard({ data }) {
  if (!data) return null;

  return (
    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7">
      <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400 font-medium mb-1">
        Subject Property
      </p>
      <p className="font-serif text-[19px] text-[#1B2338] mt-1">
        {data.propertyTitle || `Property #${data.propertyId}`}
      </p>

      <div className="mt-5">
        <Row icon={DollarSign} label="Price" value={formatCurrency(data.propertyPrice)} />
        <Row icon={Ruler} label="Area" value={formatArea(data.propertyArea)} />
        <Row icon={Building2} label="Comparables Found" value={data.totalComparables ?? 0} />
      </div>
    </div>
  );
}

export default PropertySummaryCard;
