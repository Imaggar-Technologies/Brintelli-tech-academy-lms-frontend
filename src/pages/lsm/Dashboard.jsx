import { AlertTriangle, HeartHandshake, Target } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import AnnouncementCard from "../../components/AnnouncementCard";
import Button from "../../components/Button";

const LsmDashboard = () => {
  return (
    <>
      <PageHeader
        title="Learning Success Overview"
        description="Stay ahead of mentee wellbeing, missed classes, and placement readiness signals."
        actions={
          <Button variant="secondary" className="mt-3 gap-2 text-xs font-semibold">
            Share Agenda
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={HeartHandshake} value="48" label="Active Mentees" trend="6 need attention" trendType="negative" />
        <StatsCard icon={AlertTriangle} value="9" label="Missed Classes" trend="-3 vs last week" />
        <StatsCard icon={Target} value="14" label="Placement Ready" trend="+4 this week" />
        <StatsCard icon={Target} value="5" label="Escalations" trend="Resolve today" trendType="negative" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 shadow-soft">
          <h3 className="text-base font-semibold text-text">Mentees Needing Attention</h3>
          <div className="mt-3 space-y-3 text-sm text-textSoft">
            {[
              {
                name: "Arjun M",
                issue: "Missed 2 classes · assignment overdue",
                action: "Schedule wellbeing check",
              },
              {
                name: "Kavya S",
                issue: "Drops in practice streak",
                action: "Share productivity plan",
              },
              {
                name: "Ritik S",
                issue: "Placement anxiety reported",
                action: "Recommend mentor session",
              },
            ].map((mentee) => (
              <div
                key={mentee.name}
                className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-3 shadow-soft/20"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-text">{mentee.name}</p>
                  <span className="rounded-full bg-brand-700/20 px-3 py-1 text-xs font-semibold text-brand-700">
                    High Priority
                  </span>
                </div>
                <p className="mt-2 text-xs text-textMuted">{mentee.issue}</p>
                <Button variant="primary" className="mt-3 w-full justify-center text-xs font-semibold">
                  {mentee.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 shadow-soft">
            <h3 className="text-base font-semibold text-text">Missed Classes Alerts</h3>
            <div className="mt-3 space-y-2 text-sm text-textSoft">
              {[
                "Arjun M missed Backend Live Class yesterday",
                "Shraddha P missed DSA Sprint recap",
                "Harsh Y missed Placement prep sync",
              ].map((alert) => (
                <div key={alert} className="rounded-lg bg-brand-600/10 px-3 py-2 font-semibold text-brand-600">
                  {alert}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 shadow-soft">
            <h3 className="text-base font-semibold text-text">Announcements to Share</h3>
            <div className="mt-3 space-y-3">
              <AnnouncementCard
                title="Placement Masterclass"
                description="Encourage mentees to join the session hosted by Amazon alumni this Friday."
                date="Nov 20"
              />
              <AnnouncementCard
                title="Wellbeing Circle"
                description="Group session for managing stress and project workload next Monday."
                date="Nov 21"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LsmDashboard;

