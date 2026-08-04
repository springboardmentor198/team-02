// components/risk/RiskSkeleton.jsx
//
// Pulse-based skeleton in the app's own tones (#E3DDCE / #F2EEE4) rather
// than a generic gray-200, so it doesn't flash a foreign palette for the
// half-second before real content lands.
function Block({ className = "" }) {
  return <div className={`bg-[#F2EEE4] rounded-lg animate-pulse ${className}`} />;
}

function RiskSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading risk assessment">
      <div className="rounded-2xl bg-[#1B2338]/90 p-9 h-[220px] flex items-center justify-between">
        <div className="space-y-3 w-full max-w-md">
          <div className="h-3 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-9 w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-11 w-full bg-white/10 rounded-full animate-pulse mt-6" />
        </div>
        <div className="hidden sm:block w-[176px] h-[176px] rounded-full bg-white/10 animate-pulse shrink-0" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E3DDCE] rounded-lg p-6 space-y-4">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-[#E3DDCE] rounded-2xl p-7 space-y-4">
          <Block className="h-4 w-40" />
          <Block className="h-24 w-full" />
        </div>
        <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7 space-y-4">
          <Block className="h-4 w-32" />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-3/4" />
          <Block className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

export default RiskSkeleton;
