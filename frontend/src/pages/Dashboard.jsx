// Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

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

          {showDetails && selectedProperty && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-[700px] max-h-[80vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Property Details</h2>
                  <button onClick={()=>setShowDetails(false)} className="text-red-600">✕</button>
                </div>

                <div className="space-y-2">
                  <p><b>Title:</b> {selectedProperty.title}</p>
                  <p><b>Address:</b> {selectedProperty.address}</p>
                  <p><b>City:</b> {selectedProperty.city}</p>
                  <p><b>State:</b> {selectedProperty.state}</p>
                  <p><b>Type:</b> {selectedProperty.propertyType}</p>
                  <p><b>Owner:</b> {selectedProperty.ownerName}</p>
                  <p><b>Price:</b> {selectedProperty.price}</p>
                  <p><b>Area:</b> {selectedProperty.area}</p>
                  <p><b>Status:</b> {selectedProperty.verificationStatus}</p>
                  <p><b>Score:</b> {selectedProperty.verificationScore}</p>
                  <hr className="my-4" />

                  <h3 className="text-lg font-semibold">Land Registry</h3>

                  <p><b>Registry Number:</b> {selectedProperty.landRegistry?.registryNumber || "N/A"}</p>

                  <p><b>Status:</b> {selectedProperty.landRegistry?.registryStatus || "N/A"}</p>

                  <p><b>Registry Office:</b> {selectedProperty.landRegistry?.registryOffice || "N/A"}</p>

                  <p><b>Title Verified:</b>
                  {" "}
                  {selectedProperty.landRegistry?.titleVerified !== undefined
                    ? String(selectedProperty.landRegistry.titleVerified)
                    : "N/A"}
                  </p>

                  <p><b>Last Updated:</b>
                  {" "}
                  {selectedProperty.landRegistry?.lastUpdated || "N/A"}
                  </p>

                  <hr className="my-4" />

                  <h3 className="text-lg font-semibold">Ownership Records</h3>

                  <p><b>Owner Verified:</b>
                  {" "}
                  {selectedProperty.ownership?.ownerVerified !== undefined
                    ? String(selectedProperty.ownership.ownerVerified)
                    : "N/A"}
                  </p>

                  <p><b>Ownership Type:</b>
                  {" "}
                  {selectedProperty.ownership?.ownershipType || "N/A"}
                  </p>

                  <p><b>Ownership Since:</b>
                  {" "}
                  {selectedProperty.ownership?.ownershipSince || "N/A"}
                  </p>

                  <p><b>Remarks:</b>
                  {" "}
                  {selectedProperty.ownership?.remarks || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
