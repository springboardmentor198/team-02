import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import { getFloodZone } from "../services/api";

// ---- Risk scale config -----------------------------------------------
// Colors are deliberately more muted / editorial than default Tailwind
// red/yellow/green so the report reads as an official document rather
// than a status widget.
const RISK_CONFIG = {
  HIGH: {
    label: "High Risk",
    color: "#B3402F",
    bg: "#FBEDE9",
    border: "#EFD3CB",
    needle: { x: 246.6, y: 120 },
  },
  MEDIUM: {
    label: "Moderate Risk",
    color: "#A8752C",
    bg: "#FBF3E4",
    border: "#EEDFC3",
    needle: { x: 160, y: 70 },
  },
  LOW: {
    label: "Low Risk",
    color: "#3F7657",
    bg: "#EDF5EE",
    border: "#CFE3D4",
    needle: { x: 73.4, y: 120 },
  },
};

function getRiskConfig(risk) {
  return RISK_CONFIG[(risk || "").toUpperCase()] || RISK_CONFIG.LOW;
}

// ---- Signature element: semi-circular risk gauge -----------------------
function RiskGauge({ riskLevel }) {
  const key = (riskLevel || "").toUpperCase();
  const cfg = getRiskConfig(riskLevel);

  const arcs = [
    { key: "LOW", d: "M30,170 A130,130 0 0 1 95,57.42", color: RISK_CONFIG.LOW.color },
    { key: "MEDIUM", d: "M95,57.42 A130,130 0 0 1 225,57.42", color: RISK_CONFIG.MEDIUM.color },
    { key: "HIGH", d: "M225,57.42 A130,130 0 0 1 290,170", color: RISK_CONFIG.HIGH.color },
  ];

  return (
    <svg viewBox="0 0 320 190" className="w-full max-w-[300px] mx-auto">
      {arcs.map((arc) => (
        <path
          key={arc.key}
          d={arc.d}
          fill="none"
          stroke={arc.color}
          strokeWidth={arc.key === key ? 22 : 16}
          strokeOpacity={arc.key === key ? 1 : 0.18}
          strokeLinecap="round"
        />
      ))}

      {/* tick marks at zone boundaries */}
      {[30, 95, 160, 225, 290].map((cx, i) => (
        <circle key={i} cx={cx} cy={i === 0 || i === 4 ? 170 : 57.42} r="2.5" fill="#EFEAE0" />
      ))}

      {/* needle */}
      <line
        x1="160"
        y1="170"
        x2={cfg.needle.x}
        y2={cfg.needle.y}
        stroke="#1B2338"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="160" cy="170" r="9" fill="#1B2338" />
      <circle cx="160" cy="170" r="3.5" fill="#EFEAE0" />
    </svg>
  );
}

// ---- Ledger-style label/value row --------------------------------------
function LedgerRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-dotted border-[#C9C1AC] last:border-b-0">
      <span className="text-[11px] uppercase tracking-[1.5px] text-gray-500 shrink-0">
        {label}
      </span>
      <span className="font-mono text-[15px] text-[#1B2338] font-medium text-right">
        {value}
      </span>
    </div>
  );
}

// ---- Verification stamp badge ------------------------------------------
function VerifiedStamp() {
  return (
    <div className="hidden sm:flex flex-col items-center justify-center w-[84px] h-[84px] rounded-full border-[1.5px] border-[#1B2338] text-[#1B2338] -rotate-[8deg] shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mb-0.5">
        <path
          d="M5 13l4 4L19 7"
          stroke="#1B2338"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[8px] tracking-[1.5px] font-semibold leading-tight text-center">
        VERIFIED
        <br />
        REPORT
      </span>
    </div>
  );
}

