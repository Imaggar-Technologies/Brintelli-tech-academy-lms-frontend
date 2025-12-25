import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Search, Filter, Plus, Mail, Phone, Building2, UserPlus, ClipboardList, Users, X, RefreshCw, Eye, ChevronDown, FileText, MoreVertical, User, Video } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import CallNotesModal from "../../components/CallNotesModal";
import CallNotesViewer from "../../components/CallNotesViewer";
import ViewAllCallNotesModal from "../../components/ViewAllCallNotesModal";
import Modal from "../../components/Modal";
import { leadAPI } from "../../api/lead";
import { programAPI } from "../../api/program";
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
  const [stageFilter, setStageFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCallNotesModalOpen, setIsCallNotesModalOpen] = useState(false);
  const [showViewAllCallNotesModal, setShowViewAllCallNotesModal] = useState(false);
  const [showPreScreeningViewModal, setShowPreScreeningViewModal] = useState(false);
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);
  const [showContactDetailsModal, setShowContactDetailsModal] = useState(false);
  const [showBookDemoModal, setShowBookDemoModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [demoData, setDemoData] = useState({
    date: "",
    time: "",
    meetingLink: "",
    notes: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [preScreeningData, setPreScreeningData] = useState({
    leadId: null,
    education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
    financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
    job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
    social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
    courseInterest: { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
    notes: "",
  });

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;
  const [programs, setPrograms] = useState([]);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await programAPI.getAllPrograms({ status: 'ACTIVE' });
        if (response.success && response.data.programs) {
          setPrograms(response.data.programs);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };
    fetchPrograms();
  }, []);

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

  // Handle pre-screening (for sales agents only - editable)
  const handlePreScreening = (lead) => {
    const existingData = lead.preScreening || {};
    setPreScreeningData({
      leadId: lead.id || lead._id,
      education: existingData.education || { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
      financial: existingData.financial || { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
      job: existingData.job || { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
      social: existingData.social || { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
      courseInterest: existingData.courseInterest || { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
      notes: existingData.notes || "",
    });
    setSelectedLead(lead);
    setShowPreScreeningModal(true);
  };

  // Handle pre-screening submit (sales agents only)
  const handlePreScreeningSubmit = async () => {
    try {
      const { leadId, ...preScreeningPayload } = preScreeningData;
      
      const response = await leadAPI.updatePreScreening(leadId, {
        education: preScreeningPayload.education,
        financial: preScreeningPayload.financial,
        job: preScreeningPayload.job,
        social: preScreeningPayload.social,
        courseInterest: preScreeningPayload.courseInterest,
        notes: preScreeningPayload.notes,
      });

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

      await fetchLeads();

      toast.success("Pre-screening data updated successfully");
      
      setShowPreScreeningModal(false);
      setPreScreeningData({
        leadId: null,
        education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
        financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
        job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
        social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
        courseInterest: { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
        notes: "",
      });
      setSelectedLead(null);
    } catch (error) {
      console.error('Error saving pre-screening:', error);
      toast.error(error.message || "Failed to save pre-screening data");
    }
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

  // Close dropdown when modals open
  useEffect(() => {
    if (isCallNotesModalOpen || showViewAllCallNotesModal || showPreScreeningModal || showContactDetailsModal || showBookDemoModal) {
      setOpenDropdownId(null);
    }
  }, [isCallNotesModalOpen, showViewAllCallNotesModal, showPreScreeningModal, showContactDetailsModal, showBookDemoModal]);

  // Handle book demo
  const handleBookDemo = async () => {
    if (!demoData.date || !demoData.time || !selectedLead) {
      toast.error("Please select date and time");
      return;
    }

    setBookingLoading(true);
    try {
      await leadAPI.bookDemo(selectedLead.id || selectedLead._id, demoData);
      
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

      await fetchLeads();
      
      toast.success("Demo call booked successfully!");
      setShowBookDemoModal(false);
      setDemoData({ date: "", time: "", meetingLink: "", notes: "" });
      setSelectedLead(null);
    } catch (error) {
      console.error("Error booking demo:", error);
      toast.error(error.message || "Failed to book demo call");
    } finally {
      setBookingLoading(false);
    }
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

  // Get unique values for filters
  const uniqueStages = [...new Set(leads.map(l => l.pipelineStage).filter(Boolean))];
  const uniqueAssignedTo = [...new Set(leads.map(l => l.assignedTo).filter(Boolean))];

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    // Search filter
    if (searchTerm) {
    const search = searchTerm.toLowerCase();
      const matchesSearch = (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.includes(search) ||
      lead.company?.toLowerCase().includes(search)
    );
      if (!matchesSearch) return false;
    }

    // Stage filter
    if (stageFilter && lead.pipelineStage !== stageFilter) {
      return false;
    }

    // Assigned To filter
    if (assignedToFilter && lead.assignedTo !== assignedToFilter) {
      return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, assignedToFilter]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeFilterColumn && !event.target.closest('.filter-dropdown')) {
        setActiveFilterColumn(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilterColumn]);

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
          <div className="flex items-center gap-3">
            {(stageFilter || assignedToFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setStageFilter('');
                  setAssignedToFilter('');
                }}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <div className="relative w-64">
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
        </div>
        <div>
          {loadingLeads ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-brand" />
              <span className="ml-3 text-textMuted">Loading active leads...</span>
            </div>
          ) : (
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Contact</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted relative">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:text-text filter-dropdown"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFilterColumn(activeFilterColumn === 'stage' ? null : 'stage');
                      }}
                    >
                      Stage
                      {stageFilter && (
                        <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-xs text-white">
                          1
                        </span>
                      )}
                      <Filter className="h-3 w-3" />
                    </div>
                    {activeFilterColumn === 'stage' && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50 filter-dropdown">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-text">Filter by Stage</span>
                            {stageFilter && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStageFilter('');
                                }}
                                className="text-textMuted hover:text-text transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <select
                              value={stageFilter}
                              onChange={(e) => {
                                setStageFilter(e.target.value);
                                setActiveFilterColumn(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm text-text focus:border-brand-500 focus:outline-none appearance-none pr-8"
                            >
                              <option value="">All Stages</option>
                              {uniqueStages.map(stage => (
                                <option key={stage} value={stage}>
                                  {stage.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    )}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Pre-Screening</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Last Call Note</th>
                  <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_APPROVE]}>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted relative">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-text filter-dropdown"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFilterColumn(activeFilterColumn === 'assignedTo' ? null : 'assignedTo');
                        }}
                      >
                        Assigned To
                        {assignedToFilter && (
                          <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-xs text-white">
                            1
                          </span>
                        )}
                        <Filter className="h-3 w-3" />
                      </div>
                      {activeFilterColumn === 'assignedTo' && (
                        <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50 filter-dropdown">
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-text">Filter by Assigned To</span>
                              {assignedToFilter && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignedToFilter('');
                                  }}
                                  className="text-textMuted hover:text-text transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <select
                                value={assignedToFilter}
                                onChange={(e) => {
                                  setAssignedToFilter(e.target.value);
                                  setActiveFilterColumn(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm text-text focus:border-brand-500 focus:outline-none appearance-none pr-8"
                              >
                                <option value="">All Team Members</option>
                                {uniqueAssignedTo.map(email => {
                                  const member = salesTeam.find(m => m.email === email);
                                  const displayName = member ? (member.name || member.fullName) : email;
                                  return (
                                    <option key={email} value={email}>
                                      {displayName}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                  </AnyPermissionGate>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={isSalesAgent ? 7 : 8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <UserPlus className="h-12 w-12 text-textMuted mb-4" />
                        <p className="text-text font-medium mb-1">
                          {searchTerm || stageFilter || assignedToFilter 
                            ? "No active leads match your filters" 
                            : "No active leads found"}
                        </p>
                        <p className="text-sm text-textMuted">
                          {(searchTerm || stageFilter || assignedToFilter) 
                            ? "Try adjusting your search or filter criteria" 
                            : "Active leads will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const leadId = lead.id || lead._id;
                    return (
                      <tr key={leadId} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-text">{lead.name || 'N/A'}</p>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-text">{lead.phone || 'N/A'}</p>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {lead.pipelineStage?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Unknown'}
                        </span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lead.preScreening ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand via-brand-dark to-brand transition-all duration-300"
                                  style={{ width: `${calculateCompletionPercentage(lead.preScreening)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-text">{calculateCompletionPercentage(lead.preScreening)}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-textMuted">Not started</span>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                        <CallNotesViewer callNotes={lead.callNotes} showLastOnly={true} />
                      </td>
                      <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_APPROVE]}>
                          <td className="px-6 py-4 whitespace-nowrap">
                          {lead.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex-shrink-0">
                                  {getAssignedName(lead.assignedTo).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-text">{getAssignedName(lead.assignedTo)}</span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Unassigned
                              </span>
                          )}
                        </td>
                      </AnyPermissionGate>
                        <td className="px-6 py-4 whitespace-nowrap">
                        {isSalesAgent ? (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === leadId ? null : leadId);
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {openDropdownId === leadId && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50">
                                  <div className="py-1">
                                    {/* View/Edit Pre-Screening */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const existingData = lead.preScreening || {};
                                        setPreScreeningData({
                                          leadId: lead.id || lead._id,
                                          education: existingData.education || { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
                                          financial: existingData.financial || { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
                                          job: existingData.job || { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
                                          social: existingData.social || { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
                                          courseInterest: existingData.courseInterest || { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
                                          notes: existingData.notes || "",
                                        });
                                        setSelectedLead(lead);
                                        setShowPreScreeningModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                    >
                                      <FileText className="h-4 w-4" />
                                      {lead.preScreening ? "Edit Pre-Screening" : "Add Pre-Screening"}
                                    </button>
                                    
                                    {/* View All Notes */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(lead);
                                        setShowViewAllCallNotesModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                    >
                                      <ClipboardList className="h-4 w-4" />
                                      View All Notes
                                    </button>
                                    
                                    {/* Contact Details */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(lead);
                                        setShowContactDetailsModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                    >
                                      <User className="h-4 w-4" />
                                      Contact Details
                                    </button>
                                    
                                    {/* Book Demo Call */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(lead);
                                        setDemoData({ date: "", time: "", meetingLink: "", notes: "" });
                                        setShowBookDemoModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                    >
                                      <Video className="h-4 w-4" />
                                      Book Demo Call
                                    </button>
                                    
                                    {/* Add Call Notes */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(lead);
                                        setIsCallNotesModalOpen(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2 border-t border-brintelli-border"
                                    >
                                      <Phone className="h-4 w-4" />
                                      Add Call Notes
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
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
                                View Pre-Screening
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })
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
          onItemsPerPageChange={setItemsPerPage}
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
      {showPreScreeningViewModal && selectedLead && (
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
      )}

      {/* Pre-Screening Edit Modal (Sales Agent Only) */}
      {isSalesAgent && showPreScreeningModal && selectedLead && (
        <Modal
          isOpen={showPreScreeningModal}
          onClose={() => {
            setShowPreScreeningModal(false);
            setSelectedLead(null);
          }}
          title={`Pre-Screening: ${selectedLead.name || "Lead"}`}
          size="lg"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Progress Indicator */}
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">Pre-Screening Progress</span>
                <span className="text-sm font-semibold text-brand">
                  {calculateCompletionPercentage(preScreeningData)}% Complete
                </span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand via-brand-dark to-brand transition-all duration-500 ease-out"
                  style={{ width: `${calculateCompletionPercentage(preScreeningData)}%` }}
                />
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Education Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Degree</label>
                  <input
                    type="text"
                    value={preScreeningData.education.degree}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, degree: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={preScreeningData.education.field}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, field: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">University/College</label>
                  <input
                    type="text"
                    value={preScreeningData.education.university}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, university: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={preScreeningData.education.graduationYear}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, graduationYear: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">GPA/Percentage</label>
                  <input
                    type="text"
                    value={preScreeningData.education.gpa}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, gpa: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Financial */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Financial Status</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Current Salary</label>
                  <input
                    type="text"
                    value={preScreeningData.financial.currentSalary}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, currentSalary: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Expected Salary</label>
                  <input
                    type="text"
                    value={preScreeningData.financial.expectedSalary}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, expectedSalary: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Can Afford Program Fees?</label>
                  <input
                    type="text"
                    value={preScreeningData.financial.canAfford}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, canAfford: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={preScreeningData.financial.paymentMethod}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, paymentMethod: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-textMuted mb-1">Financial Status</label>
                  <input
                    type="text"
                    value={preScreeningData.financial.financialStatus}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, financialStatus: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Job */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Job Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Current Job Title</label>
                  <input
                    type="text"
                    value={preScreeningData.job.currentJob}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, currentJob: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Company</label>
                  <input
                    type="text"
                    value={preScreeningData.job.company}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, company: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={preScreeningData.job.experience}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, experience: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Current Position Level</label>
                  <input
                    type="text"
                    value={preScreeningData.job.position}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, position: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={preScreeningData.job.noticePeriod}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, noticePeriod: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Social Media & Portfolio</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={preScreeningData.social.linkedin}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, linkedin: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">GitHub</label>
                  <input
                    type="url"
                    value={preScreeningData.social.github}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, github: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Portfolio/Website</label>
                  <input
                    type="url"
                    value={preScreeningData.social.portfolio}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, portfolio: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Twitter</label>
                  <input
                    type="text"
                    value={preScreeningData.social.twitter}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, twitter: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-textMuted mb-1">Other Link</label>
                  <input
                    type="url"
                    value={preScreeningData.social.other}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, other: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Course Interest */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Course Interest</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Primary Program</label>
                  <select
                    value={preScreeningData.courseInterest.primary}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, primary: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  >
                    <option value="">Select a program...</option>
                    {programs.map(program => (
                      <option key={program.id || program._id} value={program.name || program.title}>
                        {program.name || program.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Secondary Program</label>
                  <select
                    value={preScreeningData.courseInterest.secondary}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, secondary: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  >
                    <option value="">Select a program...</option>
                    {programs.map(program => (
                      <option key={program.id || program._id} value={program.name || program.title}>
                        {program.name || program.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Preferred Batch</label>
                  <input
                    type="text"
                    value={preScreeningData.courseInterest.preferredBatch}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, preferredBatch: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Start Date Preference</label>
                  <input
                    type="date"
                    value={preScreeningData.courseInterest.startDatePreference}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, startDatePreference: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Additional Notes</h3>
              <textarea
                value={preScreeningData.notes}
                onChange={(e) => setPreScreeningData({
                  ...preScreeningData,
                  notes: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                placeholder="Add any additional notes about this lead..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowPreScreeningModal(false);
                  setSelectedLead(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handlePreScreeningSubmit}
              >
                Save Pre-Screening
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contact Details Modal */}
      {showContactDetailsModal && selectedLead && (
        <Modal
          isOpen={showContactDetailsModal}
          onClose={() => {
            setShowContactDetailsModal(false);
            setSelectedLead(null);
          }}
          title={`Contact Details: ${selectedLead.name || "Lead"}`}
          size="md"
        >
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text">Contact Information</h3>
              <div className="grid gap-4 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                <div>
                  <label className="text-xs font-medium text-textMuted">Full Name</label>
                  <p className="text-sm text-text font-medium mt-1">{selectedLead.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-textMuted">Phone Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-textMuted" />
                    <a 
                      href={`tel:${selectedLead.phone}`}
                      className="text-sm text-brand hover:underline font-medium"
                    >
                      {selectedLead.phone || 'N/A'}
                    </a>
                  </div>
                </div>
                {selectedLead.alternatePhone && (
                  <div>
                    <label className="text-xs font-medium text-textMuted">Alternate Phone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-textMuted" />
                      <a 
                        href={`tel:${selectedLead.alternatePhone}`}
                        className="text-sm text-brand hover:underline font-medium"
                      >
                        {selectedLead.alternatePhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {(selectedLead.company || selectedLead.location || selectedLead.source) && (
              <div className="space-y-4 border-t border-brintelli-border pt-4">
                <h3 className="text-lg font-semibold text-text">Additional Details</h3>
                <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                  {selectedLead.company && (
                    <div>
                      <label className="text-xs font-medium text-textMuted">Company</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4 text-textMuted" />
                        <p className="text-sm text-text">{selectedLead.company}</p>
                      </div>
                    </div>
                  )}
                  {selectedLead.location && (
                    <div>
                      <label className="text-xs font-medium text-textMuted">Location</label>
                      <p className="text-sm text-text mt-1">{selectedLead.location}</p>
                    </div>
                  )}
                  {selectedLead.source && (
                    <div>
                      <label className="text-xs font-medium text-textMuted">Source</label>
                      <p className="text-sm text-text mt-1">{selectedLead.source}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pipeline Information */}
            <div className="space-y-4 border-t border-brintelli-border pt-4">
              <h3 className="text-lg font-semibold text-text">Pipeline Information</h3>
              <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                <div>
                  <label className="text-xs font-medium text-textMuted">Stage</label>
                  <p className="text-sm text-text mt-1">
                    {selectedLead.pipelineStage?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-textMuted">Status</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-1">
                    Active
                  </span>
                </div>
                {selectedLead.assignedTo && (
                  <div>
                    <label className="text-xs font-medium text-textMuted">Assigned To</label>
                    <p className="text-sm text-text mt-1">{getAssignedName(selectedLead.assignedTo)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowContactDetailsModal(false);
                  setSelectedLead(null);
                }}
              >
                Close
              </Button>
              {selectedLead.phone && (
                <Button 
                  variant="primary"
                  onClick={() => {
                    window.location.href = `tel:${selectedLead.phone}`;
                  }}
                  className="gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Book Demo Call Modal */}
      {showBookDemoModal && selectedLead && (
        <Modal
          isOpen={showBookDemoModal}
          onClose={() => {
            setShowBookDemoModal(false);
            setDemoData({ date: "", time: "", meetingLink: "", notes: "" });
            setSelectedLead(null);
          }}
          title={`Book Demo Call: ${selectedLead.name || "Lead"}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Demo Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={demoData.date}
                  onChange={(e) => setDemoData({ ...demoData, date: e.target.value })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-4 py-2 text-sm text-text focus:border-brand-500 focus:outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Demo Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={demoData.time}
                  onChange={(e) => setDemoData({ ...demoData, time: e.target.value })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-4 py-2 text-sm text-text focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={demoData.meetingLink}
                onChange={(e) => setDemoData({ ...demoData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-4 py-2 text-sm text-text focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Notes (Optional)
              </label>
              <textarea
                value={demoData.notes}
                onChange={(e) => setDemoData({ ...demoData, notes: e.target.value })}
                placeholder="Any additional notes about the demo call..."
                rows="3"
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-4 py-2 text-sm text-text focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBookDemoModal(false);
                  setDemoData({ date: "", time: "", meetingLink: "", notes: "" });
                  setSelectedLead(null);
                }}
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBookDemo} 
                disabled={!demoData.date || !demoData.time || bookingLoading}
              >
                {bookingLoading ? "Booking..." : "Book Demo Call"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ActiveLeads;

