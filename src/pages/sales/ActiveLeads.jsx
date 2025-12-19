import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Search, Filter, Plus, Mail, Phone, Building2, UserPlus, ClipboardList, Users, X, RefreshCw, Eye } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import CallNotesModal from "../../components/CallNotesModal";
import CallNotesViewer from "../../components/CallNotesViewer";
import ViewAllCallNotesModal from "../../components/ViewAllCallNotesModal";
import Modal from "../../components/Modal";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchSalesTeam, selectSalesTeam, selectSalesTeamLoading, selectSalesTeamError } from "../../store/slices/salesTeamSlice";
import { AnyPermissionGate } from "../../components/PermissionGate";
import { PERMISSIONS } from "../../utils/permissions";

const ActiveLeads = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const salesTeam = useSelector(selectSalesTeam);
  const loadingTeam = useSelector(selectSalesTeamLoading);
  const teamError = useSelector(selectSalesTeamError);
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCallNotesModalOpen, setIsCallNotesModalOpen] = useState(false);
  const [showViewAllCallNotesModal, setShowViewAllCallNotesModal] = useState(false);
  const [showPreScreeningViewModal, setShowPreScreeningViewModal] = useState(false);

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;

  // Calculate pre-screening completion percentage
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

    const totalFields = fields.length;
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    
    // Notes is optional, so we calculate based on 23 main fields + notes (weighted 0.5)
    const mainFields = 23;
    const filledMainFields = fields.slice(0, mainFields).filter(f => f && f.toString().trim() !== '').length;
    const hasNotes = fields[fields.length - 1] && fields[fields.length - 1].toString().trim() !== '';
    
    // Calculate: (filled main fields / 23) * 95% + (has notes ? 5% : 0%)
    const percentage = Math.round((filledMainFields / mainFields) * 95 + (hasNotes ? 5 : 0));
    
    return Math.min(percentage, 100);
  };

  // Fetch sales team from Redux on mount
  useEffect(() => {
    dispatch(fetchSalesTeam()).then((result) => {
      if (result.type === 'salesTeam/fetchSalesTeam/fulfilled') {
        console.log('Sales team loaded:', result.payload);
      } else if (result.type === 'salesTeam/fetchSalesTeam/rejected') {
        console.error('Failed to load sales team:', result.error);
      }
    });

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      dispatch(fetchSalesTeam());
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Helper function to get assigned team member name
  const getAssignedName = (email) => {
    if (!email) return "Unassigned";
    const member = salesTeam.find(m => m.email === email);
    return member ? (member.name || member.fullName) : email;
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoadingLeads(true);
        const response = await leadAPI.getAllLeads();
        if (response.success && response.data.leads) {
          let activeLeads;
          
          if (isSalesAgent && userEmail) {
            // For sales_agent: Show ONLY leads assigned to them in meet_and_call stage (preliminary talk)
            activeLeads = response.data.leads.filter(lead => 
              lead.assignedTo === userEmail && 
              lead.pipelineStage === 'meet_and_call'
            );
          } else {
            // For sales_admin/sales_lead: Show all assigned leads (assignedTo is not null and not empty)
            activeLeads = response.data.leads.filter(lead => 
              lead.assignedTo && lead.assignedTo !== ''
            );
          }
          
          setLeads(activeLeads);
        } else {
          setLeads([]);
        }
      } catch (error) {
        console.error('Error fetching active leads:', error);
        toast.error('Failed to load active leads');
        setLeads([]);
      } finally {
        setLoadingLeads(false);
      }
    };

    // Only fetch if we have user info (for sales agents)
    if (isSalesAgent && !userEmail) {
      // Wait for user to load
      return;
    }

    fetchLeads();
  }, [isSalesAgent, userEmail]);

  // Pagination
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.includes(search) ||
      lead.company?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const activeLeadsCount = leads.length;
  const inProgressLeads = leads.filter(lead => 
    lead.pipelineStage === 'meet_and_call' || 
    lead.pipelineStage === 'assessments' || 
    lead.pipelineStage === 'offer'
  ).length;

  return (
    <>
      <PageHeader
        title={isSalesAgent ? "My Active Leads" : "Active Leads"}
        description={isSalesAgent 
          ? "Leads in meet and call stage - preliminary talk, contacting leads and clearing doubts."
          : "View and manage all assigned leads that are currently in progress."}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Sparkles} 
          value={activeLeadsCount} 
          label={isSalesAgent ? "My Active Leads" : "Active Leads"} 
          trend={isSalesAgent ? "Assigned to me" : "Currently assigned"} 
        />
        <StatsCard icon={Mail} value={inProgressLeads} label="In Progress" trend="Being processed" />
        <StatsCard icon={Phone} value={leads.filter(l => l.pipelineStage === 'meet_and_call').length} label="Call Scheduled" trend="Meet and Call" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="flex items-center justify-between border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">
            {isSalesAgent ? "My Active Leads" : "Active Leads"}
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search active leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loadingLeads ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-brand" />
              <span className="ml-3 text-textMuted">Loading active leads...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-brintelli-baseAlt">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Last Call Note</th>
                  <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_APPROVE]}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Assigned To</th>
                  </AnyPermissionGate>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={isSalesAgent ? 6 : 7} className="px-4 py-8 text-center text-textMuted">
                      {searchTerm ? "No active leads match your search." : "No active leads found."}
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead, idx) => (
                    <tr key={lead.id || idx} className="transition hover:bg-brintelli-baseAlt">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{lead.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-textMuted">{lead.email}</p>
                        <p className="text-xs text-textMuted">{lead.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                          {lead.pipelineStage?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <CallNotesViewer callNotes={lead.callNotes} showLastOnly={true} />
                      </td>
                      <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_APPROVE]}>
                        <td className="px-4 py-3">
                          {lead.assignedTo ? (
                            <span className="text-xs text-textSoft">{getAssignedName(lead.assignedTo)}</span>
                          ) : (
                            <span className="text-xs text-textMuted">Unassigned</span>
                          )}
                        </td>
                      </AnyPermissionGate>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Call Notes: Only Sales Agents can add call notes */}
                          {isSalesAgent && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsCallNotesModalOpen(true);
                              }}
                            >
                              <Phone className="h-3 w-3" />
                              Add Call Notes
                            </Button>
                          )}
                          {/* View Notes: All roles can view call notes */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowViewAllCallNotesModal(true);
                            }}
                          >
                            <ClipboardList className="h-3 w-3" />
                            View Notes
                          </Button>
                          {lead.preScreening && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowPreScreeningViewModal(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                              Pre-Screening
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeads.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Call Notes Modal */}
      <CallNotesModal
        isOpen={isCallNotesModalOpen}
        onClose={() => {
          setIsCallNotesModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSuccess={(updatedLead) => {
          // Refresh leads list
          const fetchLeads = async () => {
            try {
              const response = await leadAPI.getAllLeads();
              if (response.success && response.data.leads) {
                let activeLeads;
                
                if (isSalesAgent && userEmail) {
                  activeLeads = response.data.leads.filter(lead => 
                    lead.assignedTo === userEmail && 
                    lead.pipelineStage === 'meet_and_call'
                  );
                } else {
                  activeLeads = response.data.leads.filter(lead => 
                    lead.assignedTo && lead.assignedTo !== ''
                  );
                }
                
                setLeads(activeLeads);
              }
            } catch (error) {
              console.error('Error refreshing leads:', error);
            }
          };
          fetchLeads();
        }}
      />

      {/* View All Call Notes Modal */}
      <ViewAllCallNotesModal
        isOpen={showViewAllCallNotesModal}
        onClose={() => {
          setShowViewAllCallNotesModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
      />

      {/* Pre-Screening View Details Modal (Read-only) */}
      <Modal
        isOpen={showPreScreeningViewModal}
        onClose={() => {
          setShowPreScreeningViewModal(false);
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
                        <label className="text-xs font-medium text-textMuted">Degree</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.education.degree}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.education.field && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Field of Study</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.education.field}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.education.university && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">University/College</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.education.university}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.education.graduationYear && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Graduation Year</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.education.graduationYear}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.education.gpa && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">GPA/Percentage</label>
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
                        <label className="text-xs font-medium text-textMuted">Current Salary</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.financial.currentSalary}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.financial.expectedSalary && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Expected Salary</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.financial.expectedSalary}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.financial.canAfford && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Can Afford Program Fees?</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.financial.canAfford}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.financial.paymentMethod && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Preferred Payment Method</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.financial.paymentMethod}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.financial.financialStatus && (
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-textMuted">Overall Financial Status</label>
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
                        <label className="text-xs font-medium text-textMuted">Current Job Title</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.job.currentJob}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.job.company && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Company</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.job.company}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.job.experience && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Years of Experience</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.job.experience}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.job.position && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Current Position Level</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.job.position}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.job.noticePeriod && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Notice Period</label>
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
                        <label className="text-xs font-medium text-textMuted">Primary Course Interest</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.courseInterest.primary}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.courseInterest.secondary && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Secondary Interest</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.courseInterest.secondary}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.courseInterest.preferredBatch && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Preferred Batch</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.courseInterest.preferredBatch}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.courseInterest.startDatePreference && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Start Date Preference</label>
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
                        <label className="text-xs font-medium text-textMuted">LinkedIn Profile</label>
                        <p className="text-sm text-text break-all">
                          <a href={selectedLead.preScreening.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                            {selectedLead.preScreening.social.linkedin}
                          </a>
                        </p>
                      </div>
                    )}
                    {selectedLead.preScreening.social.github && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">GitHub Profile</label>
                        <p className="text-sm text-text break-all">
                          <a href={selectedLead.preScreening.social.github} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                            {selectedLead.preScreening.social.github}
                          </a>
                        </p>
                      </div>
                    )}
                    {selectedLead.preScreening.social.portfolio && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Portfolio/Website</label>
                        <p className="text-sm text-text break-all">
                          <a href={selectedLead.preScreening.social.portfolio} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                            {selectedLead.preScreening.social.portfolio}
                          </a>
                        </p>
                      </div>
                    )}
                    {selectedLead.preScreening.social.twitter && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Twitter Handle</label>
                        <p className="text-sm text-text">{selectedLead.preScreening.social.twitter}</p>
                      </div>
                    )}
                    {selectedLead.preScreening.social.other && (
                      <div>
                        <label className="text-xs font-medium text-textMuted">Other Link</label>
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

          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowPreScreeningViewModal(false);
                setSelectedLead(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ActiveLeads;

