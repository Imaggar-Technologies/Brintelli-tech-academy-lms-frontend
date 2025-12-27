import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarClock, Video, FileText, Calendar, Filter, ExternalLink, Clock, Users, BookOpen } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import tutorAPI from '../../api/tutor';

const TutorSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'today', 'past'
  const [statusFilter, setStatusFilter] = useState(''); // '', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'

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

  const columns = [
    {
      key: 'name',
      title: 'Session',
      render: (row) => (
        <div className="flex items-center gap-3">
          {getTypeIcon(row.type)}
          <div className="flex-1">
            <p className="font-semibold text-text">{row.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {row.module && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-100/50 px-2 py-0.5 text-brand-700 font-medium">
                  <BookOpen className="h-3 w-3" />
                  {row.module.name}
                </span>
              )}
              {row.objective && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-purple-100/50 px-2 py-0.5 text-purple-700 font-medium">
                  <BookOpen className="h-3 w-3" />
                  {row.objective.title}
                </span>
              )}
              {row.program && (
                <span className="text-textMuted">{row.program.name}</span>
              )}
            </div>
            {row.description && (
              <p className="mt-1 text-xs text-textMuted line-clamp-1">{row.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'batch',
      title: 'Batch',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-text">{row.batch?.name || 'N/A'}</p>
          {row.batch?.code && (
            <p className="text-xs text-textMuted">{row.batch.code}</p>
          )}
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      title: 'Schedule',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-textMuted" />
          <span className="text-sm text-textSoft">
            {formatSessionTime(row.scheduledDate, row.duration)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(row.status)}`}>
          {row.status || 'N/A'}
        </span>
      ),
    },
    {
      key: 'meetingLink',
      title: 'Meeting',
      render: (row) => (
        row.meetingLink ? (
          <a 
            href={row.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Join
          </a>
        ) : (
          <span className="text-xs text-textMuted">No link</span>
        )
      ),
    },
  ];

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

      {/* Sessions Table */}
      <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm">
        <div className="p-6 border-b border-brintelli-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text">All Sessions</h3>
              <p className="mt-1 text-sm text-textMuted">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-sm"
              onClick={() => window.location.href = '/tutor/curriculum'}
            >
              <BookOpen className="h-4 w-4" />
              View Program Modules
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={sessions}
            emptyLabel="No sessions found. Sessions will appear here once you're assigned to batches."
            minRows={10}
          />
        </div>
      </div>
    </>
  );
};

export default TutorSchedule;
