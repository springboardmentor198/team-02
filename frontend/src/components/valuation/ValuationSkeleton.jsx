// components/valuation/ValuationSkeleton.jsx
function Block({ className = "" }) {
  return <div className={`bg-[#F2EEE4] rounded-lg animate-pulse ${className}`} />;
}

function ValuationSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading valuation comparison">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7 space-y-4">
          <Block className="h-3 w-32" />
          <Block className="h-5 w-full" />
          <Block className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white border border-[#E3DDCE] rounded-lg p-6 space-y-4">
              <Block className="h-3 w-20" />
              <Block className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7 space-y-4">
        <Block className="h-4 w-40" />
        <Block className="h-20 w-full" />
      </div>
    </div>
  );
}

export default ValuationSkeleton;
