// pages/DueDiligenceReport.jsx
//
// Task 4: Due Diligence Report Generation. GET /api/reports/{propertyId}
// regenerates the report live (no separate "create" step exists on the
// backend), so this page is simply that call keyed by the :propertyId
// route param, rendered through the same hero/section-card/skeleton
// vocabulary as RiskAssessment.jsx. Property verification status (not on
// the report DTO) comes from a parallel getPropertySummary call.
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  DollarSign,
  Droplets,
  Gavel,
  Landmark,
  MapPin,
  Ruler,
  Scale,
  ScrollText,
  ShieldCheck,
  User,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import ReportHero from "../components/report/ReportHero";
import ReportSectionCard from "../components/report/ReportSectionCard";
import ReportSkeleton from "../components/report/ReportSkeleton";
import ReportErrorState from "../components/report/ReportErrorState";
import RecommendationPanel from "../components/risk/RecommendationPanel";
import StatusBadge from "../components/StatusBadge";
import { getPropertySummary, getReport } from "../services/api";
import { formatArea, formatCurrency } from "../utils/format";

function DueDiligenceReport() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportData, propertyData] = await Promise.allSettled([
        getReport(propertyId),
        getPropertySummary(propertyId),
      ]);

      if (reportData.status === "fulfilled") {
        setReport(reportData.value);
      } else {
        throw reportData.reason;
      }
      setProperty(propertyData.status === "fulfilled" ? propertyData.value : null);
    } catch (err) {
      console.error("Failed to load due diligence report:", err);
      setError(
        err?.response?.status === 404
          ? "No property found for this ID."
          : "Something went wrong generating this report."
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="h-screen flex bg-[#EFEAE0] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[220px] h-screen flex flex-col overflow-hidden">
        <div className="shrink-0">
          <TopHeader />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 sm:px-9 py-8 max-w-[1200px] w-full mx-auto">
            {loading ? (
              <ReportSkeleton />
            ) : error ? (
              <ReportErrorState message={error} onRetry={load} />
            ) : (
              <div className="space-y-6">
              <ReportHero
                report={report}
                property={property}
                propertyId={propertyId}
                onBack={() => navigate(-1)}
              />

              <ReportSectionCard
                icon={Building2}
                title="Property Details"
                badge={property && <StatusBadge status={property.verificationStatus} />}
                columns={3}
                fields={[
                  { icon: Building2, label: "Property Type", value: report.propertyType },
                  { icon: MapPin, label: "Address", value: report.address },
                  { icon: MapPin, label: "City", value: report.city },
                  { icon: MapPin, label: "State", value: report.state },
                  { icon: Ruler, label: "Area", value: report.area ? formatArea(report.area) : null },
                  { icon: DollarSign, label: "Price", value: report.price ? formatCurrency(report.price) : null },
                ]}
              />

              <ReportSectionCard
                icon={User}
                title="Ownership"
                columns={3}
                fields={[
                  { icon: User, label: "Owner Name", value: report.ownerName },
                  {
                    icon: ShieldCheck,
                    label: "Owner Verified",
                    value:
                      report.ownerVerified === true
                        ? "Verified"
                        : report.ownerVerified === false
                        ? "Not Verified"
                        : null,
                  },
                  { icon: Landmark, label: "Ownership Type", value: report.ownershipType },
                  { icon: ScrollText, label: "Remarks", value: report.ownershipRemarks },
                ]}
              />

              <ReportSectionCard
                icon={Gavel}
                title="Legal Records"
                columns={3}
                fields={[
                  { icon: Gavel, label: "Court Cases", value: report.courtCases },
                  { icon: Scale, label: "Case Status", value: report.caseStatus },
                  { icon: ScrollText, label: "Legal Remarks", value: report.legalRemarks },
                ]}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <ReportSectionCard
                  icon={Droplets}
                  title="Flood Zone"
                  columns={1}
                  fields={[{ icon: Droplets, label: "Flood Risk Level", value: report.floodRiskLevel }]}
                />
                <ReportSectionCard
                  icon={Landmark}
                  title="Tax History"
                  columns={1}
                  fields={[{ icon: Landmark, label: "Latest Tax Status", value: report.latestTaxStatus }]}
                />
                <ReportSectionCard
                  icon={Scale}
                  title="Zoning"
                  columns={1}
                  fields={[
                    { icon: Scale, label: "Zone Type", value: report.zoneType },
                    { icon: ShieldCheck, label: "Construction Allowed", value: report.constructionAllowed },
                  ]}
                />
              </div>

              <RecommendationPanel recommendation={report.recommendation} riskLevel={report.riskLevel} />
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DueDiligenceReport;
