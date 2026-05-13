import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [1, 2, 3, "...", 8, 9, 10];

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-white">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={13} />
        Previous
      </button>

      <div className="flex items-center gap-0.5">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={i} className="px-1.5 py-1 text-xs text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-[#3d5af1] text-white font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight size={13} />
      </button>
    </div>
  );
}