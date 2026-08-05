// components/PropertySelector.jsx
//
// A searchable property picker built to sit inside the same dark
// glassmorphic hero block RiskHero.jsx uses for its ID input — same
// height/radius/border-white/10 treatment, just swapped for a filterable
// dropdown so the user never has to type a raw Property ID. Reused by
// both ComparableAnalysis.jsx and ValuationComparison.jsx.
import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Search } from "lucide-react";

function PropertySelector({
  properties = [],
  loading = false,
  selectedId,
  onSelect,
  placeholder = "Search and select a property...",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const selected = properties.find((p) => String(p.id) === String(selectedId));

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = properties.filter((p) => {
    const haystack = `${p.title || ""} ${p.city || ""} ${p.propertyType || ""} ${p.id}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div ref={rootRef} className="relative flex-1 sm:max-w-[340px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="w-full h-11 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm pl-10 pr-10 text-sm text-left text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40 hover:bg-white/15 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Building2
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
        />
        <span className={selected ? "text-white" : "text-white/40"}>
          {loading
            ? "Loading properties…"
            : selected
            ? selected.title || `Property #${selected.id}`
            : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !loading && (
        <div className="absolute z-20 mt-2 w-full sm:min-w-[340px] rounded-2xl border border-[#E3DDCE] bg-white shadow-[0_20px_50px_-15px_rgba(27,35,56,0.35)] overflow-hidden">
          <div className="relative border-b border-[#F2EEE4] px-4 py-3">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA2B5]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, city, or type..."
              className="w-full pl-6 text-sm text-[#1B2338] placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-6 text-center">
                No properties match your search.
              </p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors border-b border-[#F8F6F0] last:border-0 hover:bg-[#FAF8F3] ${
                    String(p.id) === String(selectedId) ? "bg-[#FAF8F3]" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-[#1B2338] truncate">
                    {p.title || `Property #${p.id}`}
                  </p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">
                    {[p.city, p.propertyType].filter(Boolean).join(" · ") || "—"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertySelector;
