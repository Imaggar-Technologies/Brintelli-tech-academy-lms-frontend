import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Video, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import { studentAPI } from '../../../api/student';
import { apiRequest } from '../../../api/apiClient';

const ScheduleMeet = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [meetingData, setMeetingData] = useState({
    reason: '',
    preferredDate: '',
    preferredTime: '',
    duration: 30,
  });
  const [pendingMeetings, setPendingMeetings] = useState([]);
  const [scheduledMeetings, setScheduledMeetings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollment to get current mentor
      const enrollmentResponse = await studentAPI.getMyEnrollment();
      if (enrollmentResponse?.success && enrollmentResponse.data?.enrollment) {
        const enrollmentData = enrollmentResponse.data.enrollment;
        setEnrollment(enrollmentData);
        
        // Set current mentor if assigned
        if (enrollmentData.mentorId && enrollmentData.suggestedMentors) {
          const mentor = enrollmentData.suggestedMentors.find(
            m => m.id === enrollmentData.mentorId
          );
          if (mentor) {
            setCurrentMentor(mentor);
          }
        }

        // Get meetings from bookedCalls
        if (enrollmentData.bookedCalls) {
          const pending = enrollmentData.bookedCalls.filter(
            call => call.status === 'PENDING'
          );
          const scheduled = enrollmentData.bookedCalls.filter(
            call => call.status === 'SCHEDULED' && call.scheduledDate
          ).map(call => ({
            ...call,
            scheduledDate: call.scheduledDate ? new Date(call.scheduledDate) : null,
          })).sort((a, b) => {
            if (!a.scheduledDate) return 1;
            if (!b.scheduledDate) return -1;
            return a.scheduledDate - b.scheduledDate;
          });
          
          setPendingMeetings(pending);
          setScheduledMeetings(scheduled);
        }
      }

      // Fetch available mentors if no mentor assigned
      if (!currentMentor) {
        try {
          const mentorsResponse = await apiRequest('/api/students/mentors');
          if (mentorsResponse?.success) {
            setAvailableMentors(mentorsResponse.data.mentors || []);
          }
        } catch (err) {
          console.error('Error fetching mentors:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookMeeting = async () => {
    if (!selectedMentor && !currentMentor) {
      toast.error('Please select a mentor');
      return;
    }

    if (!meetingData.reason.trim()) {
      toast.error('Please provide a reason for the meeting');
      return;
    }

    const mentorId = selectedMentor?.id || currentMentor?.id;
    if (!mentorId) {
      toast.error('Mentor ID not found');
      return;
    }

    try {
      const response = await studentAPI.bookMentorCall(mentorId);
      
      if (response?.success) {
        toast.success('Meeting request sent successfully! The mentor will schedule a time.');
        setShowBookModal(false);
        setSelectedMentor(null);
        setMeetingData({
          reason: '',
          preferredDate: '',
          preferredTime: '',
          duration: 30,
        });
        fetchData();
      } else {
        throw new Error(response?.message || 'Failed to book meeting');
      }
    } catch (error) {
      console.error('Error booking meeting:', error);
      toast.error(error.message || 'Failed to book meeting');
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
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <>
      <PageHeader
        title="Schedule Meet"
        description="Book meetings with your mentor"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading...</p>
        </div>
      ) : !currentMentor && availableMentors.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No mentor assigned yet</p>
          <p className="text-sm text-textMuted mt-2">
            Please select a mentor first from the My Mentor page
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Mentor Info */}
          {currentMentor && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                  {currentMentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">{currentMentor.name}</h3>
                  <p className="text-sm text-textMuted">{currentMentor.email}</p>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedMentor(currentMentor);
                  setShowBookModal(true);
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book a Meeting
              </Button>
            </div>
          )}

          {/* Available Mentors (if no mentor assigned) */}
          {!currentMentor && availableMentors.length > 0 && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Available Mentors</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {availableMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-brintelli-border bg-white/70"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center text-brand-600 font-bold">
                      {mentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text">{mentor.name}</p>
                      <p className="text-xs text-textMuted">{mentor.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowBookModal(true);
                      }}
                    >
                      Book
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Meetings */}
          {pendingMeetings.length > 0 && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-text">Pending Requests</h3>
              </div>
              <div className="space-y-3">
                {pendingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50"
                  >
                    <div>
                      <p className="font-semibold text-text">{meeting.reason}</p>
                      <p className="text-sm text-textMuted">
                        Requested: {new Date(meeting.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Meetings */}
          {scheduledMeetings.length > 0 && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-text">Scheduled Meetings</h3>
              </div>
              <div className="space-y-3">
                {scheduledMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex flex-col gap-3 rounded-lg border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-text">
                            {formatDateTime(meeting.scheduledDate)}
                          </span>
                        </div>
                        <p className="text-sm text-textMuted ml-6">{meeting.reason}</p>
                        {meeting.duration && (
                          <p className="text-sm text-textMuted ml-6">
                            Duration: {meeting.duration} minutes
                          </p>
                        )}
                      </div>
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Scheduled
                      </span>
                    </div>
                    {meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-sm text-brand hover:underline bg-white px-4 py-2 rounded-lg border border-green-200 font-medium"
                      >
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Meetings Message */}
          {pendingMeetings.length === 0 && scheduledMeetings.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-brintelli-border bg-brintelli-card">
              <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">No meetings scheduled yet</p>
              <p className="text-sm text-textMuted mt-2">
                Book a meeting with your mentor to get started
              </p>
            </div>
          )}
        </div>
      )}

      {/* Book Meeting Modal */}
      <Modal
        isOpen={showBookModal}
        onClose={() => {
          setShowBookModal(false);
          setSelectedMentor(null);
          setMeetingData({
            reason: '',
            preferredDate: '',
            preferredTime: '',
            duration: 30,
          });
        }}
        title="Book a Meeting"
        size="md"
      >
        {(selectedMentor || currentMentor) && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">
                Mentor: {(selectedMentor || currentMentor).name}
              </p>
              <p className="text-xs text-textMuted">{(selectedMentor || currentMentor).email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Reason for Meeting <span className="text-red-500">*</span>
              </label>
              <textarea
                value={meetingData.reason}
                onChange={(e) => setMeetingData({ ...meetingData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
                placeholder="What would you like to discuss with your mentor?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={meetingData.preferredDate}
                  onChange={(e) => setMeetingData({ ...meetingData, preferredDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={meetingData.preferredTime}
                  onChange={(e) => setMeetingData({ ...meetingData, preferredTime: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Duration (minutes)
              </label>
              <select
                value={meetingData.duration}
                onChange={(e) => setMeetingData({ ...meetingData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleBookMeeting}
                disabled={!meetingData.reason.trim()}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Request Meeting
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowBookModal(false);
                  setSelectedMentor(null);
                  setMeetingData({
                    reason: '',
                    preferredDate: '',
                    preferredTime: '',
                    duration: 30,
                  });
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

export default ScheduleMeet;



















