import { ClipboardCheck, Clock3, FileText } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import Button from "../../components/Button";

const assignments = [
  {
    id: 1,
    title: "System Design Case Study: Notification Service",
    course: "Backend Engineering Mastery",
    due: "Nov 25 • 11:59 PM",
    progress: 45,
    status: "In Progress",
  },
  {
    id: 2,
    title: "DSA Marathon: Segment Trees & Fenwick Trees",
    course: "Advanced Data Structures & Algorithms",
    due: "Nov 26 • 9:00 PM",
    progress: 10,
    status: "Pending",
  },
  {
    id: 3,
    title: "Capstone Sprint #2 Deliverable",
    course: "Full Stack Accelerator",
    due: "Nov 28 • 7:00 PM",
    progress: 72,
    status: "Review Queue",
  },
];

const StudentAssignments = () => {
  return (
    <>
      <PageHeader
        title="Assignments & Deliverables"
        description="Plan your week, submit on time, and request reviews for faster feedback."
        actions={
          <Button variant="secondary">View Submission Guidelines</Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-soft/20 p-3 text-brand">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                <p className="text-sm text-textSoft">{item.course}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-textMuted">
              <span className="inline-flex items-center gap-2 rounded-full border border-brintelli-border bg-brintelli-baseAlt px-3 py-1 text-textSoft">
                <Clock3 className="h-4 w-4 text-brand" />
                Due {item.due}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft/20 px-3 py-1 text-brand">
                <ClipboardCheck className="h-4 w-4" />
                {item.status}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-textSoft">
                <span>Progress</span>
                <span className="font-semibold text-text">{item.progress}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={item.progress} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="flex-1 justify-center gap-2">
                Submit Work
              </Button>
              <Button variant="secondary" className="flex-1 justify-center">
                Request Review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentAssignments;

