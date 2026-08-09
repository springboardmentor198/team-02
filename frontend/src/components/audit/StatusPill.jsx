// components/audit/StatusPill.jsx
//
// Same shape/sizing as the top-level StatusBadge.jsx (verification status),
// just with the value set Task 7 actually uses across AuditLog.status and
// DueDiligenceReport.status: SUCCESS/COMPLETED, FAILED, PROCESSING, PENDING.
const STYLES = {
  SUCCESS: "bg-[#4D7B73]/10 text-[#4D7B73]",
  COMPLETED: "bg-[#4D7B73]/10 text-[#4D7B73]",
  FAILED: "bg-[#B45B46]/10 text-[#B45B46]",
  PROCESSING: "bg-[#3E63C2]/10 text-[#3E63C2]",
  PENDING: "bg-[#C89546]/10 text-[#C89546]",
};

function StatusPill({ status }) {
  const key = (status || "").toUpperCase();
  const cls = STYLES[key] || "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block w-fit px-3 py-1 rounded-full text-[11px] font-medium ${cls}`}>
      {status || "Unknown"}
    </span>
  );
}

export default StatusPill;
