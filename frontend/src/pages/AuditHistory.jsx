import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  FaHistory,
  FaSearch,
  FaFilter,
  FaUser,
  FaFileAlt,
  FaEye,
  FaDownload,
  FaEdit,
  FaTrash,
  FaSignInAlt,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaDatabase,
  FaShieldAlt,
  FaClipboardList,
} from "react-icons/fa";

function AuditHistory() {
  const [activeTab, setActiveTab] = useState("ACTIVITY");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterUser, setFilterUser] = useState("ALL");

  // Activity Logs Data
  const [activityLogs] = useState([
    {
      id: 1,
      user: "dharanidharan",
      role: "BUYER",
      action: "LOGIN",
      entityType: "AUTH",
      description: "User logged in successfully",
      ipAddress: "192.168.1.100",
      timestamp: "2026-08-06 09:42:15",
      status: "SUCCESS",
    },
    {
      id: 2,
      user: "dharanidharan",
      role: "BUYER",
      action: "VIEW_PROPERTY",
      entityType: "PROPERTY",
      description: "Viewed property: 402 Riverside Commons",
      ipAddress: "192.168.1.100",
      timestamp: "2026-08-06 09:45:30",
      status: "SUCCESS",
    },
    {
      id: 3,
      user: "durgaprasad",
      role: "AGENT",
      action: "GENERATE_REPORT",
      entityType: "REPORT",
      description: "Generated PDF report RPT-2026-001",
      ipAddress: "192.168.1.105",
      timestamp: "2026-08-06 10:15:20",
      status: "SUCCESS",
    },
    {
      id: 4,
      user: "admin",
      role: "ADMIN",
      action: "UPDATE_USER",
      entityType: "USER",
      description: "Updated user role for john@example.com",
      ipAddress: "192.168.1.101",
      timestamp: "2026-08-06 11:00:45",
      status: "SUCCESS",
    },
    {
      id: 5,
      user: "sharmakaustuk21",
      role: "LEGAL",
      action: "DOWNLOAD_REPORT",
      entityType: "REPORT",
      description: "Downloaded Excel report RPT-2026-002",
      ipAddress: "192.168.1.110",
      timestamp: "2026-08-06 11:30:12",
      status: "SUCCESS",
    },
    {
      id: 6,
      user: "unknown",
      role: "GUEST",
      action: "LOGIN",
      entityType: "AUTH",
      description: "Failed login attempt with invalid credentials",
      ipAddress: "203.45.67.89",
      timestamp: "2026-08-06 12:15:33",
      status: "FAILED",
    },
    {
      id: 7,
      user: "dharanidharan",
      role: "BUYER",
      action: "DELETE_PROPERTY",
      entityType: "PROPERTY",
      description: "Deleted property listing #2050",
      ipAddress: "192.168.1.100",
      timestamp: "2026-08-06 13:22:18",
      status: "SUCCESS",
    },
    {
      id: 8,
      user: "durgaprasad",
      role: "AGENT",
      action: "LOGOUT",
      entityType: "AUTH",
      description: "User logged out",
      ipAddress: "192.168.1.105",
      timestamp: "2026-08-06 14:05:00",
      status: "SUCCESS",
    },
  ]);

  // Report History Data
  const [reportHistory] = useState([
    {
      id: 1,
      reportNumber: "RPT-2026-001",
      property: "402 Riverside Commons, Tampa FL",
      requestedBy: "dharanidharan",
      reportType: "FULL",
      generatedDate: "2026-08-06 10:15:20",
      status: "COMPLETED",
      fileSize: "2.5 MB",
      downloads: 3,
      lastAccessed: "2026-08-06 15:30:00",
    },
    {
      id: 2,
      reportNumber: "RPT-2026-002",
      property: "55 Bayshore Ave, Tampa FL",
      requestedBy: "durgaprasad",
      reportType: "SUMMARY",
      generatedDate: "2026-08-05 14:20:10",
      status: "COMPLETED",
      fileSize: "1.2 MB",
      downloads: 5,
      lastAccessed: "2026-08-06 09:00:00",
    },
    {
      id: 3,
      reportNumber: "RPT-2026-003",
      property: "18 Dockside Row, Tampa FL",
      requestedBy: "sharmakaustuk21",
      reportType: "FULL",
      generatedDate: "2026-08-04 11:45:30",
      status: "PROCESSING",
      fileSize: "-",
      downloads: 0,
      lastAccessed: "-",
    },
    {
      id: 4,
      reportNumber: "RPT-2026-004",
      property: "390 Riverside Commons, Tampa FL",
      requestedBy: "admin",
      reportType: "CUSTOM",
      generatedDate: "2026-08-03 16:30:45",
      status: "FAILED",
      fileSize: "-",
      downloads: 0,
      lastAccessed: "-",
    },
    {
      id: 5,
      reportNumber: "RPT-2026-005",
      property: "125 Ocean Drive, Miami FL",
      requestedBy: "dharanidharan",
      reportType: "FULL",
      generatedDate: "2026-08-02 09:15:00",
      status: "COMPLETED",
      fileSize: "3.1 MB",
      downloads: 8,
      lastAccessed: "2026-08-05 18:20:00",
    },
  ]);

  const getActionBadge = (action) => {
    const badges = {
      LOGIN: { bg: "bg-blue-100", text: "text-blue-700", icon: <FaSignInAlt /> },
      LOGOUT: { bg: "bg-slate-100", text: "text-slate-700", icon: <FaSignOutAlt /> },
      VIEW_PROPERTY: { bg: "bg-purple-100", text: "text-purple-700", icon: <FaEye /> },
      GENERATE_REPORT: { bg: "bg-emerald-100", text: "text-emerald-700", icon: <FaChartBar /> },
      UPDATE_USER: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <FaEdit /> },
      DOWNLOAD_REPORT: { bg: "bg-cyan-100", text: "text-cyan-700", icon: <FaDownload /> },
      DELETE_PROPERTY: { bg: "bg-red-100", text: "text-red-700", icon: <FaTrash /> },
    };
    return badges[action] || { bg: "bg-slate-100", text: "text-slate-700", icon: <FaClipboardList /> };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
      case "COMPLETED":
        return { bg: "bg-emerald-100", text: "text-emerald-700", icon: <FaCheckCircle /> };
      case "FAILED":
        return { bg: "bg-red-100", text: "text-red-700", icon: <FaTimesCircle /> };
      case "PROCESSING":
        return { bg: "bg-yellow-100", text: "text-yellow-700", icon: <FaExclamationTriangle /> };
      default:
        return { bg: "bg-slate-100", text: "text-slate-700", icon: <FaClock /> };
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { bg: "bg-red-100", text: "text-red-700" },
      AGENT: { bg: "bg-blue-100", text: "text-blue-700" },
      BUYER: { bg: "bg-emerald-100", text: "text-emerald-700" },
      LEGAL: { bg: "bg-purple-100", text: "text-purple-700" },
      GUEST: { bg: "bg-slate-100", text: "text-slate-700" },
    };
    return badges[role] || { bg: "bg-slate-100", text: "text-slate-700" };
  };

  // Statistics
  const totalActivities = activityLogs.length;
  const successCount = activityLogs.filter(l => l.status === "SUCCESS").length;
  const failedCount = activityLogs.filter(l => l.status === "FAILED").length;
  const totalReports = reportHistory.length;
  const completedReports = reportHistory.filter(r => r.status === "COMPLETED").length;

  // Filter logic
  const filteredActivityLogs = activityLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    const matchesUser = filterUser === "ALL" || log.role === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const filteredReports = reportHistory.filter(report =>
    report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-8">

          {/* Page Header */}

          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">

            <div className="flex items-center gap-3 mb-2">
              <FaShieldAlt className="text-4xl text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-800">
                Audit & Report History
              </h1>
            </div>

            <p className="text-slate-500 mt-2">
              Track all user activities and monitor report generation history
            </p>

          </div>

          {/* Statistics Cards */}

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow-md p-6">
              <FaDatabase className="text-blue-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {totalActivities}
              </h2>
              <p className="text-slate-500">Total Activities</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-emerald-500">
              <FaCheckCircle className="text-emerald-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {successCount}
              </h2>
              <p className="text-slate-500">Successful Actions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500">
              <FaTimesCircle className="text-red-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {failedCount}
              </h2>
              <p className="text-slate-500">Failed Attempts</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
              <FaFileAlt className="text-purple-600" size={40} />
              <h2 className="text-3xl font-bold mt-4 text-slate-800">
                {totalReports}
              </h2>
              <p className="text-slate-500">Total Reports</p>
            </div>

          </div>

          {/* Tabs */}

          <div className="bg-white rounded-2xl shadow-md mb-6 overflow-hidden">

            <div className="flex border-b border-slate-200">

              <button
                onClick={() => setActiveTab("ACTIVITY")}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === "ACTIVITY"
                    ? "bg-blue-50 text-blue-600 border-b-4 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaHistory />
                  Activity Logs ({filteredActivityLogs.length})
                </div>
              </button>

              <button
                onClick={() => setActiveTab("REPORTS")}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === "REPORTS"
                    ? "bg-blue-50 text-blue-600 border-b-4 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaFileAlt />
                  Report History ({filteredReports.length})
                </div>
              </button>

            </div>

            {/* Search and Filter */}

            <div className="p-4 bg-slate-50 border-b border-slate-200">

              <div className="grid md:grid-cols-3 gap-4">

                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {activeTab === "ACTIVITY" && (
                  <>
                    <select
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Actions</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                      <option value="VIEW_PROPERTY">View Property</option>
                      <option value="GENERATE_REPORT">Generate Report</option>
                      <option value="DOWNLOAD_REPORT">Download Report</option>
                      <option value="UPDATE_USER">Update User</option>
                      <option value="DELETE_PROPERTY">Delete Property</option>
                    </select>

                    <select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agent</option>
                      <option value="BUYER">Buyer</option>
                      <option value="LEGAL">Legal</option>
                    </select>
                  </>
                )}

              </div>

            </div>

          </div>

          {/* Activity Logs Table */}

          {activeTab === "ACTIVITY" && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-3 text-slate-600 text-sm">User</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Role</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Action</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Description</th>
                      <th className="text-left p-3 text-slate-600 text-sm">IP Address</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Timestamp</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredActivityLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-8 text-slate-500">
                          No activity logs found
                        </td>
                      </tr>
                    ) : (
                      filteredActivityLogs.map((log) => {
                        const actionBadge = getActionBadge(log.action);
                        const statusBadge = getStatusBadge(log.status);
                        const roleBadge = getRoleBadge(log.role);

                        return (
                          <tr
                            key={log.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <FaUser className="text-slate-400" />
                                <span className="font-semibold text-slate-800">{log.user}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`${roleBadge.bg} ${roleBadge.text} px-2 py-1 rounded text-xs font-semibold`}>
                                {log.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`${actionBadge.bg} ${actionBadge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
                                {actionBadge.icon}
                                {log.action.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700 text-sm">
                              {log.description}
                            </td>
                            <td className="p-3 text-slate-600 text-xs font-mono">
                              {log.ipAddress}
                            </td>
                            <td className="p-3 text-slate-600 text-xs">
                              <div className="flex items-center gap-1">
                                <FaClock className="text-slate-400" />
                                {log.timestamp}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`${statusBadge.bg} ${statusBadge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
                                {statusBadge.icon}
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                </table>
              </div>

            </div>
          )}

          {/* Report History Table */}

          {activeTab === "REPORTS" && (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-3 text-slate-600 text-sm">Report #</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Property</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Requested By</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Type</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Generated</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Size</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Downloads</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Status</th>
                      <th className="text-left p-3 text-slate-600 text-sm">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center p-8 text-slate-500">
                          No reports found
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => {
                        const statusBadge = getStatusBadge(report.status);

                        return (
                          <tr
                            key={report.id}
                            className="border-b border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="p-3 font-semibold text-blue-600">
                              {report.reportNumber}
                            </td>
                            <td className="p-3 text-slate-700 text-sm max-w-xs truncate">
                              {report.property}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-slate-700 text-sm">
                                <FaUser className="text-slate-400" />
                                {report.requestedBy}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">
                                {report.reportType}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 text-xs">
                              {report.generatedDate}
                            </td>
                            <td className="p-3 text-slate-700 text-sm font-semibold">
                              {report.fileSize}
                            </td>
                            <td className="p-3 text-center">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold text-sm">
                                {report.downloads}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`${statusBadge.bg} ${statusBadge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
                                {statusBadge.icon}
                                {report.status}
                              </span>
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
                      })
                    )}
                  </tbody>

                </table>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AuditHistory;        