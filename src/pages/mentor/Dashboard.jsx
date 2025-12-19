import { CalendarClock, ClipboardList, Lightbulb, UsersRound } from "lucide-react";
import AnimationWrapper from "../../components/AnimationWrapper";
import StatsCard from "../../components/StatsCard";

const mentorStats = [
  {
    icon: UsersRound,
    value: "18",
    label: "Active Mentees",
    sublabel: "Across 4 cohorts",
    trend: "+2 this week",
  },
  {
    icon: CalendarClock,
    value: "5",
    label: "Sessions Today",
    sublabel: "Next in 35 mins",
    trend: "On schedule",
  },
  {
    icon: ClipboardList,
    value: "9",
    label: "Feedback Pending",
    sublabel: "Review by tonight",
    trend: "Action needed",
    trendType: "negative",
  },
  {
    icon: Lightbulb,
    value: "12",
    label: "Suggested Resources",
    sublabel: "Shared this week",
    trend: "+4 new",
  },
];

const MentorDashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-3xl border border-brintelli-border bg-gradient-to-r from-brand-soft via-white to-brand-soft p-8 shadow-glow">
        <h1 className="text-2xl font-semibold text-text">Welcome back, Mentor!</h1>
        <p className="mt-2 max-w-2xl text-sm text-textMuted">
          Keep mentees unblocked with quick session prep, timely feedback, and curated resource drops.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mentorStats.map((item) => (
          <AnimationWrapper key={item.label} className="h-full">
            <StatsCard {...item} />
          </AnimationWrapper>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Today’s Focus Sessions</h2>
              <p className="text-sm text-textMuted">Stay ahead of upcoming calls and preparation checkpoints.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {[
              {
                title: "Career Navigation AMA",
                time: "6:30 PM · Product Cohort",
                action: "Open prep notes",
              },
              {
                title: "System Design Deep-dive",
                time: "8:00 PM · Backend Cohort",
                action: "Review last feedback",
              },
              {
                title: "Mock Interview Retro",
                time: "9:15 PM · Interview Pod",
                action: "Share resource pack",
              },
            ].map((session) => (
              <div
                key={session.title}
                className="flex flex-col gap-2 rounded-2xl border border-brintelli-border bg-white/70 p-4 shadow-card backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">{session.title}</p>
                  <span className="inline-flex rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                    Upcoming
                  </span>
                </div>
                <p className="text-sm text-textMuted">{session.time}</p>
                <button className="inline-flex w-full items-center justify-center rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/15">
                  {session.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-text">Quick Nudges</h2>
          <p className="mt-1 text-sm text-textMuted">Drop helpful resources where mentees need them most.</p>
          <div className="mt-4 space-y-3">
            {[
              "Share the resume critique checklist",
              "Send weekly DS interview prompts",
              "Remind mentees about mock interview slots",
            ].map((item) => (
              <button
                key={item}
                className="flex w-full items-center justify-between rounded-xl border border-brintelli-border px-4 py-3 text-left text-sm text-textSoft transition hover:border-brand hover:text-brand"
              >
                {item}
                <span className="text-xs font-semibold text-brand">Send</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;

