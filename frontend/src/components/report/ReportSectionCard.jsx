// components/report/ReportSectionCard.jsx
//
// One card per report section (Property Details, Ownership, Legal Records,
// Flood Zone, Tax History, Zoning). Built on the exact FactCard grid
// Dashboard.jsx already uses for its property-detail tabs, with the
// RiskBreakdownCard hover lift layered on since this is meant to read as
// a premium continuation of the same product.

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="border border-[#E3DDCE] rounded-xl p-4 bg-[#FAF8F3] transition-colors duration-200 hover:border-[#1B2338]/25">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[1px] text-gray-400 font-medium mb-2">
        {Icon && <Icon size={12} className="text-[#9AA2B5]" strokeWidth={2} />}
        {label}
      </div>
      <p className="text-[15px] text-[#1B2338] font-semibold break-words">
        {value === undefined || value === null || value === "" ? "N/A" : String(value)}
      </p>
    </div>
  );
}

function ReportSectionCard({ icon: Icon, title, badge, fields = [], columns = 3 }) {
  const colClass =
    columns === 1
      ? ""
      : columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="group bg-white border border-[#E3DDCE] rounded-2xl p-7 transition-all duration-200 hover:shadow-[0_10px_30px_-14px_rgba(27,35,56,0.2)]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1B2338]/[0.06]">
            {Icon && <Icon size={15} className="text-[#1B2338]" />}
          </div>
          <h3 className="text-[15px] font-semibold text-[#1B2338]">{title}</h3>
        </div>
        {badge}
      </div>
      <div className={`grid grid-cols-1 ${colClass} gap-4`}>
        {fields.map((f) => (
          <Fact key={f.label} icon={f.icon} label={f.label} value={f.value} />
        ))}
      </div>
    </div>
  );
}

export default ReportSectionCard;
