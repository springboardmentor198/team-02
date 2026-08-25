// pages/ValuationComparison.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import { getAllProperties, getValuationComparison } from "../services/api";

import ErrorState from "../components/risk/ErrorState";
import ValuationHero from "../components/valuation/ValuationHero";
import ValuationSummaryCard from "../components/valuation/ValuationSummaryCard";
import DifferenceCard from "../components/valuation/DifferenceCard";
import StatusCard from "../components/valuation/StatusCard";
import RecommendationPanel from "../components/valuation/RecommendationPanel";
import ValuationSkeleton from "../components/valuation/ValuationSkeleton";
import EmptyState from "../components/valuation/EmptyState";
import { getValuationConfig } from "../components/valuation/valuationConfig";

function ValuationComparison({ embedded = false } = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const [propertyId, setPropertyId] = useState(searchParams.get("propertyId") || "");
  const [data, setData] = useState(null);

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

  const runValuation = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    setStarted(true);
    try {
      const res = await getValuationComparison(id);
      setData(res);
    } catch (e) {
      console.error("Valuation Comparison Error:", e);
      setData(null);
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          "Couldn't load a valuation for that property. Is the backend running on port 8080?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = searchParams.get("propertyId");
    if (initial) runValuation(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (id) => {
    setPropertyId(id);
    setSearchParams({ propertyId: id });
    runValuation(id);
  };

  const cfg = data ? getValuationConfig(data.valuationStatus) : null;

  const body = (
    <div className="px-10 py-8 max-w-[1200px] mx-auto space-y-6">
            <ValuationHero
              properties={properties}
              propertiesLoading={propertiesLoading}
              propertyId={propertyId}
              onSelect={handleSelect}
              onBack={() => navigate("/dashboard")}
              result={data}
            />

            {loading && <ValuationSkeleton />}

            {!loading && error && (
              <ErrorState message={error} onRetry={() => runValuation(propertyId)} />
            )}

            {!loading && !error && !started && <EmptyState />}

            {!loading && !error && data && cfg && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

  <div className="lg:col-span-3">
    <ValuationSummaryCard data={data} />
  </div>

  <StatusCard status={data.valuationStatus} />

</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <DifferenceCard
                    priceDifference={data.priceDifference}
                    percentageDifference={data.percentageDifference}
                    color={cfg.color}
                  />
                  <div
                    className="bg-white border border-[#E3DDCE] rounded-lg p-6 flex flex-col justify-center"
                    style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                  >
                    <p className="text-[11px] uppercase tracking-[2px] mb-2" style={{ color: cfg.color }}>
                      Percentage Difference
                    </p>
                    <h2 className="text-[28px] tabular-nums" style={{ color: cfg.color }}>
                      {data.percentageDifference != null
                        ? `${Number(data.percentageDifference) > 0 ? "+" : ""}${Number(
                            data.percentageDifference
                          ).toFixed(1)}%`
                        : "—"}
                    </h2>
                    <p className="text-[12.5px] mt-1" style={{ color: cfg.color }}>
                      vs. estimated market value
                    </p>
                  </div>
                </div>

                <RecommendationPanel status={data.valuationStatus} />
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

export default ValuationComparison;
