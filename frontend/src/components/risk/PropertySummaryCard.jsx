// components/risk/PropertySummaryCard.jsx
import { Building2, DollarSign, MapPin, Ruler, User } from "lucide-react";
import StatusBadge from "../StatusBadge";

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

function PropertySummaryCard({ property }) {
  if (!property) return null;

  return (
    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-semibold text-[#1B2338]">Property Summary</h3>
        <StatusBadge status={property.verificationStatus} />
      </div>
      <p className="font-serif text-[19px] text-[#1B2338] mt-1">{property.title || "Untitled Property"}</p>
      <p className="flex items-center gap-1.5 text-[13px] text-gray-500 mt-1">
        <MapPin size={12} />
        {[property.address, property.city, property.state].filter(Boolean).join(", ") || "N/A"}
      </p>

      <div className="mt-5">
        <Row icon={User} label="Owner" value={property.ownerName} />
        <Row icon={Building2} label="Property Type" value={property.propertyType} />
        <Row icon={DollarSign} label="Price" value={property.price} />
        <Row icon={Ruler} label="Area" value={property.area} />
      </div>
    </div>
  );
}

export default PropertySummaryCard;
