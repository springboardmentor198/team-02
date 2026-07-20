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

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Backend: PropertyController.getAllProperties / getStats
        // Both are scoped server-side to the logged-in user (findByUser).
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

  const verifiedCount = properties.filter((p) => p.verificationStatus === "Verified").length;
  const pendingCount = properties.filter((p) => p.verificationStatus === "Pending").length;
  const needsReviewCount = properties.filter((p) => p.verificationStatus === "Needs Review").length;
  const avgScore = properties.length
    ? Math.round(
        properties.reduce((sum, p) => sum + (p.verificationScore || 0), 0) / properties.length
      )
    : 0;

  const summaryCards = [
    { title: "PROPERTIES TRACKED", value: properties.length },
    { title: "AVG VERIFICATION SCORE", value: `${avgScore}/100` },
    { title: "VERIFIED", value: verifiedCount },
    { title: "PENDING REVIEW", value: pendingCount + needsReviewCount },
  ];

  const typeEntries = Object.entries(stats);
  const typeTotal = typeEntries.reduce((sum, [, count]) => sum + count, 0) || 1;
  const typeColors = ["#4D7B73", "#C89546", "#B45B46", "#3E63C2", "#8E6C9C"];

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />
        <div className="px-10 py-8">
          <h1 className="font-serif text-[44px] text-[#1B2338] leading-tight">
            Good morning, {username}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "Loading your properties…" : `${properties.length} properties tracked`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-md px-4 py-3 mt-5">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-5 mt-8">
            {summaryCards.map((s) => (
              <div
                key={s.title}
                className="bg-white border border-[#E3DDCE] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <p className="text-[11px] uppercase tracking-[2px] text-gray-500">{s.title}</p>
                <h2 className="text-[34px] mt-5 text-[#1B2338]">{loading ? "—" : s.value}</h2>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5 mt-8">
            <div className="col-span-2 bg-white border border-[#E3DDCE] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#1B2338]">Recent Properties</h2>
                <Link to="/add-property" className="text-sm text-[#3E63C2] font-medium hover:underline">
                  + Add property
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
              ) : properties.length === 0 ? (
                <div className="text-center py-16 text-gray-500 text-sm">
                  No properties yet.{" "}
                  <Link to="/add-property" className="text-[#3E63C2] hover:underline">
                    Add your first property
                  </Link>{" "}
                  to start tracking it here.
                </div>
              ) : (
                properties.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center border-b border-[#F0EBE0] py-3.5 last:border-0"
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-[#1B2338]">{p.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.city}, {p.state} · {p.propertyType}
                      </p>
                    </div>
                    <StatusBadge status={p.verificationStatus} />
                  </div>
                ))
              )}
            </div>

            <div className="bg-white border border-[#E3DDCE] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="text-xl font-semibold mb-6 text-[#1B2338]">Property Type Mix</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
              ) : typeEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No data yet — add a property to see the breakdown.
                </div>
              ) : (
                typeEntries.map(([type, count], i) => {
                  const pct = Math.round((count / typeTotal) * 100);
                  return (
                    <div key={type} className="mb-5">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full mt-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: typeColors[i % typeColors.length] }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
