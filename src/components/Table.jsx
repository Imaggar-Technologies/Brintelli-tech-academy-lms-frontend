const Table = ({ columns = [], data = [], emptyLabel = "No data available" }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card">
      <div className="max-h-[460px] overflow-auto">
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
          <tbody className="divide-y divide-brintelli-border/60 bg-white">
            {data.length === 0 && (
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

