import { useState, useEffect } from "react";
import { Search, Plus, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, Eye } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { financeAPI } from "../../api/finance";
import toast from "react-hot-toast";

const Installments = () => {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    overdue: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchInstallments();
  }, [filters, currentPage]);

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      const response = filters.overdue
        ? await financeAPI.getOverdueInstallments()
        : await financeAPI.getInstallments(filters);

      if (response.success && response.data.installments) {
        setInstallments(response.data.installments);
      }
    } catch (error) {
      console.error("Error fetching installments:", error);
      toast.error("Failed to load installments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PAID: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      OVERDUE: "bg-red-100 text-red-700",
      PARTIAL: "bg-orange-100 text-orange-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredInstallments = installments.filter((installment) => {
    const matchesSearch = 
      installment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installment.invoiceId?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage);
  const paginatedInstallments = filteredInstallments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Installment Schedule"
        description="View and manage installment payment schedules"
      />

      {/* Filters */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted w-4 h-4" />
            <input
              type="text"
              placeholder="Search installments..."
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
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PARTIAL">Partial</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-text">Show Overdue Only</span>
          </label>
        </div>
      </div>

      {/* Installments Table */}
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Installment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Days Overdue</th>
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
                      <p className="text-sm font-medium text-textMuted">Loading installments...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedInstallments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-textMuted">No installments found</p>
                  </td>
                </tr>
              ) : (
                paginatedInstallments.map((installment) => {
                  const daysOverdue = getDaysOverdue(installment.dueDate);
                  return (
                    <tr key={installment._id || installment.id} className="hover:bg-brintelli-baseAlt/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-text">{installment.studentName}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-textMuted">
                          {installment.installmentNumber} of {installment.totalInstallments}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-text">₹{installment.amount?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">₹{installment.paidAmount?.toLocaleString() || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-textMuted">
                          {installment.dueDate ? new Date(installment.dueDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {daysOverdue > 0 ? (
                          <span className="text-sm font-semibold text-red-600">{daysOverdue} days</span>
                        ) : (
                          <span className="text-sm text-textMuted">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(installment.status)}`}>
                          {installment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedInstallment(installment);
                            setShowDetailsModal(true);
                          }}
                          className="text-brand-500 hover:text-brand-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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

      {/* Installment Details Modal */}
      {showDetailsModal && selectedInstallment && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInstallment(null);
          }}
          title="Installment Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Student</p>
                <p className="text-sm font-semibold text-text">{selectedInstallment.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Installment</p>
                <p className="text-sm font-semibold text-text">
                  {selectedInstallment.installmentNumber} of {selectedInstallment.totalInstallments}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Total Amount</p>
                <p className="text-sm font-semibold text-text">₹{selectedInstallment.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Paid Amount</p>
                <p className="text-sm font-semibold text-green-600">₹{selectedInstallment.paidAmount?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Due Date</p>
                <p className="text-sm text-text">
                  {selectedInstallment.dueDate ? new Date(selectedInstallment.dueDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(selectedInstallment.status)}`}>
                  {selectedInstallment.status}
                </span>
              </div>
            </div>
            {selectedInstallment.notes && (
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">Notes</p>
                <p className="text-sm text-text">{selectedInstallment.notes}</p>
              </div>
            )}
    </div>
        </Modal>
      )}
    </>
  );
};

export default Installments;
