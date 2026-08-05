// components/comparable/ComparableHero.jsx
//
// Same gradient/texture recipe as RiskHero.jsx (from-[#1B2338] via-[#202B47]
// to-[#2E3A5C] with the dual radial-gradient overlay), with the raw ID
// input swapped for PropertySelector since this page shouldn't ask the
// user to type a Property ID.
import { ArrowLeft, Layers } from "lucide-react";
import PropertySelector from "../PropertySelector";

function ComparableHero({ properties, propertiesLoading, propertyId, onSelect, onBack }) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#1B2338] via-[#202B47] to-[#2E3A5C] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 15%, #C89546 0%, transparent 45%), radial-gradient(circle at 92% 80%, #4D7B73 0%, transparent 45%)",
        }}
      />

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
            Diligence Ledger &nbsp;/&nbsp; Comparable Analysis
          </p>
        </div>

        <div className="max-w-xl mt-5">
          <h1 className="font-serif text-[38px] sm:text-[44px] leading-tight text-white">
            Comparable Property Analysis
          </h1>
          <p className="text-sm text-white/60 mt-2 leading-6">
            Compare this property against similar nearby properties.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <PropertySelector
              properties={properties}
              loading={propertiesLoading}
              selectedId={propertyId}
              onSelect={onSelect}
              placeholder="Search and select a property..."
            />
            <div className="hidden sm:flex items-center gap-2 text-white/40 text-xs">
              <Layers size={14} />
              {properties.length} tracked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComparableHero;
