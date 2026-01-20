import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarClock, Clock, Video, User, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import mentorAPI from '../../api/mentor';

const Upcoming = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  const fetchUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getAllMeetings('SCHEDULED');
      
      if (response.success) {
        const allMeetings = response.data.meetings || [];
        // Filter to only future meetings
        const now = new Date();
        const upcoming = allMeetings
          .filter(meeting => {
            if (!meeting.scheduledDate) return false;
            return new Date(meeting.scheduledDate) >= now;
          })
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        
        setUpcomingMeetings(upcoming);
      } else {
        toast.error(response.message || 'Failed to load upcoming sessions');
        setUpcomingMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      toast.error(error.message || 'Failed to load upcoming sessions');
      setUpcomingMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not scheduled';
    try {
      return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
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

  const getTimeUntil = (date) => {
    if (!date) return '';
    try {
      const now = new Date();
      const meetingDate = new Date(date);
      const diff = meetingDate - now;
      
      if (diff < 0) return 'Past';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}`;
      if (hours > 0) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } catch (error) {
      return '';
    }
  };

  return (
    <>
      <PageHeader
        title="Upcoming Sessions"
        description="View and prepare for upcoming mentoring sessions"
      />

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Upcoming Sessions</h3>
            <p className="text-sm text-textMuted mt-1">
              {upcomingMeetings.length} session{upcomingMeetings.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchUpcomingMeetings}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading upcoming sessions...</p>
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/30 p-4 shadow-card"
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
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-textMuted">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDateTime(meeting.scheduledDate)}</span>
                      </div>
                      {meeting.duration && (
                        <div className="flex items-center gap-2 text-textMuted">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.duration} minutes</span>
                        </div>
                      )}
                    </div>
                    {meeting.scheduledDate && (
                      <p className="text-xs text-brand-600 font-semibold mt-2">
                        {getTimeUntil(meeting.scheduledDate)}
                      </p>
                    )}
                  </div>
                </div>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-brand hover:underline bg-white px-4 py-2 rounded-lg border border-brand-200"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Upcoming;

