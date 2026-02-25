import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Video } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import { studentAPI } from '../../../api/student';

const Logs = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [statusFilter, sessionLogs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollment to get current mentor and session logs
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

        // Get session logs from bookedCalls
        if (enrollmentData.bookedCalls) {
          const logs = enrollmentData.bookedCalls.map(call => ({
            ...call,
            scheduledDate: call.scheduledDate ? new Date(call.scheduledDate) : null,
            createdAt: call.createdAt ? new Date(call.createdAt) : new Date(),
          })).sort((a, b) => {
            const dateA = a.scheduledDate || a.createdAt;
            const dateB = b.scheduledDate || b.createdAt;
            return dateB - dateA;
          });
          
          setSessionLogs(logs);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load session logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...sessionLogs];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircle2;
      case 'SCHEDULED':
        return Calendar;
      case 'CANCELLED':
        return XCircle;
      case 'PENDING':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: sessionLogs.length,
    completed: sessionLogs.filter(l => l.status === 'COMPLETED').length,
    scheduled: sessionLogs.filter(l => l.status === 'SCHEDULED').length,
    pending: sessionLogs.filter(l => l.status === 'PENDING').length,
  };

  return (
    <>
      <PageHeader
        title="Session Logs"
        description="View your mentoring session history"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading session logs...</p>
        </div>
      ) : !currentMentor ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No mentor assigned yet</p>
          <p className="text-sm text-textMuted mt-2">
            Please select a mentor first to view session logs
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mentor Info */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                {currentMentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{currentMentor.name}</h3>
                <p className="text-sm text-textMuted">{currentMentor.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-4 mb-6">
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textMuted mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-brand-600">{stats.total}</p>
                </div>
                <FileText className="h-12 w-12 text-brand-600 opacity-20" />
              </div>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50 shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
              </div>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Scheduled</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
            </div>
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Session Logs */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
                <p className="text-textMuted">
                  {statusFilter !== 'ALL'
                    ? 'No sessions found with this status'
                    : 'No session logs available'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => {
                  const StatusIcon = getStatusIcon(log.status);
                  return (
                    <div
                      key={log.id}
                      className={`flex flex-col gap-3 rounded-xl border-2 p-4 ${getStatusColor(log.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <StatusIcon className="h-5 w-5" />
                          <div className="flex-1">
                            <p className="font-semibold">{log.reason || 'Mentoring Session'}</p>
                            <div className="flex items-center gap-4 text-xs mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(log.scheduledDate || log.createdAt)}</span>
                              </div>
                              {log.duration && (
                                <span>Duration: {log.duration} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex rounded-full bg-white/50 px-3 py-1 text-xs font-semibold">
                          {log.status}
                        </span>
                      </div>

                      {log.notes && (
                        <div className="p-3 bg-white/50 rounded-lg">
                          <p className="text-xs font-semibold mb-1">Session Notes:</p>
                          <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                        </div>
                      )}

                      {log.outcome && (
                        <div className="p-3 bg-white/50 rounded-lg">
                          <p className="text-xs font-semibold mb-1">Outcome:</p>
                          <p className="text-sm whitespace-pre-wrap">{log.outcome}</p>
                        </div>
                      )}

                      {log.report && (
                        <div className="p-3 bg-white/50 rounded-lg">
                          <p className="text-xs font-semibold mb-1">Meeting Report:</p>
                          <p className="text-sm whitespace-pre-wrap">{log.report}</p>
                        </div>
                      )}

                      {log.meetingLink && log.status === 'SCHEDULED' && (
                        <a
                          href={log.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border"
                        >
                          <Video className="h-4 w-4" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Logs;

























