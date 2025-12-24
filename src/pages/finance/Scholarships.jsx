import { useState, useEffect } from "react";
import { Search, RefreshCw, CheckCircle2, XCircle, Clock, Eye, DollarSign } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { scholarshipAPI } from "../../api/scholarship";
import toast from "react-hot-toast";

const Scholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Show all by default
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionData, setDecisionData] = useState({ decision: "", finalPrice: "", notes: "" });

  useEffect(() => {
    fetchScholarships();
  }, [statusFilter]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await scholarshipAPI.getAllScholarships({
        status: statusFilter || undefined,
      });

      if (response.success && response.data.scholarshipRequests) {
        setScholarships(response.data.scholarshipRequests);
      }
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      toast.error("Failed to load scholarship requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (scholarship) => {
    setSelectedScholarship(scholarship);
    setShowDetailModal(true);
  };

  const handleMakeDecision = (scholarship) => {
    setSelectedScholarship(scholarship);
    setDecisionData({
      decision: "",
      finalPrice: scholarship.offer?.offeredPrice?.toString() || "",
      notes: "",
    });
    setShowDecisionModal(true);
  };

  const handleSubmitDecision = async () => {
    if (!decisionData.decision) {
      toast.error("Please select a decision");
      return;
    }

    if (decisionData.decision === "APPROVED" && !decisionData.finalPrice) {
      toast.error("Please enter the final price");
      return;
    }

    try {
      const response = await scholarshipAPI.makeScholarshipDecision(
        selectedScholarship.id,
        {
          decision: decisionData.decision,
          finalPrice: decisionData.decision === "APPROVED" ? parseFloat(decisionData.finalPrice) : null,
          notes: decisionData.notes,
        }
      );

      if (response.success) {
        toast.success(`Scholarship request ${decisionData.decision.toLowerCase()} successfully`);
        setShowDecisionModal(false);
        setSelectedScholarship(null);
        fetchScholarships();
      } else {
        toast.error(response.error || "Failed to process decision");
      }
    } catch (error) {
      console.error("Error making decision:", error);
      toast.error(error.message || "Failed to process decision");
    }
  };

  const filteredScholarships = scholarships.filter((scholarship) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      scholarship.lead?.name?.toLowerCase().includes(search) ||
      scholarship.lead?.email?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScholarships = filteredScholarships.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const badges = {
      REQUESTED: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Requested" },
      APPROVED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Approved" },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Rejected" },
    };
    const badge = badges[status] || badges.REQUESTED;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  return (
    <>
      <PageHeader
        title="Scholarship Management"
        description="Review and manage scholarship requests from candidates."
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending Requests</p>
              <p className="text-2xl font-bold text-text">
                {scholarships.filter((s) => s.status === "REQUESTED").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Approved</p>
              <p className="text-2xl font-bold text-text">
                {scholarships.filter((s) => s.status === "APPROVED").length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending Revenue Impact</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{scholarships
                  .filter((s) => s.status === "REQUESTED")
                  .reduce((sum, s) => sum + (s.requestedAmount || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Revenue Loss</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{scholarships
                  .filter((s) => s.status === "APPROVED")
                  .reduce((sum, s) => {
                    const revenueLoss = s.offer?.basePrice 
                      ? (s.offer.basePrice - (s.offer.offeredPrice || s.offer.basePrice))
                      : (s.requestedAmount || 0);
                    return sum + revenueLoss;
                  }, 0)
                  .toLocaleString()}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Scholarships Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by candidate name or email..."
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
              <option value="REQUESTED">Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Button variant="ghost" size="sm" onClick={fetchScholarships}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading scholarship requests...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Base Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Requested Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Final Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Revenue Loss (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Requested At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {paginatedScholarships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-textMuted">
                    {searchTerm ? "No scholarship requests match your search." : "No scholarship requests found."}
                  </td>
                </tr>
              ) : (
                paginatedScholarships.map((scholarship) => {
                  const basePrice = scholarship.offer?.basePrice || 0;
                  const finalPrice = scholarship.offer?.offeredPrice || basePrice;
                  const revenueLoss = basePrice - finalPrice;
                  
                  return (
                    <tr key={scholarship.id} className="transition hover:bg-brintelli-baseAlt">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{scholarship.lead?.name || "N/A"}</p>
                        <p className="text-xs text-textMuted">{scholarship.lead?.email || "N/A"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-text">
                          ₹{basePrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-text">
                          ₹{scholarship.requestedAmount?.toLocaleString() || "0"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-text">
                          ₹{finalPrice.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-red-600">
                          ₹{revenueLoss.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(scholarship.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text">
                          {new Date(scholarship.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(scholarship)}
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {scholarship.status === "REQUESTED" && (
                            <button
                              onClick={() => handleMakeDecision(scholarship)}
                              className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 hover:underline"
                              title="Make Decision"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
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
        {filteredScholarships.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredScholarships.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedScholarship && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedScholarship(null);
          }}
          title="Scholarship Request Details"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-textMuted mb-2">Candidate</h3>
              <p className="text-text font-semibold">{selectedScholarship.lead?.name || "N/A"}</p>
              <p className="text-sm text-textMuted">{selectedScholarship.lead?.email || "N/A"}</p>
            </div>

            {selectedScholarship.offer && (
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                <h3 className="text-sm font-semibold text-textMuted mb-3">Offer Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Base Price:</span>
                    <span className="text-sm font-semibold text-text">
                      ₹{selectedScholarship.offer.basePrice?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Current Offered Price:</span>
                    <span className="text-sm font-semibold text-text">
                      ₹{selectedScholarship.offer.offeredPrice?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-textMuted">Level:</span>
                    <span className="text-sm font-semibold text-text">{selectedScholarship.offer.level || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <h3 className="text-sm font-semibold text-textMuted mb-3">Scholarship Request</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-textMuted">Requested Amount:</span>
                  <span className="text-sm font-semibold text-text">
                    ₹{selectedScholarship.requestedAmount?.toLocaleString() || "0"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-textMuted">Reason:</span>
                  <p className="text-sm text-text mt-1">{selectedScholarship.reason || "No reason provided"}</p>
                </div>
                {selectedScholarship.documents && selectedScholarship.documents.length > 0 && (
                  <div>
                    <span className="text-sm text-textMuted">Documents:</span>
                    <div className="mt-1 space-y-1">
                      {selectedScholarship.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-brand-600 hover:underline block"
                        >
                          Document {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedScholarship.reviewedAt && (
              <div>
                <p className="text-xs text-textMuted mb-1">Reviewed At</p>
                <p className="text-sm text-text">
                  {new Date(selectedScholarship.reviewedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedScholarship(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedScholarship && (
        <Modal
          isOpen={showDecisionModal}
          onClose={() => {
            setShowDecisionModal(false);
            setSelectedScholarship(null);
          }}
          title="Make Scholarship Decision"
        >
          <div className="space-y-6">
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <p className="text-sm font-semibold text-text">{selectedScholarship.lead?.name}</p>
              <p className="text-xs text-textMuted">{selectedScholarship.lead?.email}</p>
              <p className="text-sm text-textMuted mt-2">
                Requested: ₹{selectedScholarship.requestedAmount?.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">Decision</label>
              <select
                value={decisionData.decision}
                onChange={(e) => setDecisionData({ ...decisionData, decision: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
                required
              >
                <option value="">Select decision...</option>
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </select>
            </div>

            {decisionData.decision === "APPROVED" && (
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Final Price (₹)</label>
                <input
                  type="number"
                  value={decisionData.finalPrice}
                  onChange={(e) => setDecisionData({ ...decisionData, finalPrice: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="Enter final price"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-text mb-2">Notes (Optional)</label>
              <textarea
                value={decisionData.notes}
                onChange={(e) => setDecisionData({ ...decisionData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Add any notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button variant="primary" onClick={handleSubmitDecision}>
                Submit Decision
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDecisionModal(false);
                  setSelectedScholarship(null);
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

export default Scholarships;
