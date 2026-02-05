import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Phone, Calendar, MessageSquare, FileText, Video, Clock, CheckCircle, XCircle, Search, RefreshCw, ClipboardList, Edit2, Plus, MoreVertical, ArchiveX } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import MeetingReportModal from "../../components/MeetingReportModal";
import RescheduleMeetingModal from "../../components/RescheduleMeetingModal";
import ScheduleAssessmentModal from "../../components/ScheduleAssessmentModal";
import BookingOptionsMenu from "../../components/BookingOptionsMenu";
import DeactivateLeadModal from "../../components/DeactivateLeadModal";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchSalesTeam } from "../../store/slices/salesTeamSlice";

const MeetingsCounselling = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [meetingType, setMeetingType] = useState(null); // 'demo' or 'counseling'
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [allowResubmit, setAllowResubmit] = useState(false);

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;

  // Fetch sales team for assessment assignment
  useEffect(() => {
    dispatch(fetchSalesTeam());
  }, [dispatch]);

  // Close dropdown when modals open
  useEffect(() => {
    if (showReportModal || showRescheduleModal || showAssessmentModal) {
      setOpenDropdownId(null);
    }
  }, [showReportModal, showRescheduleModal, showAssessmentModal]);

  // Fetch leads with booked meetings
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        
        if (response.success && response.data.leads) {
          // Show leads in demo stage (with or without meetings booked)
          let filteredLeads = response.data.leads.filter(lead => 
            lead.pipelineStage === 'demo_and_mentor_screening'
          );

          // ABAC: Sales Agent - Only their assigned leads
          if (isSalesAgent && userEmail) {
            filteredLeads = filteredLeads.filter(lead => lead.assignedTo === userEmail);
          }

          setLeads(filteredLeads);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast.error('Failed to load meetings');
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      return; // Wait for user to load
    }

    fetchLeads();
  }, [isSalesAgent, userEmail]);

  // Filter leads by search term
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.includes(search)
    );
  });

  // Generate all rows from leads (each lead can have multiple rows: demo, counseling, or no meeting)
  const allRows = filteredLeads.flatMap((lead, idx) => {
    const hasDemo = lead.demoBooked;
    const hasCounseling = lead.counselingBooked;
    const rows = [];

    // Show leads without meetings if they're in demo stage but no meetings booked
    if (!hasDemo && !hasCounseling && lead.pipelineStage === 'demo_and_mentor_screening') {
      rows.push({ type: 'no-meeting', lead, idx: `${lead.id || idx}-no-meeting` });
    }

    // Demo meeting row
    if (hasDemo) {
      rows.push({ type: 'demo', lead, idx: `${lead.id || idx}-demo` });
    }

    // Counseling meeting row
    if (hasCounseling) {
      rows.push({ type: 'counseling', lead, idx: `${lead.id || idx}-counseling` });
    }

    return rows;
  });

  // Pagination - apply to rows, not leads
  const totalPages = Math.ceil(allRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = allRows.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const scheduledCount = leads.filter(l => {
    const demoUpcoming = l.demoBooked && (!l.demoReport?.submitted) && new Date(l.demoDate) >= new Date();
    const counselingUpcoming = l.counselingBooked && (!l.counselingReport?.submitted) && new Date(l.counselingDate) >= new Date();
    return demoUpcoming || counselingUpcoming;
  }).length;

  const completedCount = leads.filter(l => {
    const demoDone = l.demoReport?.submitted;
    const counselingDone = l.counselingReport?.submitted;
    return demoDone || counselingDone;
  }).length;

  const pendingReports = leads.filter(l => {
    const demoNeedsReport = l.demoBooked && !l.demoReport?.submitted && new Date(l.demoDate) < new Date();
    const counselingNeedsReport = l.counselingBooked && !l.counselingReport?.submitted && new Date(l.counselingDate) < new Date();
    return demoNeedsReport || counselingNeedsReport;
  }).length;

  const handleOpenReport = (lead, type, resubmit = false) => {
    setSelectedLead(lead);
    setMeetingType(type);
    setAllowResubmit(resubmit);
    setShowReportModal(true);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAllLeads();
      if (response.success && response.data.leads) {
        // Show leads in demo stage (with or without meetings booked)
        let filteredLeads = response.data.leads.filter(lead => 
          lead.pipelineStage === 'demo_and_mentor_screening'
        );
        if (isSalesAgent && userEmail) {
          filteredLeads = filteredLeads.filter(lead => lead.assignedTo === userEmail);
        }
        setLeads(filteredLeads);
      }
    } catch (error) {
      console.error('Error refreshing meetings:', error);
      toast.error('Failed to refresh meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (lead, type) => {
    setSelectedLead(lead);
    setMeetingType(type);
    setShowRescheduleModal(true);
  };

  const handleScheduleAssessment = (lead) => {
    setSelectedLead(lead);
    setShowAssessmentModal(true);
  };

  const handleDeactivateLead = (lead) => {
    setSelectedLead(lead);
    setShowDeactivateModal(true);
    setOpenDropdownId(null);
  };

  const handleAssessmentSuccess = () => {
    // Refresh leads after assessment scheduling
    // Lead should move to assessments stage, so it will be filtered out
    handleRefresh();
  };

  const handleReportSuccess = () => {
    // Refresh leads after report submission
    handleRefresh();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const isMeetingPast = (dateString) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <>
      <PageHeader
        title="Meetings & Counselling"
        description="Manage demo and counseling meetings with leads. Submit reports after meetings to proceed with assessments."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <StatsCard 
          icon={Calendar} 
          value={scheduledCount} 
          label="Scheduled Meetings" 
          trend="Upcoming" 
        />
        <StatsCard 
          icon={CheckCircle} 
          value={completedCount} 
          label="Completed" 
          trend="Reports submitted" 
        />
        <StatsCard 
          icon={FileText} 
          value={pendingReports} 
          label="Pending Reports" 
          trend="Action required" 
        />
      </div>

      {/* Meetings Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading meetings...</span>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Lead</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Meeting Type</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Date & Time</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Report</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-textMuted">
                        {searchTerm ? "No meetings match your search." : "No meetings scheduled."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedRows.map((row) => {
                    const { lead, idx, type } = row;

                    // No Meeting Row
                    if (type === 'no-meeting') {
                      return (
                        <tr key={idx} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40 border-b-2 border-dashed border-yellow-300">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-semibold text-text">{lead.name}</p>
                            <p className="text-xs text-textMuted">{lead.email}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-textMuted italic">No meeting booked</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-textMuted">-</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <Calendar className="h-3 w-3" />
                              Needs Booking
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-textMuted italic">-</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <BookingOptionsMenu 
                              lead={lead}
                              onSuccess={handleRefresh}
                            />
                          </td>
                        </tr>
                      );
                    }
                    
                    // Demo Meeting Row
                    if (type === 'demo') {
                      return (
                        <tr key={idx} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-semibold text-text">{lead.name}</p>
                            <p className="text-xs text-textMuted">{lead.email}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-brand" />
                              <span className="text-sm text-text">Demo</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-textMuted" />
                              <span className="text-text">{formatDate(lead.demoDate)}</span>
                              <Clock className="h-3.5 w-3.5 text-textMuted ml-2" />
                              <span className="text-text">{formatTime(lead.demoTime)}</span>
                            </div>
                            {lead.demoMeetingLink && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="gap-2 mt-2"
                                onClick={() => window.open(lead.demoMeetingLink, '_blank', 'noopener,noreferrer')}
                              >
                                <Video className="h-4 w-4" />
                                Join Meeting
                              </Button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.demoReport?.submitted ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                Report Submitted
                              </span>
                            ) : isMeetingPast(lead.demoDate) ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                <XCircle className="h-3 w-3" />
                                Report Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                                <Calendar className="h-3 w-3" />
                                Upcoming
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.demoReport?.submitted ? (
                              <span className="text-xs text-textMuted">
                                {new Date(lead.demoReport.submittedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-textMuted italic">Not submitted</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === idx ? null : idx);
                                }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              {openDropdownId === idx && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setOpenDropdownId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50">
                                    <div className="py-1">
                                      {/* Submit/View Report */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenReport(lead, 'demo');
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                      >
                                        <FileText className="h-4 w-4" />
                                        {lead.demoReport?.submitted ? "View Report" : "Submit Report"}
                                      </button>
                                      
                                      {/* Resubmit Report (only if report already submitted) */}
                                      {lead.demoReport?.submitted && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReport(lead, 'demo', true);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                                        >
                                          <FileText className="h-4 w-4" />
                                          Resubmit Report
                                        </button>
                                      )}
                                      
                                      {/* Reschedule */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReschedule(lead, 'demo');
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                        Reschedule
                                      </button>
                                      
                                      {/* Schedule Assessment (only if report submitted) */}
                                      {lead.demoReport?.submitted && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleScheduleAssessment(lead);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2 border-t border-brintelli-border"
                                        >
                                          <ClipboardList className="h-4 w-4" />
                                          Schedule Assessment
                                        </button>
                                      )}
                                      
                                      {/* Deactivate Lead */}
                                      <div className="border-t border-brintelli-border my-1"></div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeactivateLead(lead);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                      >
                                        <ArchiveX className="h-4 w-4" />
                                        Deactivate Lead
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Counseling Meeting Row
                    if (type === 'counseling') {
                      return (
                        <tr key={idx} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-semibold text-text">{lead.name}</p>
                            <p className="text-xs text-textMuted">{lead.email}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-brand" />
                              <span className="text-sm text-text">Counseling</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-textMuted" />
                              <span className="text-text">{formatDate(lead.counselingDate)}</span>
                              <Clock className="h-3.5 w-3.5 text-textMuted ml-2" />
                              <span className="text-text">{formatTime(lead.counselingTime)}</span>
                            </div>
                            {lead.counselingMeetingLink && (
                              <Button
                                variant="primary"
                                size="sm"
                                className="gap-2 mt-2"
                                onClick={() => window.open(lead.counselingMeetingLink, '_blank', 'noopener,noreferrer')}
                              >
                                <Video className="h-4 w-4" />
                                Join Meeting
                              </Button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.counselingReport?.submitted ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                Report Submitted
                              </span>
                            ) : isMeetingPast(lead.counselingDate) ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                <XCircle className="h-3 w-3" />
                                Report Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                                <Calendar className="h-3 w-3" />
                                Upcoming
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.counselingReport?.submitted ? (
                              <span className="text-xs text-textMuted">
                                {new Date(lead.counselingReport.submittedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-textMuted italic">Not submitted</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === idx ? null : idx);
                                }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              {openDropdownId === idx && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setOpenDropdownId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50">
                                    <div className="py-1">
                                      {/* Submit/View Report */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenReport(lead, 'counseling');
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                      >
                                        <FileText className="h-4 w-4" />
                                        {lead.counselingReport?.submitted ? "View Report" : "Submit Report"}
                                      </button>
                                      
                                      {/* Resubmit Report (only if report already submitted) */}
                                      {lead.counselingReport?.submitted && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReport(lead, 'counseling', true);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                                        >
                                          <FileText className="h-4 w-4" />
                                          Resubmit Report
                                        </button>
                                      )}
                                      
                                      {/* Reschedule */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReschedule(lead, 'counseling');
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                        Reschedule
                                      </button>
                                      
                                      {/* Schedule Assessment (only if report submitted) */}
                                      {lead.counselingReport?.submitted && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleScheduleAssessment(lead);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2 border-t border-brintelli-border"
                                        >
                                          <ClipboardList className="h-4 w-4" />
                                          Schedule Assessment
                                        </button>
                                      )}
                                      
                                      {/* Deactivate Lead */}
                                      <div className="border-t border-brintelli-border my-1"></div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeactivateLead(lead);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                      >
                                        <ArchiveX className="h-4 w-4" />
                                        Deactivate Lead
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return null;
                  })}
                </>
              )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {allRows.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allRows.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Meeting Report Modal */}
      <MeetingReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedLead(null);
          setMeetingType(null);
          setAllowResubmit(false);
        }}
        allowResubmit={allowResubmit}
        lead={selectedLead}
        meetingType={meetingType}
        onSuccess={handleReportSuccess}
      />

      {/* Reschedule Meeting Modal */}
      <RescheduleMeetingModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedLead(null);
          setMeetingType(null);
        }}
        lead={selectedLead}
        meetingType={meetingType}
        onSuccess={handleRefresh}
      />

      {/* Schedule Assessment Modal */}
      <ScheduleAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => {
          setShowAssessmentModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSuccess={handleRefresh}
      />

      {/* Deactivate Lead Modal */}
      {showDeactivateModal && selectedLead && (
        <DeactivateLeadModal
          isOpen={showDeactivateModal}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}
    </>
  );
};

export default MeetingsCounselling;
