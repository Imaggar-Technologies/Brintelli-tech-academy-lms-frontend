import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList, Calendar, Clock, CheckCircle, XCircle, Search, RefreshCw, FileText, User, Mail, Phone, MoreVertical, Gift, Send, DollarSign, ArchiveX } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import ReleaseOfferModal from "../../components/ReleaseOfferModal";
import ApplyScholarshipModal from "../../components/ApplyScholarshipModal";
import DeactivateLeadModal from "../../components/DeactivateLeadModal";
import { leadAPI } from "../../api/lead";
import { scholarshipAPI } from "../../api/scholarship";
import { offerAPI } from "../../api/offer";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";

const Assessments = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [scholarships, setScholarships] = useState({}); // Map of leadId -> scholarship
  const [offers, setOffers] = useState({}); // Map of leadId -> offer

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const isSalesLead = currentUser?.role === 'sales_lead';
  const isAccountant = currentUser?.role === 'accountant' || currentUser?.role === 'finance';
  const userEmail = currentUser?.email;

  // Fetch leads with assessments, scholarships, and offers
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const [leadsResponse, scholarshipsResponse, offersResponse] = await Promise.all([
          leadAPI.getAllLeads(),
          scholarshipAPI.getAllScholarships().catch(() => ({ success: false, data: { scholarshipRequests: [] } })),
          offerAPI.getAllOffers().catch(() => ({ success: false, data: { offers: [] } }))
        ]);
        
        if (leadsResponse.success && leadsResponse.data.leads) {
          // Filter leads that have assessments scheduled, assigned, or sent - BUT NOT completed
          // Completed assessments should go to Scholarship and Offers page
          let filteredLeads = leadsResponse.data.leads.filter(lead => 
            // Exclude deactivated (Lead Dump)
            lead.pipelineStage !== 'lead_dump' &&
            lead.status !== 'DEACTIVATED' &&
            (lead.assessmentScheduled || 
            lead.assessmentDate || 
            lead.assessmentBooked || 
            lead.assessmentAssignedTo ||
            lead.assessmentType ||
            lead.assessmentSent ||
            lead.assessmentLink ||
            lead.assessmentId ||
            lead.pipelineStage === 'assessments') &&
            !lead.assessmentCompleted && !lead.assessmentResult
          );

          // ABAC: Sales Agent - Only their assigned leads (check both assignedTo and assessmentAssignedTo)
          if (isSalesAgent && userEmail) {
            filteredLeads = filteredLeads.filter(lead => 
              lead.assignedTo === userEmail || 
              lead.assessmentAssignedTo === userEmail
            );
          }

          setAssessments(filteredLeads);

          // Map scholarships by leadId, offerId, and email (handle various ID formats)
          if (scholarshipsResponse.success && scholarshipsResponse.data.scholarshipRequests) {
            const scholarshipsMap = {};
            const scholarshipsByEmail = {};
            
            scholarshipsResponse.data.scholarshipRequests.forEach(scholarship => {
              // Handle leadId in various formats
              let leadId = null;
              
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

          // Map offers by leadId and email (handle various ID formats)
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
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
        toast.error('Failed to load assessments');
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    if (isSalesAgent && !userEmail) {
      return; // Wait for user to load
    }

    fetchAssessments();
  }, [isSalesAgent, userEmail]);

  // Filter assessments by search term
  const filteredAssessments = assessments.filter(assessment => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      assessment.name?.toLowerCase().includes(search) ||
      assessment.email?.toLowerCase().includes(search) ||
      assessment.phone?.includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssessments = filteredAssessments.slice(startIndex, startIndex + itemsPerPage);

  // Stats - Note: Completed assessments are now on Scholarship and Offers page
  const scheduledCount = assessments.filter(a => {
    return a.assessmentScheduled && a.assessmentDate && new Date(a.assessmentDate) >= new Date();
  }).length;

  const pendingCount = assessments.filter(a => {
    return (a.assessmentScheduled && a.assessmentDate && new Date(a.assessmentDate) < new Date()) ||
           (a.assessmentSent || a.assessmentLink) ||
           (a.assessmentAssignedTo && !a.assessmentScheduled);
  }).length;

  const sentCount = assessments.filter(a => {
    return a.assessmentSent || a.assessmentLink;
  }).length;

  const handleDeactivateLead = (lead) => {
    setSelectedAssessment(lead);
    setShowDeactivateModal(true);
    setOpenDropdownId(null);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [leadsResponse, scholarshipsResponse, offersResponse] = await Promise.all([
        leadAPI.getAllLeads(),
        scholarshipAPI.getAllScholarships().catch(() => ({ success: false, data: { scholarshipRequests: [] } })),
        offerAPI.getAllOffers().catch(() => ({ success: false, data: { offers: [] } }))
      ]);
      
      if (leadsResponse.success && leadsResponse.data.leads) {
        // Filter leads that have assessments scheduled, assigned, or sent - BUT NOT completed
        // Completed assessments should go to Scholarship and Offers page
        let filteredLeads = leadsResponse.data.leads.filter(lead => 
          // Exclude deactivated (Lead Dump)
          lead.pipelineStage !== 'lead_dump' &&
          lead.status !== 'DEACTIVATED' &&
          (lead.assessmentScheduled || 
          lead.assessmentDate || 
          lead.assessmentBooked || 
          lead.assessmentAssignedTo ||
          lead.assessmentType ||
          lead.assessmentSent ||
          lead.assessmentLink ||
          lead.assessmentId ||
          lead.pipelineStage === 'assessments') &&
          !lead.assessmentCompleted && !lead.assessmentResult
        );
        // ABAC: Sales Agent - Only their assigned leads (check both assignedTo and assessmentAssignedTo)
        if (isSalesAgent && userEmail) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.assignedTo === userEmail || 
            lead.assessmentAssignedTo === userEmail
          );
        }
        setAssessments(filteredLeads);

        // Map scholarships by leadId, offerId, and email (handle various ID formats)
        if (scholarshipsResponse.success && scholarshipsResponse.data.scholarshipRequests) {
          const scholarshipsMap = {};
          const scholarshipsByEmail = {};
          
          scholarshipsResponse.data.scholarshipRequests.forEach(scholarship => {
            // Handle leadId in various formats
            let leadId = null;
            
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

        // Map offers by leadId and email (handle various ID formats)
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
      }
    } catch (error) {
      console.error('Error refreshing assessments:', error);
      toast.error('Failed to refresh assessments');
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

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Manage and track scheduled assessments for leads. Once assessments are completed, they move to the Scholarship and Offers page."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <StatsCard 
          icon={Calendar} 
          value={scheduledCount} 
          label="Scheduled Assessments" 
          trend="Upcoming" 
        />
        <StatsCard 
          icon={Mail} 
          value={sentCount} 
          label="Link Sent" 
          trend="Awaiting completion" 
        />
        <StatsCard 
          icon={XCircle} 
          value={pendingCount} 
          label="Pending" 
          trend="Action required" 
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
          <div>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Lead</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Date & Time</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
              </tr>
            </thead>
              <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
              {paginatedAssessments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-textMuted">
                    {searchTerm ? "No assessments match your search." : "No assessments scheduled."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAssessments.map((assessment, idx) => (
                  <tr key={assessment.id || idx} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-text">{assessment.name || 'N/A'}</p>
                          {assessment.email && (
                          <div className="flex items-center gap-2 text-xs text-textMuted">
                            <Mail className="h-3 w-3" />
                            {assessment.email}
                          </div>
                          )}
                          {assessment.phone && (
                            <div className="flex items-center gap-2 text-xs text-textMuted">
                              <Phone className="h-3 w-3" />
                              {assessment.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assessment.assessmentDate ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-textMuted" />
                        <span className="text-text">{formatDate(assessment.assessmentDate)}</span>
                        {assessment.assessmentTime && (
                          <>
                            <Clock className="h-3.5 w-3.5 text-textMuted ml-2" />
                            <span className="text-text">{formatTime(assessment.assessmentTime)}</span>
                          </>
                        )}
                      </div>
                      ) : assessment.assessmentSentAt ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-textMuted" />
                          <span className="text-text">Sent {formatDate(assessment.assessmentSentAt)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-textMuted italic">Not scheduled yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assessment.assessmentCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      ) : assessment.assessmentScheduled && assessment.assessmentDate && new Date(assessment.assessmentDate) < new Date() ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle className="h-3 w-3" />
                          Overdue
                        </span>
                      ) : assessment.assessmentScheduled || assessment.assessmentDate ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                          <Calendar className="h-3 w-3" />
                          Scheduled
                        </span>
                      ) : assessment.assessmentSent || assessment.assessmentLink ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700">
                          <Mail className="h-3 w-3" />
                          Link Sent
                        </span>
                      ) : assessment.assessmentAssignedTo || assessment.assessmentBooked ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                          <ClipboardList className="h-3 w-3" />
                          Assigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                          <ClipboardList className="h-3 w-3" />
                          Not Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === (assessment.id || assessment._id) ? null : (assessment.id || assessment._id));
                          }}
                          >
                          <MoreVertical className="h-4 w-4" />
                          </Button>
                        {openDropdownId === (assessment.id || assessment._id) && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setOpenDropdownId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brintelli-border z-50">
                              <div className="py-1">
                                {/* View Details */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAssessment(assessment);
                                    toast.info("View details feature coming soon");
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt transition-colors flex items-center gap-2"
                                >
                                  <FileText className="h-4 w-4" />
                                  View Details
                                </button>
                                
                                {/* Deactivate Lead */}
                                <div className="border-t border-brintelli-border my-1"></div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeactivateLead(assessment);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  <ArchiveX className="h-4 w-4" />
                                  Deactivate Lead
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        )}

        {/* Pagination */}
        {filteredAssessments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAssessments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Release Offer Modal */}
      {showOfferModal && selectedAssessment && (
        <ReleaseOfferModal
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedAssessment(null);
          }}
          lead={selectedAssessment}
          assessmentResult={selectedAssessment.assessmentResult}
          scholarshipRequest={(() => {
            if (!selectedAssessment) return null;
            const leadId = String(selectedAssessment.id || selectedAssessment._id || '');
            return scholarships[leadId] || scholarships[selectedAssessment.id] || scholarships[selectedAssessment._id] || null;
          })()}
          onSuccess={() => {
            handleRefresh();
            setShowOfferModal(false);
            setSelectedAssessment(null);
          }}
        />
      )}

      {/* Apply Scholarship Modal */}
      {showScholarshipModal && selectedAssessment && (
        <ApplyScholarshipModal
          isOpen={showScholarshipModal}
          onClose={() => {
            setShowScholarshipModal(false);
            setSelectedAssessment(null);
          }}
          lead={selectedAssessment}
          assessmentResult={selectedAssessment.assessmentResult}
          onSuccess={() => {
            handleRefresh();
            setShowScholarshipModal(false);
            setSelectedAssessment(null);
          }}
        />
      )}

      {/* Deactivate Lead Modal */}
      {showDeactivateModal && selectedAssessment && (
        <DeactivateLeadModal
          isOpen={showDeactivateModal}
          onClose={() => {
            setShowDeactivateModal(false);
            setSelectedAssessment(null);
          }}
          lead={selectedAssessment}
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}
    </>
  );
};

export default Assessments;

