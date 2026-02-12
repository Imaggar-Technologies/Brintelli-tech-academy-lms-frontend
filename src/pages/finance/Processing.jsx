import { useState, useEffect } from "react";
import { Search, Mail, MessageSquare, Eye, Download, RefreshCw, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import { financeAPI } from "../../api/finance";
import toast from "react-hot-toast";

/**
 * FINANCIAL PROCESSING PAGE
 * 
 * Shows all offers (payment links) sent to students
 * Finance Officer can track payment status, send reminders, and process payments
 */
const Processing = () => {
  const [offers, setOffers] = useState([]);
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchOffers();
  }, [statusFilter, currentPage]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const [offersResponse, leadsResponse] = await Promise.all([
        offerAPI.getAllOffers(),
        leadAPI.getAllLeads(),
      ]);

      if (offersResponse.success && offersResponse.data.offers) {
        let filteredOffers = offersResponse.data.offers;

        // Filter by status if selected
        if (statusFilter) {
          filteredOffers = filteredOffers.filter(offer => offer.paymentStatus === statusFilter);
        }

        setOffers(filteredOffers);
      }

        if (leadsResponse.success && leadsResponse.data.leads) {
          const leadsMap = {};
          leadsResponse.data.leads.forEach(lead => {
          leadsMap[lead._id?.toString() || lead.id] = lead;
          });
          setLeads(leadsMap);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (offerId, method = 'email') => {
    try {
      const response = await financeAPI.sendDueReminder(offerId, { method });
      if (response.success) {
        toast.success(`Reminder sent via ${method}`);
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const handleRecordPayment = async () => {
    try {
      if (!selectedOffer || !paymentForm.amount) {
        toast.error("Please enter payment amount");
      return;
    }

      const paymentData = {
        studentId: selectedOffer.leadId,
        studentName: leads[selectedOffer.leadId]?.name || "Unknown",
        invoiceId: null,
        amount: parseFloat(paymentForm.amount),
        paymentType: "PARTIAL",
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: paymentForm.paymentDate,
        referenceNumber: paymentForm.referenceNumber,
        notes: paymentForm.notes,
      };

      const response = await financeAPI.createPayment(paymentData);
      if (response.success) {
        // Update offer payment status
        const paidAmount = (selectedOffer.paymentAmount || 0) + parseFloat(paymentForm.amount);
        const totalAmount = selectedOffer.offeredPrice || 0;
        
        let newStatus = 'PARTIAL';
        if (paidAmount >= totalAmount) {
          newStatus = 'PAID';
        }

        await offerAPI.updateOffer(selectedOffer._id || selectedOffer.id, {
          paymentAmount: paidAmount,
          paymentStatus: newStatus,
          paymentDate: paymentForm.paymentDate,
          paymentMethod: paymentForm.paymentMethod,
        });

        toast.success("Payment recorded successfully");
        setShowPaymentModal(false);
        setPaymentForm({
          amount: "",
          paymentMethod: "CASH",
          paymentDate: new Date().toISOString().split('T')[0],
          referenceNumber: "",
          notes: "",
        });
        fetchOffers();
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PAID: "bg-green-100 text-green-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
      PENDING: "bg-gray-100 text-gray-700",
      OVERDUE: "bg-red-100 text-red-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatus = (offer) => {
    if (offer.paymentStatus === 'PAID') return 'PAID';
    if (offer.paymentAmount > 0) return 'PARTIAL';
    if (offer.sentAt) {
      const daysSinceSent = Math.floor((new Date() - new Date(offer.sentAt)) / (1000 * 60 * 60 * 24));
      if (daysSinceSent > 7) return 'OVERDUE';
    }
    return 'PENDING';
  };

  const filteredOffers = offers.filter((offer) => {
    const lead = leads[offer.leadId];
    const matchesSearch = 
      (lead?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (offer.offeredPrice?.toString() || "").includes(searchTerm);
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Financial Processing"
        description="Manage payment links and offers sent to students"
      />

        {/* Filters */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
          </div>
            <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
            >
              <option value="">All Payment Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
            </select>
          <Button variant="ghost" onClick={fetchOffers}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

      {/* Offers Table */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Offered Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Sent Date</th>
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
                      <p className="text-sm font-medium text-textMuted">Loading offers...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-textMuted">No offers found</p>
                  </td>
                </tr>
              ) : (
                paginatedOffers.map((offer) => {
                  const lead = leads[offer.leadId];
                  const paidAmount = offer.paymentAmount || 0;
                  const totalAmount = offer.offeredPrice || 0;
                  const balance = totalAmount - paidAmount;
                  const status = getPaymentStatus(offer);
                  
                  return (
                    <tr key={offer._id || offer.id} className="hover:bg-brintelli-baseAlt/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-text">{lead?.name || "Unknown"}</p>
                        <p className="text-xs text-textMuted">{lead?.email || "N/A"}</p>
                        <p className="text-xs text-textMuted">{lead?.phone || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-text">₹{totalAmount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">₹{paidAmount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-text">₹{balance.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-textMuted">
                          {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString() : 'N/A'}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOffer(offer);
                              setShowDetailsModal(true);
                            }}
                            className="text-brand-500 hover:text-brand-600"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {balance > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedOffer(offer);
                                  setShowPaymentModal(true);
                                }}
                                className="text-green-500 hover:text-green-600"
                                title="Record Payment"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                                onClick={() => handleSendReminder(offer._id || offer.id, 'email')}
                                className="text-blue-500 hover:text-blue-600"
                                title="Send Reminder"
                              >
                                <Mail className="w-4 h-4" />
                          </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Offer Details Modal */}
      {showDetailsModal && selectedOffer && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOffer(null);
          }}
          title="Offer Details"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-textMuted mb-1">Student</p>
              <p className="text-sm text-text">{leads[selectedOffer.leadId]?.name || "Unknown"}</p>
              <p className="text-xs text-textMuted">{leads[selectedOffer.leadId]?.email || "N/A"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Offered Price</p>
                <p className="text-sm font-semibold text-text">₹{selectedOffer.offeredPrice?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Paid Amount</p>
                <p className="text-sm font-semibold text-green-600">₹{(selectedOffer.paymentAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Balance</p>
                <p className="text-sm font-semibold text-text">
                  ₹{((selectedOffer.offeredPrice || 0) - (selectedOffer.paymentAmount || 0)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(getPaymentStatus(selectedOffer))}`}>
                  {getPaymentStatus(selectedOffer)}
                </span>
              </div>
            </div>
            {selectedOffer.sentAt && (
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Sent Date</p>
                <p className="text-sm text-text">{new Date(selectedOffer.sentAt).toLocaleString()}</p>
              </div>
            )}
            {selectedOffer.paymentDate && (
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Last Payment Date</p>
                <p className="text-sm text-text">{new Date(selectedOffer.paymentDate).toLocaleString()}</p>
              </div>
            )}
            {selectedOffer.paymentMethod && (
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Payment Method</p>
                <p className="text-sm text-text">{selectedOffer.paymentMethod}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedOffer && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOffer(null);
            setPaymentForm({
              amount: "",
              paymentMethod: "CASH",
              paymentDate: new Date().toISOString().split('T')[0],
              referenceNumber: "",
              notes: "",
            });
          }}
          title="Record Payment"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-textMuted mb-1">Student</p>
              <p className="text-sm font-semibold text-text">{leads[selectedOffer.leadId]?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-textMuted mb-1">Outstanding Balance</p>
              <p className="text-sm font-semibold text-text">
                ₹{((selectedOffer.offeredPrice || 0) - (selectedOffer.paymentAmount || 0)).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Payment Amount *</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                placeholder="Enter amount"
                max={(selectedOffer.offeredPrice || 0) - (selectedOffer.paymentAmount || 0)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-text mb-1">Payment Method</label>
              <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Reference Number</label>
              <input
                type="text"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                placeholder="Transaction/Reference number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                rows={3}
                placeholder="Additional notes"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordPayment}>
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Processing;
