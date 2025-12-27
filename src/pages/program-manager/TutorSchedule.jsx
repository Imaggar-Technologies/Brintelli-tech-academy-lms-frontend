import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, BookOpen, Video, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { apiRequest } from '../../api/apiClient';
import lsmAPI from '../../api/lsm';
import { useNavigate } from 'react-router-dom';

const TutorSchedule = () => {
  const navigate = useNavigate();
  const ALL_TUTORS_ID = '__ALL_TUTORS__';

  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  // Default to All Tutors (no placeholder option needed)
  const [selectedTutorId, setSelectedTutorId] = useState(ALL_TUTORS_ID);
  const [sessions, setSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'

  const tutorsById = useMemo(() => {
    const map = new Map();
    tutors.forEach((t) => map.set(t.id || t._id, t));
    return map;
  }, [tutors]);

  const selectedTutor = useMemo(() => {
    if (!selectedTutorId || selectedTutorId === ALL_TUTORS_ID) return null;
    return tutorsById.get(selectedTutorId) || null;
  }, [selectedTutorId, tutorsById]);

  const isAllTutors = selectedTutorId === ALL_TUTORS_ID;

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    if (selectedTutorId) {
      fetchTutorSessions();
    }
  }, [selectedTutorId, currentDate]);

  const fetchTutors = async () => {
    try {
      const response = await apiRequest('/api/users/role/tutor');
      if (response.success) {
        const users = response.data?.users || [];
        const normalized = users.map((t, idx) => ({
          ...t,
          id: t.id || t._id || `tutor-${idx}`,
          _id: t._id || t.id || `tutor-${idx}`,
          fullName: t.fullName || t.name || (t.email ? t.email.split('@')[0] : 'Unknown Tutor'),
        }));
        setTutors(normalized);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast.error(error?.message || 'Failed to load tutors');
    }
  };

  const fetchTutorSessions = async () => {
    if (!selectedTutorId) {
      setSessions([]);
      return;
    }

    try {
      setLoading(true);

      // All tutors mode: fetch sessions for every tutor and annotate with tutorName
      if (isAllTutors) {
        // Ensure we have tutors list available immediately (don't rely on async state timing)
        let tutorList = tutorsById.size ? Array.from(tutorsById.values()) : tutors;
        if (!tutorList.length) {
          const tutorRes = await apiRequest('/api/users/role/tutor');
          const users = tutorRes?.data?.users || [];
          tutorList = users.map((t, idx) => ({
            ...t,
            id: t.id || t._id || `tutor-${idx}`,
            _id: t._id || t.id || `tutor-${idx}`,
            fullName: t.fullName || t.name || (t.email ? t.email.split('@')[0] : 'Unknown Tutor'),
          }));
          setTutors(tutorList);
        }

        const results = await Promise.allSettled(
          tutorList.map(async (t) => {
            const tutorId = t.id || t._id;
            const res = await apiRequest(`/api/tutors/sessionsByTutor?tutorId=${tutorId}`);
            const arr = res?.data?.sessions || [];
            return arr.map((s) => ({
              ...s,
              tutorName: t.fullName || t.email,
              tutorId,
            }));
          })
        );

        const combined = results
          .filter((r) => r.status === 'fulfilled')
          .flatMap((r) => r.value);

        const mappedSessions = combined.map((session) => {
          let scheduledDate = session.scheduledDate;
          if (scheduledDate) {
            const testDate = new Date(scheduledDate);
            if (isNaN(testDate.getTime())) scheduledDate = null;
          }
          return {
            ...session,
            scheduledDate,
            batchName: session.batch?.name || session.batchName || 'Unknown Batch',
            id: session.id || session._id,
            _id: session._id || session.id,
          };
        });

        setSessions(mappedSessions);
        if (mappedSessions.length === 0) toast.info('No sessions found across tutors');
        return;
      }

      // Single tutor mode
      const tutorId = selectedTutor?.id || selectedTutor?._id || selectedTutorId;
      let response;
      try {
        response = await apiRequest(`/api/tutors/sessionsByTutor?tutorId=${tutorId}`);
      } catch (error) {
        response = await apiRequest(`/api/tutors/sessions-by-tutor?tutorId=${tutorId}`);
      }

      if (response.success && response.data) {
        const sessionsArray = response.data.sessions || [];
        
        if (sessionsArray.length > 0) {
          console.log('First 3 sessions:');
          sessionsArray.slice(0, 3).forEach((s, idx) => {
            console.log(`  Session ${idx + 1}:`, {
              name: s.name,
              scheduledDate: s.scheduledDate,
              scheduledDateType: typeof s.scheduledDate,
              tutorId: s.tutorId,
              batch: s.batch?.name,
            });
          });
        }
        
        // Map sessions to include batchName for display
        const mappedSessions = sessionsArray.map(session => {
          // Keep scheduledDate as-is, but ensure it's a valid date string
          let scheduledDate = session.scheduledDate;
          if (scheduledDate) {
            // Test if it's a valid date
            const testDate = new Date(scheduledDate);
            if (isNaN(testDate.getTime())) {
              console.warn('Invalid date found:', scheduledDate);
              scheduledDate = null;
            }
          }
          
          const mapped = {
            ...session,
            scheduledDate: scheduledDate,
            batchName: session.batch?.name || session.batchName || 'Unknown Batch',
            id: session.id || session._id,
            _id: session._id || session.id,
            tutorName: selectedTutor?.fullName || selectedTutor?.email || null,
          };
          return mapped;
        });
        
        const sessionsWithDates = mappedSessions.filter(s => s.scheduledDate);
        console.log('Sessions with valid dates:', sessionsWithDates.length);
        
        if (sessionsWithDates.length > 0) {
          console.log('Date breakdown:');
          sessionsWithDates.forEach((s, idx) => {
            const date = new Date(s.scheduledDate);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            console.log(`  ${s.name}: ${dateStr} (${date.toLocaleString()})`);
          });
        }
        
        setSessions(mappedSessions);
        
        if (mappedSessions.length === 0) {
          toast.info('No sessions found for this tutor');
        } else if (sessionsWithDates.length === 0) {
          toast.warning('Sessions found but none have scheduled dates');
        } else {
          toast.success(`Loaded ${sessionsWithDates.length} session${sessionsWithDates.length !== 1 ? 's' : ''} with dates`);
        }
      } else {
        console.error('API response not successful:', response);
        toast.error(response.message || 'Failed to load sessions');
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching tutor sessions:', error);
      console.error('Error details:', error.response || error.message);
      toast.error(error.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
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

  const getSessionId = (session) =>
    session?.id || session?._id || session?.sessionId || session?.sessionID || null;

  const openSessionDetails = (session) => {
    const sessionId = getSessionId(session);
    if (!sessionId) {
      console.warn('[TutorSchedule] Missing session id, cannot navigate:', session);
      toast.error('Unable to open session details (missing session id)');
      return;
    }
    navigate(`/program-manager/sessions/${sessionId}`, { state: { session } });
  };

  const getPrimaryLabel = (session) => {
    // In All Tutors mode, show Tutor name prominently (requested)
    if (isAllTutors) return session.tutorName || 'Unknown Tutor';
    // In single tutor mode, show Session name prominently (requested)
    return session.name || 'Unnamed Session';
  };

  const getSecondaryLabel = (session) => {
    // In All Tutors mode, show Session name as secondary context
    if (isAllTutors) return session.name || 'Unnamed Session';
    // In single tutor mode, show Batch as secondary context
    return session.batchName || session.batch?.name || null;
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
    
    // Get date in local timezone (YYYY-MM-DD format)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // NOTE: Don't reference `matchingSessions` inside the filter callback (temporal dead zone).
    let debugMatchesLogged = 0;

    const matchingSessions = sessions.filter(session => {
      if (!session.scheduledDate) {
        return false;
      }
      
      try {
        // Handle both string and Date object
        let sessionDate;
        if (session.scheduledDate instanceof Date) {
          sessionDate = session.scheduledDate;
        } else if (typeof session.scheduledDate === 'string') {
          sessionDate = new Date(session.scheduledDate);
        } else {
          return false;
        }
        
        if (isNaN(sessionDate.getTime())) {
          return false;
        }
        
        // Compare dates in local timezone (ignore time)
        const sessionYear = sessionDate.getFullYear();
        const sessionMonth = String(sessionDate.getMonth() + 1).padStart(2, '0');
        const sessionDay = String(sessionDate.getDate()).padStart(2, '0');
        const sessionDateStr = `${sessionYear}-${sessionMonth}-${sessionDay}`;
        
        const matches = sessionDateStr === dateStr;
        
        // Debug logging for first few matches
        if (matches && debugMatchesLogged < 3) {
          debugMatchesLogged += 1;
          console.log(`Session "${session.name}" matches date ${dateStr}`, {
            sessionDate: session.scheduledDate,
            parsedDate: sessionDateStr,
            calendarDate: dateStr,
          });
        }
        
        return matches;
      } catch (error) {
        console.error('Error parsing session date:', session.scheduledDate, error);
        return false;
      }
    });
    
    return matchingSessions;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(currentDate);

  return (
    <>
      <PageHeader
        title="Tutor Schedule Calendar"
        description="View all tutor classes and sessions in a calendar view."
      />

      <div className="space-y-6">
        {/* Tutor Selection */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-text">Select Tutor:</label>
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text"
            >
              <option value={ALL_TUTORS_ID}>All Tutors</option>
              {tutors.map((tutor) => (
                <option key={tutor.id || tutor._id} value={tutor.id || tutor._id}>
                  {tutor.fullName || tutor.email}
                </option>
              ))}
            </select>
            {selectedTutorId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTutorId(ALL_TUTORS_ID);
                  setSessions([]);
                }}
              >
                Clear Filter
              </Button>
            )}
          </div>
          {selectedTutorId && (
            <div className="mt-4 text-sm text-textMuted">
              {isAllTutors ? (
                <>Showing sessions across <span className="font-semibold text-text">all tutors</span></>
              ) : (
                <>Showing all sessions assigned to <span className="font-semibold text-text">{selectedTutor?.fullName || selectedTutor?.email}</span></>
              )}
            </div>
          )}
        </div>

        {/* Calendar */}
        {selectedTutorId ? (
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
                      {isAllTutors ? 'All Tutors' : (selectedTutor?.fullName || selectedTutor?.email)}
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

                  return (
                    <div
                      key={index}
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
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              isToday ? 'text-brand-700' : 'text-text'
                            }`}
                          >
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {daySessions.length > 0 ? (
                              <>
                                {daySessions.slice(0, 3).map((session, sessionIndex) => {
                                  const sessionId = session.id || session._id || `session-${sessionIndex}`;
                                  return (
                                    <button
                                      type="button"
                                      key={sessionId}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        openSessionDetails(session);
                                      }}
                                      className={`w-full text-left text-xs p-1.5 rounded border hover:shadow-sm cursor-pointer transition-colors ${getStatusStyles(session.status)}`}
                                      title={`${session.name} - ${formatTime(session.scheduledDate)}`}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <Clock className="h-3 w-3" />
                                        <span className="font-medium truncate">
                                          {formatTime(session.scheduledDate)}
                                        </span>
                                      </div>
                                      <div className="truncate font-semibold">{getPrimaryLabel(session)}</div>
                                      {getSecondaryLabel(session) && (
                                        <div className="text-[10px] text-textMuted truncate">
                                          {getSecondaryLabel(session)}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                                {daySessions.length > 3 && (
                                  <div className="text-xs text-textMuted text-center py-1">
                                    +{daySessions.length - 3} more
                                  </div>
                                )}
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
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-100/50 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-lg font-semibold text-text">Select a tutor to view schedule</p>
            <p className="mt-2 text-sm text-textMuted">
              Choose a tutor from the dropdown above to see their class schedule
            </p>
          </div>
        )}
        
      </div>
    </>
  );
};

export default TutorSchedule;

