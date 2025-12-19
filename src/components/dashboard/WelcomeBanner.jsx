import AnimationWrapper from "../AnimationWrapper";
import Button from "../Button";

const WelcomeBanner = () => {
  return (
    <AnimationWrapper className="relative overflow-hidden rounded-3xl border border-brand-soft/40 bg-gradient-cta px-8 py-10 text-white shadow-glow">
      <div className="pointer-events-none absolute -right-24 top-[-80px] h-[420px] w-[420px] rounded-full bg-accent-cyan/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-[-120px] h-[360px] w-[360px] rounded-full bg-brand-soft/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-1 text-sm font-medium shadow-soft">
            <span className="text-xl">👋</span>
            Welcome back, Aishwarya
          </span>
          <h1 className="text-4xl font-semibold tracking-tight drop-shadow-sm lg:text-[2.9rem]">
            Your learning tracks are ready for another milestone
          </h1>
          <p className="text-sm text-white/80">
            Revisit open modules, confirm upcoming live classes, and keep your placement readiness dashboard glowing.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/20 bg-white/20 px-6 py-5 text-left shadow-glass backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Weekly Snapshot
          </p>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xl font-semibold">12h 30m</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Focused Time</p>
            </div>
            <div className="h-12 w-px bg-white/25" />
            <div>
              <p className="text-xl font-semibold">3</p>
              <p className="text-xs uppercase tracking-wide text-white/70">Live Sessions</p>
            </div>
          </div>
          <Button variant="secondary" className="gap-2">
            View Learning Plan
          </Button>
        </div>
      </div>
    </AnimationWrapper>
  );
};

export default WelcomeBanner;


