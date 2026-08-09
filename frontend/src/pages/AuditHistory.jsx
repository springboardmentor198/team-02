// pages/AuditHistory.jsx
//
// Task 7 — Audit Logging & Report History. Built to match the existing
// "Diligence Ledger" visual language exactly (Sidebar + TopHeader shell,
// parchment background, navy/gold/sage palette, font-serif headings,
// rounded-2xl white cards) rather than the lighter Navbar/react-icons style
// — see Sidebar.jsx / Dashboard.jsx for the established pattern this page
// follows.
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  XCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatCard from "../components/risk/StatCard";
import ToastStack from "../components/Toast";
import { useToast } from "../hooks/useToast";
import AuditLogsSection from "../components/audit/AuditLogsSection";
import ReportHistorySection from "../components/audit/ReportHistorySection";
import { getAuditLogStats, getReportHistoryStats } from "../services/api";

const TABS = [
  { key: "activity", label: "Activity Logs" },
  { key: "reports", label: "Report History" },
];

function AuditHistory() {
  const [activeTab, setActiveTab] = useState("activity");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reportNumberPreset, setReportNumberPreset] = useState(null);

  const { toasts, showToast, dismissToast } = useToast();

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const [auditStats, reportStats] = await Promise.all([
        getAuditLogStats(),
        getReportHistoryStats(),
      ]);
      setStats({ ...auditStats, ...reportStats });
    } catch (e) {
      console.error("Failed to load audit/report stats:", e);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleViewAuditTrail = (reportNumber) => {
    setReportNumberPreset(reportNumber || "");
    setActiveTab("activity");
  };

  const statCards = [
    {
      key: "total",
      icon: Activity,
      label: "TOTAL ACTIVITIES",
      value: stats?.totalActivities,
      accent: "#3E63C2",
    },
    {
      key: "success",
      icon: CheckCircle2,
      label: "SUCCESSFUL ACTIONS",
      value: stats?.successfulActions,
      accent: "#4D7B73",
    },
    {
      key: "failed",
      icon: XCircle,
      label: "FAILED ATTEMPTS",
      value: stats?.failedAttempts,
      accent: "#B45B46",
    },
    {
      key: "reports",
      icon: FileText,
      label: "TOTAL REPORTS",
      value: stats?.totalReports,
      accent: "#C89546",
    },
    {
      key: "completed",
      icon: ClipboardCheck,
      label: "COMPLETED REPORTS",
      value: stats?.completedReports,
      accent: "#4D7B73",
    },
    {
      key: "today",
      icon: CalendarClock,
      label: "TODAY'S ACTIVITY",
      value: stats?.todayActivity,
      accent: "#3E63C2",
    },
  ];

  return (
    <div className="h-screen flex bg-[#EFEAE0] overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[220px] h-screen flex flex-col overflow-hidden">
        <div className="shrink-0">
          <TopHeader placeholder="Search by user, report number, or property..." />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-10 py-8">
            <p className="text-[11px] uppercase tracking-[2px] text-gray-500 font-medium">
              Diligence Ledger &nbsp;/&nbsp; Audit &amp; History
            </p>
            <h1 className="font-serif text-[38px] text-[#1B2338] leading-tight mt-2">
              Audit &amp; History
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Every login, property change, report generation, and download —
              tracked and searchable.
            </p>

            {/* Statistics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mt-8">
              {statCards.map((s) => (
                <StatCard
                  key={s.key}
                  icon={s.icon}
                  label={s.label}
                  value={statsLoading ? "—" : (s.value ?? 0).toLocaleString()}
                  accent={s.accent}
                />
              ))}
            </div>

            {/* Tab bar */}
            <div className="bg-white border border-[#E3DDCE] rounded-t-2xl px-6 mt-8">
              <div className="flex gap-6 overflow-x-auto">
                {TABS.map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative flex items-center gap-2 py-4 text-sm font-medium whitespace-nowrap transition ${
                        active ? "text-[#1B2338]" : "text-gray-400 hover:text-[#1B2338]"
                      }`}
                    >
                      {tab.label}
                      {active && (
                        <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#C89546] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            <div className="bg-white border border-t-0 border-[#E3DDCE] rounded-b-2xl overflow-hidden">
              {activeTab === "activity" ? (
                <AuditLogsSection
                  reportNumberPreset={reportNumberPreset}
                  onConsumePreset={() => setReportNumberPreset(null)}
                  showToast={showToast}
                />
              ) : (
                <ReportHistorySection
                  onViewAuditTrail={handleViewAuditTrail}
                  showToast={showToast}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default AuditHistory;
