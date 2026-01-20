import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Clock, User, Calendar, Video, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import mentorAPI from '../../api/mentor';

const SessionLogs = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    // Filter meetings based on search and status
    let filtered = meetings;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.studentName?.toLowerCase().includes(term) ||
        m.studentEmail?.toLowerCase().includes(term) ||
        m.reason?.toLowerCase().includes(term) ||
        m.report?.toLowerCase().includes(term)
      );
    }

    setFilteredMeetings(filtered);
  }, [searchTerm, statusFilter, meetings]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getAllMeetings();
      
      if (response.success) {
        const meetingsData = response.data.meetings || [];
        // Sort by date (most recent first)
        const sorted = meetingsData.sort((a, b) => {
          const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(a.createdAt || 0);
          const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        setMeetings(sorted);
        setFilteredMeetings(sorted);
      } else {
        toast.error(response.message || 'Failed to load session logs');
        setMeetings([]);
        setFilteredMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error(error.message || 'Failed to load session logs');
      setMeetings([]);
      setFilteredMeetings([]);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'SCHEDULED':
        return { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' };
      case 'PENDING':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const completedMeetings = meetings.filter(m => m.status === 'COMPLETED');
  const withReports = completedMeetings.filter(m => m.report);

  return (
    <>
      <PageHeader
        title="Session Logs"
        description="View and manage session logs and history"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-brand-600">{meetings.length}</p>
            </div>
            <FileText className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedMeetings.length}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Reports Submitted</p>
              <p className="text-3xl font-bold text-accent-600">{withReports.length}</p>
            </div>
            <FileText className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by student name, email, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <Button variant="ghost" size="sm" onClick={fetchMeetings}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Session Logs List */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Session History</h3>
            <p className="text-sm text-textMuted mt-1">
              {filteredMeetings.length} session{filteredMeetings.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading session logs...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm || statusFilter !== 'all' 
                ? 'No sessions found matching your filters'
                : 'No session logs available'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
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
                      {meeting.scheduledDate && (
                        <div className="flex items-center gap-2 text-sm text-textMuted">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(meeting.scheduledDate)}</span>
                          {meeting.duration && <span>• {meeting.duration} minutes</span>}
                        </div>
                      )}
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {meeting.report && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold mb-1">Meeting Report</p>
                      <p className="text-sm text-text">{meeting.report}</p>
                      {meeting.reportSubmittedAt && (
                        <p className="text-xs text-textMuted mt-1">
                          Submitted: {formatDateTime(meeting.reportSubmittedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {meeting.notes && !meeting.report && (
                    <div className="mt-2 p-3 bg-brintelli-baseAlt rounded-lg">
                      <p className="text-xs text-textMuted mb-1">Notes:</p>
                      <p className="text-sm text-text">{meeting.notes}</p>
                    </div>
                  )}

                  {meeting.outcome && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 font-semibold mb-1">Outcome:</p>
                      <p className="text-sm text-text">{meeting.outcome}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default SessionLogs;

