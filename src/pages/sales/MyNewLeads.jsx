import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Sparkles, Search, RefreshCw, Eye, Mail, Phone, FileText, Flag, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import CallNotesViewer from "../../components/CallNotesViewer";
import ViewAllCallNotesModal from "../../components/ViewAllCallNotesModal";
import Modal from "../../components/Modal";
import { leadAPI } from "../../api/lead";
import { programAPI } from "../../api/program";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * MY NEW LEADS - Sales Agent Only
 * 
 * WORKFLOW: Screening stage - validate interest and complete pre-screening
 * 
 * RBAC: Sales Agent only
 * 
 * ABAC: Only leads assigned to them in "primary_screening" stage
 * 
 * BUSINESS LOGIC:
 * - Agents see only their assigned leads
 * - Complete pre-screening to move leads to Active Leads
 * - Once pre-screening data is added, lead automatically moves to meet_and_call stage
 */

const MyNewLeads = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showViewAllCallNotesModal, setShowViewAllCallNotesModal] = useState(false);
  const [showPreScreeningModal, setShowPreScreeningModal] = useState(false);
  const [showPreScreeningViewModal, setShowPreScreeningViewModal] = useState(false);
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
      data.education?.degree,
      data.education?.field,
      data.education?.university,
      data.education?.graduationYear,
      data.education?.gpa,
      data.financial?.currentSalary,
      data.financial?.expectedSalary,
      data.financial?.canAfford,
      data.financial?.paymentMethod,
      data.financial?.financialStatus,
      data.job?.currentJob,
      data.job?.company,
      data.job?.experience,
      data.job?.position,
      data.job?.noticePeriod,
      data.social?.linkedin,
      data.social?.github,
      data.social?.portfolio,
      data.social?.twitter,
      data.social?.other,
      data.courseInterest?.primary,
      data.courseInterest?.preferredBatch,
      data.courseInterest?.startDatePreference,
      data.notes,
    ];

    const totalFields = fields.length;
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    
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
      
      // Calculate completion percentage
      const completion = calculateCompletionPercentage(preScreeningPayload);
      
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

      // Only move to active leads if pre-screening is 100% complete
      if (completion === 100 && !wasAutoMoved) {
        try {
          await leadAPI.updatePipelineStage(leadId, 'meet_and_call');
          toast.success("Pre-screening completed! Lead moved to 'Active Leads'.");
        } catch (stageError) {
          console.error('Error updating pipeline stage:', stageError);
          toast.success("Pre-screening data saved successfully");
        }
      } else if (completion === 100) {
        toast.success("Pre-screening completed! Lead moved to 'Active Leads'.");
      } else {
        toast.success(`Pre-screening data saved (${completion}% complete)`);
      }

      // Refresh leads list
      await fetchLeads();
      
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

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAllLeads();
      
      if (response.success && response.data.leads) {
        // ABAC: Sales Agent - Only leads assigned to them in primary_screening stage
        const filteredLeads = response.data.leads.filter(lead => 
          lead.assignedTo === userEmail && 
          lead.pipelineStage === 'primary_screening'
        );
        
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

  useEffect(() => {
    if (isSalesAgent && userEmail) {
      fetchLeads();
    }
  }, [isSalesAgent, userEmail]);

  // Sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-textMuted" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-brand" />
      : <ArrowDown className="h-3.5 w-3.5 text-brand" />;
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

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const newLeadsCount = leads.length;
  const withPreScreening = leads.filter(l => l.preScreening).length;

  return (
    <>
      <PageHeader
        title="My New Leads"
        description="Leads in screening stage assigned to you - validate interest and complete pre-screening to move to Active Leads."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatsCard 
          icon={Sparkles} 
          value={newLeadsCount} 
          label="My New Leads" 
          trend="Assigned to me" 
        />
        <StatsCard 
          icon={FileText} 
          value={withPreScreening} 
          label="With Pre-Screening" 
          trend="Started screening" 
        />
        <StatsCard 
          icon={Flag} 
          value={leads.filter(l => l.flag).length} 
          label="Flagged Leads" 
          trend="Requires attention" 
        />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="flex items-center justify-between border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">My New Leads</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-brand" />
            <span className="ml-3 text-textMuted">Loading leads...</span>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
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
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Pre-Screening</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Sparkles className="h-12 w-12 text-textMuted mb-4" />
                        <p className="text-text font-medium mb-1">
                          {searchTerm ? "No leads match your search" : "No new leads assigned"}
                        </p>
                        <p className="text-sm text-textMuted">
                          {searchTerm ? "Try adjusting your search criteria" : "New leads assigned to you will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const leadId = lead.id || lead._id;
                    const completion = calculateCompletionPercentage(lead.preScreening);
                    return (
                      <tr 
                        key={leadId} 
                        className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40"
                      >
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
                          {lead.preScreening ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-brand via-brand-dark to-brand transition-all duration-300"
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-text">{completion}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-textMuted">Not started</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 w-fit">
                              Primary Screening
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
                          <Button 
                            variant="secondary"
                            size="sm" 
                            className="gap-1.5"
                            onClick={() => handlePreScreening(lead)}
                          >
                            <FileText className="h-4 w-4" />
                            {lead.preScreening ? "Edit Pre-Screening" : "Pre-Screening"}
                          </Button>
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeads.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Pre-Screening Modal */}
      {showPreScreeningModal && selectedLead && (
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

      {/* View All Call Notes Modal */}
      <ViewAllCallNotesModal
        isOpen={showViewAllCallNotesModal}
        onClose={() => {
          setShowViewAllCallNotesModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
      />
    </>
  );
};

export default MyNewLeads;

