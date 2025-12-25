import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sparkles, Search, Filter, Plus, Mail, Phone, Building2, UserPlus, ClipboardList, Users, X, RefreshCw, Eye, FileText, Flag, ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import CallNotesModal from "../../components/CallNotesModal";
import CallNotesViewer from "../../components/CallNotesViewer";
import ViewAllCallNotesModal from "../../components/ViewAllCallNotesModal";
import FlagLeadModal from "../../components/FlagLeadModal";
import BookingOptionsMenu from "../../components/BookingOptionsMenu";
import Modal from "../../components/Modal";
import { leadAPI } from "../../api/lead";
import { programAPI } from "../../api/program";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchSalesTeam, selectSalesTeam, selectSalesTeamLoading } from "../../store/slices/salesTeamSlice";
import { AnyPermissionGate } from "../../components/PermissionGate";
import { PERMISSIONS } from "../../utils/permissions";

/**
 * NEW LEADS PAGE
 * 
 * WORKFLOW: Screening stage - validate interest
 * 
 * RBAC: Visible to Sales Agent and Sales Lead (excludes Sales Head)
 * 
 * ABAC (Attribute-Based Access Control):
 * - Sales Agent: Only leads assigned to them in "primary_screening" stage
 * - Sales Lead: Unassigned leads OR leads assigned to their team
 * 
 * BUSINESS LOGIC:
 * - This is the first stage of the sales pipeline
 * - Agents work on leads assigned to them
 * - Leads can assign leads to agents from here
 */

