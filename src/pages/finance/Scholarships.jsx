import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Clock, Eye, DollarSign, RefreshCw } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { scholarshipAPI } from "../../api/scholarship";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";

/**
 * SCHOLARSHIP MANAGEMENT PAGE
 * 
 * Review and manage scholarship requests from candidates
 * - Summary cards: Pending Requests, Approved, Pending Revenue Impact, Total Revenue Loss
 * - Table with: Candidate, Base Price, Requested Amount, Final Price, Revenue Loss, Status, Requested At, Actions
 * - Decision modal for approve/reject with notes
 */
const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [offers, setOffers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionForm, setDecisionForm] = useState({
    decision: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [scholarshipsResponse, offersResponse, leadsResponse] = await Promise.all([
        scholarshipAPI.getAllScholarships().catch(err => {
          console.error('Error fetching scholarships:', err);
          return { success: false, data: { scholarshipRequests: [] } };
        }),
        offerAPI.getAllOffers().catch(err => {
          console.error('Error fetching offers:', err);
          return { success: false, data: { offers: [] } };
        }),
        leadAPI.getAllLeads().catch(err => {
          console.error('Error fetching leads:', err);
          return { success: false, data: { leads: [] } };
        }),
      ]);

      const scholarshipRequests = scholarshipsResponse.success 
        ? scholarshipsResponse.data.scholarshipRequests || [] 
        : [];
      const offersList = offersResponse.success ? offersResponse.data.offers || [] : [];
      const leadsList = leadsResponse.success ? leadsResponse.data.leads || [] : [];

      setOffers(offersList);
      setLeads(leadsList);

      // Enrich scholarships with offer and lead data
      const enrichedScholarships = scholarshipRequests.map(scholarship => {
        const offer = offersList.find(o => o.id === scholarship.offerId || o._id === scholarship.offerId);
        const lead = leadsList.find(l => l.id === scholarship.leadId || l._id === scholarship.leadId);
        
        const basePrice = offer?.offeredPrice || offer?.basePrice || 0;
        const requestedAmount = scholarship.requestedAmount || 0;
        const finalPrice = scholarship.status === 'APPROVED' 
          ? basePrice - requestedAmount 
          : basePrice;
        const revenueLoss = scholarship.status === 'APPROVED' ? requestedAmount : 0;

        return {
          ...scholarship,
          studentName: lead?.name || scholarship.studentName || 'Unknown',
          studentEmail: lead?.email || scholarship.studentEmail || 'N/A',
          basePrice,
          finalPrice,
          revenueLoss,
          courseName: offer?.courseName || lead?.courseName || 'N/A',
        };
      });

      // Apply status filter
      let filtered = enrichedScholarships;
      if (statusFilter) {
        filtered = filtered.filter(s => s.status === statusFilter);
      }

      setScholarships(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDecisionModal = (scholarship) => {
    setSelectedScholarship(scholarship);
    setDecisionForm({
      decision: "",
      notes: "",
    });
    setShowDecisionModal(true);
  };

  const handleSubmitDecision = async () => {
    if (!decisionForm.decision) {
      toast.error("Please select a decision");
      return;
    }

    if (!selectedScholarship) return;

    try {
      const response = await scholarshipAPI.makeScholarshipDecision(
        selectedScholarship.id || selectedScholarship._id,
        {
          decision: decisionForm.decision,
          notes: decisionForm.notes || undefined,
        }
      );

      if (response.success) {
        toast.success(`Scholarship ${decisionForm.decision.toLowerCase()} successfully`);
        setShowDecisionModal(false);
        setSelectedScholarship(null);
        setDecisionForm({ decision: "", notes: "" });
        fetchData();
      } else {
        toast.error(response.message || "Failed to submit decision");
      }
    } catch (error) {
      console.error("Error submitting decision:", error);
      toast.error("Failed to submit decision");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      REQUESTED: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      DENIED: "bg-red-100 text-red-700",
      PENDING: "bg-blue-100 text-blue-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  const filteredScholarships = scholarships.filter((scholarship) => {
    const matchesSearch = 
      scholarship.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.requestedAmount?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const paginatedScholarships = filteredScholarships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const pendingRequests = filteredScholarships.filter(s => s.status === 'REQUESTED').length;
  const approvedCount = filteredScholarships.filter(s => s.status === 'APPROVED').length;
  const pendingRevenueImpact = filteredScholarships
    .filter(s => s.status === 'REQUESTED')
    .reduce((sum, s) => sum + (s.requestedAmount || 0), 0);
  const totalRevenueLoss = filteredScholarships
    .filter(s => s.status === 'APPROVED')
    .reduce((sum, s) => sum + (s.revenueLoss || s.requestedAmount || 0), 0);

  return (
    <>
      <PageHeader
        title="Scholarship Management"
        description="Review and manage scholarship requests from candidates"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending Revenue Impact</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(pendingRevenueImpact)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Revenue Loss</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalRevenueLoss)}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by candidate name or email..."
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
            <option value="REJECTED">Rejected</option>
            <option value="DENIED">Denied</option>
            <option value="PENDING">Pending</option>
          </select>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Scholarships Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">CANDIDATE</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">BASE PRICE</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">REQUESTED AMOUNT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">FINAL PRICE</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">REVENUE LOSS (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">REQUESTED AT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                      <p className="text-sm font-medium text-textMuted">Loading scholarships...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedScholarships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-textMuted">No scholarships found</p>
                    <p className="text-xs text-textMuted mt-2">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedScholarships.map((scholarship) => (
                  <tr key={scholarship.id || scholarship._id} className="hover:bg-brintelli-baseAlt/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-text">{scholarship.studentName}</p>
                        <p className="text-xs text-textMuted">{scholarship.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">{formatCurrency(scholarship.basePrice)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">{formatCurrency(scholarship.requestedAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">{formatCurrency(scholarship.finalPrice)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${scholarship.revenueLoss > 0 ? 'text-red-600' : 'text-text'}`}>
                        {formatCurrency(scholarship.revenueLoss)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(scholarship.status)}`}>
                        {scholarship.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted">
                        {scholarship.createdAt || scholarship.requestedAt
                          ? new Date(scholarship.createdAt || scholarship.requestedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDecisionModal(scholarship)}
                          className="p-1 text-brand-600 hover:bg-brand-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {scholarship.status === "REQUESTED" && (
                          <button
                            onClick={() => handleOpenDecisionModal(scholarship)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Make Decision"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
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
          <div className="px-6 py-4 border-t border-brintelli-border flex items-center justify-between">
            <div className="text-sm text-textMuted">
              {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredScholarships.length)} of {filteredScholarships.length}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Make Scholarship Decision Modal */}
      {showDecisionModal && selectedScholarship && (
        <Modal
          isOpen={showDecisionModal}
          onClose={() => {
            setShowDecisionModal(false);
            setSelectedScholarship(null);
            setDecisionForm({ decision: "", notes: "" });
          }}
          title="Make Scholarship Decision"
        >
          <div className="space-y-6">
            {/* Applicant Information */}
            <div className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-textMuted mb-1">Name</p>
                  <p className="text-sm font-semibold text-text">{selectedScholarship.studentName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-textMuted mb-1">Email</p>
                  <p className="text-sm text-text">{selectedScholarship.studentEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-textMuted mb-1">Requested Amount</p>
                  <p className="text-sm font-semibold text-text">Requested: {formatCurrency(selectedScholarship.requestedAmount)}</p>
                  <p className="text-xs text-textMuted mt-1">
                    Base Price: {formatCurrency(selectedScholarship.basePrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Field */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Decision <span className="text-red-500">*</span>
              </label>
              <select
                value={decisionForm.decision}
                onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select decision...</option>
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
                <option value="DENIED">Deny</option>
              </select>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={decisionForm.notes}
                onChange={(e) => setDecisionForm({ ...decisionForm, notes: e.target.value })}
                rows={4}
                placeholder="Add any notes..."
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDecisionModal(false);
                  setSelectedScholarship(null);
                  setDecisionForm({ decision: "", notes: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitDecision}
                disabled={!decisionForm.decision}
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Scholarships;