function FloodZone() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFloodZone(id);
        setData(res);
      } catch (e) {
        console.error(e);
        setError("Failed to load flood zone details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const cfg = data ? getRiskConfig(data.riskLevel) : RISK_CONFIG.LOW;
  const refNumber = `FZ-${String(id ?? "0").padStart(5, "0")}`;
  const issuedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#EFEAE0]">
      <Sidebar />
      <main className="ml-[220px]">
        <TopHeader />

        <div className="px-10 py-8 max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[2px] text-[#1B2338]/70 font-semibold">
                Property Risk Assessment Report
              </p>
              <h1 className="font-serif text-[38px] leading-tight text-[#1B2338] mt-1">
                Flood Zone Verification
              </h1>
              <p className="text-[13px] text-gray-500 mt-2 font-mono">
                Ref. {refNumber} &nbsp;Β·&nbsp; Issued {issuedDate}
              </p>
            </div>
            {!loading && !error && data && <VerifiedStamp />}
          </div>

          {loading && (
            <div className="mt-8 bg-white border border-[#E3DDCE] rounded-lg p-10 text-center text-gray-500">
              <div className="inline-block w-5 h-5 rounded-full border-2 border-[#E3DDCE] border-t-[#1B2338] animate-spin mb-3" />
              <p>Loading flood zone information...</p>
            </div>
          )}

          {error && (
            <div className="mt-8 bg-[#FBEDE9] border border-[#EFD3CB] rounded-lg p-6 text-[#B3402F]">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Gauge card */}
              <div className="relative overflow-hidden bg-white border border-[#E3DDCE] rounded-xl mt-8 px-8 pt-8 pb-6">
                {/* subtle contour-line texture, echoes topographic flood maps */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 400 160"
                >
                  <path d="M-10,40 Q100,10 200,40 T410,40" stroke="#1B2338" fill="none" strokeWidth="1.5" />
                  <path d="M-10,70 Q100,45 200,70 T410,70" stroke="#1B2338" fill="none" strokeWidth="1.5" />
                  <path d="M-10,100 Q100,80 200,100 T410,100" stroke="#1B2338" fill="none" strokeWidth="1.5" />
                  <path d="M-10,130 Q100,115 200,130 T410,130" stroke="#1B2338" fill="none" strokeWidth="1.5" />
                </svg>

                <RiskGauge riskLevel={data.riskLevel} />

                <div className="text-center -mt-2">
                  <p
                    className="text-[26px] font-bold tracking-tight"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Flood Zone <span className="font-mono font-medium text-[#1B2338]">{data.floodZone}</span>
                  </p>
                </div>
              </div>

              {/* Recommendation banner */}
              <div
                className="flex items-center gap-3 rounded-lg border mt-4 px-5 py-3.5"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm font-semibold">
                  {data.insuranceRequired ? "Flood Insurance Recommended" : "Low Flood Risk β€” No Action Required"}
                </p>
              </div>

              {/* Ledger detail panel */}
              <div className="bg-white border border-[#E3DDCE] rounded-xl mt-6 p-7">
                <p className="text-[11px] uppercase tracking-[1.5px] text-gray-500 font-semibold mb-1">
                  Assessment Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                  <div>
                    <LedgerRow label="Flood Zone" value={data.floodZone} />
                    <LedgerRow label="Insurance Required" value={data.insuranceRequired ? "Yes" : "No"} />
                  </div>
                  <div>
                    <LedgerRow label="Nearest Water Body" value={data.nearestWaterBody} />
                    <LedgerRow label="Distance From Water" value={`${data.distanceFromWater} m`} />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-white border border-[#E3DDCE] rounded-xl p-7 mt-6">
                <p className="text-[11px] uppercase tracking-[1.5px] text-gray-500 font-semibold">
                  Surveyor's Notes
                </p>
                <p className="mt-3 font-serif text-[17px] text-[#1B2338] leading-7">
                  {data.remarks}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8 pb-4">
                <button
                  onClick={() => navigate("/property-search")}
                  className="h-10 px-6 rounded-full bg-[#1B2338] text-white text-sm font-medium hover:bg-[#2B3450] transition-colors"
                >
                  ← Back to Property Search
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 h-10 px-6 rounded-full border border-[#E3DDCE] text-sm font-medium text-[#1B2338] hover:bg-[#F7F4EC] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0014.9 2.5M19.5 9A8 8 0 004.6 6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default FloodZone;
