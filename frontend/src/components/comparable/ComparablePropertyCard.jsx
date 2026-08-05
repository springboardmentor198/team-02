// components/comparable/ComparablePropertyCard.jsx
//
// Visual cousin of risk/RiskBreakdownCard.jsx: bg-[#FAF8F3], rounded-2xl,
// border-[#E3DDCE], with the same lift + border + glow hover treatment.
import { Building2, DollarSign, MapPin, Ruler, Tag } from "lucide-react";
import { formatArea, formatCurrency } from "../../utils/format";

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[1px] text-gray-400 font-medium shrink-0">
        <Icon size={11} className="text-[#9AA2B5]" strokeWidth={2} />
        {label}
      </span>
      <span className="text-[13px] text-[#1B2338] font-semibold text-right break-words">
        {value}
      </span>
    </div>
  );
}

function ComparablePropertyCard({ property }) {
  return (
    <div className="group relative bg-[#FAF8F3] border border-[#E3DDCE] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#1B2338]/30 hover:shadow-[0_10px_30px_-12px_rgba(27,35,56,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0"
          style={{ backgroundColor: "#3E63C21A" }}
        >
          <Building2 size={16} style={{ color: "#3E63C2" }} />
        </div>
        {property.propertyType && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.5px] bg-[#3E63C21A] text-[#3E63C2] whitespace-nowrap">
            {property.propertyType}
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-[#1B2338] mt-4">
        {property.title || `Property #${property.id}`}
      </h4>
      {property.city && (
        <p className="flex items-center gap-1.5 text-[12.5px] text-gray-500 mt-1">
          <MapPin size={11} />
          {property.city}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-[#E3DDCE] space-y-0.5">
        <Field icon={DollarSign} label="Price" value={formatCurrency(property.price)} />
        <Field icon={Ruler} label="Area" value={formatArea(property.area)} />
        <Field icon={Tag} label="Price / Sq Ft" value={formatCurrency(property.pricePerSqFt)} />
      </div>
    </div>
  );
}

export default ComparablePropertyCard;
