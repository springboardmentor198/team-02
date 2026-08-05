// components/valuation/ValuationHero.jsx
//
// Same gradient/glass recipe as RiskHero.jsx / ComparableHero.jsx, with the
// status badge shown once a result comes back — mirroring how RiskHero
// surfaces its gauge + level badge only after generating an assessment.
import { ArrowLeft } from "lucide-react";
import PropertySelector from "../PropertySelector";
import ValuationStatusBadge from "./ValuationStatusBadge";
import { getValuationConfig } from "./valuationConfig";

function ValuationHero({ properties, propertiesLoading, propertyId, onSelect, onBack, result }) {
  const cfg = result ? getValuationConfig(result.valuationStatus) : null;

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#1B2338] via-[#202B47] to-[#2E3A5C] text-white">
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
            Diligence Ledger &nbsp;/&nbsp; Valuation Comparison
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-5">
          <div className="max-w-xl">
            <h1 className="font-serif text-[38px] sm:text-[44px] leading-tight text-white">
              Property Valuation Comparison
            </h1>
            <p className="text-sm text-white/60 mt-2 leading-6">
              See how the asking price stacks up against the estimated
              market value.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <PropertySelector
                properties={properties}
                loading={propertiesLoading}
                selectedId={propertyId}
                onSelect={onSelect}
                placeholder="Search and select a property..."
              />
            </div>
          </div>

          {result && cfg && (
            <div className="flex flex-col items-center gap-3 pb-3 sm:pb-0">
              <ValuationStatusBadge status={result.valuationStatus} tone="dark" size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ValuationHero;
