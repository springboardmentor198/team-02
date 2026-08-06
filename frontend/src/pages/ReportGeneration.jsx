import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  FaFileAlt,
  FaFilePdf,
  FaFileExcel,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCog,
  FaEye,
  FaChartBar,
  FaSpinner,
  FaCalendarAlt,
  FaBuilding,
  FaClipboardList,
} from "react-icons/fa";

function ReportGeneration() {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState("");
  const [reportType, setReportType] = useState("FULL");
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [sections, setSections] = useState({
    ownership: true,
    taxHistory: true,
    permits: true,
    zoning: true,
    floodZone: true,
    environmental: true,
    comparables: true,
    riskAssessment: true,
  });

  const properties = [
    { id: 1, address: "402 Riverside Commons, Tampa FL", parcelId: "TF-0871" },
    { id: 2, address: "390 Riverside Commons, Tampa FL", parcelId: "TF-0872" },
    { id: 3, address: "55 Bayshore Ave, Tampa FL", parcelId: "TF-0873" },
    { id: 4, address: "18 Dockside Row, Tampa FL", parcelId: "TF-0874" },
  ];

  const [recentReports] = useState([
    {
      id: 1,
      reportNumber: "RPT-2026-001",
      property: "402 Riverside Commons",
      type: "FULL",
      status: "COMPLETED",
      generatedDate: "06 Aug 2026",
      riskScore: 72,
    },
    {
      id: 2,
      reportNumber: "RPT-2026-002",
      property: "55 Bayshore Ave",
      type: "SUMMARY",
      status: "COMPLETED",
      generatedDate: "05 Aug 2026",
      riskScore: 45,
    },
    {
      id: 3,
      reportNumber: "RPT-2026-003",
      property: "18 Dockside Row",
      type: "FULL",
      status: "PROCESSING",
      generatedDate: "04 Aug 2026",
      riskScore: null,
    },
    {
      id: 4,
      reportNumber: "RPT-2026-004",
      property: "390 Riverside Commons",
      type: "CUSTOM",
      status: "FAILED",
      generatedDate: "03 Aug 2026",
      riskScore: null,
    },
  ]);

  const handleSectionChange = (section) => {
    setSections({ ...sections, [section]: !sections[section] });
  };

  const handleGenerate = () => {
    if (!selectedProperty) {
      alert("Please select a property first!");
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setShowPreview(true);
      alert("Report generated successfully!");
    }, 3000);
  };

  const handleDownloadPDF = () => {
    alert("PDF Download - Will connect to backend API");
  };

  const handleExportExcel = () => {
    alert("Excel Export - Will connect to backend API");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: <FaCheckCircle />,
        };
      case "PROCESSING":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <FaSpinner className="animate-spin" />,
        };
      case "FAILED":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <FaTimesCircle />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          icon: <FaClock />,
        };
    }
  };

  const getRiskColor = (score) => {
    if (score === null) return "text-slate-400";
    if (score < 40) return "text-emerald-600";
    if (score < 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-8">

          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">

            <div className="flex items-center gap-3 mb-2">
              <FaFileAlt className="text-4xl text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-800">
                Report Generation
              </h1>
            </div>

            <p className="text-slate-500 mt-2">
              Generate comprehensive due diligence reports for any property
            </p>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaFileAlt className="text-blue-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {recentReports.length}
              </h2>
              <p className="text-slate-500">Total Reports</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaCheckCircle className="text-emerald-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {recentReports.filter((r) => r.status === "COMPLETED").length}
              </h2>
              <p className="text-slate-500">Completed</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaSpinner className="text-yellow-500" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {recentReports.filter((r) => r.status === "PROCESSING").length}
              </h2>
              <p className="text-slate-500">Processing</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaTimesCircle className="text-red-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {recentReports.filter((r) => r.status === "FAILED").length}
              </h2>
              <p className="text-slate-500">Failed</p>
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-6">

              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FaCog className="text-blue-600" />
                Configure Report
              </h2>

              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-2">
                  Select Property
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a property --</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address} ({p.parcelId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-3">
                  Report Type
                </label>

                <div className="grid grid-cols-3 gap-3">

                  <div
                    onClick={() => setReportType("FULL")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      reportType === "FULL"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <FaFileAlt className="text-blue-600 text-2xl mb-2" />
                    <p className="font-bold text-slate-800">Full Report</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Complete analysis
                    </p>
                  </div>

                  <div
                    onClick={() => setReportType("SUMMARY")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      reportType === "SUMMARY"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <FaClipboardList className="text-emerald-600 text-2xl mb-2" />
                    <p className="font-bold text-slate-800">Summary</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Key highlights only
                    </p>
                  </div>

                  <div
                    onClick={() => setReportType("CUSTOM")}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      reportType === "CUSTOM"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <FaCog className="text-orange-500 text-2xl mb-2" />
                    <p className="font-bold text-slate-800">Custom</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose sections
                    </p>
                  </div>

                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-3">
                  Include Sections
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {Object.keys(sections).map((section) => (
                    <label
                      key={section}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={sections[section]}
                        onChange={() => handleSectionChange(section)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-slate-700 capitalize font-medium">
                        {section.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}

                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg"
              >
                {generating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FaChartBar />
                    GENERATE REPORT
                  </>
                )}
              </button>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">

              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FaEye className="text-emerald-600" />
                Preview
              </h2>

              {!showPreview ? (
                <div className="text-center py-12">
                  <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    Configure and generate a report to see preview here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">

                  <div className="bg-slate-900 text-white rounded-xl p-4">
                    <p className="text-slate-400 text-xs uppercase">
                      Report Ready
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      RPT-2026-005
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FaBuilding className="text-blue-600" />
                      <span className="text-slate-700">
                        {properties.find((p) => p.id == selectedProperty)
                          ?.address || "Property"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-emerald-600" />
                      <span className="text-slate-700">
                        Generated: {new Date().toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FaFileAlt className="text-orange-500" />
                      <span className="text-slate-700">
                        Type: {reportType} Report
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FaClipboardList className="text-purple-600" />
                      <span className="text-slate-700">
                        {Object.values(sections).filter((v) => v).length} Sections
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <FaFilePdf />
                      Download PDF
                    </button>

                    <button
                      onClick={handleExportExcel}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <FaFileExcel />
                      Export Excel
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              Recent Reports
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-3 text-slate-600">Report #</th>
                    <th className="text-left p-3 text-slate-600">Property</th>
                    <th className="text-left p-3 text-slate-600">Type</th>
                    <th className="text-left p-3 text-slate-600">Status</th>
                    <th className="text-left p-3 text-slate-600">Risk Score</th>
                    <th className="text-left p-3 text-slate-600">Date</th>
                    <th className="text-left p-3 text-slate-600">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {recentReports.map((report) => {
                    const badge = getStatusBadge(report.status);
                    return (
                      <tr
                        key={report.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="p-3 font-semibold text-blue-600">
                          {report.reportNumber}
                        </td>
                        <td className="p-3 text-slate-700">
                          {report.property}
                        </td>
                        <td className="p-3 text-slate-700">
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">
                            {report.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}
                          >
                            {badge.icon}
                            {report.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {report.riskScore !== null ? (
                            <span
                              className={`font-bold text-lg ${getRiskColor(
                                report.riskScore
                              )}`}
                            >
                              {report.riskScore}/100
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 text-sm">
                          {report.generatedDate}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {report.status === "COMPLETED" && (
                              <>
                                <button
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                                  title="Download PDF"
                                >
                                  <FaFilePdf />
                                </button>
                                <button
                                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition"
                                  title="Export Excel"
                                >
                                  <FaFileExcel />
                                </button>
                              </>
                            )}
                            <button
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                              title="View"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ReportGeneration;