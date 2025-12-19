import { Clock3, Monitor } from "lucide-react";
import AnimationWrapper from "../AnimationWrapper";
import Button from "../Button";

const NextLiveClassCard = () => {
  return (
    <AnimationWrapper className="bg-brintelli-card backdrop-blur-glass rounded-2xl border border-brintelli-border shadow-card p-6 hover:shadow-soft transition duration-160">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent rounded-full">
            Live · Today · 7:30 PM
          </span>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-text">System Design Deep Dive</h2>
          <p className="text-sm text-textSoft">Mentor: Rahul Iyer · Cohort: Backend Engineering Mastery</p>
        </div>
        <Monitor className="h-10 w-10 text-brand-500" />
      </div>
      <div className="mt-5 flex items-center gap-3 text-sm text-textSoft">
        <Clock3 className="h-4 w-4 text-brand-500" />
        <span>Join 10 minutes early for lobby announcements</span>
      </div>
      <Button variant="primary" className="mt-6 w-full justify-center">
        Join Waiting Room
      </Button>
    </AnimationWrapper>
  );
};

export default NextLiveClassCard;

