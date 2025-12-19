import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FileCheck, Clock, CheckCircle2, AlertCircle, Search, RefreshCw, Mail, ExternalLink, Calendar } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

const Assessments = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;

  // Fetch leads in assessments stage
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        
        if (response.success && response.data.leads) {
          // Show leads in assessments stage
          let filteredLeads = response.data.leads.filter(lead => 
            lead.pipelineStage === 'assessments'
          );

          // ABAC: Sales Agent - Only their assigned leads
          if (isSalesAgent && userEmail) {
            filteredLeads = filteredLeads.filter(lead => lead.assignedTo === userEmail);
          }

          setLeads(filteredLeads);
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
        toast.error('Failed to load assessments');
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

  // Calculate stats
  const totalAssessments = filteredLeads.length;
  const pendingAssessments = filteredLeads.filter(lead => 
    lead.assessmentSent && !lead.assessmentCompleted
  ).length;
  const completedAssessments = filteredLeads.filter(lead => 
    lead.assessmentCompleted
  ).length;
  const overdueAssessments = filteredLeads.filter(lead => {
    if (!lead.assessmentSentAt) return false;
    const sentDate = new Date(lead.assessmentSentAt);
    const daysSinceSent = (new Date() - sentDate) / (1000 * 60 * 60 * 24);
    return daysSinceSent > 7 && !lead.assessmentCompleted; // Overdue if > 7 days and not completed
  }).length;

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

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

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAllLeads();
      
      if (response.success && response.data.leads) {
        let filteredLeads = response.data.leads.filter(lead => 
          lead.pipelineStage === 'assessments'
        );
        if (isSalesAgent && userEmail) {
          filteredLeads = filteredLeads.filter(lead => lead.assignedTo === userEmail);
        }
        setLeads(filteredLeads);
      }
    } catch (error) {
      console.error('Error refreshing assessments:', error);
      toast.error('Failed to refresh assessments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Manage technical assessments to screen lead knowledge (beginner/intermediate/advanced)."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <StatsCard 
          icon={FileCheck} 
          value={totalAssessments} 
          label="Total Assessments" 
          trend="All time" 
        />
        <StatsCard 
          icon={Clock} 
          value={pendingAssessments} 
          label="Pending" 
          trend="Awaiting results" 
        />
        <StatsCard 
          icon={CheckCircle2} 
          value={completedAssessments} 
          label="Completed" 
          trend="Evaluated" 
        />
        <StatsCard 
          icon={AlertCircle} 
          value={overdueAssessments} 
          label="Overdue" 
          trend="Needs attention" 
        />
      </div>

      {/* Assessments Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search assessments..."
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
            <span className="ml-3 text-textMuted">Loading assessments...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Assessment Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Link Sent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Assessment Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-textMuted">
                    {searchTerm ? "No assessments match your search." : "No assessments found. Send assessment links from the Meetings & Counselling page."}
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-brintelli-baseAlt">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text">{lead.name}</p>
                      <p className="text-xs text-textMuted">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {lead.assessmentType ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 capitalize">
                          {lead.assessmentType.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-textMuted italic">Not specified</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.assessmentSentAt ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-textMuted" />
                          <span className="text-text">{formatDate(lead.assessmentSentAt)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-textMuted italic">Not sent</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.assessmentCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </span>
                      ) : lead.assessmentSent ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                          <AlertCircle className="h-3 w-3" />
                          Not Sent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.assessmentLink ? (
                        <a
                          href={lead.assessmentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open Link
                        </a>
                      ) : (
                        <span className="text-xs text-textMuted italic">No link available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

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
      </div>
    </>
  );
};

export default Assessments;
