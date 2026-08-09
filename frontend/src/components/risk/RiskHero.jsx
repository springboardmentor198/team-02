// components/risk/RiskHero.jsx
//
// Built on the exact gradient/texture recipe Dashboard.jsx already uses for
// its property-detail summary rail (from-[#1B2338] via-[#202B47] to-[#2E3A5C]
// with a faint dual radial-gradient overlay) — just widened into a hero
// banner and given real glassmorphism blocks (backdrop-blur) for the
// input/actions row, since that's where it's most legible against the
// texture. Property selection goes through PropertySelector (searchable by
// name, no raw Property ID shown) instead of a number input — same pattern
// ComparableHero/ValuationHero/ReportHero already use.
import { ArrowLeft, Sparkles } from "lucide-react";
import PropertySelector from "../PropertySelector";
import RiskScoreGauge from "./RiskScoreGauge";
import RiskLevelBadge from "./RiskLevelBadge";
import { getRiskConfig } from "./riskConfig";

function RiskHero({
  properties,
  propertiesLoading,
  propertyId,
  onSelectProperty,
  onGenerate,
  loading,
  result,
  onBack,
}) {
  const cfg = result ? getRiskConfig(result.riskLevel) : null;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#1B2338] via-[#202B47] to-[#2E3A5C] text-white">
      {/* signature radial texture, same opacity/recipe as Dashboard's summary rail */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 15%, #C89546 0%, transparent 45%), radial-gradient(circle at 92% 80%, #4D7B73 0%, transparent 45%)",
        }}
      />
      {result && cfg && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
          <div
            className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full blur-3xl transition-colors duration-700"
            style={{ backgroundColor: cfg.glow, opacity: 0.35 }}
          />
        </div>
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
            Diligence Ledger &nbsp;/&nbsp; Risk Assessment
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-5">
          <div className="max-w-xl">
            <h1 className="font-serif text-[38px] sm:text-[44px] leading-tight text-white">
              Risk Assessment
            </h1>
            <p className="text-sm text-white/60 mt-2 leading-6">
              Run an automated risk evaluation for any tracked property —
              scored against title, legal, zoning, and environmental signals,
              with a plain-language recommendation.
            </p>

            {/* Glass input/action block */}
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <PropertySelector
                properties={properties}
                loading={propertiesLoading}
                selectedId={propertyId}
                onSelect={onSelectProperty}
                placeholder="Search and select a property..."
                subtitle={(p) => [p.city, p.state].filter(Boolean).join(", ")}
              />
              <button
                onClick={onGenerate}
                disabled={loading || !propertyId}
                className="h-11 px-6 rounded-full bg-white text-[#1B2338] text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles size={15} />
                {loading ? "Assessing…" : result ? "Re-run Assessment" : "Generate Assessment"}
              </button>
            </div>
          </div>

          {/* Gauge + badge, only once we have a result */}
          {result && cfg && (
            <div className="flex flex-col items-center gap-4 pb-3 sm:pb-0">
              <RiskScoreGauge value={result.totalScore} color={cfg.color} />
              <RiskLevelBadge level={result.riskLevel} tone="dark" size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiskHero;
