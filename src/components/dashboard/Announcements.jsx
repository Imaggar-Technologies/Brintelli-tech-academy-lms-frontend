import { Megaphone } from "lucide-react";
import AnimationWrapper from "../AnimationWrapper";
import Button from "../Button";

const announcements = [
  {
    title: "Capstone Demo Day — Final Guidelines",
    body: "Upload demo links before Friday 6 PM. Team slots will be shared in the Slack channel.",
    date: "24 Nov · 09:30 AM",
  },
  {
    title: "Product Thinking AMA with Swiggy EM",
    body: "Bring your questions on cross-team collaboration and trade-off storytelling.",
    date: "23 Nov · 07:00 PM",
  },
  {
    title: "Placement Sprint Kick-off",
    body: "Resume office hours open next week. Book 1:1 slots via your placement dashboard.",
    date: "22 Nov · 05:00 PM",
  },
];

const Announcements = () => {
  return (
    <AnimationWrapper className="bg-brintelli-card backdrop-blur-glass rounded-2xl border border-brintelli-border shadow-card p-6 hover:shadow-soft transition duration-160">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-text text-xl font-semibold tracking-tight">Announcements</h3>
          <p className="text-sm text-textSoft">Stay updated with key program broadcasts and cohort reminders.</p>
        </div>
        <Megaphone className="h-6 w-6 text-brand-500" />
      </div>

      <div className="mt-5 space-y-4">
        {announcements.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-brintelli-border bg-white/70 px-4 py-3 shadow-card transition duration-160 hover:-translate-y-[1px]"
          >
            <h4 className="font-semibold text-text">{item.title}</h4>
            <p className="mt-1 text-sm text-textSoft">{item.body}</p>
            <p className="mt-2 text-textMuted text-xs font-medium uppercase tracking-wide">{item.date}</p>
          </article>
        ))}
      </div>

      <Button variant="secondary" className="mt-5 w-full justify-center">
        View all updates
      </Button>
    </AnimationWrapper>
  );
};

export default Announcements;

