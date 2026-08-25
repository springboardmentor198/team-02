// pages/RiskAssessment.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  ClipboardCheck,
  Landmark,
  Leaf,
  Map as MapIcon,
  Scale,
  ShieldAlert,
  User,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import { generateRiskAssessment, getAllProperties, getPropertySummary } from "../services/api";

import RiskHero from "../components/risk/RiskHero";
import StatCard from "../components/risk/StatCard";
import RiskBreakdownCard from "../components/risk/RiskBreakdownCard";
import RecommendationPanel from "../components/risk/RecommendationPanel";
import PropertySummaryCard from "../components/risk/PropertySummaryCard";
import AssessmentTimeline from "../components/risk/AssessmentTimeline";
import RiskSkeleton from "../components/risk/RiskSkeleton";
import EmptyState from "../components/risk/EmptyState";
import ErrorState from "../components/risk/ErrorState";
import { RISK_LEVELS, getRiskConfig } from "../components/risk/riskConfig";

// Derives the Risk Breakdown tiles from real property sub-records
// (landRegistry / ownership / legalRecord / zoning / environmental / permit)
// — the same objects Dashboard.jsx already renders — since the risk API
// itself only returns a single total score, not a category breakdown.
function buildBreakdown(property) {
  if (!property) return [];

  const yes = (v) => String(v ?? "").trim().toUpperCase() === "YES";
  const truthy = (v) => v === true || v === "true" || v === "Verified" || v === "Yes";

  return [
    {
      icon: Landmark,
      title: "Land Registry",
      level: truthy(property.landRegistry?.titleVerified) ? RISK_LEVELS.LOW : RISK_LEVELS.HIGH,
      note: property.landRegistry?.registryStatus || "Title verification status unavailable.",
    },
    {
      icon: User,
      title: "Ownership",
      level: truthy(property.ownership?.ownerVerified) ? RISK_LEVELS.LOW : RISK_LEVELS.MEDIUM,
      note: property.ownership?.ownershipType || "Ownership record status unavailable.",
    },
    {
      icon: Scale,
      title: "Legal Records",
      level: yes(property.legalRecord?.courtCases) ? RISK_LEVELS.HIGH : RISK_LEVELS.LOW,
      note: property.legalRecord?.caseStatus || "No active case data on file.",
    },
    {
      icon: MapIcon,
      title: "Zoning",
      level: yes(property.zoning?.constructionAllowed) ? RISK_LEVELS.LOW : RISK_LEVELS.MEDIUM,
      note: property.zoning?.zoneType || "Zoning classification unavailable.",
    },
    {
      icon: ClipboardCheck,
      title: "Permit",
      level:
        String(property.permit?.permitStatus || "").toLowerCase() === "approved"
          ? RISK_LEVELS.LOW
          : RISK_LEVELS.MEDIUM,
      note: property.permit?.permitType || "Permit status unavailable.",
    },
    {
      icon: Leaf,
      title: "Environmental",
      level: RISK_LEVELS[String(property.environmental?.environmentalRisk || "").toUpperCase()] || RISK_LEVELS.MEDIUM,
      note: property.environmental?.pollutionLevel || "Environmental risk data unavailable.",
    },
  ];
}

function RiskAssessment({ embedded = false } = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [propertyId, setPropertyId] = useState(searchParams.get("propertyId") || "");
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [property, setProperty] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await getAllProperties();
        setProperties(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to load properties:", e);
        setProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    })();
  }, []);

  const runAssessment = useCallback(async (id) => {
    if (!id) {
      setError("Please select a property.");
      return;
    }
    setLoading(true);
    setError("");
    setStarted(true);
    try {
      const [riskRes, propRes] = await Promise.allSettled([
        generateRiskAssessment(id),
        getPropertySummary(id),
      ]);

      if (riskRes.status !== "fulfilled") {
        throw riskRes.reason;
      }

      setResult(riskRes.value);
      setProperty(propRes.status === "fulfilled" ? propRes.value : null);
      setGeneratedAt(new Date());
    } catch (e) {
      console.error("Risk Assessment Error:", e);
      setResult(null);
      setProperty(null);
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          "Couldn't generate a risk assessment for that property. Is the backend running on port 8080?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-run when arriving with ?propertyId= already set (e.g. deep-linked
  // from Property Search), without changing the route shape.
  useEffect(() => {
    const initial = searchParams.get("propertyId");
    if (initial) runAssessment(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cfg = result ? getRiskConfig(result.riskLevel) : null;
  const breakdown = buildBreakdown(property);
  const flaggedCount = breakdown.filter(
    (b) => b.level !== RISK_LEVELS.LOW && b.level !== RISK_LEVELS["VERY LOW"]
  ).length;

  const timelineSteps = result
    ? [
        {
          label: "Property Data Collected",
          detail: property
            ? "Land, legal, zoning & environmental records retrieved."
            : "Risk-relevant property records requested.",
          done: true,
        },
        {
          label: "Risk Score Calculated",
          detail: `Scored ${result.totalScore}/100 · classified as ${cfg.label}.`,
          done: true,
        },
        {
          label: "Recommendation Generated",
          detail: result.recommendation,
          done: true,
          timestamp: generatedAt
            ? generatedAt.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
        },
      ]
    : [];

  const body = (
    <div className="px-10 py-8 max-w-[1200px] mx-auto space-y-6">
            <RiskHero
              properties={properties}
              propertiesLoading={propertiesLoading}
              propertyId={propertyId}
              onSelectProperty={(id) => {
                setPropertyId(id);
                setSearchParams({ propertyId: id });
              }}
              onGenerate={() => runAssessment(propertyId)}
              loading={loading}
              result={result}
              onBack={() => navigate("/dashboard")}
            />

            {loading && <RiskSkeleton />}

            {!loading && error && (
              <ErrorState message={error} onRetry={() => runAssessment(propertyId)} />
            )}

            {!loading && !error && !started && <EmptyState />}

            {!loading && !error && result && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    icon={Activity}
                    label="Overall Score"
                    value={result.totalScore}
                    suffix="/ 100"
                    accent={cfg.color}
                  />
                  <StatCard
                    icon={ShieldAlert}
                    label="Risk Level"
                    value={cfg.label}
                    accent={cfg.color}
                  />
                  <StatCard
                    icon={BadgeCheck}
                    label="Verification Score"
                    value={property?.verificationScore ?? "—"}
                    suffix={property?.verificationScore != null ? "/ 100" : ""}
                    accent="#3E63C2"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    label="Categories Flagged"
                    value={flaggedCount}
                    suffix={`/ ${breakdown.length}`}
                    accent="#C89546"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                  <div className="lg:col-span-2 space-y-5">
                    <RecommendationPanel
                      recommendation={result.recommendation}
                      riskLevel={result.riskLevel}
                    />

                    <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7">
                      <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400 font-medium mb-4">
                        Risk Breakdown
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {breakdown.map((item) => (
                          <RiskBreakdownCard
                            key={item.title}
                            icon={item.icon}
                            title={item.title}
                            level={item.level}
                            note={item.note}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <PropertySummaryCard property={property} />
                    <AssessmentTimeline steps={timelineSteps} />
                  </div>
                </div>
              </>
            )}
    </div>
  );

  if (embedded) return body;

  return (
    <div className="h-screen flex bg-[#EFEAE0] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[220px] h-screen flex flex-col overflow-hidden">
        <div className="shrink-0">
          <TopHeader placeholder="Search by address, parcel ID, or owner..." />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{body}</div>
      </main>
    </div>
  );
}

export default RiskAssessment;
