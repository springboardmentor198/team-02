// pages/AnalyticsWorkspace.jsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, BarChart3, TrendingUp } from "lucide-react";

import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import RiskAssessment from "./RiskAssessment";
import ComparableAnalysis from "./ComparableAnalysis";
import ValuationComparison from "./ValuationComparison";

// Analytics / Property Intelligence workspace.
// Risk Assessment + Comparable Property Analysis +
// Property Valuation Comparison are displayed as tabs.
const TABS = [
  {
    key: "risk",
    label: "Risk",
    icon: ShieldAlert,
    Component: RiskAssessment,
  },
  {
    key: "comparables",
    label: "Comparables",
    icon: BarChart3,
    Component: ComparableAnalysis,
  },
  {
    key: "valuation",
    label: "Valuation",
    icon: TrendingUp,
    Component: ValuationComparison,
  },
];

function AnalyticsWorkspace() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = TABS.some((t) => t.key === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "risk";

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (key) => {
    setActiveTab(key);

    const params = Object.fromEntries(searchParams);

    setSearchParams({
      ...params,
      tab: key,
    });
  };

  const ActiveComponent = TABS.find(
    (t) => t.key === activeTab
  )?.Component;

  return (
    <div className="min-h-screen flex bg-[#EFEAE0]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main page content */}
      <main className="flex-1 ml-[220px] min-h-screen">
        {/* Top header */}
        <TopHeader
          placeholder="Search by address, parcel ID, or owner..."
        />

        {/* Analytics heading + tabs */}
        <div className="px-10 pt-6 bg-gradient-to-b from-[#EFEAE0] to-[#EFEAE0]/60">
          <div className="mb-1">
            <h1 className="font-serif text-[24px] text-[#1B2338]">
              Analytics &amp; Property Intelligence
            </h1>

            <p className="text-sm text-gray-500 mt-0.5">
              Risk, comparables, and valuation — in one workspace.
            </p>
          </div>

          {/* Segmented control */}
          <div className="mt-5 inline-flex p-1 rounded-xl bg-white/70 backdrop-blur-md border border-[#E3DDCE] shadow-sm">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12.5px] font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-[#1B2338]/70 hover:text-[#1B2338]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="analyticsTabPill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#1B2338] to-[#2B3450]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}

                  <tab.icon
                    size={14}
                    className="relative z-10"
                  />

                  <span className="relative z-10">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 
          Main Analytics content.

          IMPORTANT:
          There is intentionally NO overflow-y-auto here.
          The entire browser page now scrolls naturally, including:
          - Analytics heading
          - Tabs
          - Property selector
          - Risk section
          - Analytics cards
          - Remaining content
        */}
        <div className="px-10 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {ActiveComponent && (
                <ActiveComponent embedded />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsWorkspace;