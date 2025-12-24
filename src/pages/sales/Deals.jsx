import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Handshake, TrendingUp, DollarSign, Clock, Search, RefreshCw, Award, Star, Percent, FileCheck, FileText, Download, CreditCard } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { leadAPI } from "../../api/lead";
import { offerAPI } from "../../api/offer";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * DEALS PAGE
 * 
 * Shows leads that have completed assessments and have offers with scholarships
 * Leads move here after assessment completion (pipelineStage: 'offer')
 * 
 * RBAC: Sales Agent, Lead, and Head (all sales roles can view deals)
 * 
 * ABAC (Attribute-Based Access Control):
 * - Sales Agent: Only their assigned leads
 * - Sales Lead: Team's deals
 * - Sales Head: All department deals
 */
const SalesDeals = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [deals, setDeals] = useState([]);
  const [offers, setOffers] = useState({}); // Map of leadId -> offer
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentStatus: 'PENDING',
    paymentAmount: '',
    paymentDate: '',
    paymentMethod: '',
  });
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const isSalesLead = currentUser?.role === 'sales_lead';
  const isSalesHead = currentUser?.role === 'sales_head' || currentUser?.role === 'sales_admin';
  const userEmail = currentUser?.email;

  // Fetch deals (leads with completed assessments in offer stage)
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const [leadsResponse, offersResponse] = await Promise.all([
          leadAPI.getAllLeads(),
          offerAPI.getAllOffers(),
        ]);
        
        if (leadsResponse.success && leadsResponse.data.leads) {
          // Filter for leads in offer stage with completed assessments
          let filteredDeals = leadsResponse.data.leads.filter(lead => 
            (lead.pipelineStage === 'offer' || lead.pipelineStage === 'deal_negotiation') &&
            lead.assessmentCompleted &&
            lead.assessmentScore !== null
          );

          // ABAC: Sales Agent - Only their assigned leads
          if (isSalesAgent && userEmail) {
            filteredDeals = filteredDeals.filter(deal => deal.assignedTo === userEmail);
          }

          setDeals(filteredDeals);

          // Map offers by leadId
          if (offersResponse.success && offersResponse.data.offers) {
            const offersMap = {};
            offersResponse.data.offers.forEach(offer => {
              if (offer.leadId) {
                offersMap[offer.leadId] = offer;
              }
            });
            setOffers(offersMap);
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast.error('Failed to load deals');
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      return; // Wait for user to load
    }

    fetchDeals();
  }, [isSalesAgent, isSalesLead, isSalesHead, userEmail]);

  // Filter deals by search term
  const filteredDeals = deals.filter(deal => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      deal.name?.toLowerCase().includes(search) ||
      deal.email?.toLowerCase().includes(search) ||
      deal.company?.toLowerCase().includes(search)
    );
  });

  // Calculate stats
  const totalDeals = filteredDeals.length;
  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const avgScore = filteredDeals.length > 0
    ? Math.round(filteredDeals.reduce((sum, deal) => sum + (deal.assessmentScore || 0), 0) / filteredDeals.length)
    : 0;
  const withScholarship = filteredDeals.filter(deal => deal.scholarship).length;

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + itemsPerPage);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [leadsResponse, offersResponse] = await Promise.all([
        leadAPI.getAllLeads(),
        offerAPI.getAllOffers(),
      ]);
      
      if (leadsResponse.success && leadsResponse.data.leads) {
        let filteredDeals = leadsResponse.data.leads.filter(lead => 
          (lead.pipelineStage === 'offer' || lead.pipelineStage === 'deal_negotiation') &&
          lead.assessmentCompleted &&
          lead.assessmentScore !== null
        );
        if (isSalesAgent && userEmail) {
          filteredDeals = filteredDeals.filter(deal => deal.assignedTo === userEmail);
        }
        setDeals(filteredDeals);

        // Map offers by leadId
        if (offersResponse.success && offersResponse.data.offers) {
          const offersMap = {};
          offersResponse.data.offers.forEach(offer => {
            if (offer.leadId) {
              offersMap[offer.leadId] = offer;
            }
          });
          setOffers(offersMap);
        }
      }
    } catch (error) {
      console.error('Error refreshing deals:', error);
      toast.error('Failed to refresh deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (offerId) => {
    try {
      await offerAPI.downloadOfferPDF(offerId);
      toast.success('Offer PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedDeal || !offers[selectedDeal.id]) {
      toast.error('No offer found for this deal');
      return;
    }

    try {
      setUpdatingPayment(true);
      const response = await offerAPI.updatePaymentStatus(offers[selectedDeal.id].id, paymentData);
      
      if (response.success) {
        toast.success('Payment status updated successfully');
        setShowPaymentModal(false);
        handleRefresh();
      } else {
        throw new Error(response.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.message || 'Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PARTIAL: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700',
      REFUNDED: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.PENDING;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getLevelBadge = (level) => {
    const colors = {
      advanced: 'bg-purple-100 text-purple-700',
      intermediate: 'bg-blue-100 text-blue-700',
      beginner: 'bg-gray-100 text-gray-700',
    };
    return colors[level] || colors.beginner;
  };

  return (
    <>
      <PageHeader
        title="Active Deals"
        description="Track and manage leads with completed assessments and scholarship offers."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <StatsCard 
          icon={Handshake} 
          value={totalDeals} 
          label="Active Deals" 
          trend={`${totalDeals} leads with offers`} 
        />
        <StatsCard 
          icon={DollarSign} 
          value={`₹${(totalValue / 1000).toFixed(0)}K`} 
          label="Total Value" 
          trend="Pipeline value" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={`${avgScore}%`} 
          label="Avg Score" 
          trend="Average assessment score" 
        />
        <StatsCard 
          icon={Award} 
          value={withScholarship} 
          label="With Scholarship" 
          trend={`${totalDeals > 0 ? Math.round((withScholarship / totalDeals) * 100) : 0}% of deals`} 
        />
      </div>

      {/* Deals Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search deals..."
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
            <span className="ml-3 text-textMuted">Loading deals...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Assessment Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Scholarship</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Payment Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {paginatedDeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-textMuted">
                    {searchTerm ? "No deals match your search." : "No active deals found. Complete assessments to see deals here."}
                  </td>
                </tr>
              ) : (
                paginatedDeals.map((deal) => {
                  const offer = offers[deal.id];
                  const hasOffer = !!offer;
                  
                  return (
                    <tr key={deal.id} className="transition hover:bg-brintelli-baseAlt">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{deal.name}</p>
                        <p className="text-xs text-textMuted">{deal.email}</p>
                        {deal.company && (
                          <p className="text-xs text-textMuted">{deal.company}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {deal.assessmentScore !== null ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(deal.assessmentScore)}`}>
                              <FileCheck className="h-3.5 w-3.5" />
                              {deal.assessmentScore}%
                            </span>
                            {deal.assessmentMarks && (
                              <span className="text-xs text-textMuted">
                                ({deal.assessmentMarks.obtained}/{deal.assessmentMarks.total})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-textMuted italic">No score</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {deal.assessmentMarks?.level ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold capitalize ${getLevelBadge(deal.assessmentMarks.level)}`}>
                            <Star className="h-3 w-3" />
                            {deal.assessmentMarks.level}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {offer?.scholarshipApplied ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                            <Award className="h-3 w-3" />
                            Scholarship Applied
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">No scholarship</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {hasOffer && offer.paymentStatus ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusBadge(offer.paymentStatus)}`}>
                            <CreditCard className="h-3 w-3" />
                            {offer.paymentStatus}
                            {offer.paymentAmount > 0 && (
                              <span className="ml-1">(₹{offer.paymentAmount.toLocaleString()})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                          {deal.pipelineStage === 'deal_negotiation' ? 'Negotiation' : 'Offer'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasOffer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(offer.id)}
                              title="Download Offer PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDeal(deal);
                              if (hasOffer) {
                                setPaymentData({
                                  paymentStatus: offer.paymentStatus || 'PENDING',
                                  paymentAmount: offer.paymentAmount || '',
                                  paymentDate: offer.paymentDate ? new Date(offer.paymentDate).toISOString().split('T')[0] : '',
                                  paymentMethod: offer.paymentMethod || '',
                                });
                                setShowPaymentModal(true);
                              } else {
                                toast.info('No offer found for this deal');
                              }
                            }}
                            title="Update Payment Status"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
      </div>

      {/* Payment Status Modal */}
      {showPaymentModal && selectedDeal && offers[selectedDeal.id] && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedDeal(null);
            setPaymentData({
              paymentStatus: 'PENDING',
              paymentAmount: '',
              paymentDate: '',
              paymentMethod: '',
            });
          }}
          title="Update Payment Status"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Status
              </label>
              <select
                value={paymentData.paymentStatus}
                onChange={(e) => setPaymentData({ ...paymentData, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                value={paymentData.paymentAmount}
                onChange={(e) => setPaymentData({ ...paymentData, paymentAmount: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Enter payment amount"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select method</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="primary"
                onClick={handleUpdatePayment}
                disabled={updatingPayment}
                className="flex-1"
              >
                {updatingPayment ? 'Updating...' : 'Update Payment Status'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedDeal(null);
                }}
                disabled={updatingPayment}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SalesDeals;
