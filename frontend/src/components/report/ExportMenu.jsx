// components/report/ExportMenu.jsx
//
// Task 5: Export PDF / Export Excel, wired to ExportController's raw-byte
// endpoints via services/api.js's exportReportPdf/exportReportExcel +
// downloadBlob. Styled as glass buttons for the dark hero (same
// bg-white/10 backdrop-blur treatment RiskHero.jsx's input/action row
// uses), each with its own loading / success / error micro-state so one
// export failing never blocks the other.
import { useState } from "react";
import { CheckCheck, FileSpreadsheet, FileText, Loader2, TriangleAlert } from "lucide-react";
import { downloadBlob, exportReportExcel, exportReportPdf } from "../../services/api";

const IDLE = "idle";
const LOADING = "loading";
const SUCCESS = "success";
const ERROR = "error";

function ExportButton({ icon: Icon, label, busyLabel, doneLabel, onExport }) {
  const [state, setState] = useState(IDLE);

  const handleClick = async () => {
    if (state === LOADING) return;
    setState(LOADING);
    try {
      await onExport();
      setState(SUCCESS);
      setTimeout(() => setState(IDLE), 2500);
    } catch (e) {
      console.error("Export failed:", e);
      setState(ERROR);
      setTimeout(() => setState(IDLE), 3000);
    }
  };

  const isLoading = state === LOADING;
  const isError = state === ERROR;
  const isSuccess = state === SUCCESS;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed shrink-0 ${
        isError
          ? "bg-[#B45B46]/90 text-white"
          : isSuccess
          ? "bg-[#4D7B73] text-white"
          : "bg-white/10 border border-white/15 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-70"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          {busyLabel}
        </>
      ) : isSuccess ? (
        <>
          <CheckCheck size={15} />
          {doneLabel}
        </>
      ) : isError ? (
        <>
          <TriangleAlert size={15} />
          Failed — retry
        </>
      ) : (
        <>
          <Icon size={15} />
          {label}
        </>
      )}
    </button>
  );
}

function ExportMenu({ propertyId, propertyTitle }) {
  const safeName = (propertyTitle || `property-${propertyId}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <ExportButton
        icon={FileText}
        label="Export PDF"
        busyLabel="Preparing PDF…"
        doneLabel="PDF downloaded"
        onExport={async () => {
          const blob = await exportReportPdf(propertyId);
          downloadBlob(blob, `due-diligence-${safeName}.pdf`);
        }}
      />
      <ExportButton
        icon={FileSpreadsheet}
        label="Export Excel"
        busyLabel="Preparing Excel…"
        doneLabel="Excel downloaded"
        onExport={async () => {
          const blob = await exportReportExcel(propertyId);
          downloadBlob(blob, `due-diligence-${safeName}.xlsx`);
        }}
      />
    </div>
  );
}

export default ExportMenu;
