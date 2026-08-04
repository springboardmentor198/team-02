// components/risk/StatCard.jsx
//
// Same shape as the summaryCards in Dashboard.jsx (white, border-[#E3DDCE],
// rounded-lg, uppercase label + big number) with an icon chip and a subtle
// hover lift added, since this page is meant to read as a dashboard.
function StatCard({ icon: Icon, label, value, accent = "#3E63C2", suffix }) {
  return (
    <div className="group bg-white border border-[#E3DDCE] rounded-lg p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(27,35,56,0.15)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[2px] text-gray-500">{label}</p>
        {Icon && (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: `${accent}1A` }}
          >
            <Icon size={14} style={{ color: accent }} />
          </div>
        )}
      </div>
      <h2 className="text-[34px] mt-5 text-[#1B2338] tabular-nums">
        {value}
        {suffix && <span className="text-base text-gray-400 font-normal ml-1">{suffix}</span>}
      </h2>
    </div>
  );
}

export default StatCard;
