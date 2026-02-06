import { useState, useEffect, useMemo, useCallback } from "react";
import { Target, Filter, Search, Plus, DollarSign, Calendar, GraduationCap, BookOpen, Phone, Building2, Trash2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import { leadAPI } from "../../api/lead";
import { userAPI } from "../../api/user";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectSalesTeam } from "../../store/slices/salesTeamSlice";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * SALES PIPELINE PAGE
 * 
 * WORKFLOW: Same route (/sales/pipeline), different UI modes based on role
 * 
 * RBAC: All sales roles can access
 * 
 * ABAC (Attribute-Based Access Control):
 * - Sales Agent: Only own leads (lead.assignedTo === user.email)
 * - Sales Lead: Team leads (lead.assignedTo in user's team)
 * - Sales Head: All department leads (read-only)
 * 
 * ROLE-BASED BEHAVIOR:
 * - Sales Agent: Single lead drag & drop, only own leads, NO bulk actions
 * - Sales Lead: Batch move allowed, team-level view, target-oriented controls
 * - Sales Head: Read-only funnel, department analytics, NO drag & drop
 */

const SalesPipeline = () => {
  const salesTeam = useSelector(selectSalesTeam);
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]); // For batch operations

  // Determine user role and mode
  const isSalesAgent = currentUser?.role === 'sales_agent';
  const isSalesLead = currentUser?.role === 'sales_lead';
  const isSalesHead = currentUser?.role === 'sales_head' || currentUser?.role === 'sales_admin';
  const userEmail = currentUser?.email;
  const userTeamId = currentUser?.teamId;
  
  // Pipeline mode based on role
  const pipelineMode = isSalesHead ? 'read-only' : isSalesLead ? 'batch-move' : 'single-move';

  // Define pipeline stages
  const pipelineStages = [
    // Only show "Unassigned" column for non-sales-agent users
    ...(isSalesAgent ? [] : [{
      id: "unassigned",
      name: "Unassigned", 
      color: "bg-gray-500",
      description: "Leads not yet assigned to any team member"
    }]),
    { 
      id: "primary_screening",
      name: "Primary Screening", 
      color: "bg-blue-500",
      description: "Initial lead qualification and pre-screening (New Leads for agents)"
    },
    { 
      id: "meet_and_call",
      name: "Meet and Call", 
      color: "bg-purple-500",
      description: "Preliminary talk - contacting lead and clearing doubts (Active Leads for agents)"
    },
    { 
      id: "demo_and_mentor_screening",
      name: "Demo & Mentor Screening", 
      color: "bg-indigo-500",
      description: "Demo of Dashboard and meeting with mentor for screening"
    },
    { 
      id: "assessments",
      name: "Assessments", 
      color: "bg-orange-500",
      description: "Technical test to screen knowledge (beginner/intermediate/advanced)"
    },
    { 
      id: "offer",
      name: "Offer", 
      color: "bg-yellow-500",
      description: "Offer released to candidate"
    },
    { 
      id: "payment_and_financial_clearance",
      name: "Payment and Financial Clearance", 
      color: "bg-pink-500",
      description: "Finance team for financial clearance"
    },
    { 
      id: "onboarded_to_lsm",
      name: "Onboarded to LSM", 
      color: "bg-green-500",
      description: "Student added to LSM dashboard"
    },
    { 
      id: "lead_dump",
      name: "Lead Dump", 
      color: "bg-red-500",
      description: "Leads that are no longer interested or not qualified"
    },
  ];

  // Memoize sales team emails to prevent unnecessary re-renders
  const teamEmails = useMemo(() => {
    return salesTeam.map(member => member.email);
  }, [salesTeam]);

  // Fetch leads from database with ABAC filtering
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        console.log('[Pipeline] Fetching leads...', { isSalesAgent, isSalesLead, isSalesHead, userEmail, teamEmails });
        const response = await leadAPI.getAllLeads();
        console.log('[Pipeline] API Response:', response);
        
        if (response && response.success) {
          // Handle different response structures
          let fetchedLeads = [];
          if (Array.isArray(response.data)) {
            fetchedLeads = response.data;
          } else if (response.data?.leads && Array.isArray(response.data.leads)) {
            fetchedLeads = response.data.leads;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            fetchedLeads = response.data.data;
          }
          console.log('[Pipeline] Raw leads count:', fetchedLeads.length);
          
          // ABAC: Filter leads based on role
          if (isSalesAgent && userEmail) {
            // Sales Agent: Only own leads
            fetchedLeads = fetchedLeads.filter(lead => lead.assignedTo === userEmail);
            console.log('[Pipeline] Filtered for sales agent:', fetchedLeads.length);
          } else if (isSalesLead && teamEmails.length > 0) {
            // Sales Lead: Team leads (leads assigned to team members)
            fetchedLeads = fetchedLeads.filter(lead => 
              !lead.assignedTo || lead.assignedTo === '' || teamEmails.includes(lead.assignedTo)
            );
            console.log('[Pipeline] Filtered for sales lead:', fetchedLeads.length);
          } else if (isSalesHead) {
            // Sales Head: All department leads (no filtering - read-only view)
            // All leads are visible for analytics
            console.log('[Pipeline] Sales head - showing all leads:', fetchedLeads.length);
          }
          
          console.log('[Pipeline] Setting leads:', fetchedLeads.length);
          setLeads(fetchedLeads);
        } else {
          console.warn('[Pipeline] API response not successful:', response);
          setLeads([]);
        }
      } catch (error) {
        console.error('[Pipeline] Error fetching leads:', error);
        toast.error(error?.message || 'Failed to load leads');
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      console.log('[Pipeline] Waiting for user email...');
      return; // Wait for user to load
    }

    fetchLeads();
  }, [isSalesAgent, isSalesLead, isSalesHead, userEmail, teamEmails]);

  // Memoize leads by stage to prevent unnecessary recalculations
  const leadsByStage = useMemo(() => {
    const grouped = {};
    pipelineStages.forEach(stage => {
      if (stage.id === 'unassigned') {
        if (isSalesAgent) {
          grouped[stage.id] = [];
        } else {
          grouped[stage.id] = leads.filter(lead => !lead.assignedTo || lead.assignedTo === '');
        }
      } else {
        grouped[stage.id] = leads.filter(lead => {
          const leadStage = lead.pipelineStage || 'primary_screening';
          return leadStage === stage.id;
        });
      }
    });
    return grouped;
  }, [leads, pipelineStages, isSalesAgent]);

  // Group leads by pipeline stage
  const getLeadsByStage = useCallback((stageId) => {
    return leadsByStage[stageId] || [];
  }, [leadsByStage]);

  // Get unassigned leads count
  const getUnassignedCount = () => {
    return leads.filter(lead => !lead.assignedTo || lead.assignedTo === '').length;
  };

  // Handle stage update (single lead move)
  const handleStageUpdate = async (leadId, newStage) => {
    // RBAC: Sales Head cannot move leads (read-only)
    if (isSalesHead) {
      toast.error('Read-only mode: Cannot move leads');
      return;
    }

    try {
      await leadAPI.updatePipelineStage(leadId, newStage);
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, pipelineStage: newStage }
          : lead
      ));
      
      const stageName = pipelineStages.find(s => s.id === newStage)?.name || newStage;
      toast.success(`Lead moved to ${stageName}`);
    } catch (error) {
      console.error('Error updating pipeline stage:', error);
      toast.error(error.message || 'Failed to update pipeline stage');
    }
  };

  // Handle batch stage update (Sales Lead only)
  const handleBatchStageUpdate = async (newStage) => {
    if (!isSalesLead || selectedLeads.length === 0) {
      return;
    }

    try {
      // TODO: Implement batch update API call
      // await leadAPI.batchUpdatePipelineStage(selectedLeads, newStage);
      
      // Update local state
      setLeads(leads.map(lead => 
        selectedLeads.includes(lead.id)
          ? { ...lead, pipelineStage: newStage }
          : lead
      ));

      const stageName = pipelineStages.find(s => s.id === newStage)?.name || newStage;
      toast.success(`${selectedLeads.length} leads moved to ${stageName}`);
      setSelectedLeads([]);
    } catch (error) {
      console.error('Error batch updating pipeline stage:', error);
      toast.error(error.message || 'Failed to batch update pipeline stage');
    }
  };

  // Get assigned member name
  const getAssignedName = (email) => {
    if (!email) return "Unassigned";
    const member = salesTeam.find(m => m.email === email);
    return member ? (member.name || member.fullName) : email;
  };

  // Memoize filtered leads to prevent unnecessary recalculations
  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads;
    const search = searchTerm.toLowerCase();
    return leads.filter(lead => 
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.phone?.includes(search) ||
      lead.company?.toLowerCase().includes(search)
    );
  }, [leads, searchTerm]);

  // Calculate stats
  const totalLeads = leads.length;
  const unassignedCount = getUnassignedCount();

  // Calculate days since creation
  const getDaysInStage = (lead) => {
    if (!lead.updatedAt && !lead.createdAt) return 0;
    const date = lead.updatedAt ? new Date(lead.updatedAt) : new Date(lead.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full">
      <PageHeader
        title={isSalesHead ? "Pipeline Analytics" : "Sales Pipeline"}
        description={
          isSalesHead 
            ? "Department-wide pipeline view. Read-only analytics and funnel metrics."
            : isSalesLead
            ? "Team pipeline view. Track team leads across pipeline stages."
            : "Your assigned leads pipeline. View leads across pipeline stages."
        }
        actions={
          <>
            {!isSalesHead && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
                Add Lead
          </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-card p-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-10 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <Button variant="ghost" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-textMuted">Loading pipeline...</p>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
        <div className="inline-flex gap-3">
            {pipelineStages.map((stage) => {
              const allStageLeads = getLeadsByStage(stage.id);
              const stageLeads = allStageLeads.filter(lead => 
                filteredLeads.some(f => f.id === lead.id)
              );

              return (
            <div 
              key={stage.id} 
              className="flex-shrink-0 w-[240px] min-w-[240px] rounded-xl border border-brintelli-border bg-brintelli-card shadow-soft"
            >
              {/* Column Header */}
              <div className="sticky top-0 z-10 rounded-t-xl border-b border-brintelli-border bg-brintelli-baseAlt p-3">
                    <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-sm text-text">{stage.name}</h3>
                  </div>
                  <span className="rounded-full bg-brintelli-card px-2 py-0.5 text-xs font-semibold text-text">
                        {stageLeads.length}
                  </span>
                </div>
                    <p className="text-xs text-textMuted mt-0.5">{stage.description}</p>
              </div>

                  {/* Column Body - Lead Cards */}
              <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                    {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                        className="group rounded-lg border border-brintelli-border/40 bg-white/50 p-2 transition-all hover:border-brand-300/60 hover:bg-white/80"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-text/80 truncate">
                              {lead.name || "Unnamed Lead"}
                        </h4>
                            {lead.phone && (
                              <div className="flex items-center gap-1 mt-0.5">
                                  <Phone className="h-2.5 w-2.5 text-textMuted/60" />
                                  <span className="text-[10px] text-textMuted/70 truncate">{lead.phone}</span>
                              </div>
                            )}
                      </div>
                    </div>

                        {lead.company && (
                          <div className="mb-1 flex items-center gap-1">
                            <Building2 className="h-2.5 w-2.5 text-textMuted/60" />
                            <span className="text-[10px] text-textMuted/70 truncate">{lead.company}</span>
                      </div>
                        )}

                        {lead.value && (
                    <div className="flex items-center gap-1 pt-1 border-t border-brintelli-border/30">
                        <DollarSign className="h-2.5 w-2.5 text-green-500/70" />
                              <span className="font-medium text-[10px] text-text/70">{lead.value}</span>
                          </div>
                        )}

                        {/* Move to Dump Button - Available from all stages */}
                        {!isSalesHead && stage.id !== 'lead_dump' && (
                          <div className="mt-1.5 pt-1.5 border-t border-brintelli-border/30">
                            <button
                              onClick={() => handleStageUpdate(lead.id, 'lead_dump')}
                              className="w-full flex items-center justify-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition bg-red-500/80 text-white hover:bg-red-500"
                              title="Move to Lead Dump"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              Move to Dump
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="text-center py-8 text-textMuted text-sm">
                        No leads in this stage
                      </div>
                    )}
                  </div>
              </div>
              );
            })}
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipeline;
