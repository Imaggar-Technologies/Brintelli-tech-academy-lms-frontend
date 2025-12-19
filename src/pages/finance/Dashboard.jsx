import { Wallet, BarChart3, PiggyBank, BadgeCheck } from "lucide-react";
import AnimationWrapper from "../../components/AnimationWrapper";
import StatsCard from "../../components/StatsCard";

const financeStats = [
  {
    icon: Wallet,
    value: "₹82.4L",
    label: "Collections (MTD)",
    sublabel: "Cleared inflows this month",
    trend: "+12.4% vs last month",
  },
  {
    icon: BarChart3,
    value: "₹5.8L",
    label: "Pending Dues",
    sublabel: "Across 4 active cohorts",
    trend: "-9.1% week-on-week",
    trendType: "positive",
  },
  {
    icon: PiggyBank,
    value: "₹28.3L",
    label: "Scholarships & Discounts",
    sublabel: "Approved YTD allocations",
    trend: "+₹1.2L pending approval",
  },
  {
    icon: BadgeCheck,
    value: "97.2%",
    label: "Fee Realisation",
    sublabel: "Cohorts on track to targets",
    trend: "+0.6% improvement",
    trendType: "positive",
  },
];

const upcomingEmi = [
  {
    learner: "Sanaya P",
    cohort: "SDE Accelerator",
    due: "₹24,500",
    cycle: "10 Dec",
    status: "Due in 3 days",
  },
  {
    learner: "Amit K",
    cohort: "Product Launchpad",
    due: "₹18,000",
    cycle: "12 Dec",
    status: "Auto-debit ready",
  },
  {
    learner: "Samar G",
    cohort: "Cloud Architect",
    due: "₹21,700",
    cycle: "15 Dec",
    status: "Follow-up pending",
  },
];

const FinanceDashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card backdrop-blur">
        <h1 className="text-2xl font-semibold text-text">Finance Command Console</h1>
        <p className="mt-2 max-w-2xl text-sm text-textMuted">
          Track learner finances, reconcile inflows, and coordinate with admissions on revenue KPIs from one view.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {financeStats.map((item) => (
          <AnimationWrapper key={item.label} className="h-full">
            <StatsCard {...item} />
          </AnimationWrapper>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div
          id="payments"
          className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Collections & Dues Overview</h2>
              <p className="text-sm text-textMuted">Monitor real-time fee receipts and overdue accounts.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/15">
              Download ledger
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              {
                cohort: "SDE Accelerator",
                collected: "₹28.6L",
                outstanding: "₹1.2L",
                action: "Send reminders",
              },
              {
                cohort: "Product Launchpad",
                collected: "₹19.1L",
                outstanding: "₹0.8L",
                action: "Share invoice digest",
              },
              {
                cohort: "Data Engineering",
                collected: "₹22.4L",
                outstanding: "₹2.5L",
                action: "Escalate to mentor ops",
              },
              {
                cohort: "Cloud Architect",
                collected: "₹12.7L",
                outstanding: "₹1.3L",
                action: "Review EMI cadence",
              },
            ].map((item) => (
              <div
                key={item.cohort}
                className="rounded-2xl border border-brintelli-border bg-white/80 p-4 shadow-card backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">{item.cohort}</p>
                  <span className="text-xs font-semibold text-emerald-600">₹ {item.collected}</span>
                </div>
                <p className="mt-2 text-sm text-textMuted">Outstanding: {item.outstanding}</p>
                <button className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-brand/30 bg-brand/5 px-3 py-2 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/10">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          id="refunds"
          className="rounded-2xl border border-brintelli-border bg-white/90 p-6 shadow-card backdrop-blur"
        >
          <h2 className="text-lg font-semibold text-text">Refund & Scholarship Queue</h2>
          <div className="mt-4 space-y-4">
            {[
              {
                title: "Refund request: Priya N",
                amount: "₹18,500",
                note: "Course deferment approved by program ops",
                cta: "Issue refund",
              },
              {
                title: "Scholarship review: Cohort 24A",
                amount: "₹2.1L",
                note: "Pending director approval",
                cta: "Send reminder",
              },
              {
                title: "Discount approval: Rahul S",
                amount: "₹12,000",
                note: "Mentor recommendation received",
                cta: "Approve discount",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-brintelli-border bg-white/80 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <span className="text-xs font-semibold text-brand">{item.amount}</span>
                </div>
                <p className="mt-2 text-xs text-textMuted">{item.note}</p>
                <button className="mt-3 inline-flex items-center justify-center rounded-xl border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/10">
                  {item.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        id="emi"
        className="grid gap-6 lg:grid-cols-[1.1fr_1fr]"
      >
        <div className="rounded-2xl border border-brintelli-border bg-white/90 p-6 shadow-card backdrop-blur">
          <h2 className="text-lg font-semibold text-text">Upcoming EMI Schedule</h2>
          <p className="mt-1 text-sm text-textMuted">
            Coordinate with admissions for students who need extensions or alternate payment plans.
          </p>
          <div className="mt-5 space-y-3">
            {upcomingEmi.map((item) => (
              <div
                key={item.learner}
                className="flex items-center justify-between rounded-xl border border-brintelli-border bg-brintelli-card px-4 py-3 text-sm text-text"
              >
                <div>
                  <p className="font-semibold">{item.learner}</p>
                  <p className="text-xs text-textMuted">{item.cohort}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-brand">{item.due}</p>
                  <p className="text-xs text-textMuted">{item.cycle}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          id="analytics"
          className="rounded-2xl border border-brintelli-border bg-white/90 p-6 shadow-card backdrop-blur"
        >
          <h2 className="text-lg font-semibold text-text">Revenue Analytics</h2>
          <p className="mt-1 text-sm text-textMuted">
            Month-on-month trending with variance explanations and linked drill-downs.
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                label: "November collections",
                value: "₹1.02 Cr",
                status: "+6.3% vs target",
              },
              {
                label: "Placement revenue share",
                value: "₹18.5L",
                status: "+2 new partners",
              },
              {
                label: "Deferred payment backlog",
                value: "₹9.7L",
                status: "Clearing at expected rate",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 text-sm text-text"
              >
                <p className="font-semibold">{item.label}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-textMuted">
                  <span>{item.value}</span>
                  <span className="font-semibold text-brand">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;


