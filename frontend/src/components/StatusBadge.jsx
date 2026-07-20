// components/StatusBadge.jsx
// Matches the exact strings VerificationService.java returns:
// "Pending", "Verified", "Needs Review", "Rejected"
const STYLES = {
  Pending: "bg-gray-100 text-gray-600",
  Verified: "bg-green-100 text-green-700",
  "Needs Review": "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  const cls = STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block w-fit px-3 py-1 rounded-full text-[11px] font-medium ${cls}`}>
      {status || "Unknown"}
    </span>
  );
}

export default StatusBadge;