const NewLeads = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const salesTeam = useSelector(selectSalesTeam);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkAssignData, setBulkAssignData] = useState({ assignedTo: "" });
  const [isCallNotesModalOpen, setIsCallNotesModalOpen] = useState(false);
  const [showViewAllCallNotesModal, setShowViewAllCallNotesModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ leadId: null, assignedTo: "" });
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);
  const [showPreScreeningViewModal, setShowPreScreeningViewModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [preScreeningData, setPreScreeningData] = useState({
    leadId: null,
    education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
    financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
    job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
    social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
    courseInterest: { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
    notes: "",
  });
  const loadingTeam = useSelector(selectSalesTeamLoading);

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const isSalesLead = currentUser?.role === 'sales_lead';
  const isSalesHead = currentUser?.role === 'sales_head' || currentUser?.role === 'sales_admin';
  const userEmail = currentUser?.email;
  const userTeamId = currentUser?.teamId;
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

    const mainFields = 23;
    const filledMainFields = fields.slice(0, mainFields).filter(f => f && f.toString().trim() !== '').length;
    const hasNotes = fields[fields.length - 1] && fields[fields.length - 1].toString().trim() !== '';
    
    const percentage = Math.round((filledMainFields / mainFields) * 95 + (hasNotes ? 5 : 0));
    return Math.min(percentage, 100);
  };

  // Handle pre-screening (for sales agents only - editable)
  const handlePreScreening = (lead) => {
    setSelectedLead(lead);
    const existingData = lead.preScreening || {};
    // Ensure all fields are initialized with defaults
    setPreScreeningData({
      leadId: lead.id,
      education: existingData.education || { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
      financial: existingData.financial || { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
      job: existingData.job || { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
      social: existingData.social || { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
      courseInterest: existingData.courseInterest || { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
      notes: existingData.notes || "",
    });
    setShowPreScreeningModal(true);
  };

  // Handle pre-screening submit (sales agents only)
  const handlePreScreeningSubmit = async () => {
    try {
      const { leadId, ...preScreeningPayload } = preScreeningData;
      
      // Check if any pre-screening data was added
      const hasData = 
        Object.values(preScreeningPayload.education || {}).some(v => v && v.toString().trim() !== '') ||
        Object.values(preScreeningPayload.financial || {}).some(v => v && v.toString().trim() !== '') ||
        Object.values(preScreeningPayload.job || {}).some(v => v && v.toString().trim() !== '') ||
        Object.values(preScreeningPayload.social || {}).some(v => v && v.toString().trim() !== '') ||
        Object.values(preScreeningPayload.courseInterest || {}).some(v => v && v.toString().trim() !== '') ||
        (preScreeningPayload.notes && preScreeningPayload.notes.trim() !== '');
      
      const response = await leadAPI.updatePreScreening(leadId, {
        education: preScreeningPayload.education,
        financial: preScreeningPayload.financial,
        job: preScreeningPayload.job,
        social: preScreeningPayload.social,
        courseInterest: preScreeningPayload.courseInterest,
        notes: preScreeningPayload.notes,
      });

      // Check if lead was automatically moved to meet_and_call (100% complete)
      const wasAutoMoved = response.data?.lead?.pipelineStage === 'meet_and_call';

      // If pre-screening data was added but lead wasn't auto-moved, move it to meet_and_call stage
      if (hasData && !wasAutoMoved) {
        try {
          await leadAPI.updatePipelineStage(leadId, 'meet_and_call');
        } catch (stageError) {
          console.error('Error updating pipeline stage:', stageError);
          // Continue even if stage update fails
        }
      }

      // Refresh leads list
      const fetchLeads = async () => {
        try {
          const response = await leadAPI.getAllLeads();
          
          if (response.success && response.data.leads) {
            let filteredLeads;
            
            if (isSalesAgent && userEmail) {
              filteredLeads = response.data.leads.filter(lead => 
                lead.assignedTo === userEmail && 
                lead.pipelineStage === 'primary_screening'
              );
            } else if (isSalesLead) {
              filteredLeads = response.data.leads.filter(lead => 
                (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage) &&
                (!lead.assignedTo || lead.assignedTo === '')
              );
            } else {
              filteredLeads = [];
            }
            
            setLeads(filteredLeads);
          }
        } catch (error) {
          console.error('Error refreshing leads:', error);
        }
      };

      await fetchLeads();

      if (wasAutoMoved || hasData) {
        toast.success("Pre-screening data saved! Lead moved to 'Active Leads'.");
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
        courseInterest: { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
        notes: "",
      });
      setSelectedLead(null);
    } catch (error) {
      console.error('Error saving pre-screening:', error);
      toast.error(error.message || "Failed to save pre-screening data");
    }
  };

  // Fetch sales team for assignment
  useEffect(() => {
    if (isSalesLead || isSalesAgent) {
      dispatch(fetchSalesTeam());
    }
  }, [dispatch, isSalesLead, isSalesAgent]);

  // Helper function to get assigned team member name
  const getAssignedName = (email) => {
    if (!email) return "Unassigned";
    const member = salesTeam.find(m => m.email === email);
    return member ? (member.name || member.fullName) : email;
  };

  // Handle assign lead
  const handleAssign = (lead) => {
    const currentAssignee = lead.assignedTo || "";
    setAssignmentData({ leadId: lead.id, assignedTo: currentAssignee });
    setSelectedLead(lead);
    setShowAssignModal(true);
  };

  // Handle assign submit
  const handleAssignSubmit = async () => {
    if (!assignmentData.assignedTo) {
      toast.error("Please select a team member");
      return;
    }

    try {
      const currentLead = leads.find(l => l.id === assignmentData.leadId);
      const isReassignment = currentLead?.assignedTo && currentLead.assignedTo !== assignmentData.assignedTo;
      
      await leadAPI.assignLead(assignmentData.leadId, assignmentData.assignedTo);

      // Refresh leads list to get updated data
      const fetchLeads = async () => {
        try {
          const response = await leadAPI.getAllLeads();
          
          if (response.success && response.data.leads) {
            let filteredLeads;
            
            if (isSalesAgent && userEmail) {
              filteredLeads = response.data.leads.filter(lead => 
                lead.assignedTo === userEmail && 
                lead.pipelineStage === 'primary_screening'
              );
            } else if (isSalesLead) {
              // Only show UNASSIGNED leads - assigned leads go to Active Leads
              filteredLeads = response.data.leads.filter(lead => 
                (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage) &&
                (!lead.assignedTo || lead.assignedTo === '')
              );
            } else {
              filteredLeads = [];
            }
            
            setLeads(filteredLeads);
          }
        } catch (error) {
          console.error('Error refreshing leads:', error);
        }
      };

      await fetchLeads();

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

  // Fetch leads with ABAC filtering
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        
        if (response.success && response.data.leads) {
          let filteredLeads;
          
          if (isSalesAgent && userEmail) {
            // ABAC: Sales Agent - Only leads assigned to them in primary_screening stage
            filteredLeads = response.data.leads.filter(lead => 
              lead.assignedTo === userEmail && 
              lead.pipelineStage === 'primary_screening'
            );
          } else if (isSalesLead) {
            // ABAC: Sales Lead - Only UNASSIGNED leads in primary_screening stage
            // Once assigned, leads move to Active Leads page
            filteredLeads = response.data.leads.filter(lead => 
              (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage) &&
              (!lead.assignedTo || lead.assignedTo === '')
            );
          } else {
            filteredLeads = [];
          }
          
          setLeads(filteredLeads);
        } else {
          setLeads([]);
        }
      } catch (error) {
        console.error('Error fetching new leads:', error);
        toast.error('Failed to load new leads');
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      return; // Wait for user to load
    }

    fetchLeads();
  }, [isSalesAgent, isSalesLead, userEmail, userTeamId, salesTeam]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Filtering
  const filteredLeads = sortedLeads.filter(lead => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.includes(search) ||
      lead.company?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(new Set(paginatedLeads.map(lead => lead.id || lead._id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every(lead => selectedLeads.has(lead.id || lead._id));
  const isIndeterminate = selectedLeads.size > 0 && selectedLeads.size < paginatedLeads.length;

  // Bulk assign handler
  const handleBulkAssign = async () => {
    if (!bulkAssignData.assignedTo) {
      toast.error("Please select a team member");
      return;
    }

    if (selectedLeads.size === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    try {
      const leadIds = Array.from(selectedLeads);
      await leadAPI.bulkAssignLeads(leadIds, bulkAssignData.assignedTo);

      // Refresh leads list
      const fetchLeads = async () => {
        try {
          const response = await leadAPI.getAllLeads();
          
          if (response.success && response.data.leads) {
            let filteredLeads;
            
            if (isSalesAgent && userEmail) {
              filteredLeads = response.data.leads.filter(lead => 
                lead.assignedTo === userEmail && 
                lead.pipelineStage === 'primary_screening'
              );
            } else if (isSalesLead) {
              filteredLeads = response.data.leads.filter(lead => 
                (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage) &&
                (!lead.assignedTo || lead.assignedTo === '')
              );
            } else {
              filteredLeads = [];
            }
            
            setLeads(filteredLeads);
          }
        } catch (error) {
          console.error('Error refreshing leads:', error);
        }
      };

      await fetchLeads();

      const assignedMember = salesTeam.find(m => m.email === bulkAssignData.assignedTo);
      toast.success(`${leadIds.length} lead(s) assigned to ${assignedMember?.name || assignedMember?.fullName || bulkAssignData.assignedTo}`);
      
      setShowBulkAssignModal(false);
      setSelectedLeads(new Set());
      setBulkAssignData({ assignedTo: "" });
    } catch (error) {
      console.error('Error bulk assigning leads:', error);
      toast.error(error.message || "Failed to assign leads");
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-textMuted opacity-40" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-brand" />
      : <ArrowDown className="h-3.5 w-3.5 text-brand" />;
  };

  const newLeadsCount = leads.length;
  const unassignedCount = leads.filter(l => !l.assignedTo || l.assignedTo === '').length;

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <PageHeader
        title={isSalesAgent ? "My New Leads" : "New Leads - Assignment"}
        description={
          isSalesAgent 
            ? "Leads in screening stage assigned to you - validate interest and qualify."
            : "Assign unassigned leads to team members. Select multiple leads to bulk assign."
        }
        actions={
          <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </AnyPermissionGate>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Sparkles} 
          value={newLeadsCount} 
          label={isSalesAgent ? "My New Leads" : "New Leads"} 
          trend={isSalesAgent ? "Assigned to me" : "In screening stage"} 
        />
        <StatsCard 
          icon={UserPlus} 
          value={unassignedCount} 
          label="Unassigned" 
          trend={isSalesLead ? "Need assignment" : "N/A"} 
        />
        <StatsCard 
          icon={ClipboardList} 
          value={leads.filter(l => l.pipelineStage === 'primary_screening').length} 
          label="In Screening" 
          trend="Being qualified" 
        />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="flex items-center justify-between border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">
            {isSalesAgent ? "My New Leads" : "New Leads"}
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search new leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
        {selectedLeads.size > 0 && (
          <div className="flex items-center justify-between border-b border-brintelli-border bg-brand-50 px-4 py-3">
            <span className="text-sm font-medium text-text">
              {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
            </span>
            <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowBulkAssignModal(true)}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Bulk Assign
              </Button>
            </AnyPermissionGate>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading new leads...</span>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
                    <th className="w-12 px-4 py-3.5 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-brintelli-border text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </th>
                  </AnyPermissionGate>
                  <th 
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted cursor-pointer hover:bg-brintelli-baseAlt transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Lead Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Contact</th>
                  <th 
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted cursor-pointer hover:bg-brintelli-baseAlt transition-colors"
                    onClick={() => handleSort('source')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Source</span>
                      {getSortIcon('source')}
                    </div>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Pre-Screening</th>
                  <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted cursor-pointer hover:bg-brintelli-baseAlt transition-colors"
                      onClick={() => handleSort('assignedTo')}
                    >
                      <div className="flex items-center gap-2">
                        <span>Assigned To</span>
                        {getSortIcon('assignedTo')}
                      </div>
                    </th>
                  </AnyPermissionGate>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={isSalesAgent ? 5 : (isSalesLead ? 6 : 5)} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <UserPlus className="h-12 w-12 text-textMuted mb-4" />
                        <p className="text-text font-medium mb-1">
                          {searchTerm ? "No leads match your search" : "No new leads found"}
                        </p>
                        <p className="text-sm text-textMuted">
                          {searchTerm ? "Try adjusting your search criteria" : "New leads will appear here for assignment"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const leadId = lead.id || lead._id;
                    const isSelected = selectedLeads.has(leadId);
                    return (
                      <tr 
                        key={leadId} 
                        className={`transition-colors duration-150 hover:bg-brintelli-baseAlt/40 ${
                          isSelected ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''
                        }`}
                      >
                        <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectLead(leadId)}
                              className="h-4 w-4 rounded border-brintelli-border text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                          </td>
                        </AnyPermissionGate>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-semibold text-text">{lead.name || 'N/A'}</p>
                            {lead.company && (
                              <p className="text-xs text-textMuted mt-0.5">{lead.company}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-textMuted flex-shrink-0" />
                              <p className="text-xs text-textMuted truncate max-w-[200px]">{lead.email || 'N/A'}</p>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-textMuted flex-shrink-0" />
                                <p className="text-xs text-textMuted">{lead.phone}</p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {lead.source || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 w-fit">
                              {lead.pipelineStage?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || 'Primary Screening'}
                            </span>
                            {lead.flag && (
                              <div className="flex items-center gap-1">
                                <Flag className={`h-3 w-3 ${
                                  lead.flag.type === 'red' ? 'text-red-600' : 
                                  lead.flag.type === 'green' ? 'text-green-600' : 
                                  'text-blue-600'
                                }`} />
                                <span className={`text-xs font-medium ${
                                  lead.flag.type === 'red' ? 'text-red-600' : 
                                  lead.flag.type === 'green' ? 'text-green-600' : 
                                  'text-blue-600'
                                }`}>
                                  {lead.flag.type === 'red' ? 'Red Flag' : lead.flag.type === 'green' ? 'Green Flag' : 'Blue Flag'}
                                </span>
                              </div>
                            )}
                          </div>
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
                        <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
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
                          <div className="flex items-center gap-2">
                            <AnyPermissionGate permissions={[PERMISSIONS.SALES_MANAGE_TEAM]}>
                              <Button 
                                variant={lead.assignedTo ? "ghost" : "secondary"}
                                size="sm" 
                                className="gap-1.5"
                                onClick={() => handleAssign(lead)}
                              >
                                <Users className="h-4 w-4" />
                                {lead.assignedTo ? "Reassign" : "Assign"}
                              </Button>
                            </AnyPermissionGate>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1.5"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowViewAllCallNotesModal(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between border-t border-brintelli-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-textMuted">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-brintelli-border bg-brintelli-card px-2 py-1 text-sm text-text focus:border-brand-500 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-textMuted">
              {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-text">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
              setLoading(true);
              const response = await leadAPI.getAllLeads();
              
              if (response.success && response.data.leads) {
                let filteredLeads;
                
                if (isSalesAgent && userEmail) {
                  filteredLeads = response.data.leads.filter(lead => 
                    lead.assignedTo === userEmail && 
                    lead.pipelineStage === 'primary_screening'
                  );
                } else if (isSalesLead) {
                  // Only show UNASSIGNED leads - assigned leads go to Active Leads
                  filteredLeads = response.data.leads.filter(lead => 
                    (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage) &&
                    (!lead.assignedTo || lead.assignedTo === '')
                  );
                } else {
                  filteredLeads = [];
                }
                
                setLeads(filteredLeads);
              }
            } catch (error) {
              console.error('Error refreshing leads:', error);
            } finally {
              setLoading(false);
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
                <Button size="sm" onClick={() => dispatch(fetchSalesTeam())} className="mt-2">
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
            <Button onClick={handleAssignSubmit} disabled={!assignmentData.assignedTo}>
              {selectedLead?.assignedTo ? "Reassign Lead" : "Assign Lead"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Pre-Screening Form Modal (Editable - Sales Agents Only) */}
      {isSalesAgent && (
        <Modal
          isOpen={showPreScreeningModal}
          onClose={() => {
            setShowPreScreeningModal(false);
            setSelectedLead(null);
            setPreScreeningData({
              leadId: null,
              education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
              financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
              job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
              social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
              courseInterest: { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
              notes: "",
            });
          }}
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
            {/* Completion Progress Bar */}
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

            {/* Course Interest */}
            <div className="space-y-4 border-t border-brintelli-border pt-4">
              <h3 className="text-lg font-semibold text-text">Course Interest</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Primary Program</label>
                  <select
                    value={preScreeningData.courseInterest.primary}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, primary: e.target.value }
                    })}
                    className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
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
                  <label className="mb-1 block text-sm font-medium text-text">Secondary Program</label>
                  <select
                    value={preScreeningData.courseInterest.secondary}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, secondary: e.target.value }
                    })}
                    className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
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
                  <label className="mb-1 block text-sm font-medium text-text">Preferred Batch</label>
                  <select
                    value={preScreeningData.courseInterest.preferredBatch}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, preferredBatch: e.target.value }
                    })}
                    className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Start Date Preference</label>
                  <input
                    type="date"
                    value={preScreeningData.courseInterest.startDatePreference}
                    onChange={(e) => setPreScreeningData({
                      ...preScreeningData,
                      courseInterest: { ...preScreeningData.courseInterest, startDatePreference: e.target.value }
                    })}
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
              <Button variant="ghost" onClick={() => {
                setShowPreScreeningModal(false);
                setSelectedLead(null);
                setPreScreeningData({
                  leadId: null,
                  education: { degree: "", field: "", university: "", graduationYear: "", gpa: "" },
                  financial: { currentSalary: "", expectedSalary: "", canAfford: "", paymentMethod: "", financialStatus: "" },
                  job: { currentJob: "", company: "", experience: "", position: "", noticePeriod: "" },
                  social: { linkedin: "", github: "", portfolio: "", twitter: "", other: "" },
                  courseInterest: { primary: "", secondary: "", preferredBatch: "", startDatePreference: "" },
                  notes: "",
                });
              }}>
                Cancel
              </Button>
              <Button onClick={handlePreScreeningSubmit}>
                Save Pre-Screening Data
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pre-Screening View Modal (Read-only - Sales Leads/Heads) */}
      {!isSalesAgent && (
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

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={showBulkAssignModal}
        onClose={() => {
          setShowBulkAssignModal(false);
          setBulkAssignData({ assignedTo: "" });
        }}
        title={`Bulk Assign ${selectedLeads.size} Lead${selectedLeads.size > 1 ? 's' : ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
            <p className="font-medium text-blue-900">
              You are about to assign {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} to a team member.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Select Team Member
            </label>
            {loadingTeam ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-textMuted" />
                <span className="ml-2 text-sm text-textMuted">Loading team...</span>
              </div>
            ) : salesTeam.length === 0 ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <p className="mb-2">No team members found.</p>
                <Button size="sm" onClick={() => dispatch(fetchSalesTeam())} className="mt-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Team
                </Button>
              </div>
            ) : (
              <select
                value={bulkAssignData.assignedTo}
                onChange={(e) => setBulkAssignData({ ...bulkAssignData, assignedTo: e.target.value })}
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
                setShowBulkAssignModal(false);
                setBulkAssignData({ assignedTo: "" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={!bulkAssignData.assignedTo}>
              Assign {selectedLeads.size} Lead{selectedLeads.size > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Flag Lead Modal */}
      <FlagLeadModal
        isOpen={showFlagModal}
        onClose={() => {
          setShowFlagModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSuccess={() => {
          // Refresh leads after flagging
          const fetchLeads = async () => {
            try {
              const response = await leadAPI.getAllLeads();
              if (response.success && response.data.leads) {
                let filteredLeads;
                if (isSalesAgent && userEmail) {
                  filteredLeads = response.data.leads.filter(lead => 
                    lead.assignedTo === userEmail && 
                    lead.pipelineStage === 'primary_screening'
                  );
                } else if (isSalesLead) {
                  filteredLeads = response.data.leads.filter(lead => 
                    (lead.pipelineStage === 'primary_screening' || !lead.pipelineStage) &&
                    (!lead.assignedTo || lead.assignedTo === '')
                  );
                } else {
                  filteredLeads = [];
                }
                setLeads(filteredLeads);
              }
            } catch (error) {
              console.error('Error refreshing leads:', error);
            }
          };
          fetchLeads();
        }}
      />
    </>
  );
};

export default NewLeads;

