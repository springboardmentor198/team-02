import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  FaHardHat,
  FaCalendarAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSyncAlt,
  FaFileAlt,
  FaBolt,
  FaTint,
  FaHome,
  FaHammer,
} from "react-icons/fa";

function PermitHistory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [permits] = useState([
    {
      id: 1,
      permitNumber: "BP-2023-1001",
      permitType: "RENOVATION",
      description: "Kitchen remodeling and cabinet installation",
      issueDate: "2023-03-15",
      expiryDate: "2023-09-15",
      status: "CLOSED",
      contractorName: "ABC Construction Ltd",
      estimatedCost: 25000,
      finalCost: 24500,
      inspectorNotes: "Work completed satisfactorily",
      source: "Tampa City Permits API",
    },
    {
      id: 2,
      permitNumber: "BP-2022-2050",
      permitType: "ELECTRICAL",
      description: "Full electrical rewiring",
      issueDate: "2022-08-10",
      expiryDate: "2023-02-10",
      status: "APPROVED",
      contractorName: "Elite Electrical Services",
      estimatedCost: 15000,
      finalCost: 14800,
      inspectorNotes: "Passed all inspections",
      source: "Tampa City Permits API",
    },
    {
      id: 3,
      permitNumber: "BP-2021-3500",
      permitType: "BUILDING",
      description: "Roof replacement",
      issueDate: "2021-06-05",
      expiryDate: "2021-12-05",
      status: "CLOSED",
      contractorName: "Roofing Pros Inc",
      estimatedCost: 18000,
      finalCost: 17500,
      inspectorNotes: "Roof replacement completed",
      source: "Tampa City Permits API",
    },
    {
      id: 4,
      permitNumber: "BP-2020-1250",
      permitType: "PLUMBING",
      description: "Bathroom plumbing upgrade",
      issueDate: "2020-04-20",
      expiryDate: "2020-10-20",
      status: "EXPIRED",
      contractorName: "Quality Plumbing Co",
      estimatedCost: 8000,
      finalCost: 8200,
      inspectorNotes: "Permit expired - work incomplete",
      source: "Tampa City Permits API",
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
      case "CLOSED":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: <FaCheckCircle />,
        };
      case "PENDING":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <FaExclamationTriangle />,
        };
      case "EXPIRED":
      case "REVOKED":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <FaTimesCircle />,
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-700",
          icon: <FaFileAlt />,
        };
    }
  };

  const getPermitIcon = (type) => {
    switch (type) {
      case "ELECTRICAL":
        return <FaBolt className="text-yellow-500" />;
      case "PLUMBING":
        return <FaTint className="text-blue-500" />;
      case "BUILDING":
        return <FaHome className="text-orange-500" />;
      case "RENOVATION":
        return <FaHammer className="text-purple-500" />;
      default:
        return <FaHardHat className="text-slate-500" />;
    }
  };

  const formatDate = (dateString) => {
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
      alert("Data refreshed successfully!");
    }, 1500);
  };

  const totalPermits = permits.length;
  const activePermits = permits.filter(
    (p) => p.status === "APPROVED" || p.status === "PENDING"
  ).length;
  const expiredPermits = permits.filter((p) => p.status === "EXPIRED").length;
  const closedPermits = permits.filter((p) => p.status === "CLOSED").length;

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
                  <FaHardHat className="text-4xl text-blue-600" />
                  <h1 className="text-4xl font-bold text-slate-800">
                    Permit History
                  </h1>
                </div>

                <p className="text-slate-500 mt-2">
                  Complete building permit records for 402 Riverside Commons, Tampa FL
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition disabled:opacity-50"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>

            </div>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaFileAlt className="text-blue-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {totalPermits}
              </h2>
              <p className="text-slate-500">Total Permits</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaCheckCircle className="text-emerald-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {closedPermits}
              </h2>
              <p className="text-slate-500">Closed / Complete</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaExclamationTriangle className="text-yellow-500" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {activePermits}
              </h2>
              <p className="text-slate-500">Active / Pending</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaTimesCircle className="text-red-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {expiredPermits}
              </h2>
              <p className="text-slate-500">Expired</p>
            </div>

          </div>

          <div className="space-y-6">

            {permits.map((permit) => {
              const badge = getStatusBadge(permit.status);

              return (
                <div
                  key={permit.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition"
                >

                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">

                    <div className="flex items-center gap-4">

                      <div className="text-4xl">
                        {getPermitIcon(permit.permitType)}
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-800">
                            {permit.permitNumber}
                          </h3>

                          <span
                            className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
                          >
                            {badge.icon}
                            {permit.status}
                          </span>
                        </div>

                        <p className="text-slate-500 text-sm mt-1">
                          {permit.permitType} PERMIT
                        </p>
                      </div>

                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase">
                        Estimated Cost
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${permit.estimatedCost.toLocaleString()}
                      </p>
                    </div>

                  </div>

                  <div className="mb-5">
                    <p className="text-xs text-slate-400 uppercase mb-1">
                      Description
                    </p>
                    <p className="text-slate-700 font-medium">
                      {permit.description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6 mb-5">

                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                        <FaCalendarAlt />
                        Issue Date
                      </div>
                      <p className="text-slate-800 font-semibold">
                        {formatDate(permit.issueDate)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                        <FaCalendarAlt />
                        Expiry Date
                      </div>
                      <p className="text-slate-800 font-semibold">
                        {formatDate(permit.expiryDate)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                        <FaUserTie />
                        Contractor
                      </div>
                      <p className="text-slate-800 font-semibold">
                        {permit.contractorName}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
                        <FaMoneyBillWave />
                        Final Cost
                      </div>
                      <p className="text-emerald-600 font-bold">
                        ${permit.finalCost.toLocaleString()}
                      </p>
                    </div>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase mb-1">
                      Inspector Notes
                    </p>
                    <p className="text-slate-700 italic">
                      "{permit.inspectorNotes}"
                    </p>
                  </div>

                  <div className="mt-4 text-right">
                    <p className="text-xs text-slate-400">
                      Data Source: {permit.source}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}

export default PermitHistory;