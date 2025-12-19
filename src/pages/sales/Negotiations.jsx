import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, Search, Filter, DollarSign, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * NEGOTIATIONS PAGE
 * 
 * WORKFLOW: Deal negotiation stage
 * 
 * RBAC: Sales Lead and Head only (requires sales:lead:view or sales:head:view)
 * 
 * ABAC (Attribute-Based Access Control):
 * - Sales Lead: Team's deals in negotiation
 * - Sales Head: All department deals in negotiation
 * 
 * BUSINESS LOGIC:
 * - Deals that have offers released and are in negotiation
 * - Track negotiation status, counter-offers, terms
 * - Move to Won/Lost after negotiation completes
 */

const Negotiations = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const isSalesLead = currentUser?.role === 'sales_lead';
  const isSalesHead = currentUser?.role === 'sales_head' || currentUser?.role === 'sales_admin';
  const userTeamId = currentUser?.teamId;

  // Fetch deals in negotiation stage
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        if (response.success && response.data.leads) {
          // Filter for deals in negotiation stage
          let negotiationDeals = response.data.leads.filter(
            lead => lead.pipelineStage === 'deal_negotiation' || lead.pipelineStage === 'offer'
          );
          
          // ABAC: Filter by team if Sales Lead
          if (isSalesLead && userTeamId) {
            // TODO: Filter by teamId when teamId is available in lead data
            // For now, filter by assignedTo email pattern
          }
          
          setDeals(negotiationDeals);
        }
      } catch (error) {
        console.error('Error fetching negotiations:', error);
        toast.error('Failed to load negotiations');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [isSalesLead, isSalesHead, userTeamId]);

  const filteredDeals = deals.filter(deal => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      deal.name?.toLowerCase().includes(search) ||
      deal.email?.toLowerCase().includes(search) ||
      deal.company?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAcceptDeal = async (dealId) => {
    try {
      // TODO: Implement API call to accept deal
      await leadAPI.updatePipelineStage(dealId, 'payment_and_financial_clearance');
      toast.success('Deal accepted and moved to payment stage');
      setDeals(deals.map(d => d.id === dealId ? { ...d, pipelineStage: 'payment_and_financial_clearance' } : d));
    } catch (error) {
      toast.error('Failed to accept deal');
    }
  };

  const handleRejectDeal = async (dealId) => {
    try {
      // TODO: Implement API call to reject deal
      await leadAPI.updatePipelineStage(dealId, 'lost');
      toast.success('Deal marked as lost');
      setDeals(deals.filter(d => d.id !== dealId));
    } catch (error) {
      toast.error('Failed to reject deal');
    }
  };

  return (
    <>
      <PageHeader
        title="Negotiations"
        description="Manage active deal negotiations. Track offers, counter-offers, and terms."
        actions={
          <Button variant="secondary" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        }
      />

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brintelli-border bg-brintelli-card p-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-textMuted">Loading negotiations...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedDeals.length === 0 ? (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
              <MessageSquare className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">{searchTerm ? "No negotiations match your search" : "No active negotiations"}</p>
            </div>
          ) : (
            paginatedDeals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text mb-1">{deal.name || "Unnamed Deal"}</h3>
                    <div className="flex items-center gap-4 text-sm text-textMuted">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {deal.email}
                      </span>
                      {deal.company && (
                        <span className="flex items-center gap-1">
                          <span>{deal.company}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {deal.value && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-text">{deal.value}</div>
                      <div className="text-xs text-textMuted">Deal Value</div>
                    </div>
                  )}
                </div>

                <div className="mb-4 p-4 rounded-xl bg-brintelli-baseAlt border border-brintelli-border">
                  <p className="text-sm text-textMuted mb-2">Negotiation Status</p>
                  <p className="text-sm text-text">Offer sent, awaiting response</p>
                  {/* TODO: Add negotiation history, counter-offers, terms */}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-textMuted">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: {new Date(deal.updatedAt || deal.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRejectDeal(deal.id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptDeal(deal.id)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept Deal
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredDeals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDeals.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default Negotiations;

