import { useState, useEffect } from "react";
import { Wallet, DollarSign, AlertCircle, Clock, TrendingUp, Download, ArrowRight, CreditCard, CheckCircle2, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import { scholarshipAPI } from "../../api/scholarship";
import { financeAPI } from "../../api/finance";
import toast from "react-hot-toast";

/**
 * FINANCE OVERVIEW DASHBOARD
 * 
 * One-glance financial health dashboard
 * Shows KPIs, charts, and quick tables
 * 
 * RBAC: All finance roles (finance, finance_head)
 */
const FinanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    todayCollections: 0,
    pendingScholarships: 0,
    refunds: 0,
  });
  const [latestPayments, setLatestPayments] = useState([]);
  const [topOverdue, setTopOverdue] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [paymentModeSplit, setPaymentModeSplit] = useState({
    UPI: 0,
    CARD: 0,
    CASH: 0,
    BANK_TRANSFER: 0,
    CHEQUE: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [offersResponse, leadsResponse, scholarshipsResponse, statsResponse] = await Promise.all([
        offerAPI.getAllOffers().catch(err => {
          console.error('Error fetching offers:', err);
          return { success: false, data: { offers: [] } };
        }),
        leadAPI.getAllLeads().catch(err => {
          console.error('Error fetching leads:', err);
          return { success: false, data: { leads: [] } };
        }),
        scholarshipAPI.getAllScholarships().catch(err => {
          console.error('Error fetching scholarships:', err);
          return { success: false, data: { scholarshipRequests: [] } };
        }),
        financeAPI.getDashboardStats().catch(() => null), // Optional: use backend stats endpoint
      ]);

      console.log('Dashboard data fetched:', {
        offers: offersResponse?.data?.offers?.length || 0,
        leads: leadsResponse?.data?.leads?.length || 0,
        scholarships: scholarshipsResponse?.data?.scholarshipRequests?.length || 0,
        stats: statsResponse?.data?.stats ? 'available' : 'not available',
      });

      // Use backend stats if available, otherwise calculate on frontend
      if (statsResponse?.success && statsResponse.data?.stats) {
        setStats(statsResponse.data.stats);
      } else if (offersResponse.success && offersResponse.data.offers) {
        const offers = offersResponse.data.offers;
        
        // Calculate stats from offers
        const totalRevenue = offers.reduce((sum, offer) => sum + (offer.offeredPrice || 0), 0);
        const totalCollected = offers
          .filter(offer => offer.paymentStatus === 'PAID')
          .reduce((sum, offer) => sum + (offer.paymentAmount || offer.offeredPrice || 0), 0);
        const totalOutstanding = totalRevenue - totalCollected;
        
        // Overdue (offers with payment status PENDING or PARTIAL, older than 7 days)
        const now = new Date();
        const overdueOffers = offers.filter(offer => {
          if (offer.paymentStatus === 'PAID') return false;
          if (!offer.sentAt) return false;
          const sentDate = new Date(offer.sentAt);
          const daysDiff = (now - sentDate) / (1000 * 60 * 60 * 24);
          return daysDiff > 7;
        });
        const overdueAmount = overdueOffers.reduce((sum, offer) => sum + (offer.offeredPrice || 0), 0);

        // Today's collections
        const today = new Date().toDateString();
        const todayCollections = offers
          .filter(offer => {
            if (offer.paymentStatus !== 'PAID' || !offer.paymentDate) return false;
            return new Date(offer.paymentDate).toDateString() === today;
          })
          .reduce((sum, offer) => sum + (offer.paymentAmount || 0), 0);

        // Pending scholarships impact
        const pendingScholarships = scholarshipsResponse.success && scholarshipsResponse.data.scholarshipRequests
          ? scholarshipsResponse.data.scholarshipRequests
              .filter(s => s.status === 'REQUESTED')
              .reduce((sum, s) => sum + (s.requestedAmount || 0), 0)
          : 0;

        setStats({
          totalRevenue,
          totalCollected,
          totalOutstanding,
          overdueAmount,
          todayCollections,
          pendingScholarships,
          refunds: 0, // TODO: Calculate from refunds data
        });
      }

      // Process offers for tables and charts
      if (offersResponse.success && offersResponse.data.offers) {
        const offers = offersResponse.data.offers;

        // Latest 10 payments
        const now = new Date();
        const paidOffers = offers
          .filter(offer => offer.paymentStatus === 'PAID' && offer.paymentDate)
          .sort((a, b) => {
            const dateA = new Date(a.paymentDate);
            const dateB = new Date(b.paymentDate);
            return dateB - dateA;
          })
          .slice(0, 10);
        
        if (leadsResponse.success && leadsResponse.data.leads) {
          const leadsMap = {};
          leadsResponse.data.leads.forEach(lead => {
            leadsMap[lead.id] = lead;
          });

          setLatestPayments(paidOffers.map(offer => ({
            ...offer,
            lead: leadsMap[offer.leadId],
          })));

          // Top 10 overdue
          const overdueOffers = offers.filter(offer => {
            if (offer.paymentStatus === 'PAID') return false;
            if (!offer.sentAt) return false;
            const sentDate = new Date(offer.sentAt);
            const daysDiff = (now - sentDate) / (1000 * 60 * 60 * 24);
            return daysDiff > 7;
          });

          const overdueWithLeads = overdueOffers
            .map(offer => ({
              ...offer,
              lead: leadsMap[offer.leadId],
              daysOverdue: Math.floor((now - new Date(offer.sentAt)) / (1000 * 60 * 60 * 24)) - 7,
            }))
            .filter(item => item.daysOverdue > 0)
            .sort((a, b) => b.daysOverdue - a.daysOverdue)
            .slice(0, 10);
          
          setTopOverdue(overdueWithLeads);
        }

        // Payment mode split
        const modeSplit = {
          UPI: 0,
          CARD: 0,
          CASH: 0,
          BANK_TRANSFER: 0,
          CHEQUE: 0,
        };
        offers.forEach(offer => {
          if (offer.paymentMethod && offer.paymentAmount > 0) {
            const method = offer.paymentMethod.toUpperCase();
            if (modeSplit[method] !== undefined) {
              modeSplit[method] += offer.paymentAmount;
            }
          }
        });
        setPaymentModeSplit(modeSplit);

        // Revenue trend (last 30 days - simplified)
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toDateString();
          const dayRevenue = offers
            .filter(offer => {
              if (offer.paymentStatus !== 'PAID' || !offer.paymentDate) return false;
              return new Date(offer.paymentDate).toDateString() === dateStr;
            })
            .reduce((sum, offer) => sum + (offer.paymentAmount || 0), 0);
          last30Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayRevenue,
          });
        }
        setRevenueTrend(last30Days);
      } else {
        // If no offers, set empty data
        console.log('No offers found, setting empty state');
        setStats({
          totalRevenue: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          overdueAmount: 0,
          todayCollections: 0,
          pendingScholarships: 0,
          refunds: 0,
        });
        setLatestPayments([]);
        setTopOverdue([]);
        setRevenueTrend([]);
        setPaymentModeSplit({
          UPI: 0,
          CARD: 0,
          CASH: 0,
          BANK_TRANSFER: 0,
          CHEQUE: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      // Set empty state on error
      setStats({
        totalRevenue: 0,
        totalCollected: 0,
        totalOutstanding: 0,
        overdueAmount: 0,
        todayCollections: 0,
        pendingScholarships: 0,
        refunds: 0,
      });
      setLatestPayments([]);
      setTopOverdue([]);
      setRevenueTrend([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  const getRiskLevel = (daysOverdue) => {
    if (daysOverdue > 30) return { level: 'High', color: 'bg-red-100 text-red-700' };
    if (daysOverdue > 15) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
    return { level: 'Low', color: 'bg-green-100 text-green-700' };
  };

  return (
    <>
      <PageHeader
        title="Finance Overview"
        description="One-glance financial health dashboard"
        actions={
          <Button variant="ghost" size="sm" onClick={() => toast.info('Export functionality coming soon')}>
            <Download className="h-4 w-4" />
            Export Summary
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Top KPI Cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4">
        <StatsCard
          icon={DollarSign}
          value={formatCurrency(stats.totalRevenue)}
          label="Total Revenue (YTD)"
          trend="All time revenue"
        />
        <StatsCard
          icon={CheckCircle2}
          value={formatCurrency(stats.totalCollected)}
          label="Total Collected"
          trend={stats.totalRevenue > 0 ? `${((stats.totalCollected / stats.totalRevenue) * 100).toFixed(1)}% collection rate` : "No revenue yet"}
          trendType={stats.totalRevenue > 0 && stats.totalCollected / stats.totalRevenue > 0.8 ? "positive" : undefined}
        />
        <StatsCard
          icon={AlertCircle}
          value={formatCurrency(stats.totalOutstanding)}
          label="Outstanding Dues"
          trend={`${formatCurrency(stats.overdueAmount)} overdue`}
          trendType={stats.totalOutstanding > 0 ? "negative" : undefined}
        />
        <StatsCard
          icon={Clock}
          value={formatCurrency(stats.overdueAmount)}
          label="Overdue Amount"
          trend="Requires immediate attention"
          trendType="negative"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <StatsCard
          icon={TrendingUp}
          value={formatCurrency(stats.todayCollections)}
          label="Today's Collections"
          trend="Collections today"
        />
        <StatsCard
          icon={Wallet}
          value={formatCurrency(stats.pendingScholarships)}
          label="Pending Scholarships"
          trend="Revenue impact"
          trendType="negative"
        />
        <StatsCard
          icon={XCircle}
          value={formatCurrency(stats.refunds)}
          label="Refunds"
          trend="Total refunded"
        />
      </div>

      {/* Charts and Quick Tables */}
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text">Revenue Trend (Last 30 Days)</h3>
            <Button variant="ghost" size="sm" onClick={() => toast.info('View full analytics')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="h-48 flex items-end justify-between gap-1">
            {revenueTrend.map((day, index) => {
              const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);
              const height = (day.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-brand-500 rounded-t transition-all hover:bg-brand-600"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${formatCurrency(day.revenue)}`}
                  />
                  {index % 5 === 0 && (
                    <span className="text-xs text-textMuted mt-1 transform -rotate-45 origin-left">
                      {day.date.split(' ')[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Mode Split */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4">
          <h3 className="text-base font-semibold text-text mb-3">Payment Mode Split</h3>
          <div className="space-y-3">
            {Object.entries(paymentModeSplit).map(([mode, amount]) => {
              const total = Object.values(paymentModeSplit).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (amount / total) * 100 : 0;
              return (
                <div key={mode}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-textMuted">{mode.replace('_', ' ')}</span>
                    <span className="text-sm font-semibold text-text">{formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-brintelli-baseAlt rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tables */}
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        {/* Latest 10 Payments */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text">Latest 10 Payments</h3>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/processing'}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brintelli-border/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Amount</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-textMuted">Loading...</p>
                      </div>
                    </td>
                  </tr>
                ) : latestPayments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-textMuted">No payments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  latestPayments.map((payment) => (
                    <tr key={payment.id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-semibold text-sm text-text">{payment.lead?.name || 'N/A'}</p>
                        <p className="text-xs text-textMuted">{payment.paymentMethod || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-sm text-text">₹{payment.paymentAmount?.toLocaleString() || '0'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-textMuted text-xs">
                          {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Overdue */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text">Top 10 Overdue Students</h3>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/dues'}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brintelli-border/50">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Due</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Days</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-textMuted">Loading...</p>
                      </div>
                    </td>
                  </tr>
                ) : topOverdue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-textMuted">No overdue found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topOverdue.map((item) => {
                    const risk = getRiskLevel(item.daysOverdue);
                    return (
                      <tr key={item.id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-sm text-text">{item.lead?.name || 'N/A'}</p>
                          <p className="text-xs text-textMuted">{item.lead?.email || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-sm text-text">₹{item.offeredPrice?.toLocaleString() || '0'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-textMuted">{item.daysOverdue} days</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${risk.color}`}>
                            {risk.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paid vs Due vs Overdue Donut (Simplified) */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4">
        <h3 className="text-base font-semibold text-text mb-3">Payment Status Overview</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="text-center p-3 rounded-lg bg-green-50">
            <p className="text-xl font-bold text-green-700">{formatCurrency(stats.totalCollected)}</p>
            <p className="text-sm text-green-600 mt-1">Paid</p>
            <p className="text-xs text-textMuted mt-1">
              {stats.totalRevenue > 0 ? ((stats.totalCollected / stats.totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50">
            <p className="text-xl font-bold text-yellow-700">{formatCurrency(stats.totalOutstanding - stats.overdueAmount)}</p>
            <p className="text-sm text-yellow-600 mt-1">Due</p>
            <p className="text-xs text-textMuted mt-1">
              {stats.totalRevenue > 0 ? (((stats.totalOutstanding - stats.overdueAmount) / stats.totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50">
            <p className="text-xl font-bold text-red-700">{formatCurrency(stats.overdueAmount)}</p>
            <p className="text-sm text-red-600 mt-1">Overdue</p>
            <p className="text-xs text-textMuted mt-1">
              {stats.totalRevenue > 0 ? ((stats.overdueAmount / stats.totalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </>
  );
};

export default FinanceDashboard;
