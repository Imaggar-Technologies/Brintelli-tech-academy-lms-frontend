import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BarChart3, TrendingUp, Target, DollarSign, Users, Calendar, FileBarChart, Award, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { AnyPermissionGate } from "../../components/PermissionGate";
import { PERMISSIONS } from "../../utils/permissions";

/**
 * EXECUTIVE DASHBOARD PAGE
 * 
 * WORKFLOW: Department-level overview and analytics
 * 
 * RBAC: Only Sales Head/Admin can access (requires sales:view_reports AND sales:manage_team)
 * 
 * ABAC: All department data (no filtering - department-wide view)
 * 
 * BUSINESS LOGIC:
 * - Revenue tracking
 * - Conversion analysis
 * - Performance metrics
 * - Department-wide pipeline health
 */

const ExecutiveDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    activeLeads: 0,
    activeDeals: 0,
    winRate: 0,
    conversionRate: 0,
    avgDealValue: 0,
  });
  const [loading, setLoading] = useState(true);

  // TODO: Fetch department-wide metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // TODO: API call to get department metrics
        // const response = await salesAPI.getExecutiveMetrics();
        // setMetrics(response.data);
        
        // Placeholder data
        setMetrics({
          totalRevenue: 2400000,
          activeLeads: 142,
          activeDeals: 28,
          winRate: 34,
          conversionRate: 18,
          avgDealValue: 85000,
        });
      } catch (error) {
        console.error('Error fetching executive metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <>
      <PageHeader
        title="Executive Dashboard"
        description="Department-wide sales performance, revenue metrics, and conversion analytics."
        actions={
          <Button variant="secondary" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {/* Key Metrics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard 
          icon={DollarSign} 
          value={`₹${(metrics.totalRevenue / 1000000).toFixed(1)}M`} 
          label="Total Revenue" 
          trend="+18% vs last month" 
        />
        <StatsCard 
          icon={Target} 
          value={metrics.activeLeads} 
          label="Active Leads" 
          trend="+24 new this week" 
        />
        <StatsCard 
          icon={Award} 
          value={metrics.activeDeals} 
          label="Active Deals" 
          trend={`₹${(metrics.activeDeals * metrics.avgDealValue / 100000).toFixed(1)}M pipeline`} 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={`${metrics.winRate}%`} 
          label="Win Rate" 
          trend="+5% improvement" 
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={BarChart3} 
          value={`${metrics.conversionRate}%`} 
          label="Conversion Rate" 
          trend="Lead to Deal" 
        />
        <StatsCard 
          icon={DollarSign} 
          value={`₹${(metrics.avgDealValue / 1000).toFixed(0)}K`} 
          label="Avg Deal Value" 
          trend="Per deal" 
        />
        <StatsCard 
          icon={Users} 
          value="4" 
          label="Sales Teams" 
          trend="Active teams" 
        />
      </div>

      {/* Analytics Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Overview */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Pipeline Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Qualified</span>
              <span className="font-semibold text-text">45 leads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Demo Scheduled</span>
              <span className="font-semibold text-text">28 leads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Proposal Sent</span>
              <span className="font-semibold text-text">18 leads</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Negotiation</span>
              <span className="font-semibold text-text">12 leads</span>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Performance Trends</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Revenue Growth</span>
              <span className="font-semibold text-green-600">+18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Lead Growth</span>
              <span className="font-semibold text-green-600">+24%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Win Rate Improvement</span>
              <span className="font-semibold text-green-600">+5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">Avg Days to Close</span>
              <span className="font-semibold text-text">28 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Add charts and graphs for revenue, conversion funnel, team performance */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Revenue Analytics</h3>
        <p className="text-textMuted text-sm">
          TODO: Add revenue charts, conversion funnel visualization, and team performance graphs
        </p>
      </div>
    </>
  );
};

export default ExecutiveDashboard;

