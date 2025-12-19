import { Sparkles, Users, Gift, DollarSign, TrendingUp, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const SalesReferrals = () => {
  const referrals = [
    { referrer: "John Doe", company: "TechCorp Inc.", status: "Converted", reward: "₹5,000", date: "2024-01-10" },
    { referrer: "Jane Smith", company: "StartupXYZ", status: "In Progress", reward: "Pending", date: "2024-01-12" },
    { referrer: "Mike Johnson", company: "Digital Solutions", status: "Converted", reward: "₹8,000", date: "2024-01-08" },
  ];

  return (
    <>
      <PageHeader
        title="Referral Program"
        description="Track referrals from customers and partners, and manage referral rewards."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Referral Link
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={Users} value="45" label="Total Referrals" trend="+12 this month" />
        <StatsCard icon={Gift} value="18" label="Converted" trend="40% conversion" />
        <StatsCard icon={DollarSign} value="₹125K" label="Rewards Paid" trend="This quarter" />
        <StatsCard icon={TrendingUp} value="32%" label="Conversion Rate" trend="+8% improvement" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Referral Activity</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {referrals.map((referral, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{referral.referrer}</h4>
                    <p className="text-sm text-textSoft">{referral.company}</p>
                    <p className="text-xs text-textMuted">Referred: {referral.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      referral.status === "Converted"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {referral.status}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold text-text">{referral.reward}</p>
                    <p className="text-xs text-textMuted">Reward</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
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

export default SalesReferrals;