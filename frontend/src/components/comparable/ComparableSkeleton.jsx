// components/comparable/ComparableSkeleton.jsx
// Same pulse-based skeleton palette (#E3DDCE / #F2EEE4) as risk/RiskSkeleton.jsx.
function Block({ className = "" }) {
  return <div className={`bg-[#F2EEE4] rounded-lg animate-pulse ${className}`} />;
}

function ComparableSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading comparable analysis">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7 space-y-4">
          <Block className="h-3 w-32" />
          <Block className="h-5 w-full" />
          <Block className="h-4 w-3/4" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-[#E3DDCE] rounded-lg p-6 space-y-4">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#FAF8F3] border border-[#E3DDCE] rounded-2xl p-5 space-y-4">
            <Block className="h-9 w-9 rounded-xl" />
            <Block className="h-4 w-2/3" />
            <Block className="h-3 w-1/2" />
            <Block className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComparableSkeleton;
