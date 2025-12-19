import { GraduationCap, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "name", title: "Student" },
  { key: "cohort", title: "Cohort" },
  { key: "attendance", title: "Attendance" },
  { key: "progress", title: "Progress" },
  { key: "status", title: "Status" },
];

const data = [
  { id: 1, name: "Aishwarya Kumar", cohort: "BE-2025A", attendance: "92%", progress: "76%", status: "On Track" },
  { id: 2, name: "Karan Gupta", cohort: "BE-2025A", attendance: "85%", progress: "61%", status: "Needs Support" },
  { id: 3, name: "Shraddha Patil", cohort: "BE-2025A", attendance: "97%", progress: "82%", status: "Star Performer" },
  { id: 4, name: "Harsh Yadav", cohort: "BE-2025A", attendance: "71%", progress: "58%", status: "At Risk" },
];

const TutorStudentsList = () => {
  return (
    <>
      <PageHeader
        title="Student Directory"
        description="Track attendance, progress, and personalize outreach for your cohort."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            <UsersRound className="h-4 w-4" />
            Create Cohort Group
          </button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text">Cohort BE-2025A</h3>
            <p className="text-sm text-textMuted">Monitor trends and plan interventions proactively.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="gap-2">
              Export CSV
            </Button>
            <Button variant="ghost">Share Insights</Button>
          </div>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default TutorStudentsList;

