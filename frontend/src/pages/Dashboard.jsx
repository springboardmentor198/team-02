// Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import {
  X,
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
} from "lucide-react";

function Dashboard() {
  const email = localStorage.getItem("email");
  const username = email ? email.split("@")[0] : "there";

  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const viewPropertyDetails = async (id) => {
    try {
      const res = await api.get(`/properties/${id}`);
      setSelectedProperty(res.data);
      setShowDetails(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load property details.");
    }
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

  // --- Modal presentation helpers (visual only — no logic/data changes) ---
  const scoreValue = Number(selectedProperty?.verificationScore) || 0;
  const scoreColor =
    scoreValue >= 80 ? "#4D7B73" : scoreValue >= 50 ? "#C89546" : "#B45B46";

  const isVerifiedStatus = (val) =>
    val === true || val === "true" || val === "Verified" || val === "Yes";

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-[#EFEAE0] flex items-center justify-center">
        <Icon size={15} className="text-[#1B2338]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] uppercase tracking-[1.5px] text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-[#1B2338] font-medium mt-0.5 break-words">
          {value === undefined || value === null || value === "" ? "N/A" : String(value)}
        </p>
      </div>
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

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
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
                        View Details
                      </button>
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

          {/* ===================== PREMIUM VIEW DETAILS MODAL ===================== */}
          {showDetails && selectedProperty && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
              onClick={() => setShowDetails(false)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-[#1B2338]/50 backdrop-blur-sm transition-opacity" />

              {/* Modal panel */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Gradient hero header */}
                <div className="relative shrink-0 px-8 pt-7 pb-6 bg-gradient-to-br from-[#1B2338] via-[#232E4A] to-[#2E3A5C] text-white">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 20%, #C89546 0%, transparent 45%), radial-gradient(circle at 85% 15%, #4D7B73 0%, transparent 40%)",
                    }}
                  />

                  <button
                    onClick={() => setShowDetails(false)}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                    aria-label="Close"
                  >
                    <X size={17} className="text-white" />
                  </button>

                  <p className="relative text-[11px] uppercase tracking-[2px] text-white/50 font-medium">
                    Property Details
                  </p>
                  <h2 className="relative font-serif text-[30px] leading-tight mt-2 pr-10">
                    {selectedProperty.title || "Untitled Property"}
                  </h2>
                  <p className="relative flex items-center gap-1.5 text-sm text-white/70 mt-2">
                    <MapPin size={14} />
                    {[selectedProperty.address, selectedProperty.city, selectedProperty.state]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>

                  <div className="relative flex items-center gap-3 mt-5">
                    <StatusBadge status={selectedProperty.verificationStatus} />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                      <Building2 size={13} />
                      {selectedProperty.propertyType || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto px-8 py-7 space-y-6">
                  {/* Stat row: price / area / score */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#EFEAE0]/60 border border-[#E3DDCE] rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[10.5px] uppercase tracking-[1.5px] font-medium">
                        <DollarSign size={12} /> Price
                      </div>
                      <p className="text-lg font-semibold text-[#1B2338] mt-1.5">
                        {selectedProperty.price || "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#EFEAE0]/60 border border-[#E3DDCE] rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[10.5px] uppercase tracking-[1.5px] font-medium">
                        <Ruler size={12} /> Area
                      </div>
                      <p className="text-lg font-semibold text-[#1B2338] mt-1.5">
                        {selectedProperty.area || "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#EFEAE0]/60 border border-[#E3DDCE] rounded-2xl p-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[10.5px] uppercase tracking-[1.5px] font-medium">
                        <BadgeCheck size={12} /> Verification Score
                      </div>
                      <p className="text-lg font-semibold mt-1.5" style={{ color: scoreColor }}>
                        {selectedProperty.verificationScore ?? "N/A"}
                        {selectedProperty.verificationScore !== undefined && (
                          <span className="text-xs text-gray-400 font-normal"> /100</span>
                        )}
                      </p>
                      <div className="h-1.5 bg-white rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(Math.max(scoreValue, 0), 100)}%`,
                            backgroundColor: scoreColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Information card */}
                  <div className="border border-[#E3DDCE] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={16} className="text-[#1B2338]" />
                      <h3 className="text-[15px] font-semibold text-[#1B2338]">Property Information</h3>
                    </div>
                    <div className="divide-y divide-[#F2EEE4]">
                      <InfoRow icon={User} label="Owner" value={selectedProperty.ownerName} />
                      <InfoRow icon={Building2} label="Property Type" value={selectedProperty.propertyType} />
                      <InfoRow icon={MapPin} label="City / State" value={[selectedProperty.city, selectedProperty.state].filter(Boolean).join(", ")} />
                    </div>
                  </div>

                  {/* Land Registry card */}
                  <div className="border border-[#E3DDCE] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Landmark size={16} className="text-[#1B2338]" />
                        <h3 className="text-[15px] font-semibold text-[#1B2338]">Land Registry</h3>
                      </div>
                      <BoolPill value={selectedProperty.landRegistry?.titleVerified} />
                    </div>
                    <div className="divide-y divide-[#F2EEE4]">
                      <InfoRow icon={ScrollText} label="Registry Number" value={selectedProperty.landRegistry?.registryNumber} />
                      <InfoRow icon={FileText} label="Registry Status" value={selectedProperty.landRegistry?.registryStatus} />
                      <InfoRow icon={Landmark} label="Registry Office" value={selectedProperty.landRegistry?.registryOffice} />
                      <InfoRow icon={CalendarClock} label="Last Updated" value={selectedProperty.landRegistry?.lastUpdated} />
                    </div>
                  </div>

                  {/* Ownership card */}
                  <div className="border border-[#E3DDCE] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-[#1B2338]" />
                        <h3 className="text-[15px] font-semibold text-[#1B2338]">Ownership Records</h3>
                      </div>
                      <BoolPill value={selectedProperty.ownership?.ownerVerified} />
                    </div>
                    <div className="divide-y divide-[#F2EEE4]">
                      <InfoRow icon={FileText} label="Ownership Type" value={selectedProperty.ownership?.ownershipType} />
                      <InfoRow icon={CalendarClock} label="Ownership Since" value={selectedProperty.ownership?.ownershipSince} />
                      <InfoRow icon={ScrollText} label="Remarks" value={selectedProperty.ownership?.remarks} />
                    </div>
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="shrink-0 border-t border-[#E3DDCE] px-8 py-4 flex items-center justify-end gap-3 bg-white">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#E3DDCE] text-[#1B2338] text-sm font-medium hover:bg-[#EFEAE0] transition"
                  >
                    Close
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1B2338] text-[#1B2338] text-sm font-medium hover:bg-[#1B2338] hover:text-white transition"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B45B46] text-white text-sm font-medium hover:bg-[#9c4c3a] transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* =================== END PREMIUM VIEW DETAILS MODAL =================== */}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
