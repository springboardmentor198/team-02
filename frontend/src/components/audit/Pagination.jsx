// components/audit/Pagination.jsx
//
// Matches PageResponse<T> from the backend: zero-indexed `page`, `totalPages`,
// `totalElements`. Styled as rounded-full icon buttons, consistent with the
// rest of the app's circular icon-button convention (Dashboard's back
// button, Notifications' back button).
import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ page, totalPages, totalElements, onPageChange }) {
  if (totalElements === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0EBE0]">
      <p className="text-[12.5px] text-gray-500">
        Page <span className="font-semibold text-[#1B2338]">{page + 1}</span> of{" "}
        <span className="font-semibold text-[#1B2338]">{Math.max(totalPages, 1)}</span>
        &nbsp;·&nbsp;{totalElements.toLocaleString()} total
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDCE] bg-white text-[#1B2338] hover:bg-[#FAF8F3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-[#E3DDCE] bg-white text-[#1B2338] hover:bg-[#FAF8F3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
