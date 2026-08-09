// components/audit/ReportHistorySection.jsx
import { useEffect, useState } from "react";
import { Download, Eye, FileSpreadsheet, FileText, History, RefreshCw, Search } from "lucide-react";
import {
  downloadBlob,
  downloadReportHistoryExcel,
  downloadReportHistoryPdf,
  searchReportHistory,
} from "../../services/api";
import { formatBytes, formatDateTime } from "../../utils/format";
import StatusPill from "./StatusPill";
import EmptyState from "./EmptyState";
import TableSkeleton from "./TableSkeleton";
import Pagination from "./Pagination";
import DetailModal from "./DetailModal";
import ErrorState from "../risk/ErrorState";

const STATUSES = ["COMPLETED", "PROCESSING", "PENDING", "FAILED"];
const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  reportNumber: "",
  property: "",
  requestedBy: "",
  reportType: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

function ReportHistorySection({ onViewAuditTrail, showToast }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await searchReportHistory({
        reportNumber: appliedFilters.reportNumber || undefined,
        property: appliedFilters.property || undefined,
        requestedBy: appliedFilters.requestedBy || undefined,
        reportType: appliedFilters.reportType || undefined,
        status: appliedFilters.status || undefined,
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        page,
        size: PAGE_SIZE,
      });
      setData(result);
    } catch (e) {
      console.error("Failed to load report history:", e);
      setError("Couldn't load report history. Is the backend running on port 8080?");
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
    showToast?.("Report history refreshed.", "info");
  };

  const handleDownload = async (report, format) => {
    setDownloadingId(`${report.id}-${format}`);
    try {
      const blob =
        format === "pdf"
          ? await downloadReportHistoryPdf(report.id)
          : await downloadReportHistoryExcel(report.id);
      const ext = format === "pdf" ? "pdf" : "xlsx";
      downloadBlob(blob, `${report.reportNumber || "report-" + report.id}.${ext}`);
      showToast?.(`${report.reportNumber || "Report"} downloaded as ${format.toUpperCase()}.`, "success");
      load();
    } catch (e) {
      console.error(`Failed to download ${format}:`, e);
      showToast?.(`Couldn't download the ${format.toUpperCase()} for this report.`, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const rows = data?.content || [];

  return (
    <div>
      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="flex flex-wrap gap-4 items-end px-6 pt-6 pb-5 border-b border-[#E3DDCE]"
      >
        <div className="min-w-[160px]">
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Report #</label>
          <input
            value={filters.reportNumber}
            onChange={(e) => setFilters({ ...filters, reportNumber: e.target.value })}
            className="w-full h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            placeholder="RPT-2026-000123"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Property</label>
          <input
            value={filters.property}
            onChange={(e) => setFilters({ ...filters, property: e.target.value })}
            className="w-full h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            placeholder="ID or keyword"
          />
        </div>
        <div className="min-w-[160px]">
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Requested By</label>
          <input
            value={filters.requestedBy}
            onChange={(e) => setFilters({ ...filters, requestedBy: e.target.value })}
            className="w-full h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#3E63C2]"
            placeholder="Name"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[1.5px] text-gray-500">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-[150px] h-10 mt-1.5 rounded-full border border-[#E3DDCE] px-4 text-sm bg-[#F8F6F0] focus:outline-none"
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
        </div>
      </form>

      {error ? (
        <div className="p-6">
          <ErrorState message={error} onRetry={load} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_0.9fr_0.9fr_0.9fr_1fr] px-6 py-3 border-b border-[#E3DDCE] text-[11px] uppercase tracking-[1.5px] text-gray-500">
            <span>Report #</span>
            <span>Property</span>
            <span>Requested By</span>
            <span>Generated</span>
            <span>File Size</span>
            <span>Downloads</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <TableSkeleton rows={PAGE_SIZE} />
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No reports found"
                message="No generated reports match your current filters. Try widening the date range or clearing filters."
              />
            </div>
          ) : (
            rows.map((report) => (
              <div
                key={report.id}
                className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_0.9fr_0.9fr_0.9fr_1fr] px-6 py-4 border-b border-[#F0EBE0] last:border-0 hover:bg-[#FAF8F2] transition-colors items-center"
              >
                <button
                  onClick={() => setSelected(report)}
                  className="text-left font-semibold text-sm text-[#3E63C2] hover:underline truncate pr-2"
                >
                  {report.reportNumber || `#${report.id}`}
                </button>
                <span className="text-sm text-gray-600 truncate pr-2">
                  {report.propertyTitle || `Property #${report.propertyId}`}
                </span>
                <span className="text-sm text-gray-600 truncate pr-2">
                  {report.requestedByName || "Unattributed"}
                </span>
                <span className="text-sm text-gray-600">{formatDateTime(report.generatedAt)}</span>
                <span className="text-sm text-gray-600">{formatBytes(report.fileSizeBytes)}</span>
                <span className="text-sm text-gray-600">{report.downloadCount ?? 0}</span>
                <StatusPill status={report.status} />
                <span className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelected(report)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDCE] text-[#1B2338] hover:bg-white transition-colors"
                    title="View"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={() => handleDownload(report, "pdf")}
                    disabled={downloadingId === `${report.id}-pdf`}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDCE] text-[#1B2338] hover:bg-white transition-colors disabled:opacity-50"
                    title="Download PDF"
                  >
                    <FileText size={13} />
                  </button>
                  <button
                    onClick={() => handleDownload(report, "excel")}
                    disabled={downloadingId === `${report.id}-excel`}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDCE] text-[#1B2338] hover:bg-white transition-colors disabled:opacity-50"
                    title="Download Excel"
                  >
                    <FileSpreadsheet size={13} />
                  </button>
                  <button
                    onClick={() => onViewAuditTrail?.(report.reportNumber)}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDCE] text-[#1B2338] hover:bg-white transition-colors"
                    title="View Audit Trail"
                  >
                    <History size={13} />
                  </button>
                </span>
              </div>
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
          title={selected.reportNumber || `Report #${selected.id}`}
          badge={<StatusPill status={selected.status} />}
          onClose={() => setSelected(null)}
          rows={[
            { label: "Property", value: selected.propertyTitle || `Property #${selected.propertyId}` },
            { label: "Owner", value: selected.ownerName },
            { label: "Requested By", value: selected.requestedByName || "Unattributed" },
            { label: "Report Type", value: selected.reportType },
            { label: "Risk Level", value: selected.riskLevel },
            { label: "Generated", value: formatDateTime(selected.generatedAt) },
            { label: "Last Accessed", value: formatDateTime(selected.lastAccessedAt) },
            { label: "File Size", value: formatBytes(selected.fileSizeBytes) },
            { label: "Downloads", value: selected.downloadCount ?? 0 },
          ]}
          actions={
            <>
              <button
                onClick={() => handleDownload(selected, "pdf")}
                className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#1B2338] text-white text-sm font-medium hover:bg-[#2B3450] transition-colors"
              >
                <Download size={14} />
                PDF
              </button>
              <button
                onClick={() => handleDownload(selected, "excel")}
                className="flex items-center gap-2 h-10 px-5 rounded-full border border-[#1B2338] text-[#1B2338] text-sm font-medium hover:bg-[#1B2338] hover:text-white transition-colors"
              >
                <Download size={14} />
                Excel
              </button>
            </>
          }
        />
      )}
    </div>
  );
}

export default ReportHistorySection;
