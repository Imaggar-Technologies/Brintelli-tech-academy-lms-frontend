import { LayoutDashboard, Target, Users2, Workflow } from "lucide-react";
import AnimationWrapper from "../../components/AnimationWrapper";
import StatsCard from "../../components/StatsCard";

const programStats = [
  {
    icon: LayoutDashboard,
    value: "6",
    label: "Active Programs",
    sublabel: "Running this quarter",
    trend: "+1 in pipeline",
  },
  {
    icon: Users2,
    value: "420",
    label: "Learners Enrolled",
    sublabel: "Across all tracks",
    trend: "+24 vs last week",
  },
  {
    icon: Target,
    value: "78%",
    label: "Goal Attainment",
    sublabel: "On track to OKRs",
    trend: "+6% improvement",
  },
  {
    icon: Workflow,
    value: "14",
    label: "Open Action Items",
    sublabel: "Shared with teams",
    trend: "4 due today",
    trendType: "negative",
  },
];

const ProgramManagerDashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card backdrop-blur">
        <h1 className="text-2xl font-semibold text-text">Program Performance Console</h1>
        <p className="mt-2 max-w-2xl text-sm text-textMuted">
          Align cohorts, mentors, and placement teams while keeping execution velocity high.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {programStats.map((item) => (
          <AnimationWrapper key={item.label} className="h-full">
            <StatsCard {...item} />
          </AnimationWrapper>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">Cohort Health Snapshot</h2>
              <p className="text-sm text-textMuted">
                Review key indicators and flag risks before they impact learners.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                cohort: "SDE Accelerator",
                status: "Green",
                summary: "Attendance steady at 92%",
              },
              {
                cohort: "Product Launchpad",
                status: "Amber",
                summary: "Mock interviews slipping this week",
              },
              {
                cohort: "Data Engineering",
                status: "Green",
                summary: "Placement conversions up 8%",
              },
              {
                cohort: "Cloud Architect",
                status: "Red",
                summary: "Content backlog needs attention",
              },
            ].map((item) => (
              <div
                key={item.cohort}
                className="rounded-2xl border border-brintelli-border bg-white/75 p-4 shadow-card backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">{item.cohort}</p>
                  <span
                    className={[
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                      item.status === "Green"
                        ? "bg-emerald-100 text-emerald-600"
                        : item.status === "Amber"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-rose-100 text-rose-600",
                    ].join(" ")}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-textMuted">{item.summary}</p>
                <button className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/15">
                  Open cohort board
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-text">Operations Checklist</h2>
          <div className="mt-4 space-y-3">
            {[
              "Sync with placement officers on newest offers",
              "Review mentor bandwidth for next sprint",
              "Publish weekly program insights deck",
              "Confirm LSM touchpoints for at-risk cohorts",
            ].map((item) => (
              <button
                key={item}
                className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-4 py-3 text-left text-sm text-textSoft transition hover:border-brand hover:text-brand"
              >
                {item}
                <span className="text-xs font-semibold text-brand">Mark done</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramManagerDashboard;

