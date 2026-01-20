import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarClock, Clock, Video, User, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import mentorAPI from '../../api/mentor';

const Schedule = () => {
  const [loading, setLoading] = useState(true);
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchScheduledMeetings();
  }, []);

  const fetchScheduledMeetings = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getAllMeetings('SCHEDULED');
      
      if (response.success) {
        const meetings = response.data.meetings || [];
        // Sort by scheduled date
        const sorted = meetings.sort((a, b) => {
          if (!a.scheduledDate) return 1;
          if (!b.scheduledDate) return -1;
          return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        });
        setScheduledMeetings(sorted);
      } else {
        toast.error(response.message || 'Failed to load schedule');
        setScheduledMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error(error.message || 'Failed to load schedule');
      setScheduledMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return scheduledMeetings.filter(meeting => {
      if (!meeting.scheduledDate) return false;
      const meetingDate = new Date(meeting.scheduledDate).toISOString().split('T')[0];
      return meetingDate === dateStr;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(currentDate);
  const todayMeetings = getMeetingsForDate(new Date());

  return (
    <>
      <PageHeader
        title="Session Schedule"
        description="Manage and view your mentoring session schedule"
      />

      {/* Today's Meetings */}
      {todayMeetings.length > 0 && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-brand-600" />
            Today's Sessions ({todayMeetings.length})
          </h3>
          <div className="space-y-3">
            {todayMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-brand-200"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-semibold text-text">{meeting.studentName}</p>
                    <p className="text-sm text-textMuted">{formatTime(meeting.scheduledDate)} • {meeting.duration} min</p>
                  </div>
                </div>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-brand hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-brand-600" />
            <h3 className="text-lg font-semibold text-text">{getMonthName(currentDate)}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
              Previous
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
              Next
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading schedule...</p>
          </div>
        ) : (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {days.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-textMuted py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="min-h-[100px]"></div>;
                }

                const dayMeetings = getMeetingsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const hasMeetings = dayMeetings.length > 0;

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] rounded-xl border p-2 ${
                      isToday
                        ? 'border-brand-500 bg-brand-50/30'
                        : hasMeetings
                        ? 'border-brand-300/60 bg-brand-50/20'
                        : 'border-brintelli-border/60 bg-white'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-brand-700' : 'text-text'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    {hasMeetings ? (
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 2).map((meeting) => (
                          <div
                            key={meeting.id}
                            className="text-xs bg-brand-500/20 text-brand-800 rounded px-1 py-0.5 truncate"
                            title={meeting.studentName}
                          >
                            {formatTime(meeting.scheduledDate)} {meeting.studentName.split(' ')[0]}
                          </div>
                        ))}
                        {dayMeetings.length > 2 && (
                          <div className="text-xs text-textMuted">
                            +{dayMeetings.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-textMuted text-center py-1">No sessions</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Upcoming Sessions List */}
      {scheduledMeetings.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mt-6">
          <h3 className="text-lg font-semibold text-text mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {scheduledMeetings.slice(0, 10).map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-brintelli-border"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-semibold text-text">{meeting.studentName}</p>
                    <p className="text-sm text-textMuted">
                      {meeting.scheduledDate ? (() => {
                        try {
                          return new Date(meeting.scheduledDate).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        } catch (error) {
                          return 'Invalid date';
                        }
                      })() : 'Not scheduled'}
                      {meeting.duration && ` • ${meeting.duration} min`}
                    </p>
                  </div>
                </div>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-brand hover:underline"
                  >
                    <Video className="h-4 w-4" />
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Schedule;

