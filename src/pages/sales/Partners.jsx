import { UsersRound, Handshake, TrendingUp, DollarSign, Building2, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const SalesPartners = () => {
  const partners = [
    { name: "Tech Partners Inc.", type: "Reseller", deals: 12, revenue: "₹850K", status: "Active" },
    { name: "Channel Solutions", type: "Referral", deals: 8, revenue: "₹420K", status: "Active" },
    { name: "Partner Network", type: "Strategic", deals: 15, revenue: "₹1.2M", status: "Active" },
  ];

  return (
    <>
      <PageHeader
        title="Partner Network"
        description="Manage your partner relationships and track referral revenue."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={UsersRound} value="24" label="Active Partners" trend="+3 this quarter" />
        <StatsCard icon={Handshake} value="35" label="Partner Deals" trend="+8 this month" />
        <StatsCard icon={DollarSign} value="₹2.4M" label="Partner Revenue" trend="+25% growth" />
        <StatsCard icon={TrendingUp} value="28%" label="Partner Contribution" trend="+5% increase" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Partner Directory</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {partners.map((partner, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft/20 text-brand">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{partner.name}</h4>
                    <p className="text-sm text-textSoft">Type: {partner.type} • {partner.deals} deals</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-semibold text-text">{partner.revenue}</p>
                    <p className="text-xs text-textMuted">Total revenue</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {partner.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View Details
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

export default SalesPartners;