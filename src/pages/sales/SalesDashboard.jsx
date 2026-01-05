import { Target, CalendarClock, Handshake, TrendingUp, DollarSign, Users, BarChart3, ArrowUpRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import Button from "../../components/Button";

const SalesDashboard = () => {
  return (
    <>
      <PageHeader
        title="Sales Dashboard"
        description="Track your sales performance, pipeline health, and revenue metrics in real-time."
        actions={
          <Button variant="secondary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard 
          icon={DollarSign} 
          value="₹2.4M" 
          label="Total Revenue" 
          trend="+18% vs last month" 
        />
        <StatsCard 
          icon={Target} 
          value="142" 
          label="Active Leads" 
          trend="+24 new this week" 
        />
        <StatsCard 
          icon={Handshake} 
          value="28" 
          label="Active Deals" 
          trend="₹1.8M pipeline value" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value="34%" 
          label="Win Rate" 
          trend="+5% improvement" 
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text">Pipeline Overview</h3>
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { stage: "Qualified", count: 45, value: "₹850K", color: "bg-blue-500" },
              { stage: "Demo Scheduled", count: 28, value: "₹620K", color: "bg-purple-500" },
              { stage: "Proposal Sent", count: 18, value: "₹420K", color: "bg-orange-500" },
              { stage: "Negotiation", count: 12, value: "₹280K", color: "bg-yellow-500" },
            ].map((item) => (
              <div key={item.stage} className="flex items-center justify-between rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <div>
                    <p className="font-semibold text-text">{item.stage}</p>
                    <p className="text-xs text-textMuted">{item.count} leads</p>
                  </div>
                </div>
                <p className="font-semibold text-text">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 shadow-soft">
          <h3 className="text-base font-semibold text-text">Recent Activity</h3>
          <div className="mt-3 space-y-2">
            {[
              { action: "New lead added", company: "TechCorp Inc.", time: "2 hours ago" },
              { action: "Demo completed", company: "StartupXYZ", time: "5 hours ago" },
              { action: "Deal won", company: "Enterprise Solutions", time: "1 day ago" },
              { action: "Follow-up scheduled", company: "Global Tech", time: "2 days ago" },
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2">
                <p className="font-semibold text-text">{item.action}</p>
                <p className="text-sm text-textSoft">{item.company}</p>
                <p className="text-xs text-textMuted">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 shadow-soft">
        <h3 className="text-base font-semibold text-text">Sales Performance</h3>
        <div className="mt-4 h-56 rounded-xl border border-dashed border-brintelli-border bg-brintelli-baseAlt text-center text-sm text-textMuted">
          <div className="flex h-full flex-col items-center justify-center">
            <BarChart3 className="h-10 w-10 text-textMuted" />
            <p className="mt-3 font-semibold text-textMuted">Revenue Chart</p>
            <p>Monthly revenue trends and conversion metrics</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesDashboard;