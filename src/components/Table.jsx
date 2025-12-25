import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from "lucide-react";

const Table = ({ 
  columns = [], 
  data = [], 
  emptyLabel = "No data available", 
  minRows = 10,
  sortable = false,
  onSort = null,
  defaultSort = null,
  expandable = false,
  renderExpandedRow = null,
}) => {
  const [sortConfig, setSortConfig] = useState(defaultSort || { key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Calculate how many empty rows to add to reach minimum
  const emptyRowsCount = Math.max(0, minRows - data.length);

  const handleSort = (columnKey) => {
    if (!sortable || !onSort) return;

    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const newSortConfig = { key: columnKey, direction };
    setSortConfig(newSortConfig);
    if (onSort) {
      onSort(newSortConfig);
    }
  };

  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (columnKey) => {
    if (!sortable) return null;
    
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="h-3.5 w-3.5 text-brand" />
        : <ArrowDown className="h-3.5 w-3.5 text-brand" />;
    }
    return <ArrowUpDown className="h-3.5 w-3.5 text-textMuted opacity-40" />;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-brintelli-border bg-brintelli-card">
      <table className="min-w-full divide-y divide-brintelli-border">
        <thead className="bg-brintelli-baseAlt/50">
          <tr>
            {expandable && (
              <th className="w-12 px-4 py-4">
                {/* Expand/collapse header */}
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted
                  first:pl-6 last:pr-6
                  ${sortable && column.sortable !== false ? 'cursor-pointer select-none hover:text-text hover:bg-brintelli-baseAlt transition-colors' : ''}
                `}
                onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.title}</span>
                  {sortable && column.sortable !== false && (
                    <span className="flex-shrink-0">
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
          {data.length === 0 && emptyRowsCount === 0 && (
            <tr>
              <td
                colSpan={columns.length + (expandable ? 1 : 0)}
                className="px-6 py-16 text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-textMuted">{emptyLabel}</p>
                </div>
              </td>
            </tr>
          )}
          {data.map((row, rowIndex) => {
            const rowId = row.id ?? rowIndex;
            const isExpanded = expandedRows.has(rowId);
            const hasExpandedContent = expandable && renderExpandedRow;

            return (
              <>
                <tr
                  key={rowId}
                  className={`
                    transition-all duration-150
                    ${isExpanded ? 'bg-brintelli-baseAlt/50 border-l-2 border-l-brand-500' : 'hover:bg-brintelli-baseAlt/40 border-l-2 border-l-transparent'}
                    ${hasExpandedContent ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => hasExpandedContent && toggleRowExpansion(rowId)}
                >
                  {expandable && (
                    <td className="px-4 py-4">
                      {hasExpandedContent ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(rowId);
                          }}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-brintelli-base transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-textMuted" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-textMuted" />
                          )}
                        </button>
                      ) : (
                        <div className="w-7" />
                      )}
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = row[column.key];
                    return (
                      <td
                        key={column.key}
                        className={`
                          px-6 py-4 text-sm font-medium
                          first:pl-6 last:pr-6
                          ${column.className || 'text-text'}
                          ${column.nowrap !== false ? 'whitespace-nowrap' : ''}
                        `}
                      >
                        {column.render ? column.render(value, row, rowIndex) : (value ?? <span className="text-textMuted">—</span>)}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && hasExpandedContent && (
                  <tr className="bg-brintelli-baseAlt/30">
                    <td
                      colSpan={columns.length + (expandable ? 1 : 0)}
                      className="px-6 py-4 border-b border-brintelli-border/30"
                    >
                      {renderExpandedRow(row, rowIndex)}
                    </td>
                  </tr>
                )}
              </>
            );
          })}
          {/* Add empty rows to reach minimum */}
          {Array.from({ length: emptyRowsCount }).map((_, index) => (
            <tr key={`empty-${index}`} className="h-14 border-b border-brintelli-border/20">
              {expandable && <td className="px-4 py-4"></td>}
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4">
                  <div className="h-4 bg-transparent"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
