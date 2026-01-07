import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart2, RefreshCw, Calendar, Users, Clock, Filter, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const WorkloadBalancer = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchPrograms();
    fetchTutors();
    fetchSessions();
  }, [selectedDateRange, selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchTutors = async () => {
    try {
      // TODO: Replace with actual tutors API
      // Mock data for now
      setTutors([]);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const allSessions = [];

      // Get all batches
      const batchesResponse = await lsmAPI.getAllBatches();
      if (batchesResponse.success && batchesResponse.data) {
        const batches = batchesResponse.data.batches || batchesResponse.data || [];
        
        // Filter by program if selected
        const filteredBatches = selectedProgram !== 'all'
          ? batches.filter(batch => batch.courseId === selectedProgram)
          : batches;

        // Fetch sessions for each batch
        for (const batch of filteredBatches) {
          try {
            const sessionsResponse = await lsmAPI.getBatchSessions(batch.id || batch._id);
            if (sessionsResponse.success && sessionsResponse.data?.sessions) {
              const batchSessions = sessionsResponse.data.sessions.map(session => ({
                ...session,
                batchName: batch.name,
                programId: batch.courseId,
                programName: programs.find(p => (p.id || p._id) === batch.courseId)?.name || 'Unknown',
              }));
              allSessions.push(...batchSessions);
            }
          } catch (error) {
            console.error(`Error fetching sessions for batch ${batch.id}:`, error);
          }
        }
      }

      // Filter by date range
      const filteredSessions = allSessions.filter(session => {
        if (!session.scheduledDate) return false;
        const sessionDate = new Date(session.scheduledDate);
        const startDate = new Date(selectedDateRange.start);
        const endDate = new Date(selectedDateRange.end);
        return sessionDate >= startDate && sessionDate <= endDate;
      });

      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by tutor
  const sessionsByTutor = sessions.reduce((acc, session) => {
    const tutorId = session.tutorId || session.tutor?.id || session.tutor?._id || 'unassigned';
    const tutorName = session.tutorName || session.tutor?.name || session.tutor?.fullName || 'Unassigned';
    
    if (!acc[tutorId]) {
      acc[tutorId] = {
        tutorId,
        tutorName,
        sessions: [],
        totalHours: 0,
      };
    }
    
    acc[tutorId].sessions.push(session);
    // Assuming each session is 1-2 hours, adjust based on actual duration
    const duration = session.duration || 1.5;
    acc[tutorId].totalHours += duration;
    
    return acc;
  }, {});

  const tutorWorkloads = Object.values(sessionsByTutor).sort((a, b) => b.totalHours - a.totalHours);

  // Get date range for Gantt chart
  const getDateRange = () => {
    const start = new Date(selectedDateRange.start);
    const end = new Date(selectedDateRange.end);
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const dates = getDateRange();
  const maxHours = Math.max(...tutorWorkloads.map(t => t.totalHours), 1);

  return (
    <>
      <PageHeader
        title="Workload Balancer"
        description="View tutor workload distribution across all sessions"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={fetchSessions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              // TODO: Implement export functionality
              toast.info('Export functionality coming soon');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Start Date</label>
            <input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">End Date</label>
            <input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Programs</option>
              {programs.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Tutors</p>
          <p className="text-2xl font-bold text-text">{tutorWorkloads.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-green-600">
            {tutorWorkloads.reduce((sum, t) => sum + t.totalHours, 0).toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-medium text-textMuted mb-1">Avg Hours/Tutor</p>
          <p className="text-2xl font-bold text-purple-600">
            {tutorWorkloads.length > 0
              ? (tutorWorkloads.reduce((sum, t) => sum + t.totalHours, 0) / tutorWorkloads.length).toFixed(1)
              : '0'}
          </p>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
            <p className="text-textMuted">Loading workload data...</p>
          </div>
        ) : tutorWorkloads.length === 0 ? (
          <div className="text-center py-12">
            <BarChart2 className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No sessions found for the selected date range.</p>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Tutor Workload Distribution</h3>
            
            {/* Gantt Chart */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header with dates */}
                <div className="flex border-b border-brintelli-border pb-2 mb-2">
                  <div className="w-48 flex-shrink-0 font-semibold text-sm text-text">Tutor</div>
                  <div className="flex-1 flex">
                    {dates.map((date, idx) => (
                      <div
                        key={idx}
                        className="flex-1 text-center text-xs text-textMuted min-w-[60px]"
                      >
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    ))}
                  </div>
                  <div className="w-24 flex-shrink-0 text-right font-semibold text-sm text-text">Total</div>
                </div>

                {/* Rows for each tutor */}
                {tutorWorkloads.map((tutorWorkload) => {
                  // Get sessions for each date
                  const sessionsByDate = dates.map(date => {
                    const dateStr = date.toISOString().split('T')[0];
                    return tutorWorkload.sessions.filter(s => {
                      const sessionDate = s.scheduledDate
                        ? new Date(s.scheduledDate).toISOString().split('T')[0]
                        : null;
                      return sessionDate === dateStr;
                    });
                  });

                  return (
                    <div key={tutorWorkload.tutorId} className="flex border-b border-brintelli-border/30 py-2 hover:bg-brintelli-baseAlt/30">
                      <div className="w-48 flex-shrink-0 flex items-center gap-2">
                        <Users className="h-4 w-4 text-textMuted" />
                        <span className="text-sm text-text font-medium truncate">
                          {tutorWorkload.tutorName}
                        </span>
                      </div>
                      <div className="flex-1 flex">
                        {sessionsByDate.map((daySessions, dateIdx) => (
                          <div
                            key={dateIdx}
                            className="flex-1 min-w-[60px] flex items-center justify-center"
                          >
                            {daySessions.length > 0 && (
                              <div className="flex flex-col gap-0.5">
                                {daySessions.map((session, sessionIdx) => (
                                  <div
                                    key={sessionIdx}
                                    className="h-4 bg-brand-500 rounded text-white text-[8px] flex items-center justify-center px-1 truncate"
                                    title={`${session.title || 'Session'} - ${session.batchName || ''}`}
                                  >
                                    {daySessions.length === 1 ? '●' : `${sessionIdx + 1}`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="w-24 flex-shrink-0 text-right flex items-center justify-end">
                        <div className="text-sm text-text font-semibold">
                          {tutorWorkload.totalHours.toFixed(1)}h
                        </div>
                        <div className="ml-2 w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${(tutorWorkload.totalHours / maxHours) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-brintelli-border">
              <div className="flex items-center gap-4 text-xs text-textMuted">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-500 rounded" />
                  <span>Session scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div className="w-full bg-brand-500 h-2 rounded-full" />
                  </div>
                  <span>Workload indicator</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkloadBalancer;



