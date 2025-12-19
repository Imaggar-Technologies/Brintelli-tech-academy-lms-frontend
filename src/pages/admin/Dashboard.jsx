import { Users, PieChart, Rocket, Settings } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import Button from "../../components/Button";

const AdminDashboard = () => {
  return (
    <>
      <PageHeader
        title="Academy Control Center"
        description="Track user growth, engagement metrics, and placement outcomes across all programs."
        actions={
          <Button variant="secondary" className="gap-2">
            Download Report
          </Button>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={Users} value="4,820" label="Total Learners" trend="+320 this month" />
        <StatsCard icon={Users} value="312" label="Tutors & Mentors" trend="+12 onboarded" />
        <StatsCard icon={PieChart} value="78%" label="Avg Engagement" trend="+5% vs last month" />
        <StatsCard icon={Rocket} value="186" label="Offers Secured" trend="+28 QoQ" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Engagement Overview</h3>
          <p className="mt-1 text-sm text-textMuted">
            Monitor cohort health, class attendance, and peer learning contributions.
          </p>
          <div className="mt-6 h-72 rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt text-center text-sm text-textMuted">
            <div className="flex h-full flex-col items-center justify-center">
              <PieChart className="h-10 w-10 text-textMuted" />
              <p className="mt-3 font-semibold text-textMuted">Chart Placeholder</p>
              <p>Daily active learners vs engagement segments</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Placement Outcomes</h3>
          <div className="mt-4 space-y-3 text-sm text-textSoft">
            {[
              "Top recruiters: Razorpay, Atlassian, Meesho, Gojek",
              "Average CTC hike: 148%",
              "Most in-demand roles: Backend Engineer, Platform Engineer, SDE II",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3">
                {item}
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-5">
            Export Insights
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

