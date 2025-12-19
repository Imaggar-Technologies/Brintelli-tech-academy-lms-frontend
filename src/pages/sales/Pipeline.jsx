import { useState, useEffect } from "react";
import { Target, Filter, Search, Plus, User, DollarSign, Calendar, GraduationCap, MoreVertical, BookOpen, Phone, Mail, Building2 } from "lucide-react";
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
      id: "program_manager_interview",
      name: "Program Manager Interview", 
      color: "bg-teal-500",
      description: "Final interview with program manager"
    },
    { 
      id: "offer",
      name: "Offer", 
      color: "bg-yellow-500",
      description: "Offer released to candidate"
    },
    { 
      id: "deal_negotiation",
      name: "Deal Negotiation", 
      color: "bg-amber-500",
      description: "Deal can be negotiated with offers"
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
  ];

  // Fetch leads from database with ABAC filtering
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        if (response.success && response.data.leads) {
          let fetchedLeads = response.data.leads;
          
          // ABAC: Filter leads based on role
          if (isSalesAgent && userEmail) {
            // Sales Agent: Only own leads
            fetchedLeads = fetchedLeads.filter(lead => lead.assignedTo === userEmail);
          } else if (isSalesLead) {
            // Sales Lead: Team leads (leads assigned to team members)
            const teamEmails = salesTeam.map(member => member.email);
            fetchedLeads = fetchedLeads.filter(lead => 
              !lead.assignedTo || lead.assignedTo === '' || teamEmails.includes(lead.assignedTo)
            );
          } else if (isSalesHead) {
            // Sales Head: All department leads (no filtering - read-only view)
            // All leads are visible for analytics
          }
          
          setLeads(fetchedLeads);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      return; // Wait for user to load
    }

    fetchLeads();
  }, [isSalesAgent, isSalesLead, isSalesHead, userEmail, salesTeam]);

  // Group leads by pipeline stage
  const getLeadsByStage = (stageId) => {
    if (stageId === 'unassigned') {
      // For sales agents, they won't see unassigned leads (they only see their own)
      if (isSalesAgent) {
        return [];
      }
      // Show unassigned leads in all stages
      return leads.filter(lead => !lead.assignedTo || lead.assignedTo === '');
    }
    return leads.filter(lead => {
      const stage = lead.pipelineStage || 'primary_screening';
      return stage === stageId;
    });
  };

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

  // Filter leads by search term
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
    <>
      <PageHeader
        title={isSalesHead ? "Pipeline Analytics" : "Sales Pipeline"}
        description={
          isSalesHead 
            ? "Department-wide pipeline view. Read-only analytics and funnel metrics."
            : isSalesLead
            ? "Team pipeline view. Track team leads and use batch operations to move multiple leads."
            : "Your assigned leads pipeline. Move individual leads between stages."
        }
        actions={
          <>
            {isSalesLead && selectedLeads.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-textMuted">{selectedLeads.length} selected</span>
                <Button variant="secondary" size="sm" className="gap-2">
                  Batch Move
                </Button>
              </div>
            )}
            {!isSalesHead && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
                Add Lead
          </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brintelli-border bg-brintelli-card p-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
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
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
            {pipelineStages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id).filter(lead => 
                filteredLeads.some(f => f.id === lead.id)
              );

              return (
            <div 
              key={stage.id} 
              className="flex-shrink-0 w-80 rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft"
            >
              {/* Column Header */}
              <div className="sticky top-0 z-10 rounded-t-2xl border-b border-brintelli-border bg-brintelli-baseAlt p-4">
                    <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <h3 className="font-semibold text-text">{stage.name}</h3>
                  </div>
                  <span className="rounded-full bg-brintelli-card px-2.5 py-1 text-xs font-semibold text-text">
                        {stageLeads.length}
                  </span>
                </div>
                    <p className="text-xs text-textMuted mt-1">{stage.description}</p>
              </div>

                  {/* Column Body - Lead Cards */}
              <div className="p-3 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                        className="group rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4 transition-all hover:border-brand-500 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text group-hover:text-brand-600 transition">
                              {lead.name || "Unnamed Lead"}
                        </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {lead.phone && (
                                <>
                                  <span className="text-xs text-textMuted flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {lead.phone}
                                  </span>
                                </>
                              )}
                              {lead.email && (
                                <>
                          <span className="text-xs text-textMuted">•</span>
                                  <span className="text-xs text-textMuted flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {lead.email}
                                  </span>
                                </>
                              )}
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-brintelli-border rounded">
                        <MoreVertical className="h-4 w-4 text-textMuted" />
                      </button>
                    </div>

                        {lead.company && (
                          <div className="mb-2 flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-textMuted" />
                            <span className="text-sm text-textMuted">{lead.company}</span>
                      </div>
                        )}

                        <div className="mb-3 space-y-1">
                          {lead.source && (
                      <div className="flex items-center gap-2">
                              <span className="text-xs text-textMuted">Source:</span>
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                {lead.source}
                        </span>
                            </div>
                          )}
                          {lead.assignedTo && (
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-textMuted" />
                              <span className="text-xs text-textMuted">{getAssignedName(lead.assignedTo)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-textMuted">{getDaysInStage(lead)} days in stage</span>
                      </div>
                    </div>

                        {lead.value && (
                    <div className="flex items-center justify-between pt-2 border-t border-brintelli-border">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                              <span className="font-semibold text-text text-sm">{lead.value}</span>
                            </div>
                          </div>
                        )}

                        {/* Stage Navigation Buttons - Role-based */}
                        {!isSalesHead && (
                          <div className="mt-3 pt-3 border-t border-brintelli-border">
                            <div className="flex gap-1">
                              {pipelineStages.map((nextStage) => {
                                if (nextStage.id === stage.id) return null;
                                const isNext = pipelineStages.findIndex(s => s.id === stage.id) + 1 === pipelineStages.findIndex(s => s.id === nextStage.id);
                                const isPrev = pipelineStages.findIndex(s => s.id === stage.id) - 1 === pipelineStages.findIndex(s => s.id === nextStage.id);
                                
                                if (!isNext && !isPrev) return null;

                                return (
                                  <button
                                    key={nextStage.id}
                                    onClick={() => handleStageUpdate(lead.id, nextStage.id)}
                                    className={`flex-1 text-xs px-2 py-1 rounded-lg transition ${
                                      isNext
                                        ? 'bg-brand-500 text-white hover:bg-brand-600'
                                        : 'bg-brintelli-border text-textMuted hover:bg-brintelli-base'
                                    }`}
                                    title={`Move to ${nextStage.name}`}
                                  >
                                    {isNext ? '→' : '←'} {isNext ? 'Next' : 'Prev'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Selection checkbox for batch operations (Sales Lead only) */}
                        {isSalesLead && (
                          <div className="mt-2 pt-2 border-t border-brintelli-border">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(lead.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeads([...selectedLeads, lead.id]);
                                  } else {
                                    setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                  }
                                }}
                                className="rounded border-brintelli-border text-brand focus:ring-brand"
                              />
                              <span className="text-xs text-textMuted">Select for batch move</span>
                            </label>
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
    </>
  );
};

export default SalesPipeline;
