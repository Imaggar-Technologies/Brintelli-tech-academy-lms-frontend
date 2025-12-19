import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Phone, Calendar, MessageSquare, FileText, Video, Clock, CheckCircle, XCircle, Search, RefreshCw, ClipboardList, Edit2, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import MeetingReportModal from "../../components/MeetingReportModal";
import RescheduleMeetingModal from "../../components/RescheduleMeetingModal";
import ScheduleAssessmentModal from "../../components/ScheduleAssessmentModal";
import BookingOptionsMenu from "../../components/BookingOptionsMenu";
import { leadAPI } from "../../api/lead";
import toast from "react-hot-toast";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { fetchSalesTeam } from "../../store/slices/salesTeamSlice";

const MeetingsCounselling = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [meetingType, setMeetingType] = useState(null); // 'demo' or 'counseling'

  const isSalesAgent = currentUser?.role === 'sales_agent';
  const userEmail = currentUser?.email;

  // Fetch sales team for assessment assignment
  useEffect(() => {
    dispatch(fetchSalesTeam());
  }, [dispatch]);

  // Fetch leads with booked meetings
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadAPI.getAllLeads();
        
        if (response.success && response.data.leads) {
          // Show leads in demo stage (with or without meetings booked)
          let filteredLeads = response.data.leads.filter(lead => 
            lead.pipelineStage === 'demo_and_mentor_screening'
          );

          // ABAC: Sales Agent - Only their assigned leads
          if (isSalesAgent && userEmail) {
            filteredLeads = filteredLeads.filter(lead => lead.assignedTo === userEmail);
          }

          setLeads(filteredLeads);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast.error('Failed to load meetings');
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

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const scheduledCount = leads.filter(l => {
    const demoUpcoming = l.demoBooked && (!l.demoReport?.submitted) && new Date(l.demoDate) >= new Date();
    const counselingUpcoming = l.counselingBooked && (!l.counselingReport?.submitted) && new Date(l.counselingDate) >= new Date();
    return demoUpcoming || counselingUpcoming;
  }).length;

  const completedCount = leads.filter(l => {
    const demoDone = l.demoReport?.submitted;
    const counselingDone = l.counselingReport?.submitted;
    return demoDone || counselingDone;
  }).length;

  const pendingReports = leads.filter(l => {
    const demoNeedsReport = l.demoBooked && !l.demoReport?.submitted && new Date(l.demoDate) < new Date();
    const counselingNeedsReport = l.counselingBooked && !l.counselingReport?.submitted && new Date(l.counselingDate) < new Date();
    return demoNeedsReport || counselingNeedsReport;
  }).length;

  const handleOpenReport = (lead, type) => {
    setSelectedLead(lead);
    setMeetingType(type);
    setShowReportModal(true);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAllLeads();
      if (response.success && response.data.leads) {
        // Show leads in demo stage (with or without meetings booked)
        let filteredLeads = response.data.leads.filter(lead => 
          lead.pipelineStage === 'demo_and_mentor_screening'
        );
        if (isSalesAgent && userEmail) {
          filteredLeads = filteredLeads.filter(lead => lead.assignedTo === userEmail);
        }
        setLeads(filteredLeads);
      }
    } catch (error) {
      console.error('Error refreshing meetings:', error);
      toast.error('Failed to refresh meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (lead, type) => {
    setSelectedLead(lead);
    setMeetingType(type);
    setShowRescheduleModal(true);
  };

  const handleScheduleAssessment = (lead) => {
    setSelectedLead(lead);
    setShowAssessmentModal(true);
  };

  const handleReportSuccess = () => {
    // Refresh leads after report submission
    handleRefresh();
  };

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

  const isMeetingPast = (dateString) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <>
      <PageHeader
        title="Meetings & Counselling"
        description="Manage demo and counseling meetings with leads. Submit reports after meetings to proceed with assessments."
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <StatsCard 
          icon={Calendar} 
          value={scheduledCount} 
          label="Scheduled Meetings" 
          trend="Upcoming" 
        />
        <StatsCard 
          icon={CheckCircle} 
          value={completedCount} 
          label="Completed" 
          trend="Reports submitted" 
        />
        <StatsCard 
          icon={FileText} 
          value={pendingReports} 
          label="Pending Reports" 
          trend="Action required" 
        />
      </div>

      {/* Meetings Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search meetings..."
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
            <span className="ml-3 text-textMuted">Loading meetings...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Meeting Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Report</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brintelli-border">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-textMuted">
                    {searchTerm ? "No meetings match your search." : "No meetings scheduled."}
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedLeads.flatMap((lead, idx) => {
                    const hasDemo = lead.demoBooked;
                    const hasCounseling = lead.counselingBooked;
                    const rows = [];

                    // Show leads without meetings if they're in demo stage but no meetings booked
                    if (!hasDemo && !hasCounseling && lead.pipelineStage === 'demo_and_mentor_screening') {
                      rows.push(
                        <tr key={`${lead.id || idx}-no-meeting`} className="transition hover:bg-brintelli-baseAlt border-b-2 border-dashed border-yellow-300">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-text">{lead.name}</p>
                            <p className="text-xs text-textMuted">{lead.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-textMuted italic">No meeting booked</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-textMuted">-</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <Calendar className="h-3 w-3" />
                              Needs Booking
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-textMuted italic">-</span>
                          </td>
                          <td className="px-4 py-3">
                            <BookingOptionsMenu 
                              lead={lead}
                              onSuccess={handleRefresh}
                            />
                          </td>
                        </tr>
                      );
                    }
                    
                    // Demo Meeting Row
                    if (hasDemo) {
                      rows.push(
                        <tr key={`${lead.id || idx}-demo`} className="transition hover:bg-brintelli-baseAlt">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-text">{lead.name}</p>
                            <p className="text-xs text-textMuted">{lead.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-brand" />
                              <span className="text-sm text-text">Demo</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-textMuted" />
                              <span className="text-text">{formatDate(lead.demoDate)}</span>
                              <Clock className="h-3.5 w-3.5 text-textMuted ml-2" />
                              <span className="text-text">{formatTime(lead.demoTime)}</span>
                            </div>
                            {lead.demoMeetingLink && (
                              <a 
                                href={lead.demoMeetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-brand-600 hover:underline mt-1 block"
                              >
                                Join Meeting
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {lead.demoReport?.submitted ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                Report Submitted
                              </span>
                            ) : isMeetingPast(lead.demoDate) ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                <XCircle className="h-3 w-3" />
                                Report Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                                <Calendar className="h-3 w-3" />
                                Upcoming
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {lead.demoReport?.submitted ? (
                              <span className="text-xs text-textMuted">
                                {new Date(lead.demoReport.submittedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-textMuted italic">Not submitted</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleOpenReport(lead, 'demo')}
                              >
                                <FileText className="h-3 w-3" />
                                {lead.demoReport?.submitted ? "View Report" : "Submit Report"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleReschedule(lead, 'demo')}
                              >
                                <Edit2 className="h-3 w-3" />
                                Reschedule
                              </Button>
                              {lead.demoReport?.submitted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleScheduleAssessment(lead)}
                                >
                                  <ClipboardList className="h-3 w-3" />
                                  Schedule Assessment
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Counseling Meeting Row
                    if (hasCounseling) {
                      rows.push(
                        <tr key={`${lead.id || idx}-counseling`} className="transition hover:bg-brintelli-baseAlt">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-text">{lead.name}</p>
                            <p className="text-xs text-textMuted">{lead.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-brand" />
                              <span className="text-sm text-text">Counseling</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-textMuted" />
                              <span className="text-text">{formatDate(lead.counselingDate)}</span>
                              <Clock className="h-3.5 w-3.5 text-textMuted ml-2" />
                              <span className="text-text">{formatTime(lead.counselingTime)}</span>
                            </div>
                            {lead.counselingMeetingLink && (
                              <a 
                                href={lead.counselingMeetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-brand-600 hover:underline mt-1 block"
                              >
                                Join Meeting
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {lead.counselingReport?.submitted ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                Report Submitted
                              </span>
                            ) : isMeetingPast(lead.counselingDate) ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-700">
                                <XCircle className="h-3 w-3" />
                                Report Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700">
                                <Calendar className="h-3 w-3" />
                                Upcoming
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {lead.counselingReport?.submitted ? (
                              <span className="text-xs text-textMuted">
                                {new Date(lead.counselingReport.submittedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-xs text-textMuted italic">Not submitted</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleOpenReport(lead, 'counseling')}
                              >
                                <FileText className="h-3 w-3" />
                                {lead.counselingReport?.submitted ? "View Report" : "Submit Report"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleReschedule(lead, 'counseling')}
                              >
                                <Edit2 className="h-3 w-3" />
                                Reschedule
                              </Button>
                              {lead.counselingReport?.submitted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleScheduleAssessment(lead)}
                                >
                                  <ClipboardList className="h-3 w-3" />
                                  Schedule Assessment
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return rows;
                  })}
                </>
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

      {/* Meeting Report Modal */}
      <MeetingReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedLead(null);
          setMeetingType(null);
        }}
        lead={selectedLead}
        meetingType={meetingType}
        onSuccess={handleReportSuccess}
      />

      {/* Reschedule Meeting Modal */}
      <RescheduleMeetingModal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedLead(null);
          setMeetingType(null);
        }}
        lead={selectedLead}
        meetingType={meetingType}
        onSuccess={handleRefresh}
      />

      {/* Schedule Assessment Modal */}
      <ScheduleAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => {
          setShowAssessmentModal(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSuccess={handleRefresh}
      />
    </>
  );
};

export default MeetingsCounselling;
