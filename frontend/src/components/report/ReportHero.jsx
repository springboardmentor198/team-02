// components/report/ReportHero.jsx
//
// Same gradient/texture/glow recipe as components/risk/RiskHero.jsx so the
// report page reads as a sibling of Risk Assessment rather than a new
// visual language. No input row here — propertyId comes from the route —
// so the glass block underneath the title carries the export actions
// instead, and the gauge/badge pair sits on the right exactly as it does
// on the risk hero.
import { ArrowLeft } from "lucide-react";
import RiskScoreGauge from "../risk/RiskScoreGauge";
import RiskLevelBadge from "../risk/RiskLevelBadge";
import { getRiskConfig } from "../risk/riskConfig";
import ExportMenu from "./ExportMenu";

function ReportHero({ report, property, propertyId, onBack }) {
  const cfg = report ? getRiskConfig(report.riskLevel) : null;
  const title = report?.propertyTitle || property?.title || `Property #${propertyId}`;
  const address = [report?.address, report?.city, report?.state].filter(Boolean).join(", ");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B2338] via-[#202B47] to-[#2E3A5C] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 15%, #C89546 0%, transparent 45%), radial-gradient(circle at 92% 80%, #4D7B73 0%, transparent 45%)",
        }}
      />
      {cfg && (
        <div
          className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-700"
          style={{ backgroundColor: cfg.glow, opacity: 0.35 }}
        />
      )}

      <div className="relative px-8 sm:px-10 py-9">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition shrink-0"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <p className="text-[11px] uppercase tracking-[2px] text-white/50 font-medium">
            Diligence Ledger &nbsp;/&nbsp; Due Diligence Report
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-5">
          <div className="max-w-xl">
            <h1 className="font-serif text-[34px] sm:text-[40px] leading-tight text-white break-words">
              {title}
            </h1>
            {address && <p className="text-sm text-white/60 mt-2 leading-6">{address}</p>}
            {report && (
              <p className="text-[11px] text-white/40 mt-1 tracking-[0.5px] uppercase">
                Freshly generated assessment
              </p>
            )}

            <div className="mt-7">
              <ExportMenu propertyId={propertyId} propertyTitle={title} />
            </div>
          </div>

          {report && cfg && (
            <div className="flex flex-col items-center gap-4 pb-3 sm:pb-0">
              <RiskScoreGauge value={report.totalRiskScore} color={cfg.color} />
              <RiskLevelBadge level={report.riskLevel} tone="dark" size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportHero;
