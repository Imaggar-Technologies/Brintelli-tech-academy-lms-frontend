import { ArrowRight, BookOpenCheck } from "lucide-react";
import AnimationWrapper from "../AnimationWrapper";
import Button from "../Button";

const ContinueLearningCard = () => {
  const progress = 64;

  return (
    <AnimationWrapper className="relative overflow-hidden rounded-2xl border border-white/25 bg-gradient-heading p-6 text-white shadow-glow transition duration-160 hover:shadow-soft" id="continue">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-cyan/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-[-80px] h-48 w-48 rounded-full bg-brand-soft/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">Continue Learning</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Backend Engineering Mastery</h2>
          <p className="text-sm text-white/85">Mentor: Aman Sharma · Last lesson completed yesterday</p>
        </div>
        <BookOpenCheck className="h-10 w-10 text-white/80" />
      </div>

      <div className="relative mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-white/85">
          <span>Course Progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-progress"
            style={{ width: `${progress}%`, backgroundSize: "200% 100%" }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-xs text-white/85">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white/80">🗓️</span>
        Next class: API Gateways & Rate Limiting · Nov 24 · 9:00 PM
      </div>

      <Button variant="cta" className="mt-6 w-full justify-center gap-2">
        <span>Continue Learning</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </AnimationWrapper>
  );
};

export default ContinueLearningCard;

