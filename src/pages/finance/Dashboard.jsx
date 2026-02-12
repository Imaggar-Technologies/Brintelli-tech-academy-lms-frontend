import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Gift, 
  AlertCircle, 
  TrendingUp, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Filter,
  Eye,
  CreditCard,
  Clock,
  FileText,
  RefreshCw
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import { scholarshipAPI } from "../../api/scholarship";
import { financeAPI } from "../../api/finance";
import toast from "react-hot-toast";

/**
 * FINANCE DASHBOARD - Redesigned Layout
 * 
 * Clean card-based UI with proper grid layout
 * Sections:
 * 1. Summary Cards (Total Revenue, Offers & Scholarships, Due Amount)
 * 2. Collection Status (Today Collected, Scholarship Applied, Refund, Yet to Refund)
 * 3. Main Panels (Receivable List, Scholarship Panel)
 * 4. Bottom Panels (Refund Approval, Overdue, Transactions)
 */
const FinanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    offersAndScholarships: 0,
    dueAmount: 0,
    todayCollected: 0,
    scholarshipApplied: 0,
    refund: 0,
    yetToRefund: 0,
  });
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    program: '',
    paymentType: '',
  });
  const [receivablePayments, setReceivablePayments] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [offersResponse, leadsResponse, scholarshipsResponse] = await Promise.all([
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
      ]);

      const offers = offersResponse.success ? offersResponse.data.offers || [] : [];
      const leads = leadsResponse.success ? leadsResponse.data.leads || [] : [];
      const scholarshipRequests = scholarshipsResponse.success 
        ? scholarshipsResponse.data.scholarshipRequests || [] 
        : [];

      // Create leads map
      const leadsMap = {};
      leads.forEach(lead => {
        leadsMap[lead.id] = lead;
      });

      // Calculate stats
      const totalRevenue = offers.reduce((sum, offer) => sum + (offer.offeredPrice || 0), 0);
      const totalCollected = offers
        .filter(offer => offer.paymentStatus === 'PAID')
        .reduce((sum, offer) => sum + (offer.paymentAmount || offer.offeredPrice || 0), 0);
      const dueAmount = totalRevenue - totalCollected;
      
      // Offers & Scholarships (pending + approved scholarships)
      const pendingScholarships = scholarshipRequests
        .filter(s => ['REQUESTED', 'APPROVED'].includes(s.status))
        .reduce((sum, s) => sum + (s.requestedAmount || 0), 0);
      const offersAndScholarships = totalRevenue + pendingScholarships;

      // Today's collections
      const today = new Date().toDateString();
      const todayCollected = offers
        .filter(offer => {
          if (offer.paymentStatus !== 'PAID' || !offer.paymentDate) return false;
          return new Date(offer.paymentDate).toDateString() === today;
        })
        .reduce((sum, offer) => sum + (offer.paymentAmount || 0), 0);

      // Scholarship Applied (approved scholarships)
      const scholarshipApplied = scholarshipRequests
        .filter(s => s.status === 'APPROVED')
        .reduce((sum, s) => sum + (s.approvedAmount || s.requestedAmount || 0), 0);

      // Refund (completed refunds)
      const refund = 0; // TODO: Calculate from refunds API
      const yetToRefund = 0; // TODO: Calculate from refunds API

      setStats({
        totalRevenue,
        offersAndScholarships,
        dueAmount,
        todayCollected,
        scholarshipApplied,
        refund,
        yetToRefund,
      });

      // Receivable Payments (PENDING, PARTIAL, OVERDUE)
      const receivable = offers
        .filter(offer => ['PENDING', 'PARTIAL'].includes(offer.paymentStatus))
        .map(offer => {
          const lead = leadsMap[offer.leadId];
          const dueDate = offer.dueDate || offer.sentAt;
          const now = new Date();
          const due = dueDate ? new Date(dueDate) : null;
          const isOverdue = due && due < now;
          
          let status = 'Partial';
          if (offer.paymentStatus === 'PENDING') status = 'Overdue';
          if (isOverdue) status = 'Overdue';
          if (offer.paymentStatus === 'PARTIAL') status = 'Partial';
          if (offer.paymentStatus === 'PAID') status = 'Paid';

          return {
            id: offer.id,
            studentName: lead?.name || 'Unknown',
            program: offer.courseName || lead?.courseName || 'N/A',
            amount: offer.offeredPrice || 0,
            paidAmount: offer.paymentAmount || 0,
            dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A',
            status,
            offerId: offer.id,
          };
        })
        .sort((a, b) => {
          // Sort by overdue first, then by due date
          if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
          if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
          return new Date(b.dueDate) - new Date(a.dueDate);
        });

      setReceivablePayments(receivable);

      // Scholarships
      const scholarshipsList = scholarshipRequests.map(scholarship => {
        const lead = leadsMap[scholarship.leadId];
        return {
          id: scholarship.id,
          studentName: lead?.name || 'Unknown',
          program: scholarship.courseName || lead?.courseName || 'N/A',
          scholarshipType: scholarship.type || 'Merit-Based',
          amount: scholarship.requestedAmount || 0,
          status: scholarship.status || 'REQUESTED',
        };
      });
      setScholarships(scholarshipsList);

      // Refund Requests (mock data for now)
      const refunds = [
        // TODO: Replace with actual refund API data
        { id: '1', studentName: 'John Doe', amount: 50000, reason: 'Course cancellation', status: 'REQUESTED' },
        { id: '2', studentName: 'Jane Smith', amount: 30000, reason: 'Dissatisfaction', status: 'APPROVED' },
      ];
      setRefundRequests(refunds);

      // Overdue List
      const now = new Date();
      const overdue = offers
        .filter(offer => {
          if (offer.paymentStatus === 'PAID') return false;
          if (!offer.sentAt) return false;
          const sentDate = new Date(offer.sentAt);
          const daysDiff = (now - sentDate) / (1000 * 60 * 60 * 24);
          return daysDiff > 7;
        })
        .map(offer => ({
          id: offer.id,
          studentName: leadsMap[offer.leadId]?.name || 'Unknown',
          amount: offer.offeredPrice || 0,
          daysOverdue: Math.floor((now - new Date(offer.sentAt)) / (1000 * 60 * 60 * 24)) - 7,
        }))
        .sort((a, b) => b.daysOverdue - a.daysOverdue)
        .slice(0, 5);
      setOverdueList(overdue);

      // Transactions (latest payments)
      const latestTransactions = offers
        .filter(offer => offer.paymentStatus === 'PAID' && offer.paymentDate)
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
        .slice(0, 5)
        .map(offer => ({
          id: offer.id,
          studentName: leadsMap[offer.leadId]?.name || 'Unknown',
          amount: offer.paymentAmount || 0,
          date: new Date(offer.paymentDate).toLocaleDateString(),
          method: offer.paymentMethod || 'N/A',
        }));
      setTransactions(latestTransactions);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      case 'REQUESTED':
        return 'bg-blue-100 text-blue-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'DENIED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleApproveRefund = (refundId) => {
    toast.success(`Refund ${refundId} approved`);
    // TODO: Implement refund approval API call
  };

  const handleRejectRefund = (refundId) => {
    toast.error(`Refund ${refundId} rejected`);
    // TODO: Implement refund rejection API call
  };

  return (
    <>
      <PageHeader
        title="Finance Dashboard"
        description="Comprehensive financial overview and management"
        actions={
          <Button variant="ghost" size="sm" onClick={() => toast.info('Export functionality coming soon')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-textMuted" />
            <span className="text-sm font-medium text-text">Filters:</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-textMuted mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-brintelli-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-textMuted mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-brintelli-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-textMuted mb-1">Program</label>
            <select
              value={filters.program}
              onChange={(e) => setFilters({ ...filters, program: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-brintelli-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Programs</option>
              {programs.map(prog => (
                <option key={prog.id} value={prog.id}>{prog.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-textMuted mb-1">Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-brintelli-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Types</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1 - SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-brand-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-brand-600" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Offers & Scholarships</p>
                  <p className="text-3xl font-bold text-accent-600">{formatCurrency(stats.offersAndScholarships)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent-100 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Due Amount</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.dueAmount)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 - COLLECTION STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Today Collected</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayCollected)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Scholarship Applied</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.scholarshipApplied)}</p>
                </div>
                <Gift className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Refund</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.refund)}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Yet to Refund</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.yetToRefund)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* SECTION 3 - MAIN PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Receivable List */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Receivable List of Payments</h3>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/dues'}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brintelli-border/50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-textMuted">Student</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-textMuted">Program</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-textMuted">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-textMuted">Due Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-textMuted">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-textMuted">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brintelli-border/30">
                    {receivablePayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-textMuted">
                          No receivable payments found
                        </td>
                      </tr>
                    ) : (
                      receivablePayments.slice(0, 10).map((payment) => (
                        <tr key={payment.id} className="hover:bg-brintelli-baseAlt/30">
                          <td className="px-3 py-3">
                            <p className="font-medium text-text">{payment.studentName}</p>
                          </td>
                          <td className="px-3 py-3 text-textMuted">{payment.program}</td>
                          <td className="px-3 py-3 font-semibold text-text">{formatCurrency(payment.amount)}</td>
                          <td className="px-3 py-3 text-textMuted">{payment.dueDate}</td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.location.href = `/finance/processing?offerId=${payment.offerId}`}
                                className="p-1 text-brand-600 hover:bg-brand-50 rounded"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => window.location.href = `/finance/processing?offerId=${payment.offerId}&action=pay`}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Pay"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel - Scholarship Panel */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Scholarship Panel</h3>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/scholarships'}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {scholarships.length === 0 ? (
                  <div className="text-center py-8 text-textMuted">
                    No scholarship requests found
                  </div>
                ) : (
                  scholarships.slice(0, 10).map((scholarship) => (
                    <div
                      key={scholarship.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-brintelli-border bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-text">{scholarship.studentName}</p>
                        <p className="text-xs text-textMuted">{scholarship.program}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-textMuted">{scholarship.scholarshipType}</span>
                          <span className="text-xs font-semibold text-text">{formatCurrency(scholarship.amount)}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(scholarship.status)}`}>
                        {scholarship.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4 - BOTTOM PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Refund Approval */}
            <div className="lg:col-span-2 rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Refund Approval</h3>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/refunds'}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {refundRequests.length === 0 ? (
                  <div className="text-center py-8 text-textMuted">
                    No refund requests found
                  </div>
                ) : (
                  refundRequests.map((refund) => (
                    <div
                      key={refund.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-brintelli-border bg-white"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-text">{refund.studentName}</p>
                        <p className="text-sm text-textMuted mt-1">{refund.reason}</p>
                        <p className="text-sm font-semibold text-text mt-1">{formatCurrency(refund.amount)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(refund.status)}`}>
                          {refund.status}
                        </span>
                        {refund.status === 'REQUESTED' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRefund(refund.id)}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRefund(refund.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right - Two Small Boxes */}
            <div className="space-y-6">
              {/* Overdue Box */}
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-text">Overdue</h3>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/dues'}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {overdueList.length === 0 ? (
                    <p className="text-sm text-textMuted text-center py-4">No overdue payments</p>
                  ) : (
                    overdueList.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded border border-brintelli-border bg-white">
                        <div>
                          <p className="text-xs font-medium text-text">{item.studentName}</p>
                          <p className="text-xs text-textMuted">{item.daysOverdue} days</p>
                        </div>
                        <p className="text-xs font-semibold text-red-600">{formatCurrency(item.amount)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transactions Box */}
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-text">Transactions</h3>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/finance/transactions'}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <p className="text-sm text-textMuted text-center py-4">No recent transactions</p>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 rounded border border-brintelli-border bg-white">
                        <div>
                          <p className="text-xs font-medium text-text">{transaction.studentName}</p>
                          <p className="text-xs text-textMuted">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-green-600">{formatCurrency(transaction.amount)}</p>
                          <p className="text-xs text-textMuted">{transaction.method}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinanceDashboard;
