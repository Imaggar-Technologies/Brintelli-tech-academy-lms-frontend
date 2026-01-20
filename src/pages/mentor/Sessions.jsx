import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Clock, Video, CheckCircle2, XCircle, Calendar, User, AlertCircle, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const Sessions = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [completeData, setCompleteData] = useState({
    notes: '',
    outcome: '',
  });
  const [reportData, setReportData] = useState({
    report: '',
    notes: '',
    outcome: '',
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getAllMeetings();
      
      if (response.success) {
        const meetingsData = response.data.meetings || [];
        // Filter out PENDING meetings that don't have a scheduled date
        // Only show PENDING meetings that are actually scheduled (have scheduledDate)
        const filtered = meetingsData.filter(m => {
          // Show all SCHEDULED, COMPLETED, CANCELLED meetings
          if (m.status !== 'PENDING') return true;
          // For PENDING, only show if they have a scheduledDate (meaning they're scheduled)
          return m.scheduledDate != null;
        });
        
        // Sort by scheduled date (upcoming first, then by date)
        const sorted = filtered.sort((a, b) => {
          if (a.status === 'SCHEDULED' && b.status !== 'SCHEDULED') return -1;
          if (a.status !== 'SCHEDULED' && b.status === 'SCHEDULED') return 1;
          if (a.scheduledDate && b.scheduledDate) {
            return new Date(a.scheduledDate) - new Date(b.scheduledDate);
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setMeetings(sorted);
      } else {
        toast.error(response.message || 'Failed to load sessions');
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error(error.message || 'Failed to load sessions');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMeeting = async () => {
    if (!selectedMeeting) return;

    try {
      const response = await mentorAPI.completeMeeting(selectedMeeting.id, {
        notes: completeData.notes,
        outcome: completeData.outcome,
      });

      if (response.success) {
        toast.success('Meeting marked as completed');
        setShowCompleteModal(false);
        setSelectedMeeting(null);
        setCompleteData({ notes: '', outcome: '' });
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error completing meeting:', error);
      toast.error(error.message || 'Failed to complete meeting');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'SCHEDULED':
        return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not scheduled';
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedMeeting) return;

    if (!reportData.report || !reportData.report.trim()) {
      toast.error('Please enter a meeting report');
      return;
    }

    try {
      const response = await mentorAPI.submitMeetingReport(selectedMeeting.id, {
        report: reportData.report,
        notes: reportData.notes,
        outcome: reportData.outcome,
      });

      if (response.success) {
        toast.success('Meeting report submitted successfully');
        setShowReportModal(false);
        setSelectedMeeting(null);
        setReportData({ report: '', notes: '', outcome: '' });
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.message || 'Failed to submit report');
    }
  };

  const scheduledMeetings = meetings.filter(m => m.status === 'SCHEDULED');
  const completedMeetings = meetings.filter(m => m.status === 'COMPLETED');
  const pendingMeetings = meetings.filter(m => m.status === 'PENDING');
  const meetingsNeedingReports = completedMeetings.filter(m => !m.report);

  return (
    <>
      <PageHeader
        title="1:1 Sessions"
        description="Conduct and manage one-on-one mentoring sessions"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Scheduled</p>
              <p className="text-3xl font-bold text-blue-600">{scheduledMeetings.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingMeetings.length}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedMeetings.length}</p>
              {meetingsNeedingReports.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {meetingsNeedingReports.length} need reports
                </p>
              )}
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">All Sessions</h3>
            <p className="text-sm text-textMuted mt-1">
              Total: {meetings.length} session{meetings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMeetings}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading sessions...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const statusBadge = getStatusBadge(meeting.status);
              return (
                <div
                  key={meeting.id}
                  className="flex flex-col gap-3 rounded-2xl border border-brintelli-border bg-white/70 p-4 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-brand-600" />
                        <div>
                          <p className="font-semibold text-text">{meeting.studentName}</p>
                          <p className="text-xs text-textMuted">{meeting.studentEmail}</p>
                        </div>
                      </div>
                      <p className="text-sm text-textMuted mb-2">
                        <strong>Reason:</strong> {meeting.reason}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-textMuted">
                        <Clock className="h-4 w-4" />
                        {meeting.scheduledDate ? (
                          <>
                            <span>{formatDateTime(meeting.scheduledDate)}</span>
                            {meeting.duration && <span>• {meeting.duration} minutes</span>}
                          </>
                        ) : (
                          <span className="text-amber-600">To be scheduled</span>
                        )}
                      </div>
                      {meeting.meetingLink && (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-brand hover:underline mt-2"
                        >
                          <Video className="h-4 w-4" />
                          <span>Join Meeting</span>
                        </a>
                      )}
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  {meeting.status === 'SCHEDULED' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowCompleteModal(true);
                        }}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  )}
                  {meeting.status === 'COMPLETED' && !meeting.report && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setReportData({
                            report: '',
                            notes: meeting.notes || '',
                            outcome: meeting.outcome || '',
                          });
                          setShowReportModal(true);
                        }}
                        className="flex-1"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Submit Report
                      </Button>
                    </div>
                  )}
                  {meeting.report && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold mb-1">Report Submitted</p>
                      <p className="text-sm text-text">{meeting.report}</p>
                    </div>
                  )}
                  {meeting.notes && !meeting.report && (
                    <div className="mt-2 p-3 bg-brintelli-baseAlt rounded-lg">
                      <p className="text-xs text-textMuted mb-1">Notes:</p>
                      <p className="text-sm text-text">{meeting.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Meeting Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedMeeting(null);
          setCompleteData({ notes: '', outcome: '' });
        }}
        title="Complete Meeting"
        size="md"
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Student: {selectedMeeting.studentName}</p>
              <p className="text-xs text-textMuted">{selectedMeeting.studentEmail}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Meeting Notes
              </label>
              <textarea
                value={completeData.notes}
                onChange={(e) => setCompleteData({ ...completeData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
                placeholder="Add notes about the meeting..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Outcome
              </label>
              <textarea
                value={completeData.outcome}
                onChange={(e) => setCompleteData({ ...completeData, outcome: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                placeholder="Meeting outcome or next steps..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleCompleteMeeting}
                className="flex-1"
              >
                Mark as Completed
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedMeeting(null);
                  setCompleteData({ notes: '', outcome: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Submit Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedMeeting(null);
          setReportData({ report: '', notes: '', outcome: '' });
        }}
        title="Submit Meeting Report"
        size="lg"
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Student: {selectedMeeting.studentName}</p>
              <p className="text-xs text-textMuted">{selectedMeeting.studentEmail}</p>
              {selectedMeeting.scheduledDate && (
                <p className="text-xs text-textMuted mt-1">
                  Meeting Date: {formatDateTime(selectedMeeting.scheduledDate)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Meeting Report <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reportData.report}
                onChange={(e) => setReportData({ ...reportData, report: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[150px]"
                placeholder="Write a detailed report about the meeting, including discussion points, student progress, concerns, and recommendations..."
                required
              />
              <p className="text-xs text-textMuted mt-1">
                Include key discussion points, student progress, concerns, and recommendations.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={reportData.notes}
                onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                placeholder="Any additional notes or observations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Outcome / Next Steps (Optional)
              </label>
              <textarea
                value={reportData.outcome}
                onChange={(e) => setReportData({ ...reportData, outcome: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                placeholder="Meeting outcome, action items, or next steps..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSubmitReport}
                disabled={!reportData.report || !reportData.report.trim()}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedMeeting(null);
                  setReportData({ report: '', notes: '', outcome: '' });
                }}
              >
                Cancel
              </Button>
      </div>
    </div>
        )}
      </Modal>
    </>
  );
};

export default Sessions;

