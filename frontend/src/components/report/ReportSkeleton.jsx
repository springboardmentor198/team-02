// components/report/ReportSkeleton.jsx
//
// Same construction as components/risk/RiskSkeleton.jsx — pulse blocks in
// the app's own tones (#E3DDCE / #F2EEE4) instead of a generic gray, sized
// for the report page's hero + section-card grid instead of the risk
// page's stat-card grid.
function Block({ className = "" }) {
  return <div className={`bg-[#F2EEE4] rounded-lg animate-pulse ${className}`} />;
}

function ReportSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading due diligence report">
      <div className="rounded-2xl bg-[#1B2338]/90 p-9 h-[240px] flex items-center justify-between">
        <div className="space-y-3 w-full max-w-md">
          <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-9 w-72 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-56 bg-white/10 rounded animate-pulse mt-2" />
          <div className="flex gap-3 mt-6">
            <div className="h-10 w-36 bg-white/10 rounded-full animate-pulse" />
            <div className="h-10 w-36 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="hidden sm:block w-[160px] h-[160px] rounded-full bg-white/10 animate-pulse shrink-0" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border border-[#E3DDCE] rounded-2xl p-6 space-y-4">
            <Block className="h-4 w-32" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportSkeleton;
