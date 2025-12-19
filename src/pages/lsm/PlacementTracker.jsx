import { BriefcaseBusiness, CalendarClock, ClipboardList, Star, Briefcase, Rocket, CircleDollarSign } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const LsmPlacementTracker = () => {
  return (
    <>
      <PageHeader
        title="Placement Tracker"
        description="Monitor offers, interview pipelines, and mentee readiness milestones."
        actions={
          <button className="rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            Share With Placement Team
          </button>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={Briefcase} value="14" label="Active Interviews" trend="+5 this week" />
        <StatsCard icon={Rocket} value="6" label="Offers Secured" trend="Congrats 🎉" />
        <StatsCard icon={CircleDollarSign} value="24 LPA" label="Avg Offer CTC" trend="+12% YoY" />
        <StatsCard icon={Briefcase} value="9" label="Company Connects" trend="Follow ups pending" trendType="negative" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Offer Pipeline</h3>
          <div className="mt-4 space-y-3 text-sm text-textSoft">
            {[
              { mentee: "Aishwarya K", status: "Offer from Razorpay · Pending acceptance" },
              { mentee: "Shraddha P", status: "Round 3 at Atlassian next Monday" },
              { mentee: "Rohit S", status: "Hiring challenge at Meesho this weekend" },
            ].map((item) => (
              <div key={item.mentee} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3">
                <p className="font-semibold text-text">{item.mentee}</p>
                <p className="text-xs text-textMuted">{item.status}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Action Items</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-textSoft">
            <li>Coordinate mock HR interview for Karan Gupta.</li>
            <li>Follow up with placement partner on Atlassian referrals.</li>
            <li>Share portfolio review checklist with mentees this week.</li>
          </ul>
          <Button variant="secondary" className="mt-5 w-full justify-center gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Add Placement Note
          </Button>
        </div>
      </div>
    </>
  );
};

export default LsmPlacementTracker;

