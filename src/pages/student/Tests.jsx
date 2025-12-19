import { Award, CheckCircle2, Timer } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";

const upcomingColumns = [
  { key: "assessment", title: "Assessment" },
  { key: "type", title: "Type" },
  { key: "schedule", title: "Schedule" },
  { key: "duration", title: "Duration" },
];

const completedColumns = [
  { key: "assessment", title: "Assessment" },
  { key: "score", title: "Score" },
  { key: "feedback", title: "Feedback" },
  {
    key: "badge",
    title: "Badge",
    render: (row) =>
      row.badge ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold text-brand-600">
          <Award className="h-3.5 w-3.5" />
          {row.badge}
        </span>
      ) : (
        "-"
      ),
  },
];

const upcoming = [
  {
    id: 1,
    assessment: "Mock Interview Round - Backend",
    type: "Mock Interview",
    schedule: "Nov 24 · 8:00 PM",
    duration: "60 mins",
  },
  {
    id: 2,
    assessment: "DSA Sprint • Week 8",
    type: "Online Test",
    schedule: "Nov 26 · 7:30 PM",
    duration: "120 mins",
  },
];

const completed = [
  {
    id: 1,
    assessment: "System Design Challenge",
    score: "82 / 100",
    feedback: "Excellent solution with strong trade-off analysis.",
    badge: "Design Pro",
  },
  {
    id: 2,
    assessment: "DSA Sprint • Week 7",
    score: "74 / 100",
    feedback: "Revisit graph DP optimizations to boost accuracy.",
  },
];

const StudentTests = () => {
  return (
    <>
      <PageHeader
        title="Assessments & Sprints"
        description="Prepare for upcoming evaluations and review feedback from previous attempts to keep improving."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">Upcoming Tests</h3>
              <p className="text-sm text-textMuted">Add reminders and join mock interviews on time.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold text-brand-600">
              <Timer className="h-4 w-4" />
              Next in 3 days
            </span>
          </div>
          <div className="mt-4">
            <Table columns={upcomingColumns} data={upcoming} />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">Completed Tests</h3>
              <p className="text-sm text-textMuted">Track performance trends and unlock achievement badges.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold text-brand-600">
              <CheckCircle2 className="h-4 w-4" />
              Avg score 78%
            </span>
          </div>
          <div className="mt-4">
            <Table columns={completedColumns} data={completed} />
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentTests;

