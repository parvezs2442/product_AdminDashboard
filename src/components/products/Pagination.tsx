import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = total === 0 ? 0 : (validPage - 1) * limit + 1;
  const endItem = Math.min(validPage * limit, total);

  // Generate page numbers with smart ellipsis logic
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const delta = 1; // Surrounding visible pages

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const left = validPage - delta;
      const right = validPage + delta;
      const range: number[] = [];

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= left && i <= right)) {
          range.push(i);
        }
      }

      let prev = 0;
      for (const i of range) {
        if (prev) {
          if (i - prev === 2) {
            pages.push(prev + 1);
          } else if (i - prev > 2) {
            pages.push('...');
          }
        }
        pages.push(i);
        prev = i;
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 sm:px-4 text-xs text-slate-400 border-t border-slate-800">
      {/* Left: Summary text & Page size select */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Dynamic counter text */}
        <span className="font-medium text-slate-300">
          Showing <span className="font-semibold text-white font-mono">{startItem}</span>–
          <span className="font-semibold text-white font-mono">{endItem}</span> of{' '}
          <span className="font-semibold text-white font-mono">{total}</span>
        </span>

        {/* Page Size Option (10, 20, 50) */}
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSizeSelect" className="text-slate-400">
            Per page:
          </label>
          <select
            id="pageSizeSelect"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Right: Page navigation controls */}
      <div className="flex items-center space-x-1.5">
        {/* Jump First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={validPage <= 1}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(validPage - 1)}
          disabled={validPage <= 1}
          className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          id="prev-page-button"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-slate-600 select-none font-mono"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === validPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(validPage + 1)}
          disabled={validPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          id="next-page-button"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Jump Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={validPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
