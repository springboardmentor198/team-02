// PropertySearch.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatusBadge from "../components/StatusBadge";
import api, { getCurrentUserId } from "../services/api";

const PROPERTY_TYPES = ["ALL", "Residential", "Commercial", "Industrial", "Land"];
const STATUS_OPTIONS = ["ALL", "Pending", "Verified", "Needs Review", "Rejected"];

function PropertySearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      // Backend exposes /properties as a marketplace-wide listing (every
      // user's properties, not just the ones you added) plus separate
      // /city, /type, /price filter endpoints — there's no combined
      // free-text search, so we fetch everything once and filter
      // client-side below.
      const [res, userId] = await Promise.all([
        api.get("/properties"),
        getCurrentUserId(),
      ]);
      setProperties(res.data);
      setCurrentUserId(userId != null ? String(userId) : null);
    } catch (e) {
      console.log(e);
      setError("Couldn't load your properties. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      const matchesQuery =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q);
      const matchesType = propertyType === "ALL" || p.propertyType === propertyType;
      const matchesStatus = status === "ALL" || p.verificationStatus === status;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [properties, query, propertyType, status]);

  const isOwnProperty = (property) =>
    currentUserId != null &&
    property?.user?.id != null &&
    String(property.user.id) === currentUserId;

  const handleVerify = async (property) => {
    if (!isOwnProperty(property)) return;
    setVerifying(true);
    try {
      // Backend: PropertyController.verifyProperty → POST /api/properties/{id}/verify
      const res = await api.post(`/properties/${property.id}/verify`);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === property.id
            ? { ...p, verificationStatus: res.data.status, verificationScore: res.data.score }
            : p
        )
      );
      setSelected((prev) =>
        prev && prev.id === property.id
          ? { ...prev, verificationStatus: res.data.status, verificationScore: res.data.score, _issues: res.data.issues }
          : prev
      );
    } catch (e) {
      console.log(e);
      alert(e.response?.data?.message || "Couldn't verify this property.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
        <div className="px-10 py-8">
          <h1 className="font-serif text-[38px] text-[#1B2338] leading-tight">
            Property Search
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "Loading…" : `${filtered.length} of ${properties.length} properties`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mt-5">
              {error}
            </div>
          )}

          <div className="bg-white border border-[#E3DDCE] rounded-lg p-6 mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[240px]">
              <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">
                Title, address, city, or owner
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-5 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                placeholder="e.g. Lakeview Terrace or M. Sanders"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Property type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-[160px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t === "ALL" ? "All types" : t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-[160px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s === "ALL" ? "All statuses" : s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-[#E3DDCE] rounded-lg mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] px-6 py-3 border-b border-[#E3DDCE] text-[11px] uppercase tracking-[1.5px] text-gray-500">
              <span>Property</span>
              <span>Type</span>
              <span>Price</span>
              <span>Owner of record</span>
              <span>Status</span>
            </div>
            {loading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Loading properties…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">
                {properties.length === 0
                  ? "No properties have been listed yet."
                  : "No properties match your search or filters."}
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="w-full text-left grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr] px-6 py-4 border-b border-[#F0EBE0] last:border-0 hover:bg-[#FAF8F2] transition-colors items-center"
                >
                  <span>
                    <span className="font-semibold text-sm text-[#1B2338] block">{p.title}</span>
                    <span className="text-xs text-gray-500">{p.city}, {p.state}</span>
                  </span>
                  <span className="text-sm text-gray-600">{p.propertyType}</span>
                  <span className="text-sm text-gray-600">
                    {p.price != null ? `$${Number(p.price).toLocaleString()}` : "—"}
                  </span>
                  <span className="text-sm text-gray-600">{p.ownerName}</span>
                  <StatusBadge status={p.verificationStatus} />
                </button>
              ))
            )}
          </div>
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div className="bg-white rounded-lg shadow-xl w-[460px] p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h2 className="font-serif text-2xl text-[#1B2338]">{selected.title}</h2>
              <StatusBadge status={selected.verificationStatus} />
            </div>
            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <p><span className="text-gray-400">Address:</span> {selected.address}</p>
              <p><span className="text-gray-400">City / State:</span> {selected.city}, {selected.state}</p>
              <p><span className="text-gray-400">Type:</span> {selected.propertyType}</p>
              <p><span className="text-gray-400">Price:</span> ${Number(selected.price).toLocaleString()}</p>
              <p><span className="text-gray-400">Area:</span> {selected.area?.toLocaleString()} sqft</p>
              <p><span className="text-gray-400">Owner of record:</span> {selected.ownerName}</p>
              <p><span className="text-gray-400">Verification score:</span> {selected.verificationScore ?? 0}/100</p>
              {selected._issues?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mt-2">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Issues found</p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside">
                    {selected._issues.map((iss, i) => <li key={i}>{iss}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {isOwnProperty(selected) ? (
                <button
                  onClick={() => handleVerify(selected)}
                  disabled={verifying}
                  className="flex-1 h-10 rounded-full bg-[#1B2338] text-white text-sm font-medium hover:bg-[#2B3450] disabled:opacity-60"
                >
                  {verifying ? "Verifying…" : "Run Verification"}
                </button>
              ) : (
                <span className="flex-1 flex items-center justify-center text-xs text-gray-400 italic">
                  Listed by another user — verification is owner-only
                </span>
              )}

              <button
                onClick={() => navigate(`/properties/${selected.id}/flood-zone`)}
                className="flex-1 h-10 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                🌊 Flood Zone
              </button>

              <button
                onClick={() => setSelected(null)}
                className="h-10 px-5 rounded-full border border-[#E3DDCE] text-sm text-gray-600 hover:bg-[#F8F6F0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertySearch;
