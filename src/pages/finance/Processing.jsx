import { useState, useEffect } from "react";
import { Search, RefreshCw, CreditCard, Download, Eye, DollarSign, Wallet, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";

/**
 * FINANCIAL PROCESSING PAGE
 * 
 * Shows all offers with payment details for processing
 * Accountants can view and update payment status
 * 
 * RBAC: All finance roles (finance, finance_head)
 */
const FinancialProcessing = () => {
  const [offers, setOffers] = useState([]);
  const [leads, setLeads] = useState({}); // Map of leadId -> lead
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(""); // Filter by payment status
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOffer, setSelectedOffer] = useState(null);
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
  }, [paymentStatusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersResponse, leadsResponse] = await Promise.all([
        offerAPI.getAllOffers(),
        leadAPI.getAllLeads(),
      ]);

      if (offersResponse.success && offersResponse.data.offers) {
        let filteredOffers = offersResponse.data.offers;

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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
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

  const getPaymentStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
      PARTIAL: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle, label: "Partial" },
      PAID: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Paid" },
      REFUNDED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Refunded" },
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

  // Calculate stats
  const totalOffers = filteredOffers.length;
  const totalValue = filteredOffers.reduce((sum, offer) => sum + (offer.offeredPrice || 0), 0);
  const paidOffers = filteredOffers.filter(offer => offer.paymentStatus === 'PAID').length;
  const pendingPayments = filteredOffers.filter(offer => offer.paymentStatus === 'PENDING' || offer.paymentStatus === 'PARTIAL').length;
  const totalPaid = filteredOffers
    .filter(offer => offer.paymentStatus === 'PAID' || offer.paymentStatus === 'PARTIAL')
    .reduce((sum, offer) => sum + (offer.paymentAmount || 0), 0);

  return (
    <>
      <PageHeader
        title="Financial Processing"
        description="Process payments and manage payment status for all offers."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Offers</p>
              <p className="text-2xl font-bold text-text">{totalOffers}</p>
            </div>
            <Wallet className="h-8 w-8 text-brand-500" />
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
              <p className="text-sm text-textMuted mb-1">Paid</p>
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

      {/* Payment Processing Table */}
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
            <span className="ml-3 text-textMuted">Loading payment data...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Offered Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Payment Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Payment Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Payment Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Payment Method</th>
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
                          ₹{offer.offeredPrice?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getPaymentStatusBadge(offer.paymentStatus || 'PENDING')}
                      </td>
                      <td className="px-4 py-3">
                        {offer.paymentAmount > 0 ? (
                          <span className="text-sm font-semibold text-text">
                            ₹{offer.paymentAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {offer.paymentDate ? (
                          <span className="text-sm text-text">
                            {new Date(offer.paymentDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {offer.paymentMethod ? (
                          <span className="text-sm text-text capitalize">{offer.paymentMethod.replace('_', ' ')}</span>
                        ) : (
                          <span className="text-xs text-textMuted italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdatePayment(offer)}
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                            title="Update Payment"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Update
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

export default FinancialProcessing;

