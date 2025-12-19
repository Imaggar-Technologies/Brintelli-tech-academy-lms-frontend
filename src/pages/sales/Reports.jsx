import { FileSpreadsheet, Download, Calendar, Filter, BarChart3 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const SalesReports = () => {
  const reports = [
    { name: "Monthly Sales Report", period: "January 2024", type: "Revenue", status: "Generated" },
    { name: "Pipeline Analysis", period: "Q4 2023", type: "Pipeline", status: "Generated" },
    { name: "Win/Loss Analysis", period: "December 2023", type: "Analysis", status: "Pending" },
  ];

  return (
    <>
      <PageHeader
        title="Performance Reports"
        description="Generate and download detailed sales performance reports."
        actions={
          <Button className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Generate Report
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brintelli-border bg-brintelli-card p-4">
        <Button variant="ghost" className="gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
        <Button variant="ghost" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Available Reports</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {reports.map((report, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{report.name}</h4>
                    <p className="text-sm text-textSoft">Period: {report.period} • Type: {report.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      report.status === "Generated"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </span>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesReports;