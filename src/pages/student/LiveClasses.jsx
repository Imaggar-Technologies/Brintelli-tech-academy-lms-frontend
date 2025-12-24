import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Video, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";
import studentAPI from '../../api/student';

const StudentLiveClasses = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('upcoming'); // 'all', 'upcoming', 'past', 'today'

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMySessions();
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
      case 'ONGOING':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: "name",
      title: "Session",
      render: (row) => (
        <div>
          <div className="font-medium text-text">{row?.name || 'N/A'}</div>
          {row?.description && (
            <div className="text-xs text-textMuted mt-1 line-clamp-1">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (row) => (
        <span className="text-sm text-textSoft">{row?.type || 'N/A'}</span>
      ),
    },
    {
      key: "scheduledDate",
      title: "Time",
      render: (row) => (
        <div>
          <div className="text-sm text-text">{formatSessionTime(row?.scheduledDate, row?.duration)}</div>
          {row?.duration && (
            <div className="text-xs text-textMuted">{row.duration} minutes</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(row?.status)}`}>
          {row?.status || 'N/A'}
        </span>
      ),
    },
    {
      key: "action",
      title: "Action",
      render: (row) => (
        <div className="flex gap-2">
          {row?.meetingLink && row.status === 'SCHEDULED' && (
            <Button
              size="sm"
              className="px-4 py-2 text-xs font-semibold"
              onClick={() => window.open(row.meetingLink, '_blank')}
            >
              Join Room
              <Video className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
          {row?.recordingUrl && row.status === 'COMPLETED' && (
            <Button
              variant="secondary"
              size="sm"
              className="px-4 py-2 text-xs font-semibold"
              onClick={() => window.open(row.recordingUrl, '_blank')}
            >
              Watch Recording
              <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
          {!row?.meetingLink && !row?.recordingUrl && (
            <span className="text-xs text-textMuted">No link available</span>
          )}
        </div>
      ),
    },
  ];

  // Filter and sort sessions
  const getFilteredSessions = () => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = sessions;
    switch (filter) {
      case 'upcoming':
        filtered = sessions.filter(s => {
          if (!s.scheduledDate) return false;
          return new Date(s.scheduledDate) > now && s.status === 'SCHEDULED';
        });
        break;
      case 'today':
        filtered = sessions.filter(s => {
          if (!s.scheduledDate) return false;
          const sessionDate = new Date(s.scheduledDate);
          return sessionDate >= today && sessionDate < tomorrow;
        });
        break;
      case 'past':
        filtered = sessions.filter(s => {
          if (!s.scheduledDate) return false;
          return new Date(s.scheduledDate) < now || s.status === 'COMPLETED';
        });
        break;
      default:
        filtered = sessions;
    }

    return filtered.sort((a, b) => {
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return new Date(a.scheduledDate) - new Date(b.scheduledDate);
    });
  };

  const filteredSessions = getFilteredSessions();
  const upcomingCount = sessions.filter(s => s.scheduledDate && new Date(s.scheduledDate) > new Date() && s.status === 'SCHEDULED').length;
  const todayCount = sessions.filter(s => {
    if (!s.scheduledDate) return false;
    const sessionDate = new Date(s.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return sessionDate >= today && sessionDate < tomorrow;
  }).length;

  if (loading) {
    return (
      <>
        <PageHeader
          title="Live Classes & Cohort Schedule"
          description="All your upcoming live sessions, mentor hours, and cohort syncs in one place."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading sessions...</p>
        </div>
      </>
    );
  }

  if (sessions.length === 0) {
    return (
      <>
        <PageHeader
          title="Live Classes & Cohort Schedule"
          description="All your upcoming live sessions, mentor hours, and cohort syncs in one place."
          actions={
            <Button variant="secondary" onClick={fetchSessions}>Refresh</Button>
          }
        />
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-2">No sessions scheduled.</p>
          <p className="text-sm text-textMuted">Sessions will appear here once you're enrolled in a batch.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Live Classes & Cohort Schedule"
        description="All your upcoming live sessions, mentor hours, and cohort syncs in one place."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchSessions}>Refresh</Button>
            <Button variant="secondary" className="gap-2">
              Sync with Calendar
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'upcoming'
                ? 'bg-brand-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'today'
                ? 'bg-blue-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            Today ({todayCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'past'
                ? 'bg-gray-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            Past Sessions
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            All ({sessions.length})
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-text text-lg font-semibold tracking-tight">All Sessions</h3>
            <p className="text-sm text-textSoft">Join classes at least 5 minutes before they start.</p>
          </div>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={filteredSessions} />
        </div>
      </div>
    </>
  );
};

export default StudentLiveClasses;

