// Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import {
  MapPin,
  Building2,
  User,
  DollarSign,
  Ruler,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Landmark,
  CalendarClock,
  BadgeCheck,
  ScrollText,
  Pencil,
  Trash2,
  Scale,
  Gavel,
  Map,
  ArrowLeft,
  LayoutGrid,
  ClipboardCheck,
  Leaf,
} from "lucide-react";

const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Land"];

function Dashboard() {
  const email = localStorage.getItem("email");
  const username = email ? email.split("@")[0] : "there";

  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProperty, setIsEditingProperty] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [propsRes, statsRes] = await Promise.all([
        api.get("/properties"),
        api.get("/properties/stats"),
      ]);
      setProperties(propsRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.log(e);
      setError("Couldn't load your dashboard. Is the backend running on port 8080?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const viewPropertyDetails = async (id) => {
    try {
      const res = await api.get(`/properties/${id}`);
      setSelectedProperty(res.data);
      setShowDetails(true);
      setActiveTab("overview");
      setIsEditingProperty(false);
      setEditForm(null);
      setEditError("");
    } catch (e) {
      console.error(e);
      alert("Failed to load property details.");
    }
  };

  const startEditProperty = () => {
    if (!selectedProperty) return;
    setEditForm({
      title: selectedProperty.title || "",
      address: selectedProperty.address || "",
      city: selectedProperty.city || "",
      state: selectedProperty.state || "",
      propertyType: selectedProperty.propertyType || "Residential",
      price: selectedProperty.price ?? "",
      area: selectedProperty.area ?? "",
      ownerName: selectedProperty.ownerName || "",
    });
    setEditError("");
    setActiveTab("overview");
    setIsEditingProperty(true);
  };

  const cancelEditProperty = () => {
    setIsEditingProperty(false);
    setEditForm(null);
    setEditError("");
  };

  const saveEditProperty = async (e) => {
    e.preventDefault();
    if (!selectedProperty || !editForm) return;
    setSavingEdit(true);
    setEditError("");
    try {
      // Backend: PropertyController.updateProperty → PUT /api/properties/{id}
      const payload = {
        ...editForm,
        price: editForm.price !== "" ? Number(editForm.price) : null,
        area: editForm.area !== "" ? Number(editForm.area) : null,
      };
      const res = await api.put(`/properties/${selectedProperty.id}`, payload);
      // The update endpoint returns the plain Property, not the full
      // PropertyDetailsResponse — merge it in so landRegistry/ownership/
      // legalRecord/zoning/floodZone/permit/environmental (already loaded) stay intact.
      setSelectedProperty((prev) => ({ ...prev, ...res.data }));
      setIsEditingProperty(false);
      setEditForm(null);
      loadDashboard();
    } catch (e) {
      console.error(e);
      setEditError(
        e.response?.data?.message ||
          e.response?.data ||
          "Couldn't save these changes. Check the fields and try again."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty) return;
    if (!window.confirm(`Delete "${selectedProperty.title}"? This cannot be undone.`)) return;
    try {
      // Backend: PropertyController.deleteProperty → DELETE /api/properties/{id}
      await api.delete(`/properties/${selectedProperty.id}`);
      setShowDetails(false);
      setSelectedProperty(null);
      loadDashboard();
    } catch (e) {
      console.error(e);
      alert("Failed to delete property.");
    }
  };

  const backToDashboard = () => {
    setShowDetails(false);
    setSelectedProperty(null);
    setIsEditingProperty(false);
    setEditForm(null);
  };

  const verifiedCount = properties.filter(p => p.verificationStatus==="Verified").length;
  const pendingCount = properties.filter(p => p.verificationStatus==="Pending").length;
  const needsReviewCount = properties.filter(p => p.verificationStatus==="Needs Review").length;
  const avgScore = properties.length
    ? Math.round(properties.reduce((s,p)=>s+(p.verificationScore||0),0)/properties.length)
    : 0;

  const summaryCards = [
    { title:"PROPERTIES TRACKED", value:properties.length},
    { title:"AVG VERIFICATION SCORE", value:`${avgScore}/100`},
    { title:"VERIFIED", value:verifiedCount},
    { title:"PENDING REVIEW", value:pendingCount+needsReviewCount},
  ];

  const typeEntries = Object.entries(stats);
  const typeTotal = typeEntries.reduce((s,[,c])=>s+c,0)||1;
  const typeColors=["#4D7B73","#C89546","#B45B46","#3E63C2","#8E6C9C"];

  // --- Detail view presentation helpers ---
  const scoreValue = Number(selectedProperty?.verificationScore) || 0;
  const scoreColor =
    scoreValue >= 80 ? "#4D7B73" : scoreValue >= 50 ? "#C89546" : "#B45B46";

  const isVerifiedStatus = (val) =>
    val === true || val === "true" || val === "Verified" || val === "Yes";

  const DETAIL_TABS = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "land", label: "Land Registry", icon: Landmark },
    { key: "ownership", label: "Ownership", icon: User },
    { key: "legal", label: "Legal Records", icon: Scale },
    { key: "zoning", label: "Zoning", icon: Map },
    { key: "permit", label: "Permit", icon: ClipboardCheck },
    { key: "environmental", label: "Environmental", icon: Leaf },
  ];

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[#F2EEE4] last:border-0">
      <span className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[1px] text-gray-400 font-medium shrink-0">
        <Icon size={12} className="text-[#9AA2B5]" strokeWidth={2} />
        {label}
      </span>
      <span className="text-sm text-[#1B2338] font-semibold text-right break-words">
        {value === undefined || value === null || value === "" ? "N/A" : String(value)}
      </span>
    </div>
  );

  const BoolPill = ({ value }) => {
    const verified = isVerifiedStatus(value);
    const label = value === undefined ? "N/A" : verified ? "Verified" : "Unverified";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
          verified
            ? "bg-[#4D7B73]/10 text-[#4D7B73]"
            : value === undefined
            ? "bg-gray-100 text-gray-400"
            : "bg-[#B45B46]/10 text-[#B45B46]"
        }`}
      >
        {verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
        {label}
      </span>
    );
  };

  const CourtCasesPill = ({ value }) => {
    if (value === undefined || value === null || value === "") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-400">
          <ShieldAlert size={12} /> N/A
        </span>
      );
    }
    const hasActiveCase = String(value).trim().toUpperCase() === "YES";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
          hasActiveCase ? "bg-[#B45B46]/10 text-[#B45B46]" : "bg-[#4D7B73]/10 text-[#4D7B73]"
        }`}
      >
        {hasActiveCase ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
        {hasActiveCase ? "Active Case" : "No Active Case"}
      </span>
    );
  };

  const ConstructionPill = ({ value }) => {
    if (value === undefined || value === null || value === "") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-400">
          <ShieldAlert size={12} /> N/A
        </span>
      );
    }
    const allowed = String(value).trim().toUpperCase() === "YES";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
          allowed ? "bg-[#4D7B73]/10 text-[#4D7B73]" : "bg-[#B45B46]/10 text-[#B45B46]"
        }`}
      >
        {allowed ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
        {allowed ? "Construction Allowed" : "Construction Restricted"}
      </span>
    );
  };

  // Generic neutral status pill for fields that don't map to a strict
  // verified/unverified or yes/no boolean (e.g. permit status, environmental
  // risk level). Purely presentational — same shape/size as the other pills
  // above, kept in a neutral palette since there's no fixed set of values.
  const StatusPill = ({ value }) => {
    if (value === undefined || value === null || value === "") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-400">
          <ShieldAlert size={12} /> N/A
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#3E63C2]/10 text-[#3E63C2]">
        <ShieldCheck size={12} />
        {String(value)}
      </span>
    );
  };

  const ScoreRing = ({ value, color }) => {
    const size = 128;
    const stroke = 9;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(Math.max(value, 0), 100);
    const offset = circumference - (clamped / 100) * circumference;
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-bold text-white leading-none">{Math.round(clamped)}</span>
          <span className="text-[10px] text-white/50 mt-1">/ 100</span>
        </div>
      </div>
    );
  };

  // A small "fact card" used to fill the wider Land Registry / Ownership /
  // Legal / Zoning tabs so they don't look like a narrow strip floating in
  // empty space. Purely presentational, no data changes.
  const FactCard = ({ icon: Icon, label, value }) => (
    <div className="border border-[#E3DDCE] rounded-xl p-4 bg-[#FAF8F3]">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[1px] text-gray-400 font-medium mb-2">
        <Icon size={12} className="text-[#9AA2B5]" strokeWidth={2} />
        {label}
      </div>
      <p className="text-[15px] text-[#1B2338] font-semibold break-words">
        {value === undefined || value === null || value === "" ? "N/A" : String(value)}
      </p>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#EFEAE0] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[220px] h-screen flex flex-col overflow-hidden">
        {/* TopHeader is pinned — it never scrolls, never unmounts, and stays
            identical between dashboard and detail view. Only the region
            below it scrolls, and only if its content is actually taller
            than the available space. */}
        <div className="shrink-0">
          <TopHeader />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {!showDetails ? (
          <div className="px-10 py-8">
            <h1 className="font-serif text-[44px] text-[#1B2338]">Good morning, {username}</h1>
            <p className="text-sm text-gray-500 mt-2">
              {loading ? "Loading your properties…" : `${properties.length} properties tracked`}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-md px-4 py-3 mt-5">
                {error}
              </div>
            )}

            <div className="grid grid-cols-4 gap-5 mt-8">
              {summaryCards.map(s=>(
                <div key={s.title} className="bg-white border border-[#E3DDCE] rounded-lg p-6">
                  <p className="text-[11px] uppercase tracking-[2px] text-gray-500">{s.title}</p>
                  <h2 className="text-[34px] mt-5 text-[#1B2338]">{loading?"—":s.value}</h2>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-5 mt-8">
              <div className="col-span-2 bg-white border border-[#E3DDCE] rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Recent Properties</h2>

                  <div className="flex gap-3">
                    <Link
                      to="/tax-history"
                      className="px-5 py-2 bg-[#1B2338] text-white rounded-md hover:bg-[#2A3555] transition"
                    >
                      Tax History
                    </Link>

                    <Link
                      to="/add-property"
                      className="px-5 py-2 border border-[#1B2338] text-[#1B2338] rounded-md hover:bg-[#1B2338] hover:text-white transition"
                    >
                      + Add Property
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <div>Loading...</div>
                ) : properties.length===0 ? (
                  <div>No properties yet.</div>
                ) : (
                  properties.slice(0,6).map(p=>(
                    <div key={p.id} className="flex justify-between items-center border-b py-3">
                      <div>
                        <h3 className="font-semibold">{p.title}</h3>
                        <p className="text-xs text-gray-500">{p.city}, {p.state} · {p.propertyType}</p>
                        <button
                          onClick={()=>viewPropertyDetails(p.id)}
                          className="text-blue-600 text-xs mt-2 hover:underline">
                          Detailed view
                        </button>
                        <Link
                          to={`/reports/${p.id}`}
                          className="text-[#3E63C2] text-xs mt-2 ml-4 hover:underline"
                        >
                          Generate Report
                        </Link>
                      </div>
                      <StatusBadge status={p.verificationStatus}/>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white border border-[#E3DDCE] rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Property Type Mix</h2>
                {typeEntries.map(([type,count],i)=>{
                  const pct=Math.round((count/typeTotal)*100);
                  return (
                    <div key={type} className="mb-5">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span><span>{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-2">
                        <div className="h-2 rounded-full" style={{width:`${pct}%`,backgroundColor:typeColors[i%typeColors.length]}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ===================== PROPERTY DETAIL VIEW ===================== */
          /* Lives inside the same <main>, under the same TopHeader — sidebar
             stays visible on the left, nothing overlays the whole viewport. */
          selectedProperty && (
            <div className="px-10 pt-5 pb-6">
              {/* Breadcrumb + actions row (replaces the old fake header bar) */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={backToDashboard}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E3DDCE] text-[#1B2338] bg-white hover:bg-[#EFEAE0] transition shrink-0"
                    aria-label="Back to dashboard"
                    title="Back to dashboard"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <p className="font-serif text-xl text-[#1B2338] truncate leading-tight">
                    {selectedProperty.title || "Untitled Property"}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isEditingProperty ? (
                    <button
                      onClick={cancelEditProperty}
                      disabled={savingEdit}
                      className="px-4 py-2.5 rounded-md border border-[#E3DDCE] text-[#1B2338] text-sm font-medium bg-white hover:bg-[#EFEAE0] transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={startEditProperty}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#1B2338] text-[#1B2338] text-sm font-medium hover:bg-[#1B2338] hover:text-white transition"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  )}
                  <button
                    onClick={handleDeleteProperty}
                    disabled={isEditingProperty}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#B45B46] text-white text-sm font-medium hover:bg-[#9c4c3a] transition disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Summary rail + tabbed content */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left summary rail */}
                <aside className="md:w-[300px] shrink-0 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1B2338] via-[#202B47] to-[#2E3A5C] text-white">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 15% 10%, #C89546 0%, transparent 45%), radial-gradient(circle at 90% 85%, #4D7B73 0%, transparent 45%)",
                    }}
                  />
                  <div className="relative p-7">
                    <p className="flex items-center gap-1.5 text-sm text-white/70">
                      <MapPin size={14} />
                      {[selectedProperty.address, selectedProperty.city, selectedProperty.state]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <StatusBadge status={selectedProperty.verificationStatus} />
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                        <Building2 size={13} />
                        {selectedProperty.propertyType || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center mt-8">
                      <ScoreRing value={scoreValue} color={scoreColor} />
                      <p className="text-[11px] text-white/50 uppercase tracking-[1.5px] mt-3">Verification Score</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1px] text-white/50">
                          <DollarSign size={11} /> Price
                        </div>
                        <p className="text-base font-semibold mt-1">{selectedProperty.price || "N/A"}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[1px] text-white/50">
                          <Ruler size={11} /> Area
                        </div>
                        <p className="text-base font-semibold mt-1">{selectedProperty.area || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Right: tabs + content */}
                <div className="flex-1 min-w-0">
                  {/* Tab bar */}
                  <div className="bg-white border border-[#E3DDCE] rounded-t-2xl px-6">
                    <div className="flex gap-6 overflow-x-auto">
                      {DETAIL_TABS.map((tab) => {
                        const TabIcon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative flex items-center gap-2 py-4 text-sm font-medium whitespace-nowrap transition ${
                              active ? "text-[#1B2338]" : "text-gray-400 hover:text-[#1B2338]"
                            }`}
                          >
                            <TabIcon size={15} />
                            {tab.label}
                            {active && (
                              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#C89546] rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab content — no nested scroll container, the page scrolls as one */}
                  <div className="bg-white border border-t-0 border-[#E3DDCE] rounded-b-2xl p-7">
                    {activeTab === "overview" && (
                      <div className="space-y-7">
                        {isEditingProperty && editForm ? (
                          <form onSubmit={saveEditProperty}>
                            {editError && (
                              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mb-5">
                                {String(editError)}
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Title</label>
                                <input
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Owner Name</label>
                                <input
                                  value={editForm.ownerName}
                                  onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Address</label>
                                <input
                                  value={editForm.address}
                                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">City</label>
                                <input
                                  value={editForm.city}
                                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">State</label>
                                <input
                                  value={editForm.state}
                                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Property Type</label>
                                <select
                                  value={editForm.propertyType}
                                  onChange={(e) => setEditForm({ ...editForm, propertyType: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
                                >
                                  {PROPERTY_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Price ($)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Area (sqft)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editForm.area}
                                  onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                                  className="w-full h-11 mt-1.5 rounded-md border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-6">
                              <button
                                type="submit"
                                disabled={savingEdit}
                                className="px-6 py-2.5 rounded-md bg-[#1B2338] text-white text-sm font-semibold hover:bg-[#2B3450] transition disabled:opacity-60"
                              >
                                {savingEdit ? "Saving…" : "Save Changes"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditProperty}
                                disabled={savingEdit}
                                className="px-6 py-2.5 rounded-md border border-[#E3DDCE] text-[#1B2338] text-sm font-medium hover:bg-[#EFEAE0] transition disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <FileText size={16} className="text-[#1B2338]" />
                                <h3 className="text-[15px] font-semibold text-[#1B2338]">Property Information</h3>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FactCard icon={User} label="Owner" value={selectedProperty.ownerName} />
                                <FactCard icon={Building2} label="Property Type" value={selectedProperty.propertyType} />
                                <FactCard
                                  icon={MapPin}
                                  label="City / State"
                                  value={[selectedProperty.city, selectedProperty.state].filter(Boolean).join(", ")}
                                />
                                <FactCard icon={DollarSign} label="Price" value={selectedProperty.price} />
                                <FactCard icon={Ruler} label="Area" value={selectedProperty.area} />
                                <FactCard icon={BadgeCheck} label="Verification Status" value={selectedProperty.verificationStatus} />
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400 font-medium mb-3">
                                Verification Snapshot
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                  onClick={() => setActiveTab("land")}
                                  className="text-left border border-[#E3DDCE] rounded-2xl p-4 bg-[#FAF8F3] hover:border-[#1B2338] transition"
                                >
                                  <div className="flex items-center gap-2 text-[#1B2338] mb-2">
                                    <Landmark size={15} />
                                    <span className="text-sm font-semibold">Land Registry</span>
                                  </div>
                                  <BoolPill value={selectedProperty.landRegistry?.titleVerified} />
                                </button>

                                <button
                                  onClick={() => setActiveTab("ownership")}
                                  className="text-left border border-[#E3DDCE] rounded-2xl p-4 bg-[#FAF8F3] hover:border-[#1B2338] transition"
                                >
                                  <div className="flex items-center gap-2 text-[#1B2338] mb-2">
                                    <User size={15} />
                                    <span className="text-sm font-semibold">Ownership</span>
                                  </div>
                                  <BoolPill value={selectedProperty.ownership?.ownerVerified} />
                                </button>

                                <button
                                  onClick={() => setActiveTab("legal")}
                                  className="text-left border border-[#E3DDCE] rounded-2xl p-4 bg-[#FAF8F3] hover:border-[#1B2338] transition"
                                >
                                  <div className="flex items-center gap-2 text-[#1B2338] mb-2">
                                    <Scale size={15} />
                                    <span className="text-sm font-semibold">Legal Records</span>
                                  </div>
                                  <CourtCasesPill value={selectedProperty.legalRecord?.courtCases} />
                                </button>

                                <button
                                  onClick={() => setActiveTab("zoning")}
                                  className="text-left border border-[#E3DDCE] rounded-2xl p-4 bg-[#FAF8F3] hover:border-[#1B2338] transition"
                                >
                                  <div className="flex items-center gap-2 text-[#1B2338] mb-2">
                                    <Map size={15} />
                                    <span className="text-sm font-semibold">Zoning</span>
                                  </div>
                                  <ConstructionPill value={selectedProperty.zoning?.constructionAllowed} />
                                </button>

                                <button
                                  onClick={() => setActiveTab("permit")}
                                  className="text-left border border-[#E3DDCE] rounded-2xl p-4 bg-[#FAF8F3] hover:border-[#1B2338] transition"
                                >
                                  <div className="flex items-center gap-2 text-[#1B2338] mb-2">
                                    <ClipboardCheck size={15} />
                                    <span className="text-sm font-semibold">Permit</span>
                                  </div>
                                  <StatusPill value={selectedProperty.permit?.permitStatus} />
                                </button>

                                <button
                                  onClick={() => setActiveTab("environmental")}
                                  className="text-left border border-[#E3DDCE] rounded-2xl p-4 bg-[#FAF8F3] hover:border-[#1B2338] transition"
                                >
                                  <div className="flex items-center gap-2 text-[#1B2338] mb-2">
                                    <Leaf size={15} />
                                    <span className="text-sm font-semibold">Environmental</span>
                                  </div>
                                  <StatusPill value={selectedProperty.environmental?.environmentalRisk} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === "land" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Landmark size={16} className="text-[#1B2338]" />
                            <h3 className="text-[15px] font-semibold text-[#1B2338]">Land Registry</h3>
                          </div>
                          <BoolPill value={selectedProperty.landRegistry?.titleVerified} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <FactCard icon={ScrollText} label="Registry Number" value={selectedProperty.landRegistry?.registryNumber} />
                          <FactCard icon={FileText} label="Registry Status" value={selectedProperty.landRegistry?.registryStatus} />
                          <FactCard icon={Landmark} label="Registry Office" value={selectedProperty.landRegistry?.registryOffice} />
                          <FactCard icon={CalendarClock} label="Last Updated" value={selectedProperty.landRegistry?.lastUpdated} />
                        </div>
                      </div>
                    )}

                    {activeTab === "ownership" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-[#1B2338]" />
                            <h3 className="text-[15px] font-semibold text-[#1B2338]">Ownership Records</h3>
                          </div>
                          <BoolPill value={selectedProperty.ownership?.ownerVerified} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <FactCard icon={FileText} label="Ownership Type" value={selectedProperty.ownership?.ownershipType} />
                          <FactCard icon={CalendarClock} label="Ownership Since" value={selectedProperty.ownership?.ownershipSince} />
                          <FactCard icon={ScrollText} label="Remarks" value={selectedProperty.ownership?.remarks} />
                        </div>
                      </div>
                    )}

                    {activeTab === "legal" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Scale size={16} className="text-[#1B2338]" />
                            <h3 className="text-[15px] font-semibold text-[#1B2338]">Legal Records</h3>
                          </div>
                          <CourtCasesPill value={selectedProperty.legalRecord?.courtCases} />
                        </div>
                        {selectedProperty.legalRecord ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FactCard icon={Gavel} label="Court Cases" value={selectedProperty.legalRecord?.courtCases} />
                            <FactCard icon={FileText} label="Case Status" value={selectedProperty.legalRecord?.caseStatus} />
                            <FactCard icon={ScrollText} label="Remarks" value={selectedProperty.legalRecord?.remarks} />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-12">No legal record data available.</p>
                        )}
                      </div>
                    )}

                    {activeTab === "zoning" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Map size={16} className="text-[#1B2338]" />
                            <h3 className="text-[15px] font-semibold text-[#1B2338]">Zoning Information</h3>
                          </div>
                          <ConstructionPill value={selectedProperty.zoning?.constructionAllowed} />
                        </div>
                        {selectedProperty.zoning ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FactCard icon={Building2} label="Zone Type" value={selectedProperty.zoning?.zoneType} />
                            <FactCard icon={ShieldCheck} label="Construction Allowed" value={selectedProperty.zoning?.constructionAllowed} />
                            <FactCard icon={Landmark} label="Authority" value={selectedProperty.zoning?.authority} />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-12">No zoning data available.</p>
                        )}
                      </div>
                    )}

                    {activeTab === "permit" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <ClipboardCheck size={16} className="text-[#1B2338]" />
                            <h3 className="text-[15px] font-semibold text-[#1B2338]">Permit Records</h3>
                          </div>
                          <StatusPill value={selectedProperty.permit?.permitStatus} />
                        </div>
                        {selectedProperty.permit ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FactCard icon={ScrollText} label="Permit Number" value={selectedProperty.permit?.permitNumber} />
                            <FactCard icon={FileText} label="Permit Type" value={selectedProperty.permit?.permitType} />
                            <FactCard icon={ClipboardCheck} label="Permit Status" value={selectedProperty.permit?.permitStatus} />
                            <FactCard icon={Landmark} label="Issuing Authority" value={selectedProperty.permit?.issuingAuthority} />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-12">No permit data available.</p>
                        )}
                      </div>
                    )}

                    {activeTab === "environmental" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Leaf size={16} className="text-[#1B2338]" />
                            <h3 className="text-[15px] font-semibold text-[#1B2338]">Environmental Records</h3>
                          </div>
                          <StatusPill value={selectedProperty.environmental?.environmentalRisk} />
                        </div>
                        {selectedProperty.environmental ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FactCard icon={ShieldAlert} label="Environmental Risk" value={selectedProperty.environmental?.environmentalRisk} />
                            <FactCard icon={FileText} label="Pollution Level" value={selectedProperty.environmental?.pollutionLevel} />
                            <FactCard icon={Map} label="Protected Area" value={selectedProperty.environmental?.protectedArea} />
                            <FactCard icon={ScrollText} label="Remarks" value={selectedProperty.environmental?.remarks} />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-12">No environmental data available.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
        {/* =================== END PROPERTY DETAIL VIEW =================== */}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
