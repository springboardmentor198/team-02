// components/audit/TableSkeleton.jsx
//
// Same pulse-block construction as risk/RiskSkeleton.jsx and
// comparable/ComparableSkeleton.jsx (#F2EEE4 blocks, animate-pulse), shaped
// for a table's rows instead of a hero/card grid.
function Block({ className = "" }) {
  return <div className={`bg-[#F2EEE4] rounded animate-pulse ${className}`} />;
}

function TableSkeleton({ rows = 6 }) {
  return (
    <div className="divide-y divide-[#F0EBE0]" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-6">
          <Block className="h-4 w-1/5" />
          <Block className="h-4 w-1/6" />
          <Block className="h-4 w-2/5" />
          <Block className="h-4 w-1/6" />
          <Block className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;
