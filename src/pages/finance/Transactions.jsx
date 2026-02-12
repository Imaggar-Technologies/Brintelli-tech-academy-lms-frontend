import { useState, useEffect } from "react";
import { Search, Download, ArrowDownCircle, ArrowUpCircle, RefreshCw, Eye } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";

/**
 * TRANSACTIONS PAGE
 * 
 * Lists ALL payment transactions - everyone who has paid
 * Shows complete payment history with filters
 */
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    paymentStatus: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [leadsMap, setLeadsMap] = useState({});

  useEffect(() => {
    fetchTransactions();
    fetchLeads();
  }, [filters, currentPage]);

  const fetchLeads = async () => {
    try {
      const response = await leadAPI.getAllLeads();
      if (response.success && response.data.leads) {
        const map = {};
        response.data.leads.forEach(lead => {
          map[lead.id] = lead;
        });
        setLeadsMap(map);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch all offers (which contain payment information)
      const response = await offerAPI.getAllOffers();
      
      if (response.success && response.data.offers) {
        const offers = response.data.offers;
        
        // Filter to only paid offers and convert to transactions
        const paidOffers = offers
          .filter(offer => offer.paymentStatus === 'PAID' && offer.paymentAmount > 0)
          .map(offer => {
            const lead = leadsMap[offer.leadId];
            return {
              id: offer.id,
              transactionNumber: `TXN-${offer.id?.slice(-8)?.toUpperCase() || 'N/A'}`,
              studentId: offer.leadId,
              studentName: lead?.name || 'Unknown Student',
              studentEmail: lead?.email || 'N/A',
              program: offer.courseName || lead?.courseName || 'N/A',
              amount: offer.paymentAmount || offer.offeredPrice || 0,
              paymentMethod: offer.paymentMethod || 'N/A',
              paymentDate: offer.paymentDate || offer.updatedAt,
              status: 'COMPLETED',
              type: 'PAYMENT',
              description: `Payment for ${offer.courseName || 'course'}`,
              referenceNumber: offer.referenceNumber || 'N/A',
              offerId: offer.id,
            };
          })
          .sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate) : new Date(0);
            const dateB = b.paymentDate ? new Date(b.paymentDate) : new Date(0);
            return dateB - dateA; // Most recent first
          });

        // Apply filters
        let filtered = paidOffers;
        
        if (filters.paymentStatus) {
          filtered = filtered.filter(t => t.status === filters.paymentStatus);
        }
        
        if (filters.paymentMethod) {
          filtered = filtered.filter(t => 
            t.paymentMethod?.toUpperCase() === filters.paymentMethod.toUpperCase()
          );
        }
        
        if (filters.startDate) {
          filtered = filtered.filter(t => {
            if (!t.paymentDate) return false;
            return new Date(t.paymentDate) >= new Date(filters.startDate);
          });
        }
        
        if (filters.endDate) {
          filtered = filtered.filter(t => {
            if (!t.paymentDate) return false;
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            return new Date(t.paymentDate) <= endDate;
          });
        }

        setTransactions(filtered);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };


  const getStatusBadge = (status) => {
    const badges = {
      COMPLETED: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      FAILED: "bg-red-100 text-red-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalPayments = filteredTransactions.filter(t => t.type === "PAYMENT").length;

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <>
      <PageHeader
        title="Transaction History"
        description="Complete payment transaction log - All payments received"
        actions={
          <Button variant="ghost" onClick={() => toast.info("Export functionality coming soon")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <p className="text-sm text-textMuted mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-text">{filteredTransactions.length}</p>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <p className="text-sm text-textMuted mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <p className="text-sm text-textMuted mb-1">Total Payments</p>
          <p className="text-3xl font-bold text-green-600">{totalPayments}</p>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <p className="text-sm text-textMuted mb-1">Avg. Payment</p>
          <p className="text-3xl font-bold text-brand-600">
            {totalPayments > 0 ? formatCurrency(totalAmount / totalPayments) : '₹0'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="End Date"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Transaction #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Program</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                      <p className="text-sm font-medium text-textMuted">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-textMuted">No transactions found</p>
                    <p className="text-xs text-textMuted mt-2">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-brintelli-baseAlt/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">{transaction.transactionNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text">{transaction.studentName}</p>
                        <p className="text-xs text-textMuted">{transaction.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-textMuted">{transaction.program}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        +{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted">{transaction.paymentMethod || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted">
                        {transaction.paymentDate 
                          ? new Date(transaction.paymentDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted font-mono">{transaction.referenceNumber || "N/A"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => window.location.href = `/finance/processing?offerId=${transaction.offerId}`}
                        className="p-1 text-brand-600 hover:bg-brand-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-brintelli-border">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Transactions;
