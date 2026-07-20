// components/AuthBrandPanel.jsx
function AuthBrandPanel({ eyebrow, headline, blurb }) {
  return (
    <div className="hidden lg:flex lg:w-[44%] h-screen bg-[#1B2338] relative overflow-hidden flex-col justify-between px-12 py-14">
      {/* subtle accent line, echoes the sidebar stripe elsewhere in the app */}
      <div className="absolute left-0 top-0 h-full w-1 bg-[#3E63C2]" />

      {/* faint decorative grid/property-plot pattern */}
      <svg
        className="absolute -right-24 -bottom-24 opacity-[0.07]"
        width="420"
        height="420"
        viewBox="0 0 420 420"
        fill="none"
      >
        <rect x="20" y="20" width="380" height="380" rx="4" stroke="white" strokeWidth="1.5" />
        <rect x="70" y="70" width="280" height="280" rx="4" stroke="white" strokeWidth="1.5" />
        <line x1="20" y1="210" x2="400" y2="210" stroke="white" strokeWidth="1.5" />
        <line x1="210" y1="20" x2="210" y2="400" stroke="white" strokeWidth="1.5" />
      </svg>

      <div className="relative">
        <p className="text-white text-[13px] tracking-[3px] font-medium">DILIGENCE LEDGER</p>
      </div>

      <div className="relative max-w-[380px]">
        <p className="text-[#8FA0C9] text-[11px] uppercase tracking-[2px] mb-4">{eyebrow}</p>
        <h1 className="font-serif text-white text-[38px] leading-[1.2]">{headline}</h1>
        <p className="text-[#B7BFD4] text-sm mt-5 leading-relaxed">{blurb}</p>
      </div>

      <div className="relative flex items-center gap-8 text-[#8FA0C9] text-xs">
        <span>Property verification</span>
        <span className="w-1 h-1 rounded-full bg-[#3E63C2]" />
        <span>Address validation</span>
        <span className="w-1 h-1 rounded-full bg-[#3E63C2]" />
        <span>Risk tracking</span>
      </div>
    </div>
  );
}

export default AuthBrandPanel;
