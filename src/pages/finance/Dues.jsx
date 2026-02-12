import { useState, useEffect } from "react";
import { Search, RefreshCw, Mail, MessageSquare, AlertTriangle, Download, Eye, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { offerAPI } from "../../api/offer";
import { leadAPI } from "../../api/lead";
import { financeAPI } from "../../api/finance";
import toast from "react-hot-toast";

/**
 * OUTSTANDING DUES PAGE
 * 
 * Follow-ups & recovery for overdue payments
 * 
 * RBAC: All finance roles (finance, finance_head)
 */
const OutstandingDues = () => {
  const [dues, setDues] = useState([]);
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState("all"); // all, overdue, critical
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDue, setSelectedDue] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");

  useEffect(() => {
    fetchDues();
  }, [viewFilter]);

  const fetchDues = async () => {
    try {
      setLoading(true);
      
      // Fetch all overdue items (invoices and installments)
      const [duesResponse, overdueResponse] = await Promise.all([
        financeAPI.getOutstandingDues({ view: viewFilter }),
        financeAPI.getOverdueItems(),
      ]);

      let allDues = [];

      // Add outstanding dues from offers
      if (duesResponse.success && duesResponse.data.dues) {
        const duesList = duesResponse.data.dues.map(due => ({
          ...due,
          type: 'offer',
        }));
        allDues = [...allDues, ...duesList];
      }

      // Add overdue invoices
      if (overdueResponse.success && overdueResponse.data.invoices) {
        const invoiceDues = overdueResponse.data.invoices.map(invoice => ({
          id: invoice._id || invoice.id,
          leadId: invoice.studentId,
          lead: {
            name: invoice.studentName,
            email: invoice.studentEmail,
            phone: invoice.studentPhone,
          },
          totalFee: invoice.totalAmount,
          paidAmount: invoice.paidAmount || 0,
          dueAmount: invoice.totalAmount - (invoice.paidAmount || 0),
          dueDate: invoice.dueDate || invoice.createdAt,
          daysOverdue: invoice.dueDate ? Math.max(0, Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))) : 0,
          riskLevel: invoice.dueDate ? (Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)) > 30 ? 'High' : 'Medium') : 'Low',
          type: 'invoice',
          invoiceNumber: invoice.invoiceNumber,
        }));
        allDues = [...allDues, ...invoiceDues];
      }

      // Add overdue installments
      if (overdueResponse.success && overdueResponse.data.installments) {
        const installmentDues = overdueResponse.data.installments.map(installment => ({
          id: installment._id || installment.id,
          leadId: installment.studentId,
          lead: {
            name: installment.studentName,
          },
          totalFee: installment.amount,
          paidAmount: installment.paidAmount || 0,
          dueAmount: installment.amount - (installment.paidAmount || 0),
          dueDate: installment.dueDate,
          daysOverdue: installment.dueDate ? Math.max(0, Math.floor((new Date() - new Date(installment.dueDate)) / (1000 * 60 * 60 * 24))) : 0,
          riskLevel: installment.dueDate ? (Math.floor((new Date() - new Date(installment.dueDate)) / (1000 * 60 * 60 * 24)) > 30 ? 'High' : 'Medium') : 'Low',
          type: 'installment',
          installmentNumber: `${installment.installmentNumber}/${installment.totalInstallments}`,
        }));
        allDues = [...allDues, ...installmentDues];
      }

      // Filter based on view
      if (viewFilter === 'overdue') {
        allDues = allDues.filter(due => due.daysOverdue > 0);
      } else if (viewFilter === 'critical') {
        allDues = allDues.filter(due => due.daysOverdue > 30);
      }

      // Sort by days overdue (most overdue first)
      allDues.sort((a, b) => b.daysOverdue - a.daysOverdue);

      setDues(allDues);

      // Map leads from the enriched dues data
      const leadsMap = {};
      allDues.forEach(due => {
        if (due.lead) {
          leadsMap[due.leadId] = due.lead;
        }
      });
      setLeads(leadsMap);
    } catch (error) {
      console.error("Error fetching dues:", error);
      toast.error("Failed to load outstanding dues");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskLevel) => {
    const badges = {
      High: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
      Medium: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      Low: { bg: "bg-green-100", text: "text-green-700", icon: Clock },
    };
    const badge = badges[riskLevel] || badges.Low;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {riskLevel}
      </span>
    );
  };

  const handleSendReminder = async (due) => {
    try {
      const response = await financeAPI.sendDueReminder(due.id, { method: 'email' });
      if (response.success) {
        const lead = due.lead || leads[due.leadId];
        toast.success(`Reminder sent to ${lead?.email || 'student'}`);
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    }
  };

  const handleAddFollowUp = (due) => {
    setSelectedDue(due);
    setFollowUpNote("");
    setShowFollowUpModal(true);
  };

  const handleSubmitFollowUp = async () => {
    if (!followUpNote.trim()) {
      toast.error("Please enter a follow-up note");
      return;
    }
    try {
      const response = await financeAPI.addFollowUpNote(selectedDue.id, { note: followUpNote });
      if (response.success) {
        toast.success("Follow-up note added");
        setShowFollowUpModal(false);
        setSelectedDue(null);
        setFollowUpNote("");
      }
    } catch (error) {
      console.error("Error adding follow-up note:", error);
      toast.error("Failed to add follow-up note");
    }
  };

  const handleEscalate = async (due) => {
    try {
      const response = await financeAPI.escalateDue(due.id, { reason: 'Overdue payment' });
      if (response.success) {
        const lead = due.lead || leads[due.leadId];
        toast.success(`Escalated ${lead?.name || 'student'} to Finance Head`);
      }
    } catch (error) {
      console.error("Error escalating due:", error);
      toast.error("Failed to escalate");
    }
  };

  const filteredDues = dues.filter(due => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    // Use lead from enriched data if available, otherwise from leads map
    const lead = due.lead || leads[due.leadId];
    if (!lead) return false;
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredDues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDues = filteredDues.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const totalDues = filteredDues.length;
  const totalDueAmount = filteredDues.reduce((sum, due) => sum + due.dueAmount, 0);
  const overdueCount = filteredDues.filter(due => due.daysOverdue > 0).length;
  const criticalCount = filteredDues.filter(due => due.daysOverdue > 30).length;

  return (
    <>
      <PageHeader
        title="Outstanding Dues"
        description="Follow-ups & recovery for overdue payments"
        actions={
          <Button variant="ghost" size="sm" onClick={() => toast.info('Export functionality coming soon')}>
            <Download className="h-4 w-4" />
            Export Overdue List
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Dues</p>
              <p className="text-2xl font-bold text-text">{totalDues}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Due Amount</p>
              <p className="text-2xl font-bold text-text">₹{totalDueAmount.toLocaleString()}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Overdue</p>
              <p className="text-2xl font-bold text-text">{overdueCount}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Critical (30+ days)</p>
              <p className="text-2xl font-bold text-text">{criticalCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Dues Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by student name, email, or phone..."
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
              value={viewFilter}
              onChange={(e) => {
                setViewFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="all">All Dues</option>
              <option value="overdue">Overdue Only</option>
              <option value="critical">Critical (30+ days)</option>
            </select>
            <Button variant="ghost" size="sm" onClick={fetchDues}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading dues...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Total Fee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Paid Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Due Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Days Overdue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {paginatedDues.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-textMuted">
                    {searchTerm ? "No dues match your search." : "No outstanding dues found."}
                  </td>
                </tr>
              ) : (
                paginatedDues.map((due) => {
                  // Use lead from enriched data if available, otherwise from leads map
                  const lead = due.lead || leads[due.leadId];
                  return (
                    <tr key={due.id} className="transition hover:bg-brintelli-baseAlt">
                      <td className="px-4 py-3">
                        {lead ? (
                          <>
                            <p className="font-semibold text-text">{lead.name || "N/A"}</p>
                            <p className="text-xs text-textMuted">{lead.email || "N/A"}</p>
                          </>
                        ) : (
                          <span className="text-xs text-textMuted italic">Lead not found</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text">Master Program</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-text">
                          ₹{due.totalFee.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text">
                          ₹{due.paidAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-red-600">
                          ₹{due.dueAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text">
                          {due.dueDate ? new Date(due.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }) : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {due.daysOverdue > 0 ? (
                          <span className="text-sm font-semibold text-red-600">
                            {due.daysOverdue} days
                          </span>
                        ) : (
                          <span className="text-sm text-textMuted">Not due yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getRiskBadge(due.riskLevel)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleSendReminder(due)}
                            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 hover:underline"
                            title="Send Reminder"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAddFollowUp(due)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            title="Add Follow-up"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                          {due.riskLevel === 'High' && (
                            <button
                              onClick={() => handleEscalate(due)}
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 hover:underline"
                              title="Escalate"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </button>
                          )}
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
        {filteredDues.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDues.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Follow-up Modal */}
      {showFollowUpModal && selectedDue && (
        <Modal
          isOpen={showFollowUpModal}
          onClose={() => {
            setShowFollowUpModal(false);
            setSelectedDue(null);
            setFollowUpNote("");
          }}
          title="Add Follow-up Note"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              {selectedDue.lead || leads[selectedDue.leadId] ? (
                <>
                  <p className="text-sm font-semibold text-text">{(selectedDue.lead || leads[selectedDue.leadId]).name}</p>
                  <p className="text-xs text-textMuted">{(selectedDue.lead || leads[selectedDue.leadId]).email}</p>
                  <p className="text-sm text-textMuted mt-2">
                    Due Amount: ₹{selectedDue.dueAmount?.toLocaleString() || "0"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-textMuted">Student ID: {selectedDue.leadId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Follow-up Note
              </label>
              <textarea
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Enter follow-up notes..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="primary"
                onClick={handleSubmitFollowUp}
                className="flex-1"
              >
                Save Note
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowFollowUpModal(false);
                  setSelectedDue(null);
                }}
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

export default OutstandingDues;
