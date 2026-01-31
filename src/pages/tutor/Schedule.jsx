import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarClock, Video, FileText, Calendar, Filter, ExternalLink, Clock, BookOpen, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import tutorAPI from '../../api/tutor';
import { useNavigate } from 'react-router-dom';
import SessionPreparationForm from '../../components/tutor/SessionPreparationForm';

const TutorSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'today', 'past'
  const [statusFilter, setStatusFilter] = useState(''); // '', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState(null);
  const [showPreparationForm, setShowPreparationForm] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [filter, statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      const now = new Date();
      if (filter === 'upcoming') {
        filters.startDate = now.toISOString();
      } else if (filter === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        filters.startDate = startOfDay.toISOString();
        filters.endDate = endOfDay.toISOString();
      } else if (filter === 'past') {
        filters.endDate = now.toISOString();
      }

      const response = await tutorAPI.getMySessions(filters);
      if (response.success) {
        setSessions(response.data.sessions || []);
      } else {
        toast.error(response.message || 'Failed to load sessions');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error(error.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatSessionTime = (scheduledDate, duration) => {
    if (!scheduledDate) return 'Not scheduled';
    const date = new Date(scheduledDate);
    const startTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    if (duration) {
      const endDate = new Date(date.getTime() + duration * 60000);
      const endTime = endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50';
      case 'ONGOING':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50';
      case 'COMPLETED':
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/50';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/50';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LIVE':
        return <Video className="h-4 w-4 text-brand-600" />;
      case 'RECORDED':
        return <FileText className="h-4 w-4 text-brand-600" />;
      case 'HYBRID':
        return <Calendar className="h-4 w-4 text-brand-600" />;
      default:
        return <Calendar className="h-4 w-4 text-brand-600" />;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const getMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100/60 border-blue-200/70 text-blue-800';
      case 'ONGOING':
        return 'bg-emerald-100/60 border-emerald-200/70 text-emerald-800';
      case 'COMPLETED':
        return 'bg-gray-100/70 border-gray-200/70 text-gray-800';
      case 'CANCELLED':
        return 'bg-rose-100/60 border-rose-200/70 text-rose-800';
      default:
        return 'bg-brand-100/50 border-brand-200/60 text-brand-800';
    }
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return sessions.filter((session) => {
      if (!session.scheduledDate) return false;
      const d = new Date(session.scheduledDate);
      if (isNaN(d.getTime())) return false;
      const sy = d.getFullYear();
      const sm = String(d.getMonth() + 1).padStart(2, '0');
      const sd = String(d.getDate()).padStart(2, '0');
      return `${sy}-${sm}-${sd}` === dateStr;
    });
  };

  const openMeeting = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      toast('No meeting link for this session', { icon: 'ℹ️' });
    }
  };

  const openLiveRoom = (session) => {
    navigate(`/tutor/sessions/${session.id}/live`);
  };

  const upcomingSessions = sessions.filter(s => {
    if (!s.scheduledDate) return false;
    return new Date(s.scheduledDate) > new Date() && s.status === 'SCHEDULED';
  }).slice(0, 5);

  const todaySessions = sessions.filter(s => {
    if (!s.scheduledDate) return false;
    const today = new Date();
    const sessionDate = new Date(s.scheduledDate);
    return sessionDate.toDateString() === today.toDateString();
  });

  if (loading && sessions.length === 0) {
    return (
      <>
        <PageHeader
          title="Class Schedule"
          description="View and manage your class schedule, upcoming sessions, and meeting links."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading sessions...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Class Schedule"
        description="View and manage your class schedule, upcoming sessions, and meeting links."
        actions={
          <Button variant="secondary" className="gap-2">
            <CalendarClock className="h-4 w-4" />
            Sync Calendar
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100/50 p-2.5 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{sessions.length}</p>
              <p className="text-xs font-medium text-textMuted">Total Sessions</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100/50 p-2.5 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{upcomingSessions.length}</p>
              <p className="text-xs font-medium text-textMuted">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-100/50 p-2.5 text-brand-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{todaySessions.length}</p>
              <p className="text-xs font-medium text-textMuted">Today</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100/50 p-2.5 text-purple-600">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {sessions.filter(s => s.status === 'ONGOING').length}
              </p>
              <p className="text-xs font-medium text-textMuted">Live Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brintelli-border/60 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-textMuted" />
          <span className="text-sm font-semibold text-textMuted">Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'upcoming', 'today', 'past'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-brintelli-baseAlt text-textSoft hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ml-auto rounded-xl border border-brintelli-border/60 bg-white px-4 py-2 text-sm font-medium text-textSoft outline-none transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Calendar (Tutor-only sessions) */}
      <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brintelli-border/60 bg-gradient-to-r from-brand-50/50 to-purple-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-600 p-2 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">{getMonthName(currentDate)}</h3>
                <p className="text-sm text-textMuted">Your sessions only</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)} className="gap-1.5">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="gap-1.5">
                Today
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)} className="gap-1.5">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-textMuted py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((date, idx) => {
              const daySessions = getSessionsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`min-h-[120px] rounded-xl border p-2 ${
                    date
                      ? isToday
                        ? 'border-brand-500 bg-brand-50/30'
                        : 'border-brintelli-border/60 bg-white hover:border-brand-300/60'
                      : 'border-transparent'
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-brand-700' : 'text-text'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {daySessions.length > 0 ? (
                          <>
                            {daySessions.slice(0, 3).map((session, sIdx) => {
                              const key = session.id || session._id || `${idx}-${sIdx}`;
                              return (
                                <button
                                  type="button"
                                  key={key}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openLiveRoom(session);
                                  }}
                                  className={`w-full text-left text-xs p-1.5 rounded border hover:shadow-sm cursor-pointer transition-colors ${getStatusStyles(session.status)}`}
                                  title={`${session.name || 'Session'} - ${formatTime(session.scheduledDate)}`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <div className="flex items-center gap-1 min-w-0">
                                      <Clock className="h-3 w-3 shrink-0" />
                                      <span className="font-medium truncate">{formatTime(session.scheduledDate)}</span>
                                    </div>
                                    <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
                                  </div>
                                  <div className="truncate font-semibold">{session.name || 'Unnamed Session'}</div>
                                  <div className="text-[10px] text-textMuted truncate">
                                    {session.batch?.name || 'Unknown Batch'}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {session.status === 'ONGOING' ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200/60">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                                        LIVE
                                      </span>
                                    ) : null}
                                    {session.recordingUrl ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200/60">
                                        <span className="h-2 w-2 rounded-full bg-violet-500" />
                                        REC
                                      </span>
                                    ) : null}
                                    {session.preparationStatus && session.preparationStatus !== 'NOT_STARTED' ? (
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                                          session.preparationStatus === 'APPROVED'
                                            ? 'bg-green-50 text-green-700 ring-green-200/60'
                                            : session.preparationStatus === 'PENDING_APPROVAL'
                                            ? 'bg-orange-50 text-orange-700 ring-orange-200/60'
                                            : session.preparationStatus === 'REJECTED'
                                            ? 'bg-red-50 text-red-700 ring-red-200/60'
                                            : 'bg-blue-50 text-blue-700 ring-blue-200/60'
                                        }`}
                                        title={`Preparation: ${session.preparationStatus}`}
                                      >
                                        PREP
                                      </span>
                                    ) : null}
                                  </div>
                                  {session.preparationStatus === 'NOT_STARTED' || session.preparationStatus === 'IN_PROGRESS' ? (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedSession(session);
                                        setShowPreparationForm(true);
                                      }}
                                      className="mt-1 w-full text-[10px] px-2 py-1 bg-brand-50 text-brand-700 rounded hover:bg-brand-100 transition"
                                    >
                                      Prepare
                                    </button>
                                  ) : null}
                                  {session.module?.name ? (
                                    <div className="text-[10px] text-textMuted truncate">{session.module.name}</div>
                                  ) : null}
                                </button>
                              );
                            })}
                            {daySessions.length > 3 ? (
                              <div className="text-xs text-textMuted text-center py-1">
                                +{daySessions.length - 3} more
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <div className="text-xs text-textMuted text-center py-1">No sessions</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {!loading && sessions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-brintelli-border/60 bg-white p-8 text-center">
              <p className="text-sm text-textMuted">
                No sessions found. Sessions will appear here once you're assigned to batches/modules.
              </p>
              <div className="mt-4">
                <Button variant="ghost" className="gap-2 text-sm" onClick={() => (window.location.href = '/tutor/curriculum')}>
                  <BookOpen className="h-4 w-4" />
                  View Program Modules
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Preparation Form Modal */}
      {showPreparationForm && selectedSession && (
        <SessionPreparationForm
          sessionId={selectedSession.id}
          session={selectedSession}
          onClose={() => {
            setShowPreparationForm(false);
            setSelectedSession(null);
            fetchSessions(); // Refresh to get updated status
          }}
          onUpdate={() => {
            fetchSessions(); // Refresh to get updated status
          }}
        />
      )}
    </>
  );
};

export default TutorSchedule;
