import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, BookOpen, Video, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { apiRequest } from '../../api/apiClient';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchPrograms();
      await fetchSessions();
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [selectedProgramId, currentDate]);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success && response.data?.programs) {
        setPrograms(response.data.programs);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const allSessions = [];

      // Get all batches
      const batchesResponse = await lsmAPI.getAllBatches();
      if (batchesResponse.success && batchesResponse.data) {
        const batches = batchesResponse.data;
        
        // Filter batches by program if selected
        const filteredBatches = selectedProgramId
          ? batches.filter(batch => batch.courseId === selectedProgramId)
          : batches;

        // Create a program name map for quick lookup
        const programMap = new Map();
        programs.forEach(p => {
          const id = p.id || p._id;
          if (id) programMap.set(id, p.name);
        });

        // Fetch sessions for each batch
        const sessionPromises = filteredBatches.map(async (batch) => {
          try {
            const sessionsResponse = await lsmAPI.getBatchSessions(batch.id || batch._id);
            if (sessionsResponse.success && sessionsResponse.data?.sessions) {
              return sessionsResponse.data.sessions.map(session => ({
                ...session,
                id: session.id || session._id,
                _id: session._id || session.id,
                batchId: batch.id || batch._id,
                batchName: batch.name || 'Unknown Batch',
                programId: batch.courseId,
                programName: batch.courseId ? (programMap.get(batch.courseId) || 'Unknown Program') : 'Unknown Program',
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error fetching sessions for batch ${batch.id}:`, error);
            return [];
          }
        });

        const sessionArrays = await Promise.all(sessionPromises);
        allSessions.push(...sessionArrays.flat());
      }

      // Filter sessions to only include those with valid scheduled dates
      const validSessions = allSessions.filter(session => {
        if (!session.scheduledDate) return false;
        const date = new Date(session.scheduledDate);
        return !isNaN(date.getTime());
      });

      setSessions(validSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error(error.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
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
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getSessionsForDate = (date) => {
    if (!date) return [];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return sessions.filter(session => {
      if (!session.scheduledDate) return false;
      
      try {
        const sessionDate = new Date(session.scheduledDate);
        if (isNaN(sessionDate.getTime())) return false;
        
        const sessionYear = sessionDate.getFullYear();
        const sessionMonth = String(sessionDate.getMonth() + 1).padStart(2, '0');
        const sessionDay = String(sessionDate.getDate()).padStart(2, '0');
        const sessionDateStr = `${sessionYear}-${sessionMonth}-${sessionDay}`;
        
        return sessionDateStr === dateStr;
      } catch (error) {
        return false;
      }
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const daySessions = getSessionsForDate(date);
    if (daySessions.length > 0) {
      setSelectedDate(date);
      setShowModal(true);
    }
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'ONGOING':
        return 'Ongoing';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(currentDate);
  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];

  // Group sessions by program for the modal
  const sessionsByProgram = useMemo(() => {
    const grouped = {};
    selectedDateSessions.forEach(session => {
      const programName = session.programName || 'Unknown Program';
      if (!grouped[programName]) {
        grouped[programName] = [];
      }
      grouped[programName].push(session);
    });
    return grouped;
  }, [selectedDateSessions]);

  return (
    <>
      <PageHeader
        title="Academic Calendar"
        description="View all classes and sessions across all programs in a calendar view."
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-textMuted" />
              <label className="text-sm font-medium text-text">Filter by Program:</label>
            </div>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id || program._id} value={program.id || program._id}>
                  {program.name}
                </option>
              ))}
            </select>
            {selectedProgramId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProgramId('')}
              >
                Clear Filter
              </Button>
            )}
          </div>
          {selectedProgramId && (
            <div className="mt-4 text-sm text-textMuted">
              Showing sessions for{' '}
              <span className="font-semibold text-text">
                {programs.find(p => (p.id || p._id) === selectedProgramId)?.name || 'Selected Program'}
              </span>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 border-b border-brintelli-border/60 bg-gradient-to-r from-brand-50/50 to-purple-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-600 p-2 text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text">{getMonthName(currentDate)}</h3>
                  <p className="text-sm text-textMuted">
                    {sessions.length} total session{sessions.length !== 1 ? 's' : ''} this month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="gap-1.5"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                  className="gap-1.5"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-textMuted">Loading calendar...</div>
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

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    const daySessions = getSessionsForDate(date);
                    const isToday =
                      date &&
                      date.toDateString() === new Date().toDateString();
                    const hasSessions = daySessions.length > 0;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayClick(date)}
                        disabled={!date || !hasSessions}
                        className={`min-h-[100px] rounded-xl border p-2 text-left transition-all ${
                          date
                            ? isToday
                              ? 'border-brand-500 bg-brand-50/30 hover:bg-brand-50/50'
                              : hasSessions
                              ? 'border-brand-300/60 bg-brand-50/20 hover:border-brand-400/60 hover:bg-brand-50/30 cursor-pointer'
                              : 'border-brintelli-border/60 bg-white hover:border-brand-300/60'
                            : 'border-transparent cursor-default'
                        } ${!date || !hasSessions ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {date && (
                          <>
                            <div
                              className={`text-sm font-semibold mb-1 ${
                                isToday ? 'text-brand-700' : 'text-text'
                              }`}
                            >
                              {date.getDate()}
                            </div>
                            {hasSessions ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                  <span className="text-xs font-semibold text-brand-700">
                                    {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-textMuted text-center py-1">No sessions</div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sessions Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDate(null);
        }}
        title={
          selectedDate ? (
            <div>
              <h2 className="text-xl font-semibold text-text">Sessions on {formatDate(selectedDate)}</h2>
              <p className="text-sm text-textMuted mt-1">
                {selectedDateSessions.length} session{selectedDateSessions.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
          ) : (
            'Sessions'
          )
        }
        size="lg"
      >
        {selectedDateSessions.length === 0 ? (
          <div className="text-center py-8 text-textMuted">
            No sessions scheduled for this day.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(sessionsByProgram).map(([programName, programSessions]) => (
              <div key={programName} className="border-b border-brintelli-border/60 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-brand-600" />
                  <h3 className="font-semibold text-text">{programName}</h3>
                  <span className="text-xs text-textMuted">
                    ({programSessions.length} session{programSessions.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="space-y-2">
                  {programSessions
                    .sort((a, b) => {
                      const dateA = new Date(a.scheduledDate);
                      const dateB = new Date(b.scheduledDate);
                      return dateA - dateB;
                    })
                    .map((session) => (
                      <div
                        key={session.id || session._id}
                        className={`rounded-lg border p-4 ${getStatusStyles(session.status)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{session.name || 'Unnamed Session'}</h4>
                            <div className="flex items-center gap-4 text-xs text-textMuted">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(session.scheduledDate)}</span>
                              </div>
                              {session.duration && (
                                <span>{session.duration} minutes</span>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{session.batchName || 'Unknown Batch'}</span>
                              </div>
                            </div>
                            {session.description && (
                              <p className="text-xs text-textMuted mt-2 line-clamp-2">
                                {session.description}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <span className="text-xs font-medium px-2 py-1 rounded bg-white/60">
                              {getStatusBadge(session.status)}
                            </span>
                          </div>
                        </div>
                        {session.type && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Video className="h-3 w-3" />
                            <span className="capitalize">{session.type}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default CalendarPage;

