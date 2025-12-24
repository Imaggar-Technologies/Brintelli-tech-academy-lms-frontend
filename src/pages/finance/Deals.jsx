import { useState, useEffect } from "react";
import { Search, RefreshCw, CreditCard, Download, Eye, DollarSign, Handshake, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import { scholarshipAPI } from "../../api/scholarship";
import toast from "react-hot-toast";

/**
 * FINANCE DEALS PAGE
 * 
 * Shows all applied offers with payment status
 * Finance users can view offers and update payment status
 * 
 * RBAC: All finance roles (finance, finance_head)
 */
const FinanceDeals = () => {
  const [offers, setOffers] = useState([]);
  const [leads, setLeads] = useState({}); // Map of leadId -> lead
  const [scholarships, setScholarships] = useState({}); // Map of leadId -> scholarship
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // ALL, PENDING, PARTIAL, PAID, REFUNDED
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(""); // Filter by payment status
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentStatus: 'PENDING',
    paymentAmount: '',
    paymentDate: '',
    paymentMethod: '',
  });
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter, paymentStatusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersResponse, leadsResponse, scholarshipsResponse] = await Promise.all([
        offerAPI.getAllOffers(),
        leadAPI.getAllLeads(),
        scholarshipAPI.getAllScholarships(),
      ]);

      if (offersResponse.success && offersResponse.data.offers) {
        let filteredOffers = offersResponse.data.offers;

        // Filter by offer status
        if (statusFilter) {
          filteredOffers = filteredOffers.filter(offer => offer.status === statusFilter);
        }

        // Filter by payment status
        if (paymentStatusFilter) {
          filteredOffers = filteredOffers.filter(offer => offer.paymentStatus === paymentStatusFilter);
        }

        setOffers(filteredOffers);

        // Map leads by ID
        if (leadsResponse.success && leadsResponse.data.leads) {
          const leadsMap = {};
          leadsResponse.data.leads.forEach(lead => {
            leadsMap[lead.id] = lead;
          });
          setLeads(leadsMap);
        }

        // Map scholarships by leadId
        if (scholarshipsResponse.success && scholarshipsResponse.data.scholarshipRequests) {
          const scholarshipsMap = {};
          scholarshipsResponse.data.scholarshipRequests.forEach(scholarship => {
            if (scholarship.leadId) {
              scholarshipsMap[scholarship.leadId] = scholarship;
            }
          });
          setScholarships(scholarshipsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetailModal(true);
  };

  const handleUpdatePayment = (offer) => {
    setSelectedOffer(offer);
    setPaymentData({
      paymentStatus: offer.paymentStatus || 'PENDING',
      paymentAmount: offer.paymentAmount || '',
      paymentDate: offer.paymentDate ? new Date(offer.paymentDate).toISOString().split('T')[0] : '',
      paymentMethod: offer.paymentMethod || '',
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedOffer) {
      toast.error('No offer selected');
      return;
    }

    try {
      setUpdatingPayment(true);
      const response = await offerAPI.updatePaymentStatus(selectedOffer.id, paymentData);
      
      if (response.success) {
        toast.success('Payment status updated successfully');
        setShowPaymentModal(false);
        setSelectedOffer(null);
        fetchData();
      } else {
        throw new Error(response.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.message || 'Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleDownloadPDF = async (offerId) => {
    try {
      await offerAPI.downloadOfferPDF(offerId);
      toast.success('Offer PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const lead = leads[offer.leadId];
    if (!lead) return false;
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOffers = filteredOffers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
      ACCEPTED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Accepted" },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Rejected" },
      PENDING_SCHOLARSHIP: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock, label: "Pending Scholarship" },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PARTIAL: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700',
      REFUNDED: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.PENDING;
  };

  // Calculate stats
  const totalOffers = filteredOffers.length;
  const totalValue = filteredOffers.reduce((sum, offer) => sum + (offer.offeredPrice || 0), 0);
  const paidOffers = filteredOffers.filter(offer => offer.paymentStatus === 'PAID').length;
  const pendingPayments = filteredOffers.filter(offer => offer.paymentStatus === 'PENDING' || offer.paymentStatus === 'PARTIAL').length;

  return (
    <>
      <PageHeader
        title="Deals Review"
        description="Review all applied offers and manage payment status."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Offers</p>
              <p className="text-2xl font-bold text-text">{totalOffers}</p>
            </div>
            <Handshake className="h-8 w-8 text-brand-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Value</p>
              <p className="text-2xl font-bold text-text">₹{totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Paid Offers</p>
              <p className="text-2xl font-bold text-text">{paidOffers}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-text">{pendingPayments}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Offers Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING_SCHOLARSHIP">Pending Scholarship</option>
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Payment Status</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading offers...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Base Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Offered Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Scholarship</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Payment Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {paginatedOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-textMuted">
                    {searchTerm ? "No offers match your search." : "No offers found."}
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((offer) => {
                  const lead = leads[offer.leadId];
                  const scholarship = scholarships[offer.leadId];
                  
                  return (
                    <tr key={offer.id} className="transition hover:bg-brintelli-baseAlt">
                      <td className="px-4 py-3">
                        {lead ? (
                          <>
                            <p className="font-semibold text-text">{lead.name || "N/A"}</p>
                            <p className="text-xs text-textMuted">{lead.email || "N/A"}</p>
                            {lead.phone && (
                              <p className="text-xs text-textMuted">{lead.phone}</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-textMuted italic">Lead not found</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-text">
                          ₹{offer.basePrice?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-text">
                          ₹{offer.offeredPrice?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {scholarship ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            {scholarship.status === 'APPROVED' ? 'Approved' : scholarship.status === 'REQUESTED' ? 'Requested' : 'Rejected'}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">No scholarship</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(offer.status)}</td>
                      <td className="px-4 py-3">
                        {offer.paymentStatus ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusBadge(offer.paymentStatus)}`}>
                            <CreditCard className="h-3 w-3" />
                            {offer.paymentStatus}
                            {offer.paymentAmount > 0 && (
                              <span className="ml-1">(₹{offer.paymentAmount.toLocaleString()})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(offer)}
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdatePayment(offer)}
                            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 hover:underline"
                            title="Update Payment"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(offer.id)}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {filteredOffers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOffers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOffer && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOffer(null);
          }}
          title="Offer Details"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-textMuted mb-2">Candidate</h3>
              {leads[selectedOffer.leadId] ? (
                <>
                  <p className="text-text font-semibold">{leads[selectedOffer.leadId].name || "N/A"}</p>
                  <p className="text-sm text-textMuted">{leads[selectedOffer.leadId].email || "N/A"}</p>
                  {leads[selectedOffer.leadId].phone && (
                    <p className="text-sm text-textMuted">{leads[selectedOffer.leadId].phone}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-textMuted">Lead not found</p>
              )}
            </div>

            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <h3 className="text-sm font-semibold text-textMuted mb-3">Offer Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-textMuted">Base Price:</span>
                  <span className="text-sm font-semibold text-text">
                    ₹{selectedOffer.basePrice?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-textMuted">Offered Price:</span>
                  <span className="text-sm font-semibold text-text">
                    ₹{selectedOffer.offeredPrice?.toLocaleString() || "0"}
                  </span>
                </div>
                {selectedOffer.level && (
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Level:</span>
                    <span className="text-sm font-semibold text-text capitalize">{selectedOffer.level}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-textMuted">Status:</span>
                  {getStatusBadge(selectedOffer.status)}
                </div>
              </div>
            </div>

            {scholarships[selectedOffer.leadId] && (
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                <h3 className="text-sm font-semibold text-textMuted mb-3">Scholarship Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Status:</span>
                    <span className={`text-sm font-semibold ${
                      scholarships[selectedOffer.leadId].status === 'APPROVED' ? 'text-green-700' :
                      scholarships[selectedOffer.leadId].status === 'REJECTED' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {scholarships[selectedOffer.leadId].status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Requested Amount:</span>
                    <span className="text-sm font-semibold text-text">
                      ₹{scholarships[selectedOffer.leadId].requestedAmount?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <h3 className="text-sm font-semibold text-textMuted mb-3">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-textMuted">Payment Status:</span>
                  {selectedOffer.paymentStatus ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusBadge(selectedOffer.paymentStatus)}`}>
                      {selectedOffer.paymentStatus}
                    </span>
                  ) : (
                    <span className="text-sm text-textMuted italic">Not set</span>
                  )}
                </div>
                {selectedOffer.paymentAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Payment Amount:</span>
                    <span className="text-sm font-semibold text-text">
                      ₹{selectedOffer.paymentAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedOffer.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Payment Date:</span>
                    <span className="text-sm font-semibold text-text">
                      {new Date(selectedOffer.paymentDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {selectedOffer.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Payment Method:</span>
                    <span className="text-sm font-semibold text-text">{selectedOffer.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedOffer(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Status Modal */}
      {showPaymentModal && selectedOffer && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOffer(null);
            setPaymentData({
              paymentStatus: 'PENDING',
              paymentAmount: '',
              paymentDate: '',
              paymentMethod: '',
            });
          }}
          title="Update Payment Status"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              {leads[selectedOffer.leadId] ? (
                <>
                  <p className="text-sm font-semibold text-text">{leads[selectedOffer.leadId].name}</p>
                  <p className="text-xs text-textMuted">{leads[selectedOffer.leadId].email}</p>
                  <p className="text-sm text-textMuted mt-2">
                    Offered Price: ₹{selectedOffer.offeredPrice?.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-textMuted">Offer ID: {selectedOffer.id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Status
              </label>
              <select
                value={paymentData.paymentStatus}
                onChange={(e) => setPaymentData({ ...paymentData, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                value={paymentData.paymentAmount}
                onChange={(e) => setPaymentData({ ...paymentData, paymentAmount: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Enter payment amount"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select method</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="primary"
                onClick={handleSubmitPayment}
                disabled={updatingPayment}
                className="flex-1"
              >
                {updatingPayment ? 'Updating...' : 'Update Payment Status'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedOffer(null);
                }}
                disabled={updatingPayment}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default FinanceDeals;

