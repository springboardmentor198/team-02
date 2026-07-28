import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  FaLeaf,
  FaArrowLeft,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaTint,
  FaBiohazard,
  FaSkull,
  FaSmog,
  FaWater,
  FaRadiation,
} from "react-icons/fa";

function EnvironmentalRecords() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const [records] = useState([
    {
      id: 1,
      recordType: "SOIL_CONTAMINATION",
      description: "Adjacent lot flagged for legacy soil testing - historic industrial activity",
      status: "UNDER_REVIEW",
      severity: "MEDIUM",
      agency: "EPA Region 4",
      reportDate: "2011-05-20",
      resolutionDate: null,
      distanceFromProperty: 50.0,
      source: "EPA Envirofacts API",
    },
    {
      id: 2,
      recordType: "UNDERGROUND_TANK",
      description: "Historic underground fuel tank removed in 2005 - site remediated",
      status: "RESOLVED",
      severity: "LOW",
      agency: "Florida DEP",
      reportDate: "2005-03-15",
      resolutionDate: "2005-08-20",
      distanceFromProperty: 0.0,
      source: "Florida DEP API",
    },
    {
      id: 3,
      recordType: "AIR_QUALITY",
      description: "Nearby industrial facility monitored for air emissions",
      status: "MONITORING",
      severity: "LOW",
      agency: "EPA",
      reportDate: "2020-01-10",
      resolutionDate: null,
      distanceFromProperty: 500.0,
      source: "EPA Air Quality API",
    },
    {
      id: 4,
      recordType: "WATER_CONTAMINATION",
      description: "Groundwater testing showed minor contaminant levels within safe limits",
      status: "MONITORING",
      severity: "MEDIUM",
      agency: "Florida DEP",
      reportDate: "2019-06-15",
      resolutionDate: null,
      distanceFromProperty: 200.0,
      source: "Florida DEP API",
    },
  ]);

  const getRecordIcon = (type) => {
    switch (type) {
      case "SOIL_CONTAMINATION":
        return <FaBiohazard className="text-orange-500" />;
      case "UNDERGROUND_TANK":
        return <FaTint className="text-blue-500" />;
      case "AIR_QUALITY":
        return <FaSmog className="text-gray-500" />;
      case "WATER_CONTAMINATION":
        return <FaWater className="text-blue-600" />;
      case "SUPERFUND":
        return <FaSkull className="text-red-600" />;
      case "HAZMAT":
        return <FaRadiation className="text-yellow-500" />;
      default:
        return <FaLeaf className="text-green-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-500",
          icon: <FaTimesCircle />,
        };
      case "HIGH":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-500",
          icon: <FaExclamationTriangle />,
        };
      case "MEDIUM":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-500",
          icon: <FaExclamationTriangle />,
        };
      case "LOW":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-500",
          icon: <FaCheckCircle />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          border: "border-slate-500",
          icon: <FaLeaf />,
        };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return { bg: "bg-emerald-100", text: "text-emerald-700" };
      case "ACTIVE":
        return { bg: "bg-red-100", text: "text-red-700" };
      case "UNDER_REVIEW":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "MONITORING":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      default:
        return { bg: "bg-slate-100", text: "text-slate-700" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Ongoing";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Environmental data refreshed successfully!");
    }, 1500);
  };

  const filteredRecords =
    filter === "ALL"
      ? records
      : records.filter((r) => r.severity === filter);

  const totalRecords = records.length;
  const criticalCount = records.filter((r) => r.severity === "CRITICAL").length;
  const highCount = records.filter((r) => r.severity === "HIGH").length;
  const resolvedCount = records.filter((r) => r.status === "RESOLVED").length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-8">

          <button
            onClick={() => navigate("/due-diligence")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-semibold"
          >
            <FaArrowLeft />
            Back to Due Diligence
          </button>

          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">

            <div className="flex justify-between items-start">

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaLeaf className="text-4xl text-emerald-600" />
                  <h1 className="text-4xl font-bold text-slate-800">
                    Environmental Records
                  </h1>
                </div>

                <p className="text-slate-500 mt-2">
                  Environmental hazard records for 402 Riverside Commons, Tampa FL
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition disabled:opacity-50"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>

            </div>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaLeaf className="text-emerald-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {totalRecords}
              </h2>
              <p className="text-slate-500">Total Records</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
              <FaTimesCircle className="text-red-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {criticalCount}
              </h2>
              <p className="text-slate-500">Critical Issues</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
              <FaExclamationTriangle className="text-orange-500" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {highCount}
              </h2>
              <p className="text-slate-500">High Priority</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-emerald-500">
              <FaCheckCircle className="text-emerald-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {resolvedCount}
              </h2>
              <p className="text-slate-500">Resolved</p>
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">

            <div className="flex gap-2 flex-wrap">

              <span className="text-slate-500 font-semibold px-3 py-2">
                Filter by Severity:
              </span>

              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilter(sev)}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    filter === sev
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}

            </div>

          </div>

          <div className="space-y-6">

            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <FaLeaf className="text-6xl text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  No environmental records found for this filter.
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const severityBadge = getSeverityBadge(record.severity);
                const statusBadge = getStatusBadge(record.status);

                return (
                  <div
                    key={record.id}
                    className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition border-l-4 ${severityBadge.border}`}
                  >

                    <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">

                      <div className="flex items-center gap-4">

                        <div className="text-5xl">
                          {getRecordIcon(record.recordType)}
                        </div>

                        <div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-800">
                              {record.recordType.replace(/_/g, " ")}
                            </h3>

                            <span
                              className={`${severityBadge.bg} ${severityBadge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
                            >
                              {severityBadge.icon}
                              {record.severity} SEVERITY
                            </span>

                            <span
                              className={`${statusBadge.bg} ${statusBadge.text} px-3 py-1 rounded-full text-xs font-semibold`}
                            >
                              {record.status.replace(/_/g, " ")}
                            </span>

                          </div>

                          <p className="text-slate-500 text-sm mt-2">
                            Reported by {record.agency}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mb-5">
                      <p className="text-xs text-slate-400 uppercase mb-2">
                        Description
                      </p>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {record.description}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-5">

                      <div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                          <FaCalendarAlt />
                          Report Date
                        </div>
                        <p className="text-slate-800 font-semibold">
                          {formatDate(record.reportDate)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                          <FaCheckCircle />
                          Resolution Date
                        </div>
                        <p className="text-slate-800 font-semibold">
                          {formatDate(record.resolutionDate)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                          <FaMapMarkerAlt />
                          Distance from Property
                        </div>
                        <p className="text-slate-800 font-semibold">
                          {record.distanceFromProperty === 0
                            ? "On Property"
                            : `${record.distanceFromProperty}m away`}
                        </p>
                      </div>

                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                      <FaBuilding className="text-slate-500 text-2xl" />
                      <div>
                        <p className="text-xs text-slate-400 uppercase">
                          Reporting Agency
                        </p>
                        <p className="text-slate-700 font-semibold">
                          {record.agency}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-right">
                      <p className="text-xs text-slate-400">
                        Data Source: {record.source}
                      </p>
                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default EnvironmentalRecords;