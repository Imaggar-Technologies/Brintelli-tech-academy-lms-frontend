const Table = ({ columns = [], data = [], emptyLabel = "No data available", minRows = 10 }) => {
  // Calculate how many empty rows to add to reach minimum
  const emptyRowsCount = Math.max(0, minRows - data.length);
  const emptyRow = { _isEmpty: true };

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-brintelli-border/70">
        <thead className="bg-brintelli-baseAlt/70">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-textMuted"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brintelli-border/60 bg-transparent">
          {data.length === 0 && emptyRowsCount === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-sm text-textMuted"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
          {data.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className="transition duration-160 hover:bg-brintelli-baseAlt/40">
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-6 py-4 text-sm text-textSoft">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
          {/* Add empty rows to reach minimum */}
          {Array.from({ length: emptyRowsCount }).map((_, index) => (
            <tr key={`empty-${index}`} className="h-12">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-sm">
                  &nbsp;
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

