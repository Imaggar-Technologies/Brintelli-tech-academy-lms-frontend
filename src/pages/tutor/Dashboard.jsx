import { useMemo } from "react";
import { ArrowRight, ClipboardList, FilePlus2, MessageCircle, PlayCircle, CalendarClock, ChevronRight, LayoutGrid, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import Table from "../../components/Table";
import Button from "../../components/Button";

const doubtColumns = [
  { key: "student", title: "Student" },
  { key: "topic", title: "Topic" },
  { key: "age", title: "Waiting" },
];

const doubts = [
  { id: 1, student: "Arjun M", topic: "Cache invalidation strategy", age: "12 mins" },
  { id: 2, student: "Niharika D", topic: "DP memoization vs tabulation", age: "24 mins" },
  { id: 3, student: "Ritik S", topic: "API pagination best practices", age: "32 mins" },
];

const TutorDashboard = () => {
  return (
    <>
      <PageHeader
        title="Mentor Command Center"
        description="Monitor today’s sessions, attend to student doubts, and keep your courses running smoothly."
        actions={
          <>
            <Button variant="secondary">
              View Teaching Calendar
            </Button>
            <Button variant="primary">
              Start Live Session
              <PlayCircle className="h-4 w-4" />
            </Button>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={PlayCircle} value="2" label="Live Sessions Today" trend="Next in 1h" />
        <StatsCard icon={MessageCircle} value="7" label="Doubts Pending" trend="3 new" trendType="negative" />
        <StatsCard icon={ClipboardList} value="12" label="Assignments to Review" trend="Due today" trendType="negative" />
        <StatsCard icon={FilePlus2} value="3" label="Content Drafts" trend="Ready for publishing" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">Today’s Sessions</h3>
                <p className="text-sm text-textMuted">
                  Join live classes and prep rooms. Ensure decks and recordings are ready.
                </p>
              </div>
              <Button variant="ghost" className="gap-2 text-sm font-semibold text-brand">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "System Design: Caching",
                  time: "7:00 PM - 8:30 PM",
                  cohort: "Backend Accelerator",
                },
                {
                  title: "DSA Office Hour",
                  time: "9:00 PM - 10:00 PM",
                  cohort: "Problem Solving Track",
                },
              ].map((session) => (
                <div key={session.title} className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                  <p className="text-sm font-semibold text-text">{session.title}</p>
                  <p className="mt-2 text-sm text-textMuted">{session.time}</p>
                  <span className="mt-3 inline-flex rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold text-brand-600">
                    {session.cohort}
                  </span>
                  <Button variant="primary" className="mt-4 w-full justify-center">
                    Enter Studio
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Doubt Queue</h3>
              <Button className="gap-2">
                Resolve Doubts
              </Button>
            </div>
            <div className="mt-4">
              <Table columns={doubtColumns} data={doubts} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Student Performance Preview</h3>
            <p className="mt-2 text-sm text-textMuted">Monitor cohort health and intervene early.</p>
            <div className="mt-5 grid gap-3">
              {[
                { label: "Average attendance", value: "86%", tone: "positive" },
                { label: "Assignments on time", value: "68%", tone: "warning" },
                { label: "Mock interview completion", value: "42%", tone: "negative" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={[
                    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold",
                    metric.tone === "positive"
                      ? "bg-brand-600/10 text-brand-600"
                      : metric.tone === "warning"
                      ? "bg-brand-700/15 text-brand-700"
                      : "bg-brand-700/20 text-brand-700",
                  ].join(" ")}
                >
                  <span>{metric.label}</span>
                  <span>{metric.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 h-40 rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt/70 text-center text-sm text-textMuted">
              <div className="flex h-full flex-col items-center justify-center">
                <p className="font-semibold text-textMuted">Cohort Progress Chart</p>
                <p>Placeholder for performance visualization</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Quick Actions</h3>
            <div className="mt-4 grid gap-3 text-sm text-textSoft">
              {[
                "Upload today's session deck",
                "Share class recording",
                "Schedule mentor AMA",
              ].map((action) => (
                <button
                  key={action}
                  className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3 text-left transition hover:border-brand-200 hover:text-brand-600"
                >
                  {action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorDashboard;

