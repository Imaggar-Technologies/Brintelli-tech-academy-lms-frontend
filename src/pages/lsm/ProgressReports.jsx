import { FileBarChart, Share2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import Button from "../../components/Button";

const reports = [
  {
    id: 1,
    mentee: "Aishwarya Kumar",
    summary: "Strong momentum with consistent attendance and top quartile assessments.",
    progress: 78,
  },
  {
    id: 2,
    mentee: "Karan Gupta",
    summary: "Needs focus on consistency. Plan accountability rituals for assignments.",
    progress: 61,
  },
  {
    id: 3,
    mentee: "Shraddha Patil",
    summary: "Excellent DSA performance. Encourage early placement applications.",
    progress: 82,
  },
];

const LsmProgressReports = () => {
  return (
    <>
      <PageHeader
        title="Progress Reports"
        description="Generate and share structured updates with mentors, parents, and program leaders."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            <Share2 className="h-4 w-4" />
            Share Latest Summary
          </button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 p-3 text-brand-600">
                <FileBarChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{report.mentee}</h3>
                <p className="text-sm text-textMuted">Backend Engineering Cohort</p>
              </div>
            </div>
            <p className="text-sm text-textSoft">{report.summary}</p>
            <div>
              <div className="flex items-center justify-between text-sm text-textMuted">
                <span>Overall progress</span>
                <span className="font-semibold text-text">{report.progress}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={report.progress} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center">
                Download Report
              </Button>
              <button className="flex-1 rounded-xl border border-brintelli-border px-4 py-2 text-sm font-semibold text-textSoft transition hover:border-brand-300 hover:text-brand-600">
                Share Update
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default LsmProgressReports;

