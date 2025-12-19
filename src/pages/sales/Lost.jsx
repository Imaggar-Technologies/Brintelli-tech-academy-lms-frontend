import { XCircle, AlertTriangle, TrendingDown, DollarSign, FileText } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import Button from "../../components/Button";

const SalesLost = () => {
  const lostDeals = [
    { company: "StartupXYZ", value: "₹180K", reason: "Budget constraints", lost: "2024-01-12", owner: "Jane Smith" },
    { company: "Digital Solutions", value: "₹320K", reason: "Competitor won", lost: "2024-01-10", owner: "Mike Johnson" },
    { company: "Global Tech", value: "₹150K", reason: "Timing not right", lost: "2024-01-08", owner: "Sarah Williams" },
  ];

  return (
    <>
      <PageHeader
        title="Lost Deals"
        description="Analyze lost opportunities to improve your sales process and win rate."
        actions={
          <Button variant="secondary" className="gap-2">
            <FileText className="h-4 w-4" />
            Loss Analysis Report
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={XCircle} value="12" label="Lost This Month" trend="-3 vs last month" />
        <StatsCard icon={DollarSign} value="₹650K" label="Lost Value" trend="Opportunity cost" />
        <StatsCard icon={AlertTriangle} value="18%" label="Loss Rate" trend="-2% improvement" />
        <StatsCard icon={TrendingDown} value="Budget" label="Top Reason" trend="Most common" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Lost Opportunities</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {lostDeals.map((deal, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{deal.company}</h4>
                    <p className="text-sm text-textSoft">Reason: {deal.reason}</p>
                    <p className="text-xs text-textMuted">Lost: {deal.lost} • Owner: {deal.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-semibold text-text">{deal.value}</p>
                    <p className="text-xs text-textMuted">Lost value</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesLost;