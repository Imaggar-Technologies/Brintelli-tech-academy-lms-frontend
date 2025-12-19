import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Target, Search, Filter, BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * LEADS OVERVIEW PAGE
 * 
 * WORKFLOW: Department-level monitoring (read-only)
 * 
 * RBAC: Only Sales Head/Admin can access (requires sales:head:view)
 * 
 * ABAC: All department leads (read-only view, no filtering)
 * 
 * BUSINESS LOGIC:
 * - Read-only view of all department leads
 * - Department-wide analytics and metrics
 * - No actions allowed (read-only)
 */

const LeadsOverview = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeLeads: 0,
    unassignedLeads: 0,
    conversionRate: 0,
  });

  // Fetch all department leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        if (response.success && response.data.leads) {
          const allLeads = response.data.leads;
          setLeads(allLeads);
          
          // Calculate metrics
          setMetrics({
            totalLeads: allLeads.length,
            activeLeads: allLeads.filter(l => l.pipelineStage !== 'unassigned' && l.pipelineStage !== 'primary_screening').length,
            unassignedLeads: allLeads.filter(l => !l.assignedTo || l.assignedTo === '').length,
            conversionRate: allLeads.length > 0 
              ? ((allLeads.filter(l => l.pipelineStage === 'onboarded_to_lsm').length / allLeads.length) * 100).toFixed(1)
              : 0,
          });
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

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

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <PageHeader
        title="Leads Overview"
        description="Department-wide leads monitoring and analytics. Read-only view."
        actions={
          <Button variant="secondary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatsCard 
          icon={Target} 
          value={metrics.totalLeads} 
          label="Total Leads" 
          trend="All time" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={metrics.activeLeads} 
          label="Active Leads" 
          trend="In pipeline" 
        />
        <StatsCard 
          icon={Users} 
          value={metrics.unassignedLeads} 
          label="Unassigned" 
          trend="Need assignment" 
        />
        <StatsCard 
          icon={BarChart3} 
          value={`${metrics.conversionRate}%`} 
          label="Conversion Rate" 
          trend="Lead to Student" 
        />
      </div>

      {/* Search and Filters */}
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

      {/* Leads Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-textMuted">Loading leads...</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-textMuted">
                      {searchTerm ? "No leads match your search" : "No leads found"}
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-brintelli-baseAlt transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-text">{lead.name || "Unnamed"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textMuted">{lead.email || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textMuted">{lead.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.pipelineStage || "unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textMuted">{lead.assignedTo || "Unassigned"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textMuted">{lead.source || "-"}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
    </>
  );
};

export default LeadsOverview;

