import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import Modal from "../../components/Modal";
import { leadAPI } from "../../api/lead";
import salesCallApi from "../../api/salesCall";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchSalesTeam, selectSalesTeam } from "../../store/slices/salesTeamSlice";

const MeetingsCounselling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  // My Scheduled Calls (from sales call API)
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [loadingCalls, setLoadingCalls] = useState(true);

  // Sales Call Handlers - State
  const [selectedCall, setSelectedCall] = useState(null);
  const [showRescheduleCallModal, setShowRescheduleCallModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  
  // Sales Call Report & Lead Management
  const [showCallReportModal, setShowCallReportModal] = useState(false);
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);
  const [preScreeningData, setPreScreeningData] = useState(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;
  const salesTeam = useSelector(selectSalesTeam);

  // Fetch sales team for assessment assignment
  useEffect(() => {
    dispatch(fetchSalesTeam());
  }, [dispatch]);

  // Fetch scheduled sales calls (visible to this user based on role)
  const fetchCalls = async () => {
    try {
      setLoadingCalls(true);
      const response = await salesCallApi.getMyCalls();
      if (response.success && response.data?.calls) {
        setScheduledCalls(response.data.calls);
      }
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
    } finally {
      setLoadingCalls(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  // Close dropdown when modals open
  useEffect(() => {
    if (showReportModal || showRescheduleModal || showAssessmentModal || showRescheduleCallModal || showInviteModal || showCallReportModal || showPreScreeningModal || showDeactivateModal) {
      setOpenDropdownId(null);
    }
  }, [showReportModal, showRescheduleModal, showAssessmentModal, showRescheduleCallModal, showInviteModal, showCallReportModal, showPreScreeningModal, showDeactivateModal]);

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

  // Filter sales calls by search term
  const filteredCalls = scheduledCalls.filter(call => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      call.leadName?.toLowerCase().includes(search) ||
      call.leadEmail?.toLowerCase().includes(search) ||
      call.leadPhone?.includes(search)
    );
  });

  // Generate rows from leads (each lead can have multiple rows: demo, counseling, or no meeting)
  const leadRows = filteredLeads.flatMap((lead, idx) => {
    const hasDemo = lead.demoBooked;
    const hasCounseling = lead.counselingBooked;
    const rows = [];

    // Show leads without meetings if they're in demo stage but no meetings booked
    if (!hasDemo && !hasCounseling && lead.pipelineStage === 'demo_and_mentor_screening') {
      rows.push({ type: 'no-meeting', lead, idx: `lead-${lead.id || idx}-no-meeting` });
    }

    // Demo meeting row
    if (hasDemo) {
      rows.push({ type: 'demo', lead, idx: `lead-${lead.id || idx}-demo` });
    }

    // Counseling meeting row
    if (hasCounseling) {
      rows.push({ type: 'counseling', lead, idx: `lead-${lead.id || idx}-counseling` });
    }

    return rows;
  });

  // Generate rows from scheduled sales calls
  // First, filter to only active calls
  const activeCalls = filteredCalls.filter(call => {
    return call.status === 'SCHEDULED' || call.status === 'ONGOING';
  });

  // Group calls by lead ID to identify multiple calls for same lead
  const callsByLead = activeCalls.reduce((acc, call) => {
    const leadId = call.leadId?.toString() || 'unknown';
    if (!acc[leadId]) {
      acc[leadId] = [];
    }
    acc[leadId].push(call);
    return acc;
  }, {});

  // Generate rows with call numbering for multiple calls per lead
  const salesCallRows = activeCalls.map((call, idx) => {
    const leadId = call.leadId?.toString() || 'unknown';
    const callsForThisLead = callsByLead[leadId] || [];
    
    // Sort calls by scheduled date to number them chronologically
    const sortedCalls = [...callsForThisLead].sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
      const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
      return dateA - dateB;
    });
    
    const callIndex = sortedCalls.findIndex(c => 
      (c._id?.toString() || c.id) === (call._id?.toString() || call.id)
    );
    const hasMultipleCalls = sortedCalls.length > 1;
    
    return {
      type: 'sales-call',
      call,
      idx: `call-${call._id?.toString() || call.id || idx}`,
      callNumber: hasMultipleCalls ? callIndex + 1 : null,
      totalCallsForLead: hasMultipleCalls ? sortedCalls.length : null,
    };
  });

  // Combine all rows: sales calls first, then lead meetings
  const allRows = [...salesCallRows, ...leadRows];

  // Pagination - apply to rows, not leads
  const totalPages = Math.ceil(allRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = allRows.slice(startIndex, startIndex + itemsPerPage);

  // Stats (include both lead meetings and sales calls)
  const scheduledSalesCalls = scheduledCalls.filter(c => 
    c.status === 'SCHEDULED' || c.status === 'ONGOING'
  ).length;
  
  const scheduledLeadMeetings = leads.filter(l => {
    const demoUpcoming = l.demoBooked && (!l.demoReport?.submitted) && new Date(l.demoDate) >= new Date();
    const counselingUpcoming = l.counselingBooked && (!l.counselingReport?.submitted) && new Date(l.counselingDate) >= new Date();
    return demoUpcoming || counselingUpcoming;
  }).length;
  
  const scheduledCount = scheduledSalesCalls + scheduledLeadMeetings;

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
      // Refresh both leads and sales calls
      const [leadsResponse] = await Promise.all([
        leadAPI.getAllLeads(),
        fetchCalls(),
      ]);
      
      if (leadsResponse.success && leadsResponse.data.leads) {
        // Show leads in demo stage (with or without meetings booked)
        let filteredLeads = leadsResponse.data.leads.filter(lead => 
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

  // Sales Call Handlers - Functions
  const handleRescheduleCall = (call) => {
    setSelectedCall(call);
    if (call.scheduledDate) {
      const date = new Date(call.scheduledDate);
      setRescheduleDate(date.toISOString().split('T')[0]);
      setRescheduleTime(date.toTimeString().slice(0, 5));
    } else {
      setRescheduleDate("");
      setRescheduleTime("");
    }
    setShowRescheduleCallModal(true);
  };

  const handleInviteMembers = (call) => {
    setSelectedCall(call);
    setSelectedUserIds([]);
    setShowInviteModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error("Please select date and time");
      return;
    }

    if (!selectedCall) return;

    try {
      setRescheduleLoading(true);
      const scheduledDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
      
      const response = await salesCallApi.updateCall(selectedCall._id || selectedCall.id, {
        scheduledDate: scheduledDateTime.toISOString(),
      });

      if (response.success) {
        toast.success('Call rescheduled successfully');
        handleCallRescheduleSuccess();
      } else {
        toast.error(response.message || 'Failed to reschedule call');
      }
    } catch (error) {
      console.error('Error rescheduling call:', error);
      toast.error(error?.response?.data?.message || 'Failed to reschedule call');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one team member");
      return;
    }

    if (!selectedCall) return;

    try {
      setInviteLoading(true);
      const response = await salesCallApi.inviteMembers(
        selectedCall._id || selectedCall.id,
        selectedUserIds
      );

      if (response.success) {
        toast.success(`${selectedUserIds.length} member(s) invited successfully`);
        handleInviteSuccess();
      } else {
        toast.error(response.message || 'Failed to invite members');
      }
    } catch (error) {
      console.error('Error inviting members:', error);
      toast.error(error?.response?.data?.message || 'Failed to invite members');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelCall = async (call) => {
    if (!window.confirm(`Are you sure you want to cancel this call with ${call.leadName || 'the lead'}?`)) {
      return;
    }

    try {
      const response = await salesCallApi.updateCall(call._id || call.id, {
        status: 'CANCELLED',
      });
      
      if (response.success) {
        toast.success('Call cancelled successfully');
        handleRefresh();
      } else {
        toast.error(response.message || 'Failed to cancel call');
      }
    } catch (error) {
      console.error('Error cancelling call:', error);
      toast.error(error?.response?.data?.message || 'Failed to cancel call');
    }
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

  const handleCallRescheduleSuccess = () => {
    handleRefresh();
    setShowRescheduleCallModal(false);
    setSelectedCall(null);
  };

  const handleInviteSuccess = () => {
    handleRefresh();
    setShowInviteModal(false);
    setSelectedCall(null);
  };

  // ─── Fetch lead data for sales call ────────────────────────────────
  const fetchLeadForCall = async (leadId) => {
    if (!leadId) return null;
    try {
      setLoadingLead(true);
      const response = await leadAPI.getLeadById(leadId);
      if (response.success && response.data?.lead) {
        return response.data.lead;
      }
      return null;
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to fetch lead details');
      return null;
    } finally {
      setLoadingLead(false);
    }
  };

  // ─── Handle view call details ────────────────────────────────────────
  const handleViewCallDetails = (call) => {
    navigate(`/sales/calls/${call._id?.toString() || call.id}`);
  };

  // ─── Handle submit/resubmit report for sales call ──────────────────
  const handleSubmitCallReport = async (call) => {
    try {
      const leadId = call.leadId?.toString();
      if (!leadId) {
        toast.error('Lead ID not found for this call');
        return;
      }
      
      const lead = await fetchLeadForCall(leadId);
      if (!lead) {
        toast.error('Lead not found');
        return;
      }
      
      setSelectedLeadForCall(lead);
      setSelectedCall(call);
      setAllowResubmit(false);
      setShowCallReportModal(true);
    } catch (error) {
      console.error('Error opening report modal:', error);
      toast.error('Failed to open report modal');
    }
  };

  // ─── Handle resubmit report for sales call ──────────────────────────
  const handleResubmitCallReport = async (call) => {
    try {
      const leadId = call.leadId?.toString();
      if (!leadId) {
        toast.error('Lead ID not found for this call');
        return;
      }
      
      const lead = await fetchLeadForCall(leadId);
      if (!lead) {
        toast.error('Lead not found');
        return;
      }
      
      setSelectedLeadForCall(lead);
      setSelectedCall(call);
      setAllowResubmit(true);
      setShowCallReportModal(true);
    } catch (error) {
      console.error('Error opening resubmit modal:', error);
      toast.error('Failed to open resubmit modal');
    }
  };

  // ─── Handle prescreening for sales call ─────────────────────────────
  const handleCallPreScreening = async (call) => {
    try {
      const leadId = call.leadId?.toString();
      if (!leadId) {
        toast.error('Lead ID not found for this call');
        return;
      }
      
      const lead = await fetchLeadForCall(leadId);
      if (!lead) {
        toast.error('Lead not found');
        return;
      }
      
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
      setSelectedLeadForCall(lead);
      setShowPreScreeningModal(true);
    } catch (error) {
      console.error('Error opening prescreening modal:', error);
      toast.error('Failed to open prescreening modal');
    }
  };

  // ─── Handle prescreening submit ─────────────────────────────────────
  const handlePreScreeningSubmit = async () => {
    if (!preScreeningData || !preScreeningData.leadId) {
      toast.error('Invalid prescreening data');
      return;
    }

    try {
      const { leadId, ...preScreeningPayload } = preScreeningData;
      const response = await leadAPI.updatePreScreening(leadId, preScreeningPayload);
      
      if (response.success) {
        toast.success('Pre-screening updated successfully');
        setShowPreScreeningModal(false);
        setPreScreeningData(null);
        setSelectedLeadForCall(null);
        // Refresh calls to get updated lead data
        fetchCalls();
      } else {
        toast.error(response.message || 'Failed to update pre-screening');
      }
    } catch (error) {
      console.error('Error submitting prescreening:', error);
      toast.error(error?.response?.data?.message || 'Failed to update pre-screening');
    }
  };

  // ─── Handle deactivate lead for sales call ──────────────────────────
  const handleDeactivateCallLead = async (call) => {
    try {
      const leadId = call.leadId?.toString();
      if (!leadId) {
        toast.error('Lead ID not found for this call');
        return;
      }
      
      const lead = await fetchLeadForCall(leadId);
      if (!lead) {
        toast.error('Lead not found');
        return;
      }
      
      setSelectedLeadForCall(lead);
      setShowDeactivateModal(true);
    } catch (error) {
      console.error('Error opening deactivate modal:', error);
      toast.error('Failed to open deactivate modal');
    }
  };

  // ─── Handle assign assignment for sales call ────────────────────────
  const handleAssignAssignment = async (call) => {
    try {
      const leadId = call.leadId?.toString();
      if (!leadId) {
        toast.error('Lead ID not found for this call');
        return;
      }
      
      const lead = await fetchLeadForCall(leadId);
      if (!lead) {
        toast.error('Lead not found');
        return;
      }
      
      // Check if report is submitted (required before assigning assessment)
      // Sales calls use demoReport, but check both demo and counseling reports
      const hasReport = lead.demoReport?.submitted || lead.counselingReport?.submitted;
      if (!hasReport) {
        toast.error('Please submit the meeting report before assigning an assessment');
        return;
      }
      
      setSelectedLeadForCall(lead);
      setShowAssessmentModal(true);
    } catch (error) {
      console.error('Error opening assessment modal:', error);
      toast.error('Failed to open assessment modal');
    }
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
                    const { lead, call, idx, type, callNumber, totalCallsForLead } = row;

                    // Sales Call Row
                    if (type === 'sales-call') {
                      const callId = call._id?.toString() || call.id;
                      const isOngoing = call.status === 'ONGOING';
                      const scheduledDateTime = call.scheduledDate 
                        ? new Date(call.scheduledDate) 
                        : null;
                      
                      // Check if current user has a pending invitation
                      const currentUserId = currentUser?.id || currentUser?.userId;
                      const hasPendingInvitation = call.pendingInvitations?.some(
                        inv => String(inv.userId) === String(currentUserId) && inv.status === 'PENDING'
                      );
                      
                      return (
                        <tr 
                          key={idx} 
                          className={`transition-colors duration-150 hover:bg-brintelli-baseAlt/40 ${
                            isOngoing ? 'bg-green-50/50 border-l-4 border-l-green-500' : ''
                          } ${callNumber ? 'border-t border-dashed border-gray-200' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-text">
                                  {call.leadName || `Lead: ${String(call.leadId || '').slice(-6)}`}
                                </p>
                                {call.leadEmail && (
                                  <p className="text-xs text-textMuted">{call.leadEmail}</p>
                                )}
                              </div>
                              {callNumber && (
                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                  Call {callNumber}/{totalCallsForLead}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-brand" />
                              <span className="text-sm text-text">Sales Call</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {scheduledDateTime ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-3.5 w-3.5 text-textMuted" />
                                  <span className="text-text">
                                    {scheduledDateTime.toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <Clock className="h-3.5 w-3.5 text-textMuted ml-2" />
                                  <span className="text-text">
                                    {scheduledDateTime.toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {call.meetingId && (
                                  <span className="text-[10px] text-textMuted font-mono">
                                    Meeting ID: {call.meetingId}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-textMuted">Not scheduled</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasPendingInvitation ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                                <Clock className="h-3 w-3" />
                                Pending Invitation
                              </span>
                            ) : isOngoing ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
                                LIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                                <Calendar className="h-3 w-3" />
                                Scheduled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-textMuted italic">-</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                className="gap-2"
                                onClick={() => navigate(`/sales/calls/${callId}`)}
                              >
                                <Video className="h-4 w-4" />
                                {isOngoing ? 'Join' : 'Start'}
                              </Button>
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
                                        {/* View Call Details */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewCallDetails(call);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                        >
                                          <FileText className="h-4 w-4" />
                                          View Call Details
                                        </button>
                                        
                                        {/* Submit Report (if completed) */}
                                        {call.status === 'COMPLETED' && call.leadId && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSubmitCallReport(call);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <ClipboardList className="h-4 w-4" />
                                            Submit Report
                                          </button>
                                        )}
                                        
                                        {/* Resubmit Report (if completed and has report) */}
                                        {call.status === 'COMPLETED' && call.leadId && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleResubmitCallReport(call);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <Edit2 className="h-4 w-4" />
                                            Resubmit Report
                                          </button>
                                        )}
                                        
                                        {/* Reschedule */}
                                        {!isOngoing && call.status === 'SCHEDULED' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRescheduleCall(call);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <Edit2 className="h-4 w-4" />
                                            Reschedule
                                          </button>
                                        )}
                                        
                                        {/* Prescreening */}
                                        {call.leadId && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCallPreScreening(call);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <ClipboardList className="h-4 w-4" />
                                            Prescreening
                                          </button>
                                        )}
                                        
                                        {/* Assign Assignment (only if report submitted) */}
                                        {call.status === 'COMPLETED' && call.leadId && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAssignAssignment(call);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <ClipboardList className="h-4 w-4" />
                                            Assign Assignment
                                          </button>
                                        )}
                                        
                                        {/* Invite Members */}
                                        {!isOngoing && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleInviteMembers(call);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <Phone className="h-4 w-4" />
                                            Invite Members
                                          </button>
                                        )}
                                        
                                        {/* View Insights (if completed) */}
                                        {call.status === 'COMPLETED' && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/sales/calls/${callId}/insights`);
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                          >
                                            <ClipboardList className="h-4 w-4" />
                                            View Insights
                                          </button>
                                        )}
                                        
                                        {/* Deactivate Lead */}
                                        {call.leadId && (
                                          <>
                                            <div className="border-t border-brintelli-border my-1"></div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeactivateCallLead(call);
                                                setOpenDropdownId(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                            >
                                              <ArchiveX className="h-4 w-4" />
                                              Deactivate Lead
                                            </button>
                                          </>
                                        )}
                                        
                                        {/* Cancel Call (if scheduled) */}
                                        {!isOngoing && call.status === 'SCHEDULED' && (
                                          <>
                                            <div className="border-t border-brintelli-border my-1"></div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelCall(call);
                                                setOpenDropdownId(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                            >
                                              <XCircle className="h-4 w-4" />
                                              Cancel Call
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

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
          setSelectedLeadForCall(null);
        }}
        lead={selectedLead || selectedLeadForCall}
        onSuccess={() => {
          handleRefresh();
          fetchCalls();
          setSelectedLeadForCall(null);
        }}
      />

      {/* Deactivate Lead Modal */}
      {(showDeactivateModal && selectedLead) || (showDeactivateModal && selectedLeadForCall) ? (
        <DeactivateLeadModal
          isOpen={showDeactivateModal}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedLead(null);
            setSelectedLeadForCall(null);
          }}
          lead={selectedLead || selectedLeadForCall}
          onSuccess={() => {
            handleRefresh();
            fetchCalls();
            setShowDeactivateModal(false);
            setSelectedLead(null);
            setSelectedLeadForCall(null);
          }}
        />
      ) : null}
      
      {/* Sales Call Report Modal */}
      {showCallReportModal && selectedLeadForCall && (
        <MeetingReportModal
          isOpen={showCallReportModal}
          onClose={() => {
            setShowCallReportModal(false);
            setSelectedLeadForCall(null);
            setSelectedCall(null);
            setAllowResubmit(false);
          }}
          lead={selectedLeadForCall}
          meetingType="demo"
          onSuccess={() => {
            handleRefresh();
            fetchCalls();
            setShowCallReportModal(false);
            setSelectedLeadForCall(null);
            setSelectedCall(null);
            setAllowResubmit(false);
          }}
          allowResubmit={allowResubmit}
        />
      )}
      
      {/* Pre-Screening Modal for Sales Calls */}
      {showPreScreeningModal && selectedLeadForCall && preScreeningData && (
        <Modal
          isOpen={showPreScreeningModal}
          onClose={() => {
            setShowPreScreeningModal(false);
            setSelectedLeadForCall(null);
            setPreScreeningData(null);
          }}
          title={`Pre-Screening: ${selectedLeadForCall.name || "Lead"}`}
          size="lg"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Education</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Degree</label>
                  <input
                    type="text"
                    value={preScreeningData.education?.degree || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, degree: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Field</label>
                  <input
                    type="text"
                    value={preScreeningData.education?.field || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, field: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">University</label>
                  <input
                    type="text"
                    value={preScreeningData.education?.university || ""}
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
                    value={preScreeningData.education?.graduationYear || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      education: { ...preScreeningData.education, graduationYear: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">GPA</label>
                  <input
                    type="text"
                    value={preScreeningData.education?.gpa || ""}
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
              <h3 className="text-lg font-semibold text-text mb-4">Financial</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Current Salary</label>
                  <input
                    type="text"
                    value={preScreeningData.financial?.currentSalary || ""}
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
                    value={preScreeningData.financial?.expectedSalary || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, expectedSalary: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Can Afford</label>
                  <input
                    type="text"
                    value={preScreeningData.financial?.canAfford || ""}
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
                    value={preScreeningData.financial?.paymentMethod || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      financial: { ...preScreeningData.financial, paymentMethod: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Financial Status</label>
                  <input
                    type="text"
                    value={preScreeningData.financial?.financialStatus || ""}
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
              <h3 className="text-lg font-semibold text-text mb-4">Job</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Current Job</label>
                  <input
                    type="text"
                    value={preScreeningData.job?.currentJob || ""}
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
                    value={preScreeningData.job?.company || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, company: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Experience</label>
                  <input
                    type="text"
                    value={preScreeningData.job?.experience || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      job: { ...preScreeningData.job, experience: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Position</label>
                  <input
                    type="text"
                    value={preScreeningData.job?.position || ""}
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
                    value={preScreeningData.job?.noticePeriod || ""}
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
              <h3 className="text-lg font-semibold text-text mb-4">Social Profiles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={preScreeningData.social?.linkedin || ""}
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
                    type="text"
                    value={preScreeningData.social?.github || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, github: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textMuted mb-1">Portfolio</label>
                  <input
                    type="text"
                    value={preScreeningData.social?.portfolio || ""}
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
                    value={preScreeningData.social?.twitter || ""}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      social: { ...preScreeningData.social, twitter: e.target.value }
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
                value={preScreeningData.notes || ""}
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
                  setSelectedLeadForCall(null);
                  setPreScreeningData(null);
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

      {/* Reschedule Sales Call Modal */}
      <Modal
        isOpen={showRescheduleCallModal}
        onClose={() => {
          setShowRescheduleCallModal(false);
          setSelectedCall(null);
          setRescheduleDate("");
          setRescheduleTime("");
        }}
        title="Reschedule Sales Call"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <input
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRescheduleCallModal(false);
                setSelectedCall(null);
                setRescheduleDate("");
                setRescheduleTime("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleSubmit}
              disabled={rescheduleLoading}
            >
              {rescheduleLoading ? "Rescheduling..." : "Reschedule"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Members Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setSelectedCall(null);
          setSelectedUserIds([]);
        }}
        title="Invite Members to Call"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Team Members</label>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
              {salesTeam.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  Loading team...
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {salesTeam
                    .filter((m) => {
                      const memberId = m.id || m._id || m.userId;
                      const currentUserId = currentUser?.id || currentUser?.userId;
                      return memberId && String(memberId) !== String(currentUserId);
                    })
                    .map((member) => {
                      const memberId = member.id || member._id || member.userId;
                      return (
                        <label
                          key={memberId}
                          className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(memberId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUserIds([...selectedUserIds, memberId]);
                              } else {
                                setSelectedUserIds(selectedUserIds.filter((id) => id !== memberId));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {(member.name || member.fullName || member.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {member.name || member.fullName || member.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              {member.email}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowInviteModal(false);
                setSelectedCall(null);
                setSelectedUserIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteSubmit}
              disabled={selectedUserIds.length === 0 || inviteLoading}
            >
              {inviteLoading ? "Inviting..." : `Invite ${selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MeetingsCounselling;
