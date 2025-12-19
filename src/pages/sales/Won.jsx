import { Award, TrendingUp, DollarSign, Calendar, CheckCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";

const SalesWon = () => {
  const wonDeals = [
    { company: "Enterprise Solutions", value: "₹420K", closed: "2024-01-10", owner: "Mike Johnson", duration: "45 days" },
    { company: "TechCorp Inc.", value: "₹250K", closed: "2024-01-08", owner: "John Doe", duration: "32 days" },
    { company: "Digital Innovations", value: "₹320K", closed: "2024-01-05", owner: "Jane Smith", duration: "28 days" },
    { company: "Cloud Systems", value: "₹180K", closed: "2024-01-03", owner: "Sarah Williams", duration: "21 days" },
  ];

  return (
    <>
      <PageHeader
        title="Won Deals"
        description="Celebrate your successful deals and track revenue from closed opportunities."
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={Award} value="24" label="Won This Month" trend="+6 vs last month" />
        <StatsCard icon={DollarSign} value="₹2.8M" label="Total Revenue" trend="+32% growth" />
        <StatsCard icon={TrendingUp} value="34%" label="Win Rate" trend="+5% improvement" />
        <StatsCard icon={Calendar} value="28" label="Avg Days to Close" trend="-3 days faster" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Recent Wins</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {wonDeals.map((deal, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{deal.company}</h4>
                    <p className="text-sm text-textSoft">
                      Closed: {deal.closed} • Duration: {deal.duration}
                    </p>
                    <p className="text-xs text-textMuted">Owner: {deal.owner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-green-600">{deal.value}</p>
                  <p className="text-xs text-textMuted">Revenue</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesWon;