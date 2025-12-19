import { BarChart3, TrendingUp, Target, DollarSign, Users, Calendar } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";

const SalesAnalytics = () => {
  return (
    <>
      <PageHeader
        title="Sales Analytics"
        description="Comprehensive analytics and insights into your sales performance."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={DollarSign} value="₹2.4M" label="Total Revenue" trend="+18% vs last month" />
        <StatsCard icon={Target} value="34%" label="Win Rate" trend="+5% improvement" />
        <StatsCard icon={Users} value="142" label="Active Leads" trend="+24 new this week" />
        <StatsCard icon={Calendar} value="28" label="Avg Days to Close" trend="-3 days faster" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Revenue Trends</h3>
          <div className="h-72 rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt text-center text-sm text-textMuted">
            <div className="flex h-full flex-col items-center justify-center">
              <BarChart3 className="h-10 w-10 text-textMuted" />
              <p className="mt-3 font-semibold text-textMuted">Revenue Chart</p>
              <p>Monthly revenue trends over time</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Conversion Funnel</h3>
          <div className="h-72 rounded-2xl border border-dashed border-brintelli-border bg-brintelli-baseAlt text-center text-sm text-textMuted">
            <div className="flex h-full flex-col items-center justify-center">
              <TrendingUp className="h-10 w-10 text-textMuted" />
              <p className="mt-3 font-semibold text-textMuted">Funnel Chart</p>
              <p>Lead to customer conversion funnel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text mb-4">Performance Metrics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { metric: "Sales Cycle", value: "28 days", change: "-3 days" },
            { metric: "Deal Size", value: "₹85K", change: "+12%" },
            { metric: "Activity Rate", value: "78%", change: "+5%" },
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <p className="text-sm text-textMuted">{item.metric}</p>
              <p className="mt-2 text-2xl font-semibold text-text">{item.value}</p>
              <p className="mt-1 text-xs text-green-600">{item.change}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesAnalytics;