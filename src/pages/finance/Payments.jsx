import { useState, useEffect } from "react";
import { Search, Plus, Download, Eye, Filter, Calendar, DollarSign, CreditCard, Wallet, Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { financeAPI } from "../../api/finance";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentType: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    studentName: "",
    invoiceId: "",
    installmentId: "",
    amount: "",
    paymentType: "FULL",
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: "",
    notes: "",
  });
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchLeads();
  }, [filters, currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await financeAPI.getPayments({
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (response.success && response.data.payments) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await leadAPI.getAllLeads();
      if (response.success && response.data.leads) {
        setLeads(response.data.leads);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      if (!paymentForm.studentId || !paymentForm.amount) {
        toast.error("Please fill all required fields");
        return;
      }

      const response = await financeAPI.createPayment({
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      });

      if (response.success) {
        toast.success("Payment created successfully");
        setShowPaymentModal(false);
        setPaymentForm({
          studentId: "",
          studentName: "",
          invoiceId: "",
          installmentId: "",
          amount: "",
          paymentType: "FULL",
          paymentMethod: "CASH",
          paymentDate: new Date().toISOString().split('T')[0],
          referenceNumber: "",
          notes: "",
        });
        fetchPayments();
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      COMPLETED: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      FAILED: "bg-red-100 text-red-700",
      REFUNDED: "bg-gray-100 text-gray-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentTypeBadge = (type) => {
    const badges = {
      FULL: "bg-blue-100 text-blue-700",
      INSTALLMENT: "bg-purple-100 text-purple-700",
      ADVANCE: "bg-orange-100 text-orange-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
    };
    return badges[type] || "bg-gray-100 text-gray-700";
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Payments & Transactions"
        description="Manage all payment records and transactions"
        actions={
          <Button onClick={() => setShowPaymentModal(true)}>
            <Plus className="h-4 w-4" />
            Create Payment
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={filters.paymentType}
            onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
          >
            <option value="">All Payment Types</option>
            <option value="FULL">Full Payment</option>
            <option value="INSTALLMENT">Installment</option>
            <option value="ADVANCE">Advance</option>
            <option value="PARTIAL">Partial</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Payment #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                      <p className="text-sm font-medium text-textMuted">Loading payments...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-textMuted">No payments found</p>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment._id || payment.id} className="hover:bg-brintelli-baseAlt/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">{payment.paymentNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-text">{payment.studentName}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-text">₹{payment.amount?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentTypeBadge(payment.paymentType)}`}>
                        {payment.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted">{payment.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-textMuted">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentModal(true);
                        }}
                        className="text-brand-500 hover:text-brand-600"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Create Payment Modal */}
      {showPaymentModal && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
            setPaymentForm({
              studentId: "",
              studentName: "",
              invoiceId: "",
              installmentId: "",
              amount: "",
              paymentType: "FULL",
              paymentMethod: "CASH",
              paymentDate: new Date().toISOString().split('T')[0],
              referenceNumber: "",
              notes: "",
            });
          }}
          title={selectedPayment ? "View Payment" : "Create Payment"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Student *</label>
              <select
                value={paymentForm.studentId}
                onChange={(e) => {
                  const lead = leads.find(l => l._id?.toString() === e.target.value || l.id === e.target.value);
                  setPaymentForm({
                    ...paymentForm,
                    studentId: e.target.value,
                    studentName: lead?.name || "",
                  });
                }}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                disabled={!!selectedPayment}
              >
                <option value="">Select Student</option>
                {leads.map((lead) => (
                  <option key={lead._id || lead.id} value={lead._id || lead.id}>
                    {lead.name} ({lead.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Amount *</label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                placeholder="Enter amount"
                disabled={!!selectedPayment}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Payment Type</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                  disabled={!!selectedPayment}
                >
                  <option value="FULL">Full Payment</option>
                  <option value="INSTALLMENT">Installment</option>
                  <option value="ADVANCE">Advance</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                  disabled={!!selectedPayment}
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
      </div>
    </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                disabled={!!selectedPayment}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Reference Number</label>
              <input
                type="text"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-soft"
                placeholder="Transaction/Reference number"
                disabled={!!selectedPayment}
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
                disabled={!!selectedPayment}
              />
            </div>
            {!selectedPayment && (
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePayment}>
                  Create Payment
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default Payments;
