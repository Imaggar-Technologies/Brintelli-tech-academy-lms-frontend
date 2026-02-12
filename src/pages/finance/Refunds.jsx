import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Clock, Eye, Download, FileText, RefreshCw } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { financeAPI } from "../../api/finance";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";

/**
 * REFUNDS PAGE
 * 
 * Complete refund management with navigation
 * - Refund Queue (Requested)
 * - Approved Refunds
 * - Processed Refunds (Done)
 * - Revoked Refunds
 */
const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processForm, setProcessForm] = useState({
    refundMethod: "BANK_TRANSFER",
    bankAccount: "",
    ifscCode: "",
    accountHolderName: "",
    upiId: "",
  });
  const [leadsMap, setLeadsMap] = useState({});
  const [stats, setStats] = useState({
    requested: 0,
    approved: 0,
    done: 0,
    revoked: 0,
  });

  useEffect(() => {
    fetchRefunds();
    fetchLeads();
  }, [statusFilter, currentPage]);

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

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await financeAPI.getRefunds({
          status: statusFilter || undefined,
        });

        if (response.success && response.data.refunds) {
          setRefunds(response.data.refunds);
          calculateStats(response.data.refunds);
          return;
        }
      } catch (apiError) {
        console.log("Refund API not available, using mock data");
      }

      // Fallback: Create mock refunds from offers
      const offersResponse = await offerAPI.getAllOffers();
      if (offersResponse.success && offersResponse.data.offers) {
        // Mock refunds - in production, these would come from a refunds API
        const mockRefunds = [
          {
            id: '1',
            refundNumber: 'REF-001',
            studentId: offersResponse.data.offers[0]?.leadId,
            studentName: 'John Doe',
            amount: 50000,
            originalAmount: 100000,
            reason: 'Course cancellation - student requested full refund',
            status: 'REQUESTED',
            requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Student enrolled but decided not to continue',
          },
          {
            id: '2',
            refundNumber: 'REF-002',
            studentId: offersResponse.data.offers[1]?.leadId,
            studentName: 'Jane Smith',
            amount: 30000,
            originalAmount: 80000,
            reason: 'Dissatisfaction with course content',
            status: 'APPROVED',
            requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Approved by finance head',
          },
          {
            id: '3',
            refundNumber: 'REF-003',
            studentId: offersResponse.data.offers[2]?.leadId,
            studentName: 'Mike Johnson',
            amount: 25000,
            originalAmount: 50000,
            reason: 'Technical issues with platform',
            status: 'DONE',
            requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Refund processed via bank transfer',
          },
        ];

        // Enrich with lead data
        const enrichedRefunds = mockRefunds.map(refund => {
          const lead = leadsMap[refund.studentId];
          return {
            ...refund,
            studentName: lead?.name || refund.studentName,
            studentEmail: lead?.email || 'N/A',
          };
        });

        setRefunds(enrichedRefunds);
        calculateStats(enrichedRefunds);
      } else {
        setRefunds([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to load refunds");
      setRefunds([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (refundsList) => {
    setStats({
      requested: refundsList.filter(r => r.status === 'REQUESTED').length,
      approved: refundsList.filter(r => r.status === 'APPROVED').length,
      done: refundsList.filter(r => r.status === 'DONE').length,
      revoked: refundsList.filter(r => r.status === 'REVOKED').length,
    });
  };

  const handleApprove = async (refundId) => {
    try {
      const response = await financeAPI.approveRefund(refundId);
      if (response.success) {
        toast.success("Refund approved successfully");
        fetchRefunds();
      } else {
        toast.error(response.message || "Failed to approve refund");
      }
    } catch (error) {
      console.error("Error approving refund:", error);
      toast.error("Failed to approve refund");
    }
  };

  const handleProcess = async () => {
    try {
      if (!selectedRefund) return;

      if (processForm.refundMethod === "BANK_TRANSFER" && (!processForm.bankAccount || !processForm.ifscCode)) {
        toast.error("Please provide bank account details");
        return;
      }

      if (processForm.refundMethod === "UPI" && !processForm.upiId) {
        toast.error("Please provide UPI ID");
        return;
      }

      const response = await financeAPI.processRefund(selectedRefund.id, processForm);
      if (response.success) {
        toast.success("Refund processed successfully");
        setShowProcessModal(false);
        setProcessForm({
          refundMethod: "BANK_TRANSFER",
          bankAccount: "",
          ifscCode: "",
          accountHolderName: "",
          upiId: "",
        });
        fetchRefunds();
      } else {
        toast.error(response.message || "Failed to process refund");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    }
  };

  const handleRevoke = async (refundId, reason) => {
    try {
      const response = await financeAPI.revokeRefund(refundId, reason);
      if (response.success) {
        toast.success("Refund revoked successfully");
        fetchRefunds();
      } else {
        toast.error(response.message || "Failed to revoke refund");
      }
    } catch (error) {
      console.error("Error revoking refund:", error);
      toast.error("Failed to revoke refund");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      REQUESTED: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-blue-100 text-blue-700",
      DONE: "bg-green-100 text-green-700",
      REVOKED: "bg-red-100 text-red-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch = 
      refund.refundNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter && refund.status !== statusFilter) return false;
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);
  const paginatedRefunds = filteredRefunds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Refund Management"
        description="Process and manage all refund requests"
        actions={
          <Button variant="ghost" onClick={() => toast.info("Export functionality coming soon")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Requested</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.requested}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Approved</p>
              <p className="text-3xl font-bold text-blue-600">{stats.approved}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Processed</p>
              <p className="text-3xl font-bold text-green-600">{stats.done}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Revoked</p>
              <p className="text-3xl font-bold text-red-600">{stats.revoked}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="flex items-center gap-2 border-b border-brintelli-border pb-2 mb-4">
          <FileText className="h-5 w-5 text-textMuted" />
          <span className="text-sm font-semibold text-textMuted">Quick Navigation:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === '' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('')}
          >
            All Refunds
          </Button>
          <Button
            variant={statusFilter === 'REQUESTED' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('REQUESTED')}
          >
            Requested ({stats.requested})
          </Button>
          <Button
            variant={statusFilter === 'APPROVED' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved ({stats.approved})
          </Button>
          <Button
            variant={statusFilter === 'DONE' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('DONE')}
          >
            Processed ({stats.done})
          </Button>
          <Button
            variant={statusFilter === 'REVOKED' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('REVOKED')}
          >
            Revoked ({stats.revoked})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
            <input
              type="text"
              placeholder="Search refunds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="DONE">Done</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <Button variant="ghost" size="sm" onClick={fetchRefunds}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Refund #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Requested Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                      <p className="text-sm font-medium text-textMuted">Loading refunds...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-textMuted">No refunds found</p>
                    <p className="text-xs text-textMuted mt-2">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-brintelli-baseAlt/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">{refund.refundNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text">{refund.studentName}</p>
                        <p className="text-xs text-textMuted">{refund.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-text">{formatCurrency(refund.amount)}</p>
                        {refund.originalAmount && (
                          <p className="text-xs text-textMuted">of {formatCurrency(refund.originalAmount)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-textMuted truncate max-w-xs">{refund.reason || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted">
                        {refund.requestedAt 
                          ? new Date(refund.requestedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(refund.status)}`}>
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRefund(refund);
                            setShowDetailsModal(true);
                          }}
                          className="p-1 text-brand-600 hover:bg-brand-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {refund.status === "REQUESTED" && (
                          <>
                            <button
                              onClick={() => handleApprove(refund.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter reason for revocation:");
                                if (reason) {
                                  handleRevoke(refund.id, reason);
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Revoke"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {refund.status === "APPROVED" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowProcessModal(true);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Process Refund"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Enter reason for revocation:");
                                if (reason) {
                                  handleRevoke(refund.id, reason);
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Revoke"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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

      {/* Refund Details Modal */}
      {showDetailsModal && selectedRefund && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRefund(null);
          }}
          title="Refund Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Refund Number</p>
                <p className="text-sm font-semibold text-text">{selectedRefund.refundNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(selectedRefund.status)}`}>
                  {selectedRefund.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Student</p>
                <p className="text-sm font-semibold text-text">{selectedRefund.studentName}</p>
                <p className="text-xs text-textMuted">{selectedRefund.studentEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Refund Amount</p>
                <p className="text-sm font-semibold text-text">{formatCurrency(selectedRefund.amount)}</p>
                {selectedRefund.originalAmount && (
                  <p className="text-xs text-textMuted">Original: {formatCurrency(selectedRefund.originalAmount)}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Requested Date</p>
                <p className="text-sm text-text">
                  {selectedRefund.requestedAt 
                    ? new Date(selectedRefund.requestedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
              {selectedRefund.approvedAt && (
                <div>
                  <p className="text-sm font-medium text-textMuted mb-1">Approved Date</p>
                  <p className="text-sm text-text">
                    {new Date(selectedRefund.approvedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {selectedRefund.processedAt && (
                <div>
                  <p className="text-sm font-medium text-textMuted mb-1">Processed Date</p>
                  <p className="text-sm text-text">
                    {new Date(selectedRefund.processedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
            {selectedRefund.reason && (
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Reason</p>
                <p className="text-sm text-text">{selectedRefund.reason}</p>
              </div>
            )}
            {selectedRefund.notes && (
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Notes</p>
                <p className="text-sm text-text">{selectedRefund.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Process Refund Modal */}
      {showProcessModal && selectedRefund && (
        <Modal
          isOpen={showProcessModal}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedRefund(null);
            setProcessForm({
              refundMethod: "BANK_TRANSFER",
              bankAccount: "",
              ifscCode: "",
              accountHolderName: "",
              upiId: "",
            });
          }}
          title="Process Refund"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-textMuted mb-1">Student</p>
              <p className="text-sm font-semibold text-text">{selectedRefund.studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-textMuted mb-1">Refund Amount</p>
              <p className="text-sm font-semibold text-text">{formatCurrency(selectedRefund.amount)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Refund Method *</label>
              <select
                value={processForm.refundMethod}
                onChange={(e) => setProcessForm({ ...processForm, refundMethod: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            {processForm.refundMethod === "BANK_TRANSFER" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    value={processForm.bankAccount}
                    onChange={(e) => setProcessForm({ ...processForm, bankAccount: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter bank account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={processForm.ifscCode}
                    onChange={(e) => setProcessForm({ ...processForm, ifscCode: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={processForm.accountHolderName}
                    onChange={(e) => setProcessForm({ ...processForm, accountHolderName: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter account holder name"
                  />
                </div>
              </>
            )}
            {processForm.refundMethod === "UPI" && (
              <div>
                <label className="block text-sm font-medium text-text mb-1">UPI ID *</label>
                <input
                  type="text"
                  value={processForm.upiId}
                  onChange={(e) => setProcessForm({ ...processForm, upiId: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter UPI ID"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowProcessModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcess}>
                Process Refund
              </Button>
      </div>
    </div>
        </Modal>
      )}
    </>
  );
};

export default Refunds;
