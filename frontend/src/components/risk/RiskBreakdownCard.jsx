// components/risk/RiskBreakdownCard.jsx
//
// Visually a cousin of Dashboard.jsx's "Verification Snapshot" tiles
// (border-[#E3DDCE] rounded-2xl bg-[#FAF8F3]) with a premium hover
// treatment layered on: lift + border color shift + subtle glow, since
// this page is explicitly meant to read as a polished dashboard.
function RiskBreakdownCard({ icon: Icon, title, level, note }) {
  return (
    <div
      className="group relative bg-[#FAF8F3] border border-[#E3DDCE] rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#1B2338]/30 hover:shadow-[0_10px_30px_-12px_rgba(27,35,56,0.25)]"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${level.color}1A` }}
        >
          <Icon size={16} style={{ color: level.color }} />
        </div>
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.5px]"
          style={{ backgroundColor: `${level.color}1A`, color: level.color }}
        >
          {level.label}
        </span>
      </div>
      <h4 className="text-sm font-semibold text-[#1B2338] mt-4">{title}</h4>
      <p className="text-[12.5px] text-gray-500 mt-1 leading-5">{note}</p>
    </div>
  );
}

export default RiskBreakdownCard;
