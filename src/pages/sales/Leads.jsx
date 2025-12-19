import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Search, Filter, Plus, Mail, Phone, Building2, UserPlus, ClipboardList, Users, X, RefreshCw, Eye, Calendar, Clock, FileText, User } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Modal from "../../components/Modal";
import { PermissionGate, AnyPermissionGate } from "../../components/PermissionGate";
import { PERMISSIONS } from "../../utils/permissions";
import { usePermission } from "../../utils/permissions";
import { fetchSalesTeam, selectSalesTeam, selectSalesTeamLoading, selectSalesTeamError } from "../../store/slices/salesTeamSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";

const SalesLeads = () => {
  const dispatch = useDispatch();
  const salesTeam = useSelector(selectSalesTeam);
  const loadingTeam = useSelector(selectSalesTeamLoading);
  const teamError = useSelector(selectSalesTeamError);
  const currentUser = useSelector(selectCurrentUser);

  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // Store all leads before filtering
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [filterUnassigned, setFilterUnassigned] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is a sales agent
  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;

  const [selectedLead, setSelectedLead] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);
  const [showPreScreeningViewModal, setShowPreScreeningViewModal] = useState(false);
  const [showCallNotesModal, setShowCallNotesModal] = useState(false);
  const [showAllCallNotesModal, setShowAllCallNotesModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ leadId: null, assignedTo: "" });
  const [callNotes, setCallNotes] = useState("");
  const [callDate, setCallDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [assessmentBooking, setAssessmentBooking] = useState({
    assessmentDate: "",
    assessmentTime: "",
    assessmentType: "",
    assessmentAssignedTo: "",
  });
  const [preScreeningData, setPreScreeningData] = useState({
    leadId: null,
    education: {
      degree: "",
      field: "",
      university: "",
      graduationYear: "",
      gpa: "",
    },
    financial: {
      currentSalary: "",
      expectedSalary: "",
      canAfford: "",
      paymentMethod: "",
      financialStatus: "",
    },
    job: {
      currentJob: "",
      company: "",
      experience: "",
      position: "",
      noticePeriod: "",
    },
    social: {
      linkedin: "",
      github: "",
      portfolio: "",
      twitter: "",
      other: "",
    },
    notes: "",
  });

  const canAssign = usePermission(PERMISSIONS.SALES_MANAGE_TEAM) || usePermission(PERMISSIONS.SALES_APPROVE);

  // Fetch sales team from Redux on mount and set up auto-refresh
  useEffect(() => {
    // Initial fetch
    dispatch(fetchSalesTeam()).then((result) => {
      if (result.type === 'salesTeam/fetchSalesTeam/fulfilled') {
        console.log('Sales team loaded:', result.payload);
      } else if (result.type === 'salesTeam/fetchSalesTeam/rejected') {
        console.error('Failed to load sales team:', result.error);
      }
    });

    // Set up auto-refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      dispatch(fetchSalesTeam());
    }, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Fetch leads from database - New Leads page logic:
  // - For sales_admin/sales_lead: Show ONLY unassigned leads
  // - For sales_agent: Show ONLY leads assigned to them in primary_screening stage (screening part)
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoadingLeads(true);
        const response = await leadAPI.getAllLeads();
        if (response.success && response.data.leads) {
          let fetchedLeads;
          
          if (isSalesAgent && userEmail) {
            // For sales_agent: Show ONLY leads assigned to them in primary_screening stage
            fetchedLeads = response.data.leads.filter(lead => 
              lead.assignedTo === userEmail && 
              (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage)
            );
          } else {
            // For sales_admin/sales_lead: Show ONLY unassigned leads
            fetchedLeads = response.data.leads.filter(lead => 
              !lead.assignedTo || lead.assignedTo === ''
            );
          }
          
          setAllLeads(response.data.leads); // Store all leads for stats
          setLeads(fetchedLeads); // Set filtered leads
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error('Failed to load leads');
        // Keep empty array if fetch fails
        setLeads([]);
        setAllLeads([]);
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

  // Debug: Log sales team when it changes
  useEffect(() => {
    console.log('Sales Team State:', { salesTeam, loadingTeam, teamError });
  }, [salesTeam, loadingTeam, teamError]);

  // Handle refresh button
  const handleRefreshTeam = () => {
    dispatch(fetchSalesTeam()).then((result) => {
      if (result.type === 'salesTeam/fetchSalesTeam/fulfilled') {
        toast.success('Sales team refreshed');
      } else if (result.type === 'salesTeam/fetchSalesTeam/rejected') {
        toast.error(teamError || 'Failed to refresh sales team');
      }
    });
  };

  // Show error toast if team fetch fails
  useEffect(() => {
    if (teamError && !loadingTeam) {
      toast.error(teamError);
    }
  }, [teamError, loadingTeam]);

  const handleAssign = (lead) => {
    // If lead is already assigned, pre-select the current assignee
    const currentAssignee = lead.assignedTo || "";
    setAssignmentData({ leadId: lead.id, assignedTo: currentAssignee });
    setSelectedLead(lead); // Store lead for modal display
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignmentData.assignedTo) {
      toast.error("Please select a team member");
      return;
    }

    try {
      const currentLead = leads.find(l => l.id === assignmentData.leadId);
      const isReassignment = currentLead?.assignedTo && currentLead.assignedTo !== assignmentData.assignedTo;
      
      await leadAPI.assignLead(assignmentData.leadId, assignmentData.assignedTo);

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === assignmentData.leadId 
          ? { ...lead, assignedTo: assignmentData.assignedTo }
          : lead
      ));

      const assignedMember = salesTeam.find(m => m.email === assignmentData.assignedTo);
      const previousMember = currentLead?.assignedTo 
        ? salesTeam.find(m => m.email === currentLead.assignedTo)
        : null;

      if (isReassignment && previousMember) {
        toast.success(
          `Lead reassigned from ${previousMember.name || previousMember.fullName} to ${assignedMember?.name || assignedMember?.fullName || assignmentData.assignedTo}`
        );
      } else {
        toast.success(`Lead assigned to ${assignedMember?.name || assignedMember?.fullName || assignmentData.assignedTo}`);
      }
      
      setShowAssignModal(false);
      setAssignmentData({ leadId: null, assignedTo: "" });
      setSelectedLead(null);
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error(error.message || "Failed to assign lead");
    }
  };

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
      // Notes (1 field - optional, so weighted less)
      data.notes,
    ];

    const totalFields = fields.length;
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    
    // Notes is optional, so we calculate based on 20 main fields + notes (weighted 0.5)
    const mainFields = 20;
    const filledMainFields = fields.slice(0, mainFields).filter(f => f && f.toString().trim() !== '').length;
    const hasNotes = fields[fields.length - 1] && fields[fields.length - 1].toString().trim() !== '';
    
    // Calculate: (filled main fields / 20) * 95% + (has notes ? 5% : 0%)
    const percentage = Math.round((filledMainFields / mainFields) * 95 + (hasNotes ? 5 : 0));
    
    return Math.min(percentage, 100);
  };

  const handlePreScreening = (lead) => {
    setSelectedLead(lead);
    const existingData = lead.preScreening || {
      education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
      financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
      job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
      social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
      notes: "",
    };
    setPreScreeningData({ ...existingData, leadId: lead.id });
    setShowPreScreeningModal(true);
  };

  const handlePreScreeningSubmit = async () => {
    try {
      const { leadId, ...preScreeningPayload } = preScreeningData;
      
      // Check if lead exists in DB, if not create it first
      let currentLead = leads.find(l => l.id === leadId || l.id?.toString() === leadId?.toString());
      let savedLeadId = leadId;

      if (!currentLead || !currentLead.id || (typeof currentLead.id === 'string' && currentLead.id.length < 20)) {
        // Lead doesn't exist in DB, create it first
        const leadData = {
          name: currentLead?.name || selectedLead?.name || 'Unknown',
          email: currentLead?.email || selectedLead?.email || '',
          phone: currentLead?.phone || selectedLead?.phone || '',
          company: currentLead?.company || selectedLead?.company || '',
          source: currentLead?.source || selectedLead?.source || 'Manual',
          status: currentLead?.status || selectedLead?.status || 'New',
          value: currentLead?.value || selectedLead?.value || null,
        };

        const createResponse = await leadAPI.createLead(leadData);
        if (createResponse.success) {
          savedLeadId = createResponse.data.lead.id;
          // Add new lead to local state
          setLeads([...leads, createResponse.data.lead]);
        }
      }

      // Now update pre-screening
      const response = await leadAPI.updatePreScreening(savedLeadId, {
        education: preScreeningPayload.education,
        financial: preScreeningPayload.financial,
        job: preScreeningPayload.job,
        social: preScreeningPayload.social,
        notes: preScreeningPayload.notes,
      });

      // Check if lead was automatically moved to meet_and_call
      const wasAutoMoved = response.data?.lead?.pipelineStage === 'meet_and_call';

      // Update local state
      setLeads(leads.map(lead => 
        (lead.id === savedLeadId || lead.id === leadId || lead.id?.toString() === savedLeadId?.toString())
          ? { 
              ...lead, 
              preScreening: preScreeningPayload, 
              id: savedLeadId,
              pipelineStage: response.data?.lead?.pipelineStage || lead.pipelineStage
            }
          : lead
      ));

      if (wasAutoMoved) {
        toast.success("Pre-screening completed! Lead automatically moved to 'Meet and Call' stage.");
      } else {
        toast.success("Pre-screening data saved successfully");
      }
      setShowPreScreeningModal(false);
      setPreScreeningData({
        leadId: null,
        education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
        financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
        job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
        social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
        notes: "",
      });
    } catch (error) {
      console.error('Error saving pre-screening:', error);
      toast.error(error.message || "Failed to save pre-screening data");
    }
  };

  const getAssignedName = (email) => {
    const member = salesTeam.find(m => m.email === email);
    return member ? (member.name || member.fullName) : email;
  };

  // Get pipeline stage display name
  const getStageName = (pipelineStage) => {
    const stageMap = {
      'unassigned': 'Unassigned',
      'primary_screening': 'Primary Screening',
      'meet_and_call': 'Meet and Call',
      'assessments': 'Assessments',
      'offer': 'Offer',
      'payment_and_financial_clearance': 'Payment & Financial Clearance',
      'onboarded_to_lsm': 'Onboarded to LSM',
    };
    return stageMap[pipelineStage] || pipelineStage || 'Primary Screening';
  };

  // Get stage color
  const getStageColor = (pipelineStage) => {
    const colorMap = {
      'unassigned': 'bg-gray-100 text-gray-700',
      'primary_screening': 'bg-blue-100 text-blue-700',
      'meet_and_call': 'bg-purple-100 text-purple-700',
      'assessments': 'bg-orange-100 text-orange-700',
      'offer': 'bg-yellow-100 text-yellow-700',
      'payment_and_financial_clearance': 'bg-pink-100 text-pink-700',
      'onboarded_to_lsm': 'bg-green-100 text-green-700',
    };
    return colorMap[pipelineStage] || 'bg-gray-100 text-gray-700';
  };

  // Get status details based on pipeline stage
  const getStatusDetails = (lead) => {
    const stage = lead.pipelineStage || 'primary_screening';
    
    switch (stage) {
      case 'primary_screening':
        const completion = calculateCompletionPercentage(lead.preScreening);
        return {
          text: `${completion}% Done`,
          color: completion === 100 
            ? 'bg-green-100 text-green-700' 
            : completion >= 50 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-red-100 text-red-700'
        };
      case 'meet_and_call':
        return {
          text: lead.callNotes ? 'Call Completed' : 'Call Pending',
          color: lead.callNotes ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        };
      case 'assessments':
        return {
          text: lead.assessmentSent ? 'Assessment Sent' : 'Assessment Pending',
          color: lead.assessmentSent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        };
      case 'offer':
        return {
          text: lead.offerReleased ? 'Offer Released' : 'Offer Pending',
          color: lead.offerReleased ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        };
      case 'payment_and_financial_clearance':
        return {
          text: 'Payment Processing',
          color: 'bg-blue-100 text-blue-700'
        };
      case 'onboarded_to_lsm':
        return {
          text: 'Onboarded',
          color: 'bg-green-100 text-green-700'
        };
      default:
        return {
          text: 'In Progress',
          color: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const handleCallNotesSubmit = async () => {
    if (!callNotes.trim()) {
      toast.error("Please enter call notes");
      return;
    }

    try {
      const response = await leadAPI.addCallNotes(selectedLead.id, {
        notes: callNotes,
        callDate: callDate || new Date().toISOString().split('T')[0],
        callTime: callTime || new Date().toTimeString().slice(0, 5),
      });
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, callNotes: response.data?.lead?.callNotes || [] }
          : lead
      ));

      toast.success("Call notes saved successfully");
      setShowCallNotesModal(false);
      setCallNotes("");
      setCallDate("");
      setCallTime("");
      setSelectedLead(null);
    } catch (error) {
      console.error('Error saving call notes:', error);
      toast.error(error.message || 'Failed to save call notes');
    }
  };

  const handleSubmitCallNotesAndMoveToAssessments = async () => {
    if (!callNotes.trim()) {
      toast.error("Please enter call notes before submitting");
      return;
    }

    try {
      const response = await leadAPI.submitCallNotesAndMoveToAssessments(
        selectedLead.id, 
        {
          notes: callNotes,
          callDate: callDate || new Date().toISOString().split('T')[0],
          callTime: callTime || new Date().toTimeString().slice(0, 5),
        },
        assessmentBooking.assessmentDate && assessmentBooking.assessmentTime ? assessmentBooking : {}
      );
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { 
              ...lead, 
              callNotes: response.data?.lead?.callNotes || [],
              pipelineStage: 'assessments',
              assessmentSent: true,
              assessmentBooked: response.data?.lead?.assessmentBooked || false,
              assessmentDate: response.data?.lead?.assessmentDate || null,
              assessmentTime: response.data?.lead?.assessmentTime || null,
              assessmentType: response.data?.lead?.assessmentType || null,
              assessmentAssignedTo: response.data?.lead?.assessmentAssignedTo || null,
            }
          : lead
      ));

      const bookingMsg = assessmentBooking.assessmentDate && assessmentBooking.assessmentTime 
        ? " Assessment booked and " 
        : " ";
      toast.success(`Call notes submitted!${bookingMsg}Assessment email sent. Lead moved to 'Assessments' stage.`);
      setShowCallNotesModal(false);
      setCallNotes("");
      setCallDate("");
      setCallTime("");
      setAssessmentBooking({
        assessmentDate: "",
        assessmentTime: "",
        assessmentType: "",
        assessmentAssignedTo: "",
      });
      setSelectedLead(null);
    } catch (error) {
      console.error('Error submitting call notes:', error);
      toast.error(error.message || 'Failed to submit call notes');
    }
  };

  const handleBookAssessment = async () => {
    if (!assessmentBooking.assessmentDate || !assessmentBooking.assessmentTime) {
      toast.error("Please select assessment date and time");
      return;
    }

    try {
      const response = await leadAPI.bookAssessment(selectedLead.id, assessmentBooking);
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { 
              ...lead, 
              assessmentBooked: true,
              assessmentDate: response.data?.lead?.assessmentDate || null,
              assessmentTime: response.data?.lead?.assessmentTime || null,
              assessmentType: response.data?.lead?.assessmentType || null,
              assessmentAssignedTo: response.data?.lead?.assessmentAssignedTo || null,
            }
          : lead
      ));

      toast.success("Assessment booked successfully");
      setAssessmentBooking({
        assessmentDate: "",
        assessmentTime: "",
        assessmentType: "",
        assessmentAssignedTo: "",
      });
    } catch (error) {
      console.error('Error booking assessment:', error);
      toast.error(error.message || 'Failed to book assessment');
    }
  };

  return (
    <>
      <PageHeader
        title={isSalesAgent ? "My New Leads" : "New Leads"}
        description={isSalesAgent 
          ? "Leads in primary screening stage assigned to you - initial qualification and pre-screening."
          : "Unassigned leads waiting to be assigned to team members."}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Import Leads
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard 
          icon={Sparkles} 
          value={leads.length} 
          label={isSalesAgent ? "My New Leads" : "Unassigned Leads"} 
          trend={isSalesAgent ? "Assigned to me" : "Waiting for assignment"} 
        />
        <StatsCard icon={Mail} value={leads.filter(l => l.pipelineStage === 'meet_and_call').length} label="Ready for Call" trend="Meet and Call stage" />
        <StatsCard icon={Phone} value={leads.filter(l => l.pipelineStage === 'assessments').length} label="In Assessment" trend="Assessment stage" />
        <StatsCard icon={Building2} value={leads.filter(l => l.pipelineStage === 'primary_screening').length} label="In Screening" trend="Primary screening" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="flex items-center justify-between border-b border-brintelli-border p-4">
                <h3 className="text-lg font-semibold text-text">
                  {isSalesAgent ? "My New Leads" : "Unassigned Leads"}
                </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loadingLeads ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-brand" />
              <span className="ml-3 text-textMuted">Loading leads...</span>
            </div>
          ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Pre-Screening</th>
                <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_APPROVE]}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Assigned To</th>
                </AnyPermissionGate>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {(() => {
                // Filter leads based on search (all leads here are already unassigned)
                let filteredLeads = leads;
                
                if (searchTerm) {
                  const search = searchTerm.toLowerCase();
                  filteredLeads = filteredLeads.filter(lead =>
                    lead.name?.toLowerCase().includes(search) ||
                    lead.email?.toLowerCase().includes(search) ||
                    lead.phone?.includes(search) ||
                    lead.company?.toLowerCase().includes(search)
                  );
                }
                
                if (filteredLeads.length === 0) {
                  const colSpan = isSalesAgent ? 8 : 9; // Adjust based on whether "Assigned To" column is visible
                  return (
                    <tr>
                      <td colSpan={colSpan} className="px-4 py-8 text-center text-textMuted">
                        {searchTerm 
                          ? (isSalesAgent 
                              ? "No leads assigned to you match your search."
                              : "No unassigned leads match your search.")
                          : (isSalesAgent
                              ? "No leads assigned to you yet."
                              : "No unassigned leads found. All leads have been assigned.")}
                      </td>
                    </tr>
                  );
                }
                
                return filteredLeads.map((lead, idx) => (
                <tr key={idx} className="transition hover:bg-brintelli-baseAlt">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text">{lead.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-textMuted">{lead.email}</p>
                    <p className="text-xs text-textMuted">{lead.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStageColor(lead.pipelineStage)}`}>
                      {getStageName(lead.pipelineStage)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const statusDetails = getStatusDetails(lead);
                      return (
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusDetails.color}`}>
                          {statusDetails.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text">{lead.value}</p>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const completion = calculateCompletionPercentage(lead.preScreening);
                      
                      // If pre-screening is 100% complete, show "View Details" button
                      if (completion === 100) {
                        return (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowPreScreeningViewModal(true);
                            }}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View Details
                    </Button>
                        );
                      }
                      
                      // Otherwise, show progress bar
                      const getCompletionColor = (percent) => {
                        if (percent === 0) return "bg-gray-100 text-gray-600";
                        if (percent < 50) return "bg-red-100 text-red-700";
                        if (percent < 80) return "bg-yellow-100 text-yellow-700";
                        return "bg-green-100 text-green-700";
                      };
                      return (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-[80px]">
                            <div className="h-2 w-full rounded-full bg-brintelli-baseAlt overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  completion === 0 
                                    ? "bg-gray-300" 
                                    : completion < 50 
                                    ? "bg-red-500" 
                                    : completion < 80 
                                    ? "bg-yellow-500" 
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${getCompletionColor(completion)}`}>
                            {completion}%
                          </span>
                        </div>
                      );
                    })()}
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePreScreening(lead)}
                        className="gap-1"
                      >
                        <ClipboardList className="h-3 w-3" />
                        Pre-screen
                      </Button>
                      {lead.pipelineStage === 'meet_and_call' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedLead(lead);
                              setCallNotes("");
                              setCallDate(new Date().toISOString().split('T')[0]);
                              setCallTime(new Date().toTimeString().slice(0, 5));
                              setAssessmentBooking({
                                assessmentDate: lead.assessmentDate ? new Date(lead.assessmentDate).toISOString().split('T')[0] : "",
                                assessmentTime: lead.assessmentTime || "",
                                assessmentType: lead.assessmentType || "",
                                assessmentAssignedTo: lead.assessmentAssignedTo || "",
                              });
                              setShowCallNotesModal(true);
                            }}
                            className="gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            Call Notes
                          </Button>
                          {lead.callNotes && Array.isArray(lead.callNotes) && lead.callNotes.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowAllCallNotesModal(true);
                              }}
                              className="gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View All Notes
                            </Button>
                          )}
                        </>
                      )}
                      <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM, PERMISSIONS.SALES_APPROVE]}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAssign(lead)}
                          className="gap-1"
                        >
                          <UserPlus className="h-3 w-3" />
                          {lead.assignedTo ? "Reassign" : "Assign"}
                        </Button>
                      </AnyPermissionGate>
                    </div>
                  </td>
                </tr>
                ));
              })()}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Assign Lead Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedLead(null);
          setAssignmentData({ leadId: null, assignedTo: "" });
        }}
        title={selectedLead?.assignedTo ? "Reassign Lead to Team Member" : "Assign Lead to Team Member"}
        size="md"
      >
        <div className="space-y-4">
          {selectedLead?.assignedTo && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
              <p className="font-medium text-blue-900">Current Assignment:</p>
              <p className="text-blue-700">
                {getAssignedName(selectedLead.assignedTo)} ({selectedLead.assignedTo})
              </p>
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              {selectedLead?.assignedTo ? "Select New Team Member" : "Select Team Member"}
            </label>
            {loadingTeam ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-textMuted" />
                <span className="ml-2 text-sm text-textMuted">Loading team...</span>
              </div>
            ) : salesTeam.length === 0 ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <p className="mb-2">No team members found.</p>
                <Button size="sm" onClick={handleRefreshTeam} className="mt-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Team
                </Button>
              </div>
            ) : (
              <select
                value={assignmentData.assignedTo}
                onChange={(e) => setAssignmentData({ ...assignmentData, assignedTo: e.target.value })}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select a team member...</option>
                {salesTeam.map((member) => (
                  <option key={member.email || member.id} value={member.email}>
                    {member.name || member.fullName} ({member.role})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowAssignModal(false);
                setSelectedLead(null);
                setAssignmentData({ leadId: null, assignedTo: "" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignSubmit}>
              {selectedLead?.assignedTo ? "Reassign Lead" : "Assign Lead"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pre-Screening Modal */}
      <Modal
        isOpen={showPreScreeningModal}
        onClose={() => setShowPreScreeningModal(false)}
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span className="text-xl font-semibold text-text">
              Pre-Screening: {selectedLead?.name || "Lead"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-textMuted">Completion:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-brintelli-baseAlt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-300"
                    style={{ width: `${calculateCompletionPercentage(preScreeningData)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-brand min-w-[3rem]">
                  {calculateCompletionPercentage(preScreeningData)}%
                </span>
              </div>
            </div>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Completion Progress Bar (at top) */}
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
            <p className="mt-2 text-xs text-textMuted">
              Fill in all fields to complete the pre-screening process
            </p>
          </div>
          {/* Education Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Education Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Degree</label>
                <input
                  type="text"
                  value={preScreeningData.education.degree}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    education: { ...preScreeningData.education, degree: e.target.value }
                  })}
                  placeholder="e.g., B.Tech, B.Sc, MCA"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Field of Study</label>
                <input
                  type="text"
                  value={preScreeningData.education.field}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    education: { ...preScreeningData.education, field: e.target.value }
                  })}
                  placeholder="e.g., Computer Science, Engineering"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">University/College</label>
                <input
                  type="text"
                  value={preScreeningData.education.university}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    education: { ...preScreeningData.education, university: e.target.value }
                  })}
                  placeholder="University name"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Graduation Year</label>
                <input
                  type="text"
                  value={preScreeningData.education.graduationYear}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    education: { ...preScreeningData.education, graduationYear: e.target.value }
                  })}
                  placeholder="e.g., 2023"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">GPA/Percentage</label>
                <input
                  type="text"
                  value={preScreeningData.education.gpa}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    education: { ...preScreeningData.education, gpa: e.target.value }
                  })}
                  placeholder="e.g., 8.5 or 85%"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Financial Status */}
          <div className="space-y-4 border-t border-brintelli-border pt-4">
            <h3 className="text-lg font-semibold text-text">Financial Status</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Current Salary (if employed)</label>
                <input
                  type="text"
                  value={preScreeningData.financial.currentSalary}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    financial: { ...preScreeningData.financial, currentSalary: e.target.value }
                  })}
                  placeholder="e.g., ₹5,00,000"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Expected Salary</label>
                <input
                  type="text"
                  value={preScreeningData.financial.expectedSalary}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    financial: { ...preScreeningData.financial, expectedSalary: e.target.value }
                  })}
                  placeholder="e.g., ₹8,00,000"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Can Afford Course Fee</label>
                <select
                  value={preScreeningData.financial.canAfford}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    financial: { ...preScreeningData.financial, canAfford: e.target.value }
                  })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="maybe">Maybe (Needs financial aid)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Preferred Payment Method</label>
                <select
                  value={preScreeningData.financial.paymentMethod}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    financial: { ...preScreeningData.financial, paymentMethod: e.target.value }
                  })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="full">Full Payment</option>
                  <option value="emi">EMI</option>
                  <option value="installments">Installments</option>
                  <option value="loan">Education Loan</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-text">Financial Status</label>
                <textarea
                  value={preScreeningData.financial.financialStatus}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    financial: { ...preScreeningData.financial, financialStatus: e.target.value }
                  })}
                  placeholder="Additional financial information..."
                  rows="3"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4 border-t border-brintelli-border pt-4">
            <h3 className="text-lg font-semibold text-text">Job Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Currently Employed</label>
                <select
                  value={preScreeningData.job.currentJob}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    job: { ...preScreeningData.job, currentJob: e.target.value }
                  })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Current Company</label>
                <input
                  type="text"
                  value={preScreeningData.job.company}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    job: { ...preScreeningData.job, company: e.target.value }
                  })}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Years of Experience</label>
                <input
                  type="text"
                  value={preScreeningData.job.experience}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    job: { ...preScreeningData.job, experience: e.target.value }
                  })}
                  placeholder="e.g., 2 years"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Current Position</label>
                <input
                  type="text"
                  value={preScreeningData.job.position}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    job: { ...preScreeningData.job, position: e.target.value }
                  })}
                  placeholder="e.g., Software Engineer"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Notice Period</label>
                <input
                  type="text"
                  value={preScreeningData.job.noticePeriod}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    job: { ...preScreeningData.job, noticePeriod: e.target.value }
                  })}
                  placeholder="e.g., 30 days, 60 days"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Media & Links */}
          <div className="space-y-4 border-t border-brintelli-border pt-4">
            <h3 className="text-lg font-semibold text-text">Social Media & Professional Links</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">LinkedIn Profile</label>
                <input
                  type="url"
                  value={preScreeningData.social.linkedin}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    social: { ...preScreeningData.social, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">GitHub Profile</label>
                <input
                  type="url"
                  value={preScreeningData.social.github}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    social: { ...preScreeningData.social, github: e.target.value }
                  })}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Portfolio Website</label>
                <input
                  type="url"
                  value={preScreeningData.social.portfolio}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    social: { ...preScreeningData.social, portfolio: e.target.value }
                  })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Twitter/X Profile</label>
                <input
                  type="url"
                  value={preScreeningData.social.twitter}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    social: { ...preScreeningData.social, twitter: e.target.value }
                  })}
                  placeholder="https://twitter.com/..."
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-text">Other Social Media / Links</label>
                <input
                  type="text"
                  value={preScreeningData.social.other}
                  onChange={(e) => setPreScreeningData({
                    ...preScreeningData,
                    social: { ...preScreeningData.social, other: e.target.value }
                  })}
                  placeholder="Any other relevant links"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4 border-t border-brintelli-border pt-4">
            <h3 className="text-lg font-semibold text-text">Additional Notes</h3>
            <textarea
              value={preScreeningData.notes}
              onChange={(e) => setPreScreeningData({ ...preScreeningData, notes: e.target.value })}
              placeholder="Any additional notes or observations..."
              rows="4"
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 border-t border-brintelli-border pt-4">
            <Button variant="ghost" onClick={() => setShowPreScreeningModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePreScreeningSubmit}>
              Save Pre-Screening Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Call Notes & Assessment Booking Modal */}
      <Modal
        isOpen={showCallNotesModal}
        onClose={() => {
          setShowCallNotesModal(false);
          setCallNotes("");
          setAssessmentBooking({
            assessmentDate: "",
            assessmentTime: "",
            assessmentType: "",
            assessmentAssignedTo: "",
          });
          setSelectedLead(null);
        }}
        title={`Call Notes & Assessment: ${selectedLead?.name || "Lead"}`}
        size="lg"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Call Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Notes / What We Discussed
            </h3>
            
            {/* Call Date and Time */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Call Date
                </label>
                <input
                  type="date"
                  value={callDate}
                  onChange={(e) => setCallDate(e.target.value)}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Call Time
                </label>
                <input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Enter details about the call, what was discussed, next steps, concerns raised, interest level, etc..."
                rows="6"
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-textMuted">
                Add notes about the conversation, key points discussed, and any follow-up actions.
              </p>
            </div>
          </div>

          {/* Assessment Booking Section */}
          <div className="space-y-4 border-t border-brintelli-border pt-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book & Assign Assessment
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Assessment Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Assessment Date
                </label>
                <input
                  type="date"
                  value={assessmentBooking.assessmentDate}
                  onChange={(e) => setAssessmentBooking({ ...assessmentBooking, assessmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Assessment Time */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Assessment Time
                </label>
                <input
                  type="time"
                  value={assessmentBooking.assessmentTime}
                  onChange={(e) => setAssessmentBooking({ ...assessmentBooking, assessmentTime: e.target.value })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Assessment Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Assessment Type
                </label>
                <select
                  value={assessmentBooking.assessmentType}
                  onChange={(e) => setAssessmentBooking({ ...assessmentBooking, assessmentType: e.target.value })}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select assessment type...</option>
                  <option value="technical">Technical Assessment</option>
                  <option value="aptitude">Aptitude Test</option>
                  <option value="coding">Coding Challenge</option>
                  <option value="behavioral">Behavioral Interview</option>
                  <option value="combined">Combined Assessment</option>
                </select>
              </div>

              {/* Assign Assessment To */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assign To
                </label>
                {loadingTeam ? (
                  <div className="flex items-center gap-2 py-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-textMuted" />
                    <span className="text-sm text-textMuted">Loading team...</span>
                  </div>
                ) : (
                  <select
                    value={assessmentBooking.assessmentAssignedTo}
                    onChange={(e) => setAssessmentBooking({ ...assessmentBooking, assessmentAssignedTo: e.target.value })}
                    className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Select assessor...</option>
                    {salesTeam.map((member) => (
                      <option key={member.email || member.id} value={member.email}>
                        {member.name || member.fullName} ({member.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Show existing booking if any */}
            {selectedLead?.assessmentBooked && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="text-xs font-medium text-green-900 mb-1">Current Booking:</p>
                <div className="text-sm text-green-800 space-y-1">
                  {selectedLead.assessmentDate && (
                    <p><strong>Date:</strong> {new Date(selectedLead.assessmentDate).toLocaleDateString()}</p>
                  )}
                  {selectedLead.assessmentTime && (
                    <p><strong>Time:</strong> {selectedLead.assessmentTime}</p>
                  )}
                  {selectedLead.assessmentType && (
                    <p><strong>Type:</strong> {selectedLead.assessmentType}</p>
                  )}
                  {selectedLead.assessmentAssignedTo && (
                    <p><strong>Assigned To:</strong> {getAssignedName(selectedLead.assessmentAssignedTo)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowCallNotesModal(false);
                setCallNotes("");
                setCallDate("");
                setCallTime("");
                setAssessmentBooking({
                  assessmentDate: "",
                  assessmentTime: "",
                  assessmentType: "",
                  assessmentAssignedTo: "",
                });
                setSelectedLead(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="ghost"
              onClick={handleCallNotesSubmit}
            >
              Save Notes Only
            </Button>
            {assessmentBooking.assessmentDate && assessmentBooking.assessmentTime && (
              <Button 
                variant="ghost"
                onClick={handleBookAssessment}
              >
                Book Assessment
              </Button>
            )}
            <Button 
              onClick={handleSubmitCallNotesAndMoveToAssessments}
              className="bg-gradient-to-r from-brand-500 to-brand-400"
            >
              Submit & Send Assessment
            </Button>
          </div>
        </div>
      </Modal>

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
                      <div>
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

      {/* View All Call Notes Modal */}
      <Modal
        isOpen={showAllCallNotesModal}
        onClose={() => {
          setShowAllCallNotesModal(false);
          setSelectedLead(null);
        }}
        title={`All Call Notes: ${selectedLead?.name || "Lead"}`}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {selectedLead?.callNotes && Array.isArray(selectedLead.callNotes) && selectedLead.callNotes.length > 0 ? (
            <div className="space-y-4">
              {selectedLead.callNotes
                .sort((a, b) => {
                  // Sort by date and time, most recent first
                  const dateA = new Date(`${a.callDate}T${a.callTime || '00:00'}`);
                  const dateB = new Date(`${b.callDate}T${b.callTime || '00:00'}`);
                  return dateB - dateA;
                })
                .map((note, index) => (
                  <div key={index} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-brand-500" />
                        <span className="text-sm font-semibold text-text">
                          Call #{selectedLead.callNotes.length - index}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-text">
                          {note.callDate ? new Date(note.callDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </p>
                        <p className="text-xs text-textMuted">
                          {note.callTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-text whitespace-pre-wrap">{note.notes}</p>
                    </div>
                    {note.createdAt && (
                      <p className="text-xs text-textMuted mt-2">
                        Added: {new Date(note.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-textMuted">
              <Phone className="h-12 w-12 mx-auto mb-3 text-textMuted opacity-50" />
              <p>No call notes available for this lead.</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowAllCallNotesModal(false);
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

export default SalesLeads;