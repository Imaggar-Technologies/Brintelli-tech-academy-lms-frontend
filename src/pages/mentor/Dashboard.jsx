import { useState, useEffect } from "react";
import { CalendarClock, ClipboardList, Lightbulb, UsersRound, Clock, User, Calendar, Video, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import AnimationWrapper from "../../components/AnimationWrapper";
import StatsCard from "../../components/StatsCard";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import mentorAPI from "../../api/mentor";

const MentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [meetingsNeedingReports, setMeetingsNeedingReports] = useState(0);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    meetingLink: '',
    duration: 30,
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const [pendingRes, scheduledRes, allMeetingsRes] = await Promise.all([
        mentorAPI.getPendingMeetings(),
        mentorAPI.getAllMeetings('active'),
        mentorAPI.getAllMeetings('COMPLETED'),
      ]);

      let allScheduledMeetingIds = new Set();

      if (scheduledRes.success) {
        const allMeetings = scheduledRes.data.meetings || [];
        const scheduled = allMeetings.filter(m => m.status === 'SCHEDULED');
        setScheduledMeetings(scheduled);
        // Create a set of scheduled meeting IDs to filter out from pending
        allScheduledMeetingIds = new Set(scheduled.map(m => m.id));
      }

      if (pendingRes.success) {
        const pending = pendingRes.data.meetings || [];
        // Filter out meetings that are already scheduled
        const trulyPending = pending.filter(m => !allScheduledMeetingIds.has(m.id));
        setPendingMeetings(trulyPending);
      }

      // Calculate meetings needing reports
      if (allMeetingsRes.success) {
        const completedMeetings = allMeetingsRes.data.meetings || [];
        const needingReports = completedMeetings.filter(m => m.status === 'COMPLETED' && !m.report);
        // Update stats to show count of meetings needing reports
        setMeetingsNeedingReports(needingReports.length);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedMeeting) return;

    if (!scheduleData.scheduledDate || !scheduleData.scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${scheduleData.scheduledDate}T${scheduleData.scheduledTime}`);
      
      const response = await mentorAPI.scheduleMeeting(selectedMeeting.id, {
        scheduledDate: scheduledDateTime.toISOString(),
        meetingLink: scheduleData.meetingLink,
        duration: scheduleData.duration,
      });

      if (response.success) {
        toast.success('Meeting scheduled successfully!');
        setShowScheduleModal(false);
        setSelectedMeeting(null);
        setScheduleData({
          scheduledDate: '',
          scheduledTime: '',
          meetingLink: '',
          duration: 30,
        });
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error(error.message || 'Failed to schedule meeting');
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      const response = await mentorAPI.cancelMeeting(meetingId);
      if (response.success) {
        toast.success('Meeting cancelled');
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast.error(error.message || 'Failed to cancel meeting');
    }
  };

  const openScheduleModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowScheduleModal(true);
  };

  const mentorStats = [
    {
      icon: UsersRound,
      value: scheduledMeetings.length.toString(),
      label: "Scheduled Meetings",
      sublabel: "Upcoming sessions",
      trend: `${pendingMeetings.length} pending`,
    },
    {
      icon: CalendarClock,
      value: pendingMeetings.length.toString(),
      label: "Pending Requests",
      sublabel: "Awaiting your response",
      trend: pendingMeetings.length > 0 ? "Action needed" : "All clear",
      trendType: pendingMeetings.length > 0 ? "negative" : undefined,
    },
    {
      icon: ClipboardList,
      value: meetingsNeedingReports.toString(),
      label: "Reports Pending",
      sublabel: "Meetings needing reports",
      trend: meetingsNeedingReports > 0 ? "Action needed" : "All submitted",
      trendType: meetingsNeedingReports > 0 ? "negative" : undefined,
    },
    {
      icon: Lightbulb,
      value: "12",
      label: "Suggested Resources",
      sublabel: "Shared this week",
      trend: "+4 new",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="rounded-3xl border border-brintelli-border bg-gradient-to-r from-brand-soft via-white to-brand-soft p-8 shadow-glow">
        <h1 className="text-2xl font-semibold text-text">Welcome back, Mentor!</h1>
        <p className="mt-2 max-w-2xl text-sm text-textMuted">
          Keep mentees unblocked with quick session prep, timely feedback, and curated resource drops.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mentorStats.map((item) => (
          <AnimationWrapper key={item.label} className="h-full">
            <StatsCard {...item} />
          </AnimationWrapper>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Pending Meeting Requests */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Pending Meeting Requests</h2>
              <p className="text-sm text-textMuted">Students requesting to meet with you</p>
            </div>
            {pendingMeetings.length > 0 && (
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {pendingMeetings.length} new
              </span>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8 text-textMuted">Loading...</div>
          ) : pendingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-textMuted">No pending meeting requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMeetings.map((meeting) => {
                // Check if this meeting is already scheduled
                const isScheduled = scheduledMeetings.some(sm => sm.id === meeting.id || 
                  (sm.studentEmail === meeting.studentEmail && sm.reason === meeting.reason));
                
                return (
                  <div
                    key={meeting.id}
                    className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-amber-700" />
                          <p className="text-sm font-semibold text-text">{meeting.studentName}</p>
                        </div>
                        <p className="text-xs text-textMuted mb-2">{meeting.studentEmail}</p>
                        <p className="text-xs text-textMuted">
                          <strong>Reason:</strong> {meeting.reason}
                        </p>
                        {meeting.createdAt && (
                          <p className="text-xs text-textMuted mt-1">
                            Requested: {new Date(meeting.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isScheduled ? (
                        <span className="inline-flex rounded-full bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                          Scheduled
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-800">
                          Pending
                        </span>
                      )}
                    </div>
                    {!isScheduled && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => openScheduleModal(meeting)}
                          className="flex-1"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancelMeeting(meeting.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {isScheduled && (
                      <div className="text-xs text-green-700 bg-green-50 p-2 rounded-lg">
                        This meeting has been scheduled. Check the "Scheduled Meetings" section or the Sessions page.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scheduled Meetings */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text">Scheduled Meetings</h2>
              <p className="text-sm text-textMuted">Upcoming sessions with students</p>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-textMuted">Loading...</div>
          ) : scheduledMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-textMuted mx-auto mb-2" />
              <p className="text-sm text-textMuted">No scheduled meetings</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {scheduledMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex flex-col gap-2 rounded-2xl border border-brintelli-border bg-white/70 p-4 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text">{meeting.studentName}</p>
                      <p className="text-xs text-textMuted">{meeting.studentEmail}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Scheduled
                    </span>
                  </div>
                  {meeting.scheduledDate && (
                    <div className="flex items-center gap-2 text-xs text-textMuted">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(meeting.scheduledDate).toLocaleString()}</span>
                    </div>
                  )}
                  {meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-brand hover:underline"
                    >
                      <Video className="h-3 w-3" />
                      <span>Join Meeting</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedMeeting(null);
          setScheduleData({
            scheduledDate: '',
            scheduledTime: '',
            meetingLink: '',
            duration: 30,
          });
        }}
        title="Schedule Meeting"
        size="md"
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Student: {selectedMeeting.studentName}</p>
              <p className="text-xs text-textMuted">{selectedMeeting.studentEmail}</p>
              <p className="text-xs text-textMuted mt-1">
                <strong>Reason:</strong> {selectedMeeting.reason}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={scheduleData.scheduledDate}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={scheduleData.scheduledTime}
                onChange={(e) => setScheduleData({ ...scheduleData, scheduledTime: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={scheduleData.duration}
                onChange={(e) => setScheduleData({ ...scheduleData, duration: parseInt(e.target.value) || 30 })}
                min={15}
                max={120}
                step={15}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={scheduleData.meetingLink}
                onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleScheduleMeeting}
                disabled={!scheduleData.scheduledDate || !scheduleData.scheduledTime}
                className="flex-1"
              >
                Schedule Meeting
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedMeeting(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MentorDashboard;

