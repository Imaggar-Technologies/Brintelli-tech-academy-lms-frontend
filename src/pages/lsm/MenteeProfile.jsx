import { useParams } from "react-router-dom";
import { CalendarCheck, MessageCircleHeart, PhoneCall } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import AnnouncementCard from "../../components/AnnouncementCard";
import Button from "../../components/Button";

const LsmMenteeProfile = () => {
  const { id } = useParams();

  return (
    <>
      <PageHeader
        title={`Mentee Profile • ${id ?? "AISH"}`}
        description="Understand mentee journey, recent interactions, and next steps for success."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              <PhoneCall className="h-4 w-4" />
              Log Call
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
              Update Status
            </button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Mentee Snapshot</h3>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-3 text-sm text-textSoft">
                <p>
                  <span className="font-semibold text-text">Name:</span> Aishwarya Kumar
                </p>
                <p>
                  <span className="font-semibold text-text">Track:</span> Backend Engineering
                </p>
                <p>
                  <span className="font-semibold text-text">Current Role:</span> Software Engineer,
                  Zoho
                </p>
              </div>
              <div className="space-y-3 text-sm text-textSoft">
                <p>
                  <span className="font-semibold text-text">Placement Target:</span> Dec 2025
                </p>
                <p>
                  <span className="font-semibold text-text">Risk Level:</span> Low
                </p>
                <p>
                  <span className="font-semibold text-text">Last Interaction:</span> 2 days ago
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Progress Timeline</h3>
            <div className="mt-4 grid gap-4">
              {[
                { milestone: "Placement readiness review", date: "Nov 15", status: "Completed" },
                { milestone: "Mock interview feedback implementation", date: "Nov 20", status: "In Progress" },
                { milestone: "Resume branding workshop", date: "Nov 24", status: "Upcoming" },
              ].map((item) => (
                <div key={item.milestone} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm text-textSoft">
                  <p className="font-semibold text-text">{item.milestone}</p>
                  <p className="text-xs text-textMuted">
                    <CalendarCheck className="mr-1 inline h-3.5 w-3.5 text-brand-500" />
                    {item.date} • {item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Care Notes</h3>
            <p className="mt-2 text-sm text-textSoft">
              Aishwarya thrives with structured plans. Ensure follow-ups after each major assessment to keep momentum.
            </p>
            <div className="mt-4 space-y-3 text-sm text-textMuted">
              <div className="rounded-xl bg-brand-600/10 px-4 py-3 font-semibold text-brand-600">
                Strength: Consistent attendance and proactive doubt resolution.
              </div>
              <div className="rounded-xl bg-brand-700/15 px-4 py-3 font-semibold text-brand-700">
                Watch: Manage pre-interview stress and energy during project sprints.
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Recent Updates</h3>
            <div className="mt-3 space-y-4">
              <AnnouncementCard
                title="Mentor Feedback"
                description="Great code structure in last assignment. Encourage to finalize mock interviews."
                date="Nov 19"
              />
              <AnnouncementCard
                title="Wellbeing Check"
                description="Reported feeling stretched with work + prep. Suggested micro-learning plan."
                date="Nov 18"
              />
            </div>
          </div>
          <Button variant="cta" className="mt-4 w-full justify-center gap-2">
            <MessageCircleHeart className="h-4 w-4" />
            Schedule Mentorship Session
          </Button>
        </div>
      </div>
    </>
  );
};

export default LsmMenteeProfile;

