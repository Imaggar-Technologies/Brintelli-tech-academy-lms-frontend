import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Gift, Send, CheckCircle, XCircle, Search, RefreshCw, FileText, User, Mail, Phone, MoreVertical, Clock, DollarSign } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import ReleaseOfferModal from "../../components/ReleaseOfferModal";
import ApplyScholarshipModal from "../../components/ApplyScholarshipModal";
import { leadAPI } from "../../api/lead";
import { scholarshipAPI } from "../../api/scholarship";
import { offerAPI } from "../../api/offer";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

const ScholarshipAndOffers = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [scholarships, setScholarships] = useState({}); // Map of leadId -> scholarship
  const [offers, setOffers] = useState({}); // Map of leadId -> offer

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const isSalesLead = currentUser?.role === 'sales_lead';
  const isAccountant = currentUser?.role === 'accountant' || currentUser?.role === 'finance';
  const userEmail = currentUser?.email;

  // Fetch completed assessments with scholarships and offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsResponse, scholarshipsResponse, offersResponse] = await Promise.all([
          leadAPI.getAllLeads(),
          scholarshipAPI.getAllScholarships().catch(() => ({ success: false, data: { scholarshipRequests: [] } })),
          offerAPI.getAllOffers().catch(() => ({ success: false, data: { offers: [] } }))
        ]);
        
        if (leadsResponse.success && leadsResponse.data.leads) {
          // Filter only completed assessments BUT exclude those with offers sent (they go to Deals page)
          let filteredLeads = leadsResponse.data.leads.filter(lead => 
            (lead.assessmentCompleted || lead.assessmentResult) &&
            // Exclude leads that have offers sent - they should be in Deals page
            !lead.offerReleased
          );

          // ABAC: Sales Agent - Only their assigned leads
          if (isSalesAgent && userEmail) {
            filteredLeads = filteredLeads.filter(lead => 
              lead.assignedTo === userEmail || 
              lead.assessmentAssignedTo === userEmail
            );
          }

          // After mapping offers, filter out leads that have OFFER_SENT status
          // We'll do this after offers are mapped
          setLeads(filteredLeads);

          // Map scholarships by leadId and email
          if (scholarshipsResponse.success && scholarshipsResponse.data.scholarshipRequests) {
            const scholarshipsMap = {};
            const scholarshipsByEmail = {};
            
            console.log('ScholarshipAndOffers - Raw scholarships:', scholarshipsResponse.data.scholarshipRequests);
            
            scholarshipsResponse.data.scholarshipRequests.forEach(scholarship => {
              // Handle leadId in various formats
              let leadId = null;
              
              // Check if leadId is an object with $oid (MongoDB format)
              if (scholarship.leadId) {
                if (typeof scholarship.leadId === 'object' && scholarship.leadId.$oid) {
                  leadId = String(scholarship.leadId.$oid);
                } else if (typeof scholarship.leadId === 'object' && scholarship.leadId.toString) {
                  leadId = String(scholarship.leadId.toString());
                } else {
                  leadId = String(scholarship.leadId);
                }
              }
              
              // Also check lead.id and lead._id
              if (scholarship.lead?.id) {
                const leadIdFromLead = typeof scholarship.lead.id === 'object' && scholarship.lead.id.$oid
                  ? String(scholarship.lead.id.$oid)
                  : String(scholarship.lead.id);
                if (!leadId) leadId = leadIdFromLead;
                scholarshipsMap[leadIdFromLead] = scholarship;
              }
              if (scholarship.lead?._id) {
                const leadIdFromLead = typeof scholarship.lead._id === 'object' && scholarship.lead._id.$oid
                  ? String(scholarship.lead._id.$oid)
                  : String(scholarship.lead._id);
                if (!leadId) leadId = leadIdFromLead;
                scholarshipsMap[leadIdFromLead] = scholarship;
              }
              
              // Store by leadId (try all possible formats)
              if (leadId) {
                scholarshipsMap[leadId] = scholarship;
                // Also try without string conversion in case it's already a string
                if (typeof leadId === 'string') {
                  scholarshipsMap[leadId] = scholarship;
                }
              }
              
              // Also store by email for fallback matching
              if (scholarship.lead?.email) {
                scholarshipsByEmail[scholarship.lead.email.toLowerCase()] = scholarship;
              }
            });
            
            console.log('ScholarshipAndOffers - Mapped scholarships:', scholarshipsMap);
            console.log('ScholarshipAndOffers - Scholarships by email:', scholarshipsByEmail);
            
            setScholarships({ ...scholarshipsMap, _byEmail: scholarshipsByEmail });
          }

          // Map offers by leadId and email
          if (offersResponse.success && offersResponse.data.offers) {
            const offersMap = {};
            const offersByEmail = {};
            
            offersResponse.data.offers.forEach(offer => {
              let leadId = null;
              
              // Handle leadId in various formats
              if (offer.leadId) {
                if (typeof offer.leadId === 'object' && offer.leadId.$oid) {
                  leadId = String(offer.leadId.$oid);
                } else if (typeof offer.leadId === 'object' && offer.leadId.toString) {
                  leadId = String(offer.leadId.toString());
                } else {
                  leadId = String(offer.leadId);
                }
              }
              
              // Also check lead.id and lead._id
              if (offer.lead?.id) {
                const leadIdFromLead = typeof offer.lead.id === 'object' && offer.lead.id.$oid
                  ? String(offer.lead.id.$oid)
                  : String(offer.lead.id);
                if (!leadId) leadId = leadIdFromLead;
                offersMap[leadIdFromLead] = offer;
              }
              if (offer.lead?._id) {
                const leadIdFromLead = typeof offer.lead._id === 'object' && offer.lead._id.$oid
                  ? String(offer.lead._id.$oid)
                  : String(offer.lead._id);
                if (!leadId) leadId = leadIdFromLead;
                offersMap[leadIdFromLead] = offer;
              }
              
              // Store by leadId
              if (leadId) {
                offersMap[leadId] = offer;
              }
              
              // Also store by email for fallback matching
              if (offer.lead?.email) {
                offersByEmail[offer.lead.email.toLowerCase()] = offer;
              }
            });
            
            setOffers({ ...offersMap, _byEmail: offersByEmail });
          }
          
          // After mapping offers, filter out leads that have offers with OFFER_SENT status (they should be in Deals page)
          if (offersResponse.success && offersResponse.data.offers) {
            filteredLeads = filteredLeads.filter(lead => {
              const leadId = String(lead.id || lead._id || '');
              // Check if this lead has an offer with OFFER_SENT status
              const offer = offersResponse.data.offers.find(o => {
                const offerLeadId = String(o.leadId || o.lead?.id || o.lead?._id || '');
                return offerLeadId === leadId || 
                       offerLeadId === String(lead.id) || 
                       offerLeadId === String(lead._id) ||
                       (lead.email && o.lead?.email && o.lead.email.toLowerCase() === lead.email.toLowerCase());
              });
              // Exclude if offer is sent - those go to Deals page
              return !offer || offer.status !== 'OFFER_SENT';
            });
          }
          
          setLeads(filteredLeads);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      return; // Wait for user to load
    }

    fetchData();
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

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const totalCompleted = leads.length;
  const withScholarship = leads.filter(lead => {
    const leadId = String(lead.id || lead._id || '');
    return scholarships[leadId] || scholarships[lead.id] || scholarships[lead._id];
  }).length;
  const withOffers = leads.filter(lead => {
    const leadId = String(lead.id || lead._id || '');
    return offers[leadId] || offers[lead.id] || offers[lead._id];
  }).length;
  const approvedScholarships = leads.filter(lead => {
    const leadId = String(lead.id || lead._id || '');
    const scholarship = scholarships[leadId] || scholarships[lead.id] || scholarships[lead._id];
    const offer = offers[leadId] || offers[lead.id] || offers[lead._id];
    // Check if scholarship is approved OR if offer has PENDING_SCHOLARSHIP with discounted price
    return scholarship?.status === 'APPROVED' || 
           (offer && offer.status === 'PENDING_SCHOLARSHIP' && offer.offeredPrice && offer.basePrice && 
            offer.offeredPrice < offer.basePrice && offer.scholarshipApplied);
  }).length;

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [leadsResponse, scholarshipsResponse, offersResponse] = await Promise.all([
        leadAPI.getAllLeads(),
        scholarshipAPI.getAllScholarships().catch(() => ({ success: false, data: { scholarshipRequests: [] } })),
        offerAPI.getAllOffers().catch(() => ({ success: false, data: { offers: [] } }))
      ]);
      
        if (leadsResponse.success && leadsResponse.data.leads) {
          let filteredLeads = leadsResponse.data.leads.filter(lead => 
            (lead.assessmentCompleted || lead.assessmentResult) &&
            // Exclude leads that have offers sent - they should be in Deals page
            !lead.offerReleased
          );
          if (isSalesAgent && userEmail) {
            filteredLeads = filteredLeads.filter(lead => 
              lead.assignedTo === userEmail || 
              lead.assessmentAssignedTo === userEmail
            );
          }
          
          // After mapping offers, filter out leads that have OFFER_SENT status
          // We'll do this after offers are mapped
          setLeads(filteredLeads);

        if (scholarshipsResponse.success && scholarshipsResponse.data.scholarshipRequests) {
          const scholarshipsMap = {};
          const scholarshipsByEmail = {};
          
            scholarshipsResponse.data.scholarshipRequests.forEach(scholarship => {
              // Handle leadId in various formats
              let leadId = null;
              
              // Check if leadId is an object with $oid (MongoDB format)
              if (scholarship.leadId) {
                if (typeof scholarship.leadId === 'object' && scholarship.leadId.$oid) {
                  leadId = String(scholarship.leadId.$oid);
                } else if (typeof scholarship.leadId === 'object' && scholarship.leadId.toString) {
                  leadId = String(scholarship.leadId.toString());
                } else {
                  leadId = String(scholarship.leadId);
                }
              }
              
              // Also check lead.id and lead._id
              if (scholarship.lead?.id) {
                const leadIdFromLead = typeof scholarship.lead.id === 'object' && scholarship.lead.id.$oid
                  ? String(scholarship.lead.id.$oid)
                  : String(scholarship.lead.id);
                if (!leadId) leadId = leadIdFromLead;
                scholarshipsMap[leadIdFromLead] = scholarship;
              }
              if (scholarship.lead?._id) {
                const leadIdFromLead = typeof scholarship.lead._id === 'object' && scholarship.lead._id.$oid
                  ? String(scholarship.lead._id.$oid)
                  : String(scholarship.lead._id);
                if (!leadId) leadId = leadIdFromLead;
                scholarshipsMap[leadIdFromLead] = scholarship;
              }
              
              // Store by leadId
              if (leadId) {
                scholarshipsMap[leadId] = scholarship;
              }
              
              // Also store by offerId (scholarships are linked to offers)
              if (scholarship.offerId) {
                let offerId = null;
                if (typeof scholarship.offerId === 'object' && scholarship.offerId.$oid) {
                  offerId = String(scholarship.offerId.$oid);
                } else if (typeof scholarship.offerId === 'object' && scholarship.offerId.toString) {
                  offerId = String(scholarship.offerId.toString());
                } else {
                  offerId = String(scholarship.offerId);
                }
                if (offerId) {
                  scholarshipsMap[`offer_${offerId}`] = scholarship;
                }
              }
              
              // Also store by email for fallback matching
              if (scholarship.lead?.email) {
                scholarshipsByEmail[scholarship.lead.email.toLowerCase()] = scholarship;
              }
            });
          
          setScholarships({ ...scholarshipsMap, _byEmail: scholarshipsByEmail });
        }

        if (offersResponse.success && offersResponse.data.offers) {
          const offersMap = {};
          const offersByEmail = {};
          
          offersResponse.data.offers.forEach(offer => {
            let leadId = null;
            
            // Handle leadId in various formats
            if (offer.leadId) {
              if (typeof offer.leadId === 'object' && offer.leadId.$oid) {
                leadId = String(offer.leadId.$oid);
              } else if (typeof offer.leadId === 'object' && offer.leadId.toString) {
                leadId = String(offer.leadId.toString());
              } else {
                leadId = String(offer.leadId);
              }
            }
            
            // Also check lead.id and lead._id
            if (offer.lead?.id) {
              const leadIdFromLead = typeof offer.lead.id === 'object' && offer.lead.id.$oid
                ? String(offer.lead.id.$oid)
                : String(offer.lead.id);
              if (!leadId) leadId = leadIdFromLead;
              offersMap[leadIdFromLead] = offer;
            }
            if (offer.lead?._id) {
              const leadIdFromLead = typeof offer.lead._id === 'object' && offer.lead._id.$oid
                ? String(offer.lead._id.$oid)
                : String(offer.lead._id);
              if (!leadId) leadId = leadIdFromLead;
              offersMap[leadIdFromLead] = offer;
            }
            
            // Store by leadId
            if (leadId) {
              offersMap[leadId] = offer;
            }
            
            // Also store by email for fallback matching
            if (offer.lead?.email) {
              offersByEmail[offer.lead.email.toLowerCase()] = offer;
            }
          });
          
          setOffers({ ...offersMap, _byEmail: offersByEmail });
          
          // Filter out leads that have offers with OFFER_SENT status (they should be in Deals page)
          if (offersResponse.success && offersResponse.data.offers) {
            filteredLeads = filteredLeads.filter(lead => {
              const leadId = String(lead.id || lead._id || '');
              // Check if this lead has an offer with OFFER_SENT status
              const offer = offersResponse.data.offers.find(o => {
                const offerLeadId = String(o.leadId || o.lead?.id || o.lead?._id || '');
                return offerLeadId === leadId || 
                       offerLeadId === String(lead.id) || 
                       offerLeadId === String(lead._id) ||
                       (lead.email && o.lead?.email && o.lead.email.toLowerCase() === lead.email.toLowerCase());
              });
              // Exclude if offer is sent - those go to Deals page
              return !offer || offer.status !== 'OFFER_SENT';
            });
          }
        }
        
        setLeads(filteredLeads);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when modals open
  useEffect(() => {
    if (showOfferModal || showScholarshipModal) {
      setOpenDropdownId(null);
    }
  }, [showOfferModal, showScholarshipModal]);

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

  return (
    <>
      <PageHeader
        title="Scholarship and Offers"
        description="Manage scholarships and offers for leads who have completed assessments."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <StatsCard 
          icon={CheckCircle} 
          value={totalCompleted} 
          label="Completed Assessments" 
          trend="Total" 
        />
        <StatsCard 
          icon={Gift} 
          value={withScholarship} 
          label="With Scholarship" 
          trend={`${totalCompleted > 0 ? Math.round((withScholarship / totalCompleted) * 100) : 0}%`} 
        />
        <StatsCard 
          icon={CheckCircle} 
          value={approvedScholarships} 
          label="Approved Scholarships" 
          trend="Ready for offer" 
        />
        <StatsCard 
          icon={Send} 
          value={withOffers} 
          label="Offers Sent" 
          trend={`${totalCompleted > 0 ? Math.round((withOffers / totalCompleted) * 100) : 0}%`} 
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search leads..."
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
            <span className="ml-3 text-textMuted">Loading...</span>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Lead</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Score</th>
                  {isAccountant && (
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Scholarship</th>
                  )}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Offer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={isAccountant ? 5 : 4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-textMuted">
                        {searchTerm ? "No leads match your search." : "No completed assessments found."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, idx) => {
                  const leadId = String(lead.id || lead._id || '');
                  
                  // Try multiple ways to match the offer FIRST (before scholarship matching that uses it)
                  let offer = offers[leadId] || 
                              offers[lead.id] || 
                              offers[lead._id] ||
                              (lead.id && offers[String(lead.id)]) ||
                              (lead._id && offers[String(lead._id)]);
                  
                  // Fallback: try matching by email if ID matching failed
                  if (!offer && lead.email && offers._byEmail) {
                    offer = offers._byEmail[lead.email.toLowerCase()];
                  }
                  
                  // Try multiple ways to match the scholarship
                  let scholarship = scholarships[leadId] || 
                                    scholarships[lead.id] || 
                                    scholarships[lead._id] ||
                                    (lead.id && scholarships[String(lead.id)]) ||
                                    (lead._id && scholarships[String(lead._id)]);
                  
                  // Also try matching with ObjectId string format
                  if (!scholarship && lead.id) {
                    const idStr = String(lead.id);
                    // Try exact match, and also try if the scholarship leadId is stored differently
                    scholarship = scholarships[idStr] || 
                                  Object.values(scholarships).find(s => 
                                    s && typeof s === 'object' && !s._byEmail &&
                                    (String(s.leadId) === idStr || 
                                     String(s.leadId) === String(lead._id) ||
                                     (s.lead && (String(s.lead.id) === idStr || String(s.lead._id) === idStr)))
                                  );
                  }
                  
                  // Also try matching by offerId if lead has an offer
                  if (!scholarship && offer) {
                    const offerId = String(offer.id || offer._id || '');
                    // First try direct lookup by offerId key
                    scholarship = scholarships[`offer_${offerId}`];
                    // If not found, search through all scholarships
                    if (!scholarship) {
                      scholarship = Object.values(scholarships).find(s => 
                        s && typeof s === 'object' && !s._byEmail &&
                        (String(s.offerId) === offerId || 
                         (s.offerId && typeof s.offerId === 'object' && s.offerId.$oid && String(s.offerId.$oid) === offerId) ||
                         (s.offer && (String(s.offer.id) === offerId || String(s.offer._id) === offerId)))
                      );
                    }
                  }
                  
                  // Fallback: try matching by email if ID matching failed
                  if (!scholarship && lead.email && scholarships._byEmail) {
                    scholarship = scholarships._byEmail[lead.email.toLowerCase()];
                  }
                  
                  // Debug logging for missing scholarships (only log once per lead)
                  if (!scholarship && Object.keys(scholarships).length > 0) {
                    const availableKeys = Object.keys(scholarships).filter(k => k !== '_byEmail');
                    const scholarshipValues = Object.values(scholarships).filter(s => s && typeof s === 'object' && !s._byEmail);
                    console.log('Scholarship not found for lead:', {
                      leadId: lead.id,
                      lead_id: lead._id,
                      leadIdString: leadId,
                      leadName: lead.name,
                      leadEmail: lead.email,
                      availableScholarshipKeys: availableKeys,
                      scholarshipCount: scholarshipValues.length,
                      scholarships: scholarshipValues.slice(0, 3).map(s => ({
                        leadId: s.leadId,
                        leadIdType: typeof s.leadId,
                        leadIdString: String(s.leadId),
                        leadIdFromLead: s.lead?.id,
                        leadEmail: s.lead?.email,
                        status: s.status,
                        requestedAmount: s.requestedAmount
                      }))
                    });
                  }
                  const hasApprovedScholarship = scholarship?.status === 'APPROVED';
                  // Also check if offer has discounted price with PENDING_SCHOLARSHIP status (indicates approved scholarship)
                  const hasApprovedScholarshipByOffer = offer && 
                    offer.status === 'PENDING_SCHOLARSHIP' && 
                    offer.offeredPrice && 
                    offer.basePrice && 
                    offer.offeredPrice < offer.basePrice &&
                    offer.scholarshipApplied;
                  const hasApprovedScholarshipFinal = hasApprovedScholarship || hasApprovedScholarshipByOffer;
                  const hasOffer = offer && (offer.status === 'OFFER_SENT' || offer.status === 'ACCEPTED');
                  const score = lead.assessmentResult?.score || lead.assessmentScore || lead.assessmentMarks?.percentage;

                  return (
                    <tr key={lead.id || lead._id || idx} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-text">{lead.name}</p>
                            <div className="flex items-center gap-2 text-xs text-textMuted">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-xs text-textMuted">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {score !== undefined && score !== null ? (
                          <span className="text-sm font-semibold text-text">
                            {typeof score === 'number' ? `${score.toFixed(1)}%` : score}
                          </span>
                        ) : (
                          <span className="text-xs text-textMuted italic">N/A</span>
                        )}
                      </td>
                      {isAccountant && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {scholarship ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              scholarship.status === 'APPROVED' 
                                ? 'bg-green-100 text-green-700' 
                                : scholarship.status === 'REQUESTED' || scholarship.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : scholarship.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {scholarship.status === 'APPROVED' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : scholarship.status === 'REJECTED' ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {scholarship.status === 'APPROVED' 
                                ? 'Approved' 
                                : scholarship.status === 'REQUESTED' || scholarship.status === 'PENDING'
                                ? 'Pending'
                                : scholarship.status === 'REJECTED'
                                ? 'Rejected'
                                : scholarship.status || 'Applied'}
                            </span>
                          ) : (
                            <span className="text-xs text-textMuted">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {offer ? (
                          <div className="flex flex-col gap-1">
                            {offer.status === 'OFFER_SENT' || offer.status === 'ACCEPTED' ? (
                              <>
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3" />
                                  {offer.status === 'ACCEPTED' ? 'Accepted' : 'Sent'}
                                </span>
                                {offer.offeredPrice && (
                                  <span className="text-xs text-textMuted">
                                    Final Price: ₹{offer.offeredPrice.toLocaleString()}
                                  </span>
                                )}
                              </>
                            ) : hasApprovedScholarshipFinal && offer.offeredPrice ? (
                              // Scholarship approved (either matched or indicated by offer with discounted price)
                              <>
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                                  <Clock className="h-3 w-3" />
                                  Ready to Send
                                </span>
                                {offer.offeredPrice && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    Final Price: ₹{offer.offeredPrice.toLocaleString()}
                                  </span>
                                )}
                                {offer.basePrice && offer.basePrice !== offer.offeredPrice && (
                                  <span className="text-xs text-textMuted">
                                    Base: ₹{offer.basePrice.toLocaleString()}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                                <Clock className="h-3 w-3" />
                                {offer.status === 'PENDING_SCHOLARSHIP' ? 'Pending Approval' : (offer.status || 'Pending')}
                              </span>
                            )}
                          </div>
                        ) : hasApprovedScholarshipFinal ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                              <Clock className="h-3 w-3" />
                              Ready to Send
                            </span>
                            {scholarship.offer?.offeredPrice && (
                              <span className="text-xs text-blue-600 font-medium">
                                Final Price: ₹{scholarship.offer.offeredPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-textMuted italic">No offer</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!isAccountant && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === leadId ? null : leadId);
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            {openDropdownId === leadId && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50">
                                  <div className="py-1">
                                    {/* Apply Scholarship - Only if not already applied */}
                                    {!scholarship && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLead(lead);
                                          setShowScholarshipModal(true);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                      >
                                        <Gift className="h-4 w-4" />
                                        Apply Scholarship
                                      </button>
                                    )}
                                    
                                    {/* Send Offer - Available when assessment completed and (scholarship approved or no scholarship) */}
                                    {(() => {
                                      const canSendOffer = hasApprovedScholarshipFinal || !scholarship;
                                      return (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (canSendOffer && !hasOffer) {
                                              setSelectedLead(lead);
                                              setShowOfferModal(true);
                                              setOpenDropdownId(null);
                                            } else if (hasOffer) {
                                              toast.error("Offer already sent");
                                            } else if (scholarship && scholarship.status !== 'APPROVED') {
                                              toast.error("Wait for scholarship approval");
                                            }
                                          }}
                                          disabled={!canSendOffer || hasOffer}
                                          className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                                            canSendOffer && !hasOffer
                                              ? hasApprovedScholarshipFinal
                                                ? "text-green-700 hover:bg-green-50 cursor-pointer font-semibold"
                                                : "text-text hover:bg-brintelli-baseAlt cursor-pointer"
                                              : "text-textMuted cursor-not-allowed opacity-50"
                                          }`}
                                        >
                                          <Send className="h-4 w-4" />
                                          {hasApprovedScholarshipFinal ? "Send Offer (Scholarship Approved)" : "Send Offer"}
                                        </button>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
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
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Release Offer Modal */}
      {showOfferModal && selectedLead && (
        <ReleaseOfferModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          assessmentResult={selectedLead.assessmentResult || {
            score: selectedLead.assessmentScore,
            percentage: selectedLead.assessmentMarks?.percentage,
            level: selectedLead.assessmentMarks?.level
          }}
          scholarshipRequest={(() => {
            if (!selectedLead) return null;
            const leadId = String(selectedLead.id || selectedLead._id || '');
            return scholarships[leadId] || scholarships[selectedLead.id] || scholarships[selectedLead._id] || null;
          })()}
          onSuccess={() => {
            handleRefresh();
            setShowOfferModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Apply Scholarship Modal */}
      {showScholarshipModal && selectedLead && (
        <ApplyScholarshipModal
          isOpen={showScholarshipModal}
          onClose={() => {
            setShowScholarshipModal(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          assessmentResult={selectedLead.assessmentResult || {
            score: selectedLead.assessmentScore,
            percentage: selectedLead.assessmentMarks?.percentage,
            level: selectedLead.assessmentMarks?.level
          }}
          onSuccess={() => {
            handleRefresh();
            setShowScholarshipModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </>
  );
};

export default ScholarshipAndOffers;

