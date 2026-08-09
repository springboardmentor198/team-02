// components/audit/AuditLogsSection.jsx
import { useEffect, useState } from "react";
import { Download, RefreshCw, Search } from "lucide-react";
import { getAuditLogs } from "../../services/api";
import { formatDateTime } from "../../utils/format";
import StatusPill from "./StatusPill";
import EmptyState from "./EmptyState";
import TableSkeleton from "./TableSkeleton";
import Pagination from "./Pagination";
import DetailModal from "./DetailModal";
import ErrorState from "../risk/ErrorState";

const ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "CREATE_PROPERTY",
  "UPDATE_PROPERTY",
  "DELETE_PROPERTY",
  "VIEW_PROPERTY",
  "GENERATE_REPORT",
  "DOWNLOAD_REPORT",
  "UPDATE_USER",
  "DELETE_USER",
];

const ROLES = ["ADMIN", "AGENT", "BUYER", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION"];
const STATUSES = ["SUCCESS", "FAILED", "PROCESSING", "PENDING"];
const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  user: "",
  property: "",
  reportNumber: "",
  action: "",
  role: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

function actionLabel(action) {
  if (!action) return "—";
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function csvEscape(value) {
  const s = value === undefined || value === null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function AuditLogsSection({ reportNumberPreset, onConsumePreset, showToast }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  // "View Audit Trail" from a Report History row lands here with a
  // reportNumber to pre-filter on — apply it once, then let the section
  // own its own filter state normally.
  useEffect(() => {
    if (!reportNumberPreset) return;
    const next = { ...EMPTY_FILTERS, reportNumber: reportNumberPreset };
    setFilters(next);
    setAppliedFilters(next);
    setPage(0);
    onConsumePreset?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportNumberPreset]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAuditLogs({
        user: appliedFilters.user || undefined,
        property: appliedFilters.property || undefined,
        reportNumber: appliedFilters.reportNumber || undefined,
        action: appliedFilters.action || undefined,
        role: appliedFilters.role || undefined,
        status: appliedFilters.status || undefined,
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        page,
        size: PAGE_SIZE,
      });
      setData(result);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
      setError("Couldn't load activity logs. Is the backend running on port 8080?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, page]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setPage(0);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(0);
  };

  const handleRefresh = async () => {
    await load();
    showToast?.("Activity logs refreshed.", "info");
  };

  const handleExport = () => {
    const rows = data?.content || [];
    if (rows.length === 0) {
      showToast?.("Nothing to export on this page.", "info");
      return;
    }
    const header = [
      "User",
      "Role",
      "Action",
      "Entity Type",
      "Entity ID",
      "Description",
      "IP Address",
      "Timestamp",
      "Status",
    ];
    const lines = [header.map(csvEscape).join(",")];
    rows.forEach((r) => {
      lines.push(
        [
          r.username,
          r.role,
          actionLabel(r.action),
          r.entityType,
          r.entityId,
          r.description,
          r.ipAddress,
          formatDateTime(r.actionTime),
          r.status,
        ]
          .map(csvEscape)
          .join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `activity-logs-page-${page + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    showToast?.("Exported the current page to CSV.", "success");
  };

  const rows = data?.content || [];

  return (
    <div>
      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="flex flex-wrap gap-4 items-end px-6 pt-6 pb-5 border-b border-[#E3DDCE]"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">User</label>
          <input
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            className="w-full h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            placeholder="Name"
          />
        </div>
        <div className="min-w-[160px]">
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">
            Property / Report #
          </label>
          <input
            value={filters.property}
            onChange={(e) => setFilters({ ...filters, property: e.target.value })}
            className="w-full h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            placeholder="ID or keyword"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Action</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="w-[168px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {actionLabel(a)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Role</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-[140px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-[140px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-[150px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-[150px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            type="submit"
            className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1B2338] text-white text-sm font-medium hover:bg-[#2B3450] transition-colors"
          >
            <Search size={14} />
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 px-4 rounded-full border border-[#E3DDCE] text-sm text-gray-600 hover:bg-[#F8F6F0] transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E3DDCE] text-[#1B2338] hover:bg-[#F8F6F0] transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E3DDCE] text-[#1B2338] hover:bg-[#F8F6F0] transition-colors shrink-0"
            title="Export current page as CSV"
          >
            <Download size={15} />
          </button>
        </div>
      </form>

      {error ? (
        <div className="p-6">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1.3fr_1.6fr_1fr_1.4fr_1fr_0.9fr] px-6 py-3 border-b border-[#E3DDCE] text-[11px] uppercase tracking-[1.5px] text-gray-500">
            <span>User</span>
            <span>Action / Entity</span>
            <span>IP Address</span>
            <span>Description</span>
            <span>Timestamp</span>
            <span>Status</span>
          </div>

          {loading ? (
            <TableSkeleton rows={PAGE_SIZE} />
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No activity found"
                message="No activity matches your current filters. Try widening the date range or clearing filters."
              />
            </div>
          ) : (
            rows.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelected(log)}
                className="w-full text-left grid grid-cols-[1.3fr_1.6fr_1fr_1.4fr_1fr_0.9fr] px-6 py-4 border-b border-[#F0EBE0] last:border-0 hover:bg-[#FAF8F2] transition-colors items-center"
              >
                <span>
                  <span className="font-semibold text-sm text-[#1B2338] block">
                    {log.username || "Unattributed"}
                  </span>
                  <span className="text-xs text-gray-500">{log.role || "—"}</span>
                </span>
                <span>
                  <span className="text-sm text-[#1B2338] block">{actionLabel(log.action)}</span>
                  <span className="text-xs text-gray-500">
                    {log.entityType ? `${log.entityType}${log.entityId ? " #" + log.entityId : ""}` : "—"}
                  </span>
                </span>
                <span className="text-sm text-gray-600 truncate">{log.ipAddress || "—"}</span>
                <span className="text-sm text-gray-600 truncate pr-4">{log.description || "—"}</span>
                <span className="text-sm text-gray-600">{formatDateTime(log.actionTime)}</span>
                <StatusPill status={log.status} />
              </button>
            ))
          )}

          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {selected && (
        <DetailModal
          title={actionLabel(selected.action)}
          badge={<StatusPill status={selected.status} />}
          onClose={() => setSelected(null)}
          rows={[
            { label: "User", value: selected.username || "Unattributed" },
            { label: "Role", value: selected.role },
            { label: "Entity", value: selected.entityType ? `${selected.entityType} #${selected.entityId ?? "—"}` : "—" },
            { label: "Description", value: selected.description },
            { label: "IP Address", value: selected.ipAddress },
            { label: "Timestamp", value: formatDateTime(selected.actionTime) },
            { label: "Property ID", value: selected.propertyId },
            { label: "Module", value: selected.module },
          ]}
          actions={null}
        />
      )}
    </div>
  );
}

export default AuditLogsSection;
