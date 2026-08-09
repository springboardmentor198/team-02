// components/audit/DetailModal.jsx
//
// Same overlay/card recipe as the property detail modal in
// PropertySearch.jsx (fixed inset-0 bg-black/30, white rounded-lg card,
// click-outside-to-close) — reused here for both the Activity Log detail
// view and the Report History detail view instead of duplicating the modal
// shell twice.
function DetailModal({ title, badge, rows, actions, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-[480px] p-7 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4">
          <h2 className="font-serif text-2xl text-[#1B2338] leading-tight">{title}</h2>
          {badge}
        </div>

        <div className="mt-5 space-y-2 text-sm text-gray-600">
          {rows.map(({ label, value }) => (
            <p key={label}>
              <span className="text-gray-400">{label}:</span> {value ?? "—"}
            </p>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {actions}
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-full border border-[#E3DDCE] text-sm text-gray-600 hover:bg-[#F8F6F0] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
