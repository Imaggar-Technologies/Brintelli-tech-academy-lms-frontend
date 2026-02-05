import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ArchiveX, RefreshCw, Search, RotateCcw, Mail, Building2, User as UserIcon, MoreVertical, History, FileText, ClipboardList, CalendarClock, Video, Phone } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import StatsCard from "../../components/StatsCard";
import Modal from "../../components/Modal";
import ViewAllCallNotesModal from "../../components/ViewAllCallNotesModal";
import CallNotesViewer from "../../components/CallNotesViewer";
import { leadAPI } from "../../api/lead";
import { selectCurrentUser } from "../../store/slices/authSlice";

const InactiveLeads = () => {
  const currentUser = useSelector(selectCurrentUser);
  const isSalesAgent = currentUser?.role === "sales_agent";
  const userEmail = currentUser?.email;

  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewAllCallNotesModal, setShowViewAllCallNotesModal] = useState(false);
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);

  const fetchInactive = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads();
      const all = res?.data?.leads || [];
      let inactive = all.filter((l) => (l.pipelineStage || "primary_screening") === "lead_dump" || l.status === "DEACTIVATED" || l.isDeactivated === true);

      // ABAC: Sales agent sees only their leads
      if (isSalesAgent && userEmail) {
        inactive = inactive.filter((l) => l.assignedTo === userEmail);
      }

      setLeads(inactive);
    } catch (e) {
      toast.error(e?.message || "Failed to load inactive leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSalesAgent && !userEmail) return;
    fetchInactive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSalesAgent, userEmail]);

  const filtered = useMemo(() => {
    if (!searchTerm) return leads;
    const s = searchTerm.toLowerCase();
    return (leads || []).filter(
      (l) =>
        l.name?.toLowerCase().includes(s) ||
        l.email?.toLowerCase().includes(s) ||
        l.company?.toLowerCase().includes(s)
    );
  }, [leads, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const restoreLead = async (leadId) => {
    try {
      await leadAPI.updatePipelineStage(leadId, "primary_screening");
      toast.success("Lead restored to New Leads");
      fetchInactive();
    } catch (e) {
      toast.error(e?.message || "Failed to restore lead");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return String(value);
    }
  };

  // Calculate pre-screening completion percentage (same as ActiveLeads)
  const calculateCompletionPercentage = (data) => {
    if (!data) return 0;

    const fields = [
      // Education (5 fields)
      data.education?.degree,
      data.education?.field,
      data.education?.university,
      data.education?.graduationYear,
      data.education?.gpa,
      // Financial (5 fields)
      data.financial?.currentSalary,
      data.financial?.expectedSalary,
      data.financial?.canAfford,
      data.financial?.paymentMethod,
      data.financial?.financialStatus,
      // Job (5 fields)
      data.job?.currentJob,
      data.job?.company,
      data.job?.experience,
      data.job?.position,
      data.job?.noticePeriod,
      // Social (5 fields)
      data.social?.linkedin,
      data.social?.github,
      data.social?.portfolio,
      data.social?.twitter,
      data.social?.other,
      // Course Interest (3 fields)
      data.courseInterest?.primary,
      data.courseInterest?.preferredBatch,
      data.courseInterest?.startDatePreference,
      // Notes (1 field - optional, so weighted less)
      data.notes,
    ];

    // Notes is optional, so we calculate based on 23 main fields + notes (weighted 0.5)
    const mainFields = 23;
    const filledMainFields = fields.slice(0, mainFields).filter(f => f && f.toString().trim() !== '').length;
    const hasNotes = fields.at(-1) && fields.at(-1).toString().trim() !== '';
    
    // Calculate: (filled main fields / 23) * 95% + (has notes ? 5% : 0%)
    const percentage = Math.round((filledMainFields / mainFields) * 95 + (hasNotes ? 5 : 0));
    
    return Math.min(percentage, 100);
  };

  return (
    <>
      <PageHeader
        title="Inactive Leads"
        description="Leads moved to Lead Dump (not interested / not qualified)."
        actions={
          <Button variant="ghost" size="sm" onClick={fetchInactive}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <StatsCard icon={ArchiveX} value={filtered.length} label="Inactive Leads" trend="Lead Dump" />
        <StatsCard icon={Mail} value={filtered.filter((l) => !!l.email).length} label="With Email" trend="Reachable" />
        <StatsCard icon={Building2} value={filtered.filter((l) => !!l.company).length} label="With Company" trend="Prospects" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search inactive leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading inactive leads...</span>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Lead</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Assigned To</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Deactivated At</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Reason</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <ArchiveX className="h-12 w-12 text-textMuted mb-4" />
                        <p className="text-text font-medium mb-1">No inactive leads found</p>
                        <p className="text-sm text-textMuted">Leads moved to Lead Dump will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((lead) => (
                    <tr key={lead.id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text">{lead.name || "—"}</p>
                        <p className="text-xs text-textMuted">{lead.email || "—"}</p>
                        {lead.company ? <p className="text-xs text-textMuted">{lead.company}</p> : null}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-textMuted" />
                          <span className="text-sm text-text">{lead.assignedTo || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-textMuted">
                          <CalendarClock className="h-4 w-4" />
                          <span>{formatDateTime(lead.deactivatedAt || lead.updatedAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text">
                          {lead.deactivationReason || lead.flag?.reasonText || lead.flag?.reason || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowHistoryModal(true);
                            }}
                            title="View History"
                          >
                            <History className="h-4 w-4" />
                            History
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() => restoreLead(lead.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </Button>

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setOpenDropdownId(openDropdownId === lead.id ? null : lead.id)}
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {openDropdownId === lead.id ? (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setShowPreScreeningModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                    >
                                      <FileText className="h-4 w-4" />
                                      View Pre-Screening
                                    </button>

                                    <button
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setShowViewAllCallNotesModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                    >
                                      <ClipboardList className="h-4 w-4" />
                                      View All Notes
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {filtered.length > 0 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </div>
        )}
      </div>

      {/* View All Notes */}
      <ViewAllCallNotesModal
        isOpen={showViewAllCallNotesModal}
        onClose={() => {
          setShowViewAllCallNotesModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
      />

      {/* Pre-Screening (Read-only) - Full Detailed View */}
      {showPreScreeningModal && selectedLead ? (
        <Modal
          isOpen={showPreScreeningModal}
          onClose={() => {
            setShowPreScreeningModal(false);
            setSelectedLead(null);
          }}
          title={`Pre-Screening Details: ${selectedLead?.name || "Lead"}`}
          size="lg"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {selectedLead?.preScreening ? (
              <>
                {/* Completion Status */}
                <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text">Pre-Screening Progress</span>
                    <span className="text-sm font-semibold text-brand">
                      {calculateCompletionPercentage(selectedLead.preScreening)}% Complete
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand via-brand-dark to-brand transition-all duration-500 ease-out"
                      style={{ width: `${calculateCompletionPercentage(selectedLead.preScreening)}%` }}
                    />
                  </div>
                </div>

                {/* Education Details */}
                {selectedLead.preScreening.education && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-text">Education Details</h3>
                    <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                      {selectedLead.preScreening.education.degree && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Degree</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.education.degree}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.education.field && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Field of Study</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.education.field}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.education.university && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">University/College</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.education.university}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.education.graduationYear && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Graduation Year</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.education.graduationYear}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.education.gpa && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">GPA/Percentage</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.education.gpa}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Status */}
                {selectedLead.preScreening.financial && (
                  <div className="space-y-4 border-t border-brintelli-border pt-4">
                    <h3 className="text-lg font-semibold text-text">Financial Status</h3>
                    <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                      {selectedLead.preScreening.financial.currentSalary && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Current Salary</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.financial.currentSalary}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.financial.expectedSalary && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Expected Salary</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.financial.expectedSalary}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.financial.canAfford && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Can Afford Program Fees?</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.financial.canAfford}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.financial.paymentMethod && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Preferred Payment Method</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.financial.paymentMethod}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.financial.financialStatus && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium text-textMuted mb-1">Overall Financial Status</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.financial.financialStatus}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Details */}
                {selectedLead.preScreening.job && (
                  <div className="space-y-4 border-t border-brintelli-border pt-4">
                    <h3 className="text-lg font-semibold text-text">Job Details</h3>
                    <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                      {selectedLead.preScreening.job.currentJob && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Current Job Title</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.job.currentJob}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.job.company && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Company</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.job.company}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.job.experience && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Years of Experience</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.job.experience}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.job.position && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Current Position Level</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.job.position}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.job.noticePeriod && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Notice Period</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.job.noticePeriod}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Course Interest */}
                {selectedLead.preScreening.courseInterest && (
                  <div className="space-y-4 border-t border-brintelli-border pt-4">
                    <h3 className="text-lg font-semibold text-text">Course Interest</h3>
                    <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                      {selectedLead.preScreening.courseInterest.primary && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Primary Course Interest</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.courseInterest.primary}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.courseInterest.secondary && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Secondary Interest</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.courseInterest.secondary}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.courseInterest.preferredBatch && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Preferred Batch</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.courseInterest.preferredBatch}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.courseInterest.startDatePreference && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Start Date Preference</p>
                          <p className="text-sm text-text">
                            {new Date(selectedLead.preScreening.courseInterest.startDatePreference).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {selectedLead.preScreening.social && (
                  <div className="space-y-4 border-t border-brintelli-border pt-4">
                    <h3 className="text-lg font-semibold text-text">Social Media & Portfolio</h3>
                    <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                      {selectedLead.preScreening.social.linkedin && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">LinkedIn Profile</p>
                          <p className="text-sm text-text break-all">
                            <a href={selectedLead.preScreening.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                              {selectedLead.preScreening.social.linkedin}
                            </a>
                          </p>
                        </div>
                      )}
                      {selectedLead.preScreening.social.github && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">GitHub Profile</p>
                          <p className="text-sm text-text break-all">
                            <a href={selectedLead.preScreening.social.github} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                              {selectedLead.preScreening.social.github}
                            </a>
                          </p>
                        </div>
                      )}
                      {selectedLead.preScreening.social.portfolio && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Portfolio/Website</p>
                          <p className="text-sm text-text break-all">
                            <a href={selectedLead.preScreening.social.portfolio} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                              {selectedLead.preScreening.social.portfolio}
                            </a>
                          </p>
                        </div>
                      )}
                      {selectedLead.preScreening.social.twitter && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Twitter Handle</p>
                          <p className="text-sm text-text">{selectedLead.preScreening.social.twitter}</p>
                        </div>
                      )}
                      {selectedLead.preScreening.social.other && (
                        <div>
                          <p className="text-xs font-medium text-textMuted mb-1">Other Link</p>
                          <p className="text-sm text-text break-all">
                            <a href={selectedLead.preScreening.social.other} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                              {selectedLead.preScreening.social.other}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedLead.preScreening.notes && (
                  <div className="space-y-4 border-t border-brintelli-border pt-4">
                    <h3 className="text-lg font-semibold text-text">Additional Notes</h3>
                    <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                      <p className="text-sm text-text whitespace-pre-wrap">{selectedLead.preScreening.notes}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-textMuted">
                <p>No pre-screening data available for this lead.</p>
              </div>
            )}
          </div>
        </Modal>
      ) : null}

      {/* History - Enhanced UI */}
      {showHistoryModal && selectedLead ? (
        <Modal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedLead(null);
          }}
          title={`Lead History: ${selectedLead?.name || "Lead"}`}
          size="xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Lead Info Card */}
            <div className="rounded-xl border border-brintelli-border bg-gradient-to-br from-brintelli-baseAlt to-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-text">{selectedLead.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-text">{selectedLead.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Deactivated At</p>
                  <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.deactivatedAt || selectedLead.updatedAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-textMuted uppercase tracking-wide">Deactivated From Stage</p>
                  <p className="text-sm font-medium text-text">
                    {selectedLead.deactivatedFromStage ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 capitalize">
                        {selectedLead.deactivatedFromStage.replace(/_/g, " ")}
                      </span>
                    ) : "—"}
                  </p>
                </div>
              </div>
              {(selectedLead.deactivationReason || selectedLead.flag?.reasonText || selectedLead.flag?.reason) ? (
                <div className="mt-4 pt-4 border-t border-brintelli-border">
                  <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-1">Deactivation Reason</p>
                  <p className="text-sm text-text">{selectedLead.deactivationReason || selectedLead.flag?.reasonText || selectedLead.flag?.reason}</p>
                </div>
              ) : null}
            </div>

            {/* Stage Timeline - Visual Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-brand" />
                <h3 className="text-lg font-semibold text-text">Stage Timeline</h3>
              </div>
              {Array.isArray(selectedLead.stageHistory) && selectedLead.stageHistory.length > 0 ? (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand via-brand/60 to-brand/30"></div>
                  
                  <div className="space-y-4">
                    {(() => {
                      // Get all stage history entries and ensure we have the complete history
                      const allHistory = [...(selectedLead.stageHistory || [])];
                      
                      // Sort by timestamp (oldest first) to show chronological order
                      const sortedHistory = allHistory.sort((a, b) => {
                        const timeA = new Date(a.changedAt || a.changedAt || 0).getTime();
                        const timeB = new Date(b.changedAt || b.changedAt || 0).getTime();
                        return timeA - timeB;
                      });
                      
                      // Display all entries - no filtering, show complete history
                      return sortedHistory.map((h, idx) => {
                        const uniqueKey = `${h.changedAt || Date.now()}-${h.fromStage || 'null'}-${h.toStage || 'null'}-${idx}`;
                        const isDeactivation = h.toStage === 'lead_dump' || h.reason === 'deactivated';
                        const isReactivation = h.fromStage === 'lead_dump' && h.reason === 'reactivated';
                        
                        return (
                          <div key={uniqueKey} className="relative flex items-start gap-4">
                            {/* Timeline Dot */}
                            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                              isDeactivation ? 'bg-red-500' : isReactivation ? 'bg-green-500' : 'bg-brand'
                            }`}>
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                            
                            {/* Content Card */}
                            <div className={`flex-1 rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
                              isDeactivation ? 'border-red-200 bg-red-50' : 
                              isReactivation ? 'border-green-200 bg-green-50' : 
                              'border-brintelli-border bg-white'
                            }`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {h.fromStage ? (
                                      <>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${
                                          h.fromStage === 'lead_dump' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-textMuted'
                                        }`}>
                                          {h.fromStage.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-textMuted">→</span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-textMuted italic">Initial Stage</span>
                                    )}
                                    <span className={`text-sm font-semibold px-2 py-0.5 rounded capitalize ${
                                      h.toStage === 'lead_dump' ? 'bg-red-100 text-red-700' : 
                                      h.fromStage === 'lead_dump' ? 'bg-green-100 text-green-700' : 
                                      'bg-brand/10 text-brand'
                                    }`}>
                                      {h.toStage.replace(/_/g, " ")}
                                    </span>
                                    {isDeactivation && (
                                      <span className="text-xs font-semibold text-red-600 px-2 py-0.5 rounded bg-red-100">
                                        Deactivated
                                      </span>
                                    )}
                                    {isReactivation && (
                                      <span className="text-xs font-semibold text-green-600 px-2 py-0.5 rounded bg-green-100">
                                        Reactivated
                                      </span>
                                    )}
                                  </div>
                                  {h.reason ? (
                                    <p className="text-xs text-textMuted mt-1">
                                      <span className="font-medium">Reason:</span> {h.reason}
                                    </p>
                                  ) : null}
                                  {h.changedBy ? (
                                    <p className="text-xs text-textMuted mt-1">
                                      <span className="font-medium">Changed by:</span> {h.changedBy}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="text-xs text-textMuted whitespace-nowrap font-medium">
                                  {formatDateTime(h.changedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Show count of total history entries */}
                  <div className="mt-4 pt-4 border-t border-brintelli-border">
                    <p className="text-xs text-textMuted text-center">
                      Showing all {selectedLead.stageHistory?.length || 0} stage transition{selectedLead.stageHistory?.length !== 1 ? 's' : ''} in chronological order
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-6 text-center">
                  <History className="h-8 w-8 text-textMuted mx-auto mb-2" />
                  <p className="text-sm text-textMuted">No stage history recorded yet.</p>
                </div>
              )}
            </div>

            {/* Important Dates */}
            <div className="space-y-4 border-t border-brintelli-border pt-6">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-brand" />
                <h3 className="text-lg font-semibold text-text">Important Dates</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {selectedLead.createdAt && (
                  <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <p className="text-xs font-medium text-textMuted mb-1">Created At</p>
                    <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.createdAt)}</p>
                  </div>
                )}
                {selectedLead.updatedAt && (
                  <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <p className="text-xs font-medium text-textMuted mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.updatedAt)}</p>
                  </div>
                )}
                {selectedLead.demoDate && (
                  <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <p className="text-xs font-medium text-textMuted mb-1">Demo Scheduled</p>
                    <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.demoDate)}</p>
                  </div>
                )}
                {selectedLead.counselingDate && (
                  <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <p className="text-xs font-medium text-textMuted mb-1">Counseling Scheduled</p>
                    <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.counselingDate)}</p>
                  </div>
                )}
                {selectedLead.assessmentSentAt && (
                  <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <p className="text-xs font-medium text-textMuted mb-1">Assessment Sent</p>
                    <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.assessmentSentAt)}</p>
                  </div>
                )}
                {selectedLead.assessmentCompletedAt && (
                  <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <p className="text-xs font-medium text-textMuted mb-1">Assessment Completed</p>
                    <p className="text-sm font-medium text-text">{formatDateTime(selectedLead.assessmentCompletedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Reports History */}
            {(selectedLead.demoReports && selectedLead.demoReports.length > 0) || selectedLead.demoReport ? (
              <div className="space-y-4 border-t border-brintelli-border pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-brand" />
                    <h3 className="text-lg font-semibold text-text">Demo Meeting Reports</h3>
                  </div>
                  {(() => {
                    const demoReports = selectedLead.demoReports || [];
                    const count = demoReports.length > 0 ? demoReports.length : (selectedLead.demoReport?.submitted ? 1 : 0);
                    return count > 0 ? (
                      <span className="text-xs font-medium text-textMuted bg-brintelli-baseAlt px-2.5 py-1 rounded-full">
                        {count} report{count > 1 ? 's' : ''}
                      </span>
                    ) : null;
                  })()}
                </div>
                
                {(() => {
                  const demoReports = selectedLead.demoReports || [];
                  const allReports = demoReports.length > 0 
                    ? demoReports 
                    : (selectedLead.demoReport?.submitted ? [{
                        report: selectedLead.demoReport.report,
                        submittedAt: selectedLead.demoReport.submittedAt,
                        submittedBy: selectedLead.demoReport.submittedBy,
                        version: 1
                      }] : []);
                  
                  return allReports.length > 0 ? (
                    <div className="space-y-3">
                      {[...allReports]
                        .sort((a, b) => new Date(b.submittedAt || b.submittedAt || 0).getTime() - new Date(a.submittedAt || a.submittedAt || 0).getTime())
                        .map((r, idx) => (
                          <div key={`demo-${r.submittedAt || idx}-${r.version || idx}`} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-brand px-2 py-0.5 rounded bg-brand/10">
                                  Demo Report #{r.version || (allReports.length - idx)}
                                </span>
                                {idx === 0 && (
                                  <span className="text-xs font-semibold text-green-600 px-2 py-0.5 rounded bg-green-100">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-textMuted whitespace-nowrap">
                                {formatDateTime(r.submittedAt || r.submittedAt)}
                              </div>
                            </div>
                            {r.submittedBy && (
                              <p className="text-xs text-textMuted mb-2">
                                Submitted by: {r.submittedBy}
                              </p>
                            )}
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-sm text-text whitespace-pre-wrap">{r.report}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-6 text-center">
                      <Video className="h-8 w-8 text-textMuted mx-auto mb-2" />
                      <p className="text-sm text-textMuted">No demo reports recorded yet.</p>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            {/* Counseling Reports History */}
            {(selectedLead.counselingReports && selectedLead.counselingReports.length > 0) || selectedLead.counselingReport ? (
              <div className="space-y-4 border-t border-brintelli-border pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-brand" />
                    <h3 className="text-lg font-semibold text-text">Counseling Meeting Reports</h3>
                  </div>
                  {(() => {
                    const counselingReports = selectedLead.counselingReports || [];
                    const count = counselingReports.length > 0 ? counselingReports.length : (selectedLead.counselingReport?.submitted ? 1 : 0);
                    return count > 0 ? (
                      <span className="text-xs font-medium text-textMuted bg-brintelli-baseAlt px-2.5 py-1 rounded-full">
                        {count} report{count > 1 ? 's' : ''}
                      </span>
                    ) : null;
                  })()}
                </div>
                
                {(() => {
                  const counselingReports = selectedLead.counselingReports || [];
                  const allReports = counselingReports.length > 0 
                    ? counselingReports 
                    : (selectedLead.counselingReport?.submitted ? [{
                        report: selectedLead.counselingReport.report,
                        submittedAt: selectedLead.counselingReport.submittedAt,
                        submittedBy: selectedLead.counselingReport.submittedBy,
                        version: 1
                      }] : []);
                  
                  return allReports.length > 0 ? (
                    <div className="space-y-3">
                      {[...allReports]
                        .sort((a, b) => new Date(b.submittedAt || b.submittedAt || 0).getTime() - new Date(a.submittedAt || a.submittedAt || 0).getTime())
                        .map((r, idx) => (
                          <div key={`counseling-${r.submittedAt || idx}-${r.version || idx}`} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-brand px-2 py-0.5 rounded bg-brand/10">
                                  Counseling Report #{r.version || (allReports.length - idx)}
                                </span>
                                {idx === 0 && (
                                  <span className="text-xs font-semibold text-green-600 px-2 py-0.5 rounded bg-green-100">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-textMuted whitespace-nowrap">
                                {formatDateTime(r.submittedAt || r.submittedAt)}
                              </div>
                            </div>
                            {r.submittedBy && (
                              <p className="text-xs text-textMuted mb-2">
                                Submitted by: {r.submittedBy}
                              </p>
                            )}
                            <div className="rounded-lg bg-white p-3">
                              <p className="text-sm text-text whitespace-pre-wrap">{r.report}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-6 text-center">
                      <Phone className="h-8 w-8 text-textMuted mx-auto mb-2" />
                      <p className="text-sm text-textMuted">No counseling reports recorded yet.</p>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            {/* Call Notes - Enhanced Display */}
            <div className="space-y-4 border-t border-brintelli-border pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-brand" />
                  <h3 className="text-lg font-semibold text-text">Call Notes History</h3>
                </div>
                {selectedLead.callNotes && Array.isArray(selectedLead.callNotes) && selectedLead.callNotes.length > 0 && (
                  <span className="text-xs font-medium text-textMuted bg-brintelli-baseAlt px-2.5 py-1 rounded-full">
                    {selectedLead.callNotes.length} note{selectedLead.callNotes.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {selectedLead.callNotes && Array.isArray(selectedLead.callNotes) && selectedLead.callNotes.length > 0 ? (
                <div className="space-y-3">
                  <CallNotesViewer callNotes={selectedLead.callNotes} showLastOnly={false} />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 w-full"
                    onClick={() => {
                      setShowHistoryModal(false);
                      setShowViewAllCallNotesModal(true);
                    }}
                  >
                    <ClipboardList className="h-4 w-4" />
                    View All {selectedLead.callNotes.length} Call Notes
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-6 text-center">
                  <ClipboardList className="h-8 w-8 text-textMuted mx-auto mb-2" />
                  <p className="text-sm text-textMuted">No call notes recorded yet.</p>
                </div>
              )}
            </div>

            {/* Pre-Screening Summary */}
            {selectedLead.preScreening && (
              <div className="space-y-4 border-t border-brintelli-border pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand" />
                    <h3 className="text-lg font-semibold text-text">Pre-Screening Summary</h3>
                  </div>
                  <span className="text-xs font-semibold text-brand bg-brand/10 px-2.5 py-1 rounded-full">
                    {calculateCompletionPercentage(selectedLead.preScreening)}% Complete
                  </span>
                </div>
                <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-brand via-brand-dark to-brand transition-all duration-500 ease-out"
                      style={{ width: `${calculateCompletionPercentage(selectedLead.preScreening)}%` }}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    {selectedLead.preScreening.education && Object.keys(selectedLead.preScreening.education).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-textMuted">✓</span>
                        <span className="text-text">Education Details</span>
                      </div>
                    )}
                    {selectedLead.preScreening.financial && Object.keys(selectedLead.preScreening.financial).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-textMuted">✓</span>
                        <span className="text-text">Financial Status</span>
                      </div>
                    )}
                    {selectedLead.preScreening.job && Object.keys(selectedLead.preScreening.job).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-textMuted">✓</span>
                        <span className="text-text">Job Details</span>
                      </div>
                    )}
                    {selectedLead.preScreening.courseInterest && Object.keys(selectedLead.preScreening.courseInterest).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-textMuted">✓</span>
                        <span className="text-text">Course Interest</span>
                      </div>
                    )}
                    {selectedLead.preScreening.social && Object.keys(selectedLead.preScreening.social).length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-textMuted">✓</span>
                        <span className="text-text">Social Media</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => {
                    setShowHistoryModal(false);
                    setShowPreScreeningModal(true);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  View Full Pre-Screening Details
                </Button>
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default InactiveLeads;


