// pages/ComparableAnalysis.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, DollarSign, Layers } from "lucide-react";

import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import { getAllProperties, getComparableAnalysis } from "../services/api";

import StatCard from "../components/risk/StatCard";
import ErrorState from "../components/risk/ErrorState";
import ComparableHero from "../components/comparable/ComparableHero";
import PropertySummaryCard from "../components/comparable/PropertySummaryCard";
import ComparablePropertyCard from "../components/comparable/ComparablePropertyCard";
import ComparableSkeleton from "../components/comparable/ComparableSkeleton";
import EmptyState from "../components/comparable/EmptyState";
import NoComparablesFound from "../components/comparable/NoComparablesFound";
import { formatCurrency } from "../utils/format";

function ComparableAnalysis() {
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

  const runAnalysis = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    setStarted(true);
    try {
      const res = await getComparableAnalysis(id);
      setData(res);
    } catch (e) {
      console.error("Comparable Analysis Error:", e);
      setData(null);
      setError(
        e?.response?.data?.message ||
          e?.response?.data ||
          "Couldn't load comparable properties. Is the backend running on port 8080?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = searchParams.get("propertyId");
    if (initial) runAnalysis(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (id) => {
    setPropertyId(id);
    setSearchParams({ propertyId: id });
    runAnalysis(id);
  };

  const comparables = data?.comparableProperties || [];

  return (
    <div className="h-screen flex bg-[#EFEAE0] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[220px] h-screen flex flex-col overflow-hidden">
        <div className="shrink-0">
          <TopHeader placeholder="Search by address, parcel ID, or owner..." />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-10 py-8 max-w-[1200px] mx-auto space-y-6">
            <ComparableHero
              properties={properties}
              propertiesLoading={propertiesLoading}
              propertyId={propertyId}
              onSelect={handleSelect}
              onBack={() => navigate("/dashboard")}
            />

            {loading && <ComparableSkeleton />}

            {!loading && error && (
              <ErrorState message={error} onRetry={() => runAnalysis(propertyId)} />
            )}

            {!loading && !error && !started && <EmptyState />}

            {!loading && !error && data && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">

                <PropertySummaryCard data={data} />

                <div className="flex flex-col gap-5 h-full">

                  <StatCard
                    icon={DollarSign}
                    label="Avg. Comparable Price"
                    value={formatCurrency(data.averageComparablePrice)}
                    accent="#3E63C2"
                    className="flex-1"
                  />

                  <StatCard
                    icon={BarChart3}
                    label="Avg. Price / Sq Ft"
                    value={formatCurrency(data.averagePricePerSqFt)}
                    accent="#C89546"
                    className="flex-1"
                  />

                </div>

              </div>

                <div className="bg-white border border-[#E3DDCE] rounded-2xl p-7">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[11px] uppercase tracking-[1.5px] text-gray-400 font-medium">
                      Comparable Properties
                    </p>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Layers size={12} />
                      {data.totalComparables ?? comparables.length} found
                    </span>
                  </div>

                  {comparables.length === 0 ? (
                    <NoComparablesFound />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {comparables.map((property) => (
                        <ComparablePropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ComparableAnalysis;
