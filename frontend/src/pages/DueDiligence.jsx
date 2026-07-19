import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  FaFileAlt,
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaWater,
  FaHardHat,
  FaLeaf,
  FaDownload,
  FaFileExcel,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

function DueDiligence() {

  const [property] = useState({
    parcelId: "TF-0871",
    address: "402 Riverside Commons, Tampa FL",
    listedValue: "$1.24M",
    propertyType: "Commercial",
    generatedDate: "Jul 2026",
  });

  const categories = [
    {
      id: 1,
      title: "Ownership Records",
      status: "CLEAR",
      summary: "One late payment recorded in 2022, resolved within 60 days.",
      icon: <FaFileAlt />,
    },
    {
      id: 2,
      title: "Property Tax History",
      status: "REVIEW",
      summary: "One late payment recorded in 2022, resolved within 60 days.",
      icon: <FaMoneyBillWave />,
    },
    {
      id: 3,
      title: "Zoning & Compliance",
      status: "CLEAR",
      summary: "Zoned C-2 Commercial, current use fully compliant.",
      icon: <FaMapMarkedAlt />,
    },
    {
      id: 4,
      title: "Flood Zone Status",
      status: "FLAGGED",
      summary: "FEMA Zone AE - annual flood insurance required.",
      icon: <FaWater />,
    },
    {
      id: 5,
      title: "Permit History",
      status: "CLEAR",
      summary: "All renovations since 2018 permitted and closed out.",
      icon: <FaHardHat />,
    },
    {
      id: 6,
      title: "Environmental Records",
      status: "REVIEW",
      summary: "Adjacent lot flagged for legacy soil testing, 2011.",
      icon: <FaLeaf />,
    },
  ];

  const comparables = [
    "390 Riverside Commons",
    "55 Bayshore Ave",
    "18 Dockside Row",
  ];

  const timeline = [
    {
      event: "Environmental records retrieved",
      date: "06 Jul 2026",
      time: "09:42",
    },
    {
      event: "Flood zone flagged for review",
      date: "06 Jul 2026",
      time: "09:42",
    },
    {
      event: "Tax history synced from county records",
      date: "06 Jul 2026",
      time: "09:42",
    },
  ];

  const getStatusBadge = (status) => {
    if (status === "CLEAR") {
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: <FaCheckCircle />,
      };
    } else if (status === "REVIEW") {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: <FaExclamationTriangle />,
      };
    } else {
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: <FaTimesCircle />,
      };
    }
  };

  const handleDownloadPDF = () => {
    alert("PDF Download will be integrated with backend API");
  };

  const handleExportExcel = () => {
    alert("Excel Export will be integrated with backend API");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-8">

          <div className="mb-6">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-4 top-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by address, parcel ID, or owner..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl shadow-md p-8 mb-8">

            <h1 className="text-4xl font-bold mb-6">
              {property.address}
            </h1>

            <div className="grid grid-cols-4 gap-6">

              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                  Parcel ID
                </p>
                <p className="text-white font-semibold text-lg">
                  {property.parcelId}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                  Listed Value
                </p>
                <p className="text-white font-semibold text-lg">
                  {property.listedValue}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                  Property Type
                </p>
                <p className="text-white font-semibold text-lg">
                  {property.propertyType}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                  Generated
                </p>
                <p className="text-white font-semibold text-lg">
                  {property.generatedDate}
                </p>
              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">

            {categories.map((cat) => {
              const badge = getStatusBadge(cat.status);
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition cursor-pointer"
                >

                  <div className="flex justify-between items-start mb-4">

                    <div className="flex items-center gap-3">
                      <div className="text-blue-600 text-2xl">
                        {cat.icon}
                      </div>
                      <h3 className="font-bold text-slate-800">
                        {cat.title}
                      </h3>
                    </div>

                    <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                      {badge.icon}
                      {cat.status}
                    </span>

                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed">
                    {cat.summary}
                  </p>

                </div>
              );
            })}

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-6">

              <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Comparable Properties
              </h2>

              <div className="space-y-3 mb-8">
                {comparables.map((comp, i) => (
                  <div
                    key={i}
                    className="text-slate-700 font-medium p-3 border-b border-slate-100"
                  >
                    {comp}
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Export Report
              </h2>

              <div className="flex gap-4">

                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <FaDownload />
                  DOWNLOAD
                </button>

                <button
                  onClick={handleExportExcel}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <FaFileExcel />
                  EXPORT EXCEL
                </button>

              </div>

            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">

              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-5">
                Report Timeline
              </h2>

              <div className="space-y-5">
                {timeline.map((event, i) => (
                  <div key={i} className="border-l-2 border-blue-500 pl-4">
                    <p className="text-slate-800 font-medium text-sm">
                      {event.event}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {event.date} - {event.time}
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DueDiligence;