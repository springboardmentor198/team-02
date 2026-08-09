// components/report/ReportHero.jsx

import { ArrowLeft } from "lucide-react";
import RiskScoreGauge from "../risk/RiskScoreGauge";
import RiskLevelBadge from "../risk/RiskLevelBadge";
import { getRiskConfig } from "../risk/riskConfig";
import ExportMenu from "./ExportMenu";

function ReportHero({
  report,
  propertyId,
  onBack,
}) {
  const cfg = report ? getRiskConfig(report.riskLevel) : null;

  const title = report?.propertyTitle || "Due Diligence Report";

  const address = [
    report?.address,
    report?.city,
    report?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#252C45] via-[#273250] to-[#304763] border border-[#394663] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

      {/* Background Glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 15%, #C89546 0%, transparent 45%), radial-gradient(circle at 92% 80%, #4D7B73 0%, transparent 45%)",
        }}
      />

      {cfg && (
        <div
          className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-700"
          style={{
            backgroundColor: cfg.glow,
            opacity: 0.35,
          }}
        />
      )}

      <div className="relative px-8 sm:px-10 py-9">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition"
          >
            <ArrowLeft size={16} />
          </button>

          <p className="text-[11px] uppercase tracking-[2px] text-white/50 font-medium">
            Diligence Ledger &nbsp;/&nbsp; Due Diligence Report
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mt-5">

          {/* LEFT */}
          <div className="max-w-xl w-full">

            <h1 className="font-serif text-[36px] sm:text-[42px] leading-tight text-white">
              {title}
            </h1>

            {address && (
              <p className="text-sm text-white/60 mt-2">
                {address}
              </p>
            )}

            <p className="text-[11px] uppercase tracking-[1px] text-white/40 mt-1">
              Freshly Generated Assessment
            </p>

            {/* Export Buttons */}
            <div className="mt-7">
              <ExportMenu
                propertyId={propertyId}
                propertyTitle={title}
              />
            </div>

          </div>

          {/* RIGHT */}
          {report && cfg && (
            <div className="flex flex-col items-center gap-4 shrink-0">

              <RiskScoreGauge
                value={report.totalRiskScore}
                color={cfg.color}
              />

              <RiskLevelBadge
                level={report.riskLevel}
                tone="dark"
                size="lg"
              />

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default ReportHero;