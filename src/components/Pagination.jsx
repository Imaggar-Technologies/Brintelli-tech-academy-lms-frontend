import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

/**
 * Pagination Component
 * 
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page
 * @param {function} onPageChange - Callback when page changes
 * @param {function} onItemsPerPageChange - Callback when items per page changes
 * @param {boolean} showInfo - Show pagination info (default: true)
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showInfo = true,
}) => {
  const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage);

  const handleItemsPerPageChange = (value) => {
    const newItemsPerPage = Number(value);
    setLocalItemsPerPage(newItemsPerPage);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
    // Reset to page 1 when items per page changes
    if (onPageChange) {
      onPageChange(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't show pagination if there's only one page and no items per page selector
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  return (
    <div className="flex items-center justify-between border-t border-brintelli-border px-4 py-3 bg-brintelli-card">
      <div className="flex items-center gap-2">
        {onItemsPerPageChange && (
          <>
            <span className="text-sm text-textMuted">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="rounded border border-brintelli-border bg-white px-2 py-1 text-sm text-text focus:border-brand-500 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </>
        )}
        {showInfo && (
          <span className="text-sm text-textMuted">
            {startItem}-{endItem} of {totalItems}
          </span>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-text">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;

