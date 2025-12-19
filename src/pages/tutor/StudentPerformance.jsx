import { BarChart2, TrendingUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";

const TutorStudentPerformance = () => {
  return (
    <>
      <PageHeader
        title="Performance Analytics"
        description="Understand student outcomes and identify learning gaps across assessments."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            <TrendingUp className="h-4 w-4" />
            Generate Report
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Assessment Trends</h3>
          <p className="mt-1 text-sm text-textMuted">
            Track average scores and detect dips that need intervention.
          </p>
          <div className="mt-6 h-64 rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt text-center text-sm text-textMuted">
            <div className="flex h-full flex-col items-center justify-center">
              <BarChart2 className="h-10 w-10 text-textMuted" />
              <p className="mt-3 font-semibold text-textMuted">Chart Placeholder</p>
              <p>Assessment score trends, percentile distribution</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-textSoft md:grid-cols-2">
            <div className="rounded-xl bg-brand-600/10 px-4 py-3 font-semibold text-brand-600">
              Avg DSA Score: 74%
            </div>
            <div className="rounded-xl bg-brand-700/15 px-4 py-3 font-semibold text-brand-700">
              Mock Interview Completion: 42%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Focus Students</h3>
            <div className="mt-4 space-y-3 text-sm text-textSoft">
              {[
                { name: "Karan Gupta", action: "Missed 2 live classes • Schedule check-in" },
                { name: "Harsh Yadav", action: "Low assignment completion • Share study plan" },
                { name: "Ritika Shah", action: "Anxious before interviews • Offer mock support" },
              ].map((item) => (
                <div key={item.name} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3">
                  <p className="font-semibold text-text">{item.name}</p>
                  <p className="text-xs text-textMuted">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Engagement Heatmap</h3>
            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-textMuted">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {Array.from({ length: 21 }, (_, index) => (
                <div
                  key={index}
                  className={[
                    "h-10 rounded-xl border",
                    index % 5 === 0
                      ? "border-brand-600/30 bg-brand-600/15"
                      : index % 4 === 0
                      ? "border-brand-700/30 bg-brand-700/15"
                      : "border-brintelli-border bg-brintelli-baseAlt",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorStudentPerformance;

