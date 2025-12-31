import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Video, Calendar, AlertCircle, ExternalLink, User, Mail, Phone, Briefcase, CheckCircle2, Clock, X } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import studentAPI from '../../api/student';
import { useNavigate } from "react-router-dom";

const StudentLiveClasses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'today'
  const [enrollment, setEnrollment] = useState(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
 
  useEffect(() => {
    fetchSessions();
    fetchEnrollment();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMySessions();
      if (response.success) {
        const sessionsData = response.data.sessions || [];
        // Debug: Log raw data
        console.log('[LiveClasses] Raw sessions data:', sessionsData);
        // Ensure sessions have proper structure - preserve all original fields
        const normalizedSessions = sessionsData.map((session, index) => {
          // Handle empty strings as missing values, but preserve non-empty strings
          let sessionName = session.name;
          if (sessionName && typeof sessionName === 'string') {
            sessionName = sessionName.trim();
            if (sessionName === '') {
              sessionName = null;
            }
          }
          console.log(session,session.name)
          // Preserve all original fields and add normalized ones
          const normalized = {
            ...session, // Preserve all original fields first
            id: session.id || session._id?.toString() || String(session._id) || '',
            name: session.name ,
            description: session.description?.trim() || session.description || null,
            type: session.type || 'LIVE',
            status: session.status || 'SCHEDULED',
            scheduledDate: session.scheduledDate || null,
            duration: session.duration || 120,
            meetingLink: session.meetingLink || null,
            recordingUrl: session.recordingUrl || null,
            materials: session.materials || [],
            moduleId: session.moduleId || null,
          };
          // Debug: Log each normalized session
          if (index < 2) {
            console.log(`[LiveClasses] Session ${index} - Original:`, session);
            console.log(`[LiveClasses] Session ${index} - Normalized:`, normalized);
          }
          return normalized;
        });
        console.log('[LiveClasses] Total normalized sessions:', normalizedSessions.length);
        console.log('[LiveClasses] First session name check:', normalizedSessions[0]?.name);
        setSessions(normalizedSessions);
      } else {
        console.error('Sessions API error:', response.message);
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

  const fetchEnrollment = async () => {
    try {
      setLoadingEnrollment(true);
      const response = await studentAPI.getMyEnrollment();
      if (response.success) {
        setEnrollment(response.data.enrollment);
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const handleBookCall = async (mentorId) => {
    try {
      const response = await studentAPI.bookMentorCall(mentorId);
      if (response.success) {
        toast.success('Call request sent! The mentor will schedule a time with you.');
        fetchEnrollment(); // Refresh enrollment data
      }
    } catch (error) {
      console.error('Error booking call:', error);
      toast.error(error.message || 'Failed to book call');
    }
  };

  const handleSelectMentor = async (mentorId) => {
    try {
      const response = await studentAPI.selectMentor(mentorId);
      if (response.success) {
        toast.success('Mentor selected successfully!');
        fetchEnrollment(); // Refresh enrollment data
        setShowMentorModal(false);
      }
    } catch (error) {
      console.error('Error selecting mentor:', error);
      toast.error(error.message || 'Failed to select mentor');
    }
  };

  const hasBookedCall = (mentorId) => {
    if (!enrollment?.bookedCalls) return false;
    return enrollment.bookedCalls.some(call => 
      call.mentorId === mentorId && ['PENDING', 'SCHEDULED', 'COMPLETED'].includes(call.status)
    );
  };

  const hasCompletedCall = (mentorId) => {
    if (!enrollment?.bookedCalls) return false;
    return enrollment.bookedCalls.some(call => 
      call.mentorId === mentorId && call.status === 'COMPLETED'
    );
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

  const StatusPill = ({ status, isLive, hasRecording }) => {
    const displayStatus = status || 'SCHEDULED';
    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(displayStatus)}`}>
          {displayStatus}
        </span>
        {isLive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/60">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            LIVE
          </span>
        )}
        {hasRecording && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200/60">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            REC
          </span>
        )}
      </div>
    );
  };

  const columns = [
    {
      key: "name",
      title: "Session",
      render: (_value, row) => {
        if (!row) return <span className="text-textMuted">—</span>;
        return (
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium text-text">{row.name || 'Untitled Session'}</div>
              {row.status === 'ONGOING' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/60">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  LIVE
                </span>
              )}
              {!!row.recordingUrl && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-violet-200/60">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  REC
                </span>
              )}
            </div>
            {row.description && (
              <div className="text-xs text-textMuted mt-1 line-clamp-1">{row.description}</div>
            )}
          </div>
        );
      },
    },
    {
      key: "type",
      title: "Type",
      render: (_value, row) => {
        if (!row) return <span className="text-textMuted">—</span>;
        return (
          <span className="text-sm text-textSoft font-medium">
            {row.type || 'LIVE'}
          </span>
        );
      },
    },
    {
      key: "scheduledDate",
      title: "Time",
      render: (_value, row) => {
        if (!row) return <span className="text-textMuted">—</span>;
        return (
          <div>
            <div className="text-sm text-text font-medium">
              {formatSessionTime(row.scheduledDate, row.duration)}
            </div>
            {row.duration && (
              <div className="text-xs text-textMuted mt-0.5">
                Duration: {row.duration} minutes
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      render: (_value, row) => {
        if (!row) return <span className="text-textMuted">—</span>;
        return (
          <StatusPill
            status={row.status || 'SCHEDULED'}
            isLive={row.status === 'ONGOING'}
            hasRecording={!!row.recordingUrl}
          />
        );
      },
    },
    {
      key: "action",
      title: "Action",
      render: (_value, row) => {
        if (!row || !row.id) return <span className="text-xs text-textMuted">—</span>;
        
        const canJoin = (row.status === 'SCHEDULED' || row.status === 'ONGOING') && row.id;
        const hasMeetingLink = !!row.meetingLink;
        const isUpcoming = row.scheduledDate && new Date(row.scheduledDate) > new Date();
        
        return (
          <div className="flex gap-2">
            {canJoin && (
              <>
                {hasMeetingLink || row.status === 'ONGOING' ? (
                  <Button
                    size="sm"
                    className="px-4 py-2 text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/sessions/${row.id}/live`);
                    }}
                  >
                    Join Room
                    <Video className="h-3.5 w-3.5 ml-1" />
                  </Button>
                ) : isUpcoming ? (
                  <span className="text-xs text-textMuted flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Link will be available soon
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="px-4 py-2 text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/sessions/${row.id}/live`);
                    }}
                  >
                    Join Room
                    <Video className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </>
            )}
            {!canJoin && row.status === 'SCHEDULED' && !row.id && (
              <span className="text-xs text-textMuted">Session ID missing</span>
            )}
            {!!row.recordingUrl && (
              <Button
                variant="secondary"
                size="sm"
                className="px-4 py-2 text-xs font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(row.recordingUrl, '_blank');
                }}
              >
                Watch Recording
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
            {!row.recordingUrl && row.status !== 'SCHEDULED' && row.status !== 'ONGOING' && row.status !== 'COMPLETED' && (
              <span className="text-xs text-textMuted">No link available</span>
            )}
            {row.status === 'COMPLETED' && !row.recordingUrl && (
              <span className="text-xs text-textMuted">Session completed</span>
            )}
          </div>
        );
      },
    },
  ];

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = sessions;
    switch (filter) {
      case 'upcoming':
        // Upcoming should also include ONGOING sessions so learners can join instantly.
        filtered = sessions.filter(s => {
          if (s.status === 'ONGOING') return true;
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
      // Always keep ONGOING sessions at the top
      if (a.status === 'ONGOING' && b.status !== 'ONGOING') return -1;
      if (b.status === 'ONGOING' && a.status !== 'ONGOING') return 1;
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return new Date(a.scheduledDate) - new Date(b.scheduledDate);
    });
  }, [sessions, filter]);
  
  // Debug: Log filtered sessions when they change
  useEffect(() => {
    if (filteredSessions.length > 0) {
      console.log('[LiveClasses] Filtered sessions for table:', filteredSessions.slice(0, 2));
      console.log('[LiveClasses] First filtered session name:', filteredSessions[0]?.name);
    }
  }, [filteredSessions]);
  
  const upcomingCount = sessions.filter(s => {
    if (s.status === 'ONGOING') return true;
    if (!s.scheduledDate) return s.status === 'SCHEDULED';
    return new Date(s.scheduledDate) > new Date() && (s.status === 'SCHEDULED' || s.status === 'ONGOING');
  }).length;
  
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

      {/* Mentor Selection Section */}
      {enrollment && !enrollment.mentorId && enrollment.suggestedMentors && enrollment.suggestedMentors.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Choose Your Mentor</h3>
              <p className="text-sm text-textMuted mt-1">
                Book a call with each suggested mentor, then select the one you'd like to work with.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollment.suggestedMentors.map((mentor) => {
              const hasCall = hasBookedCall(mentor.id);
              const hasCompleted = hasCompletedCall(mentor.id);
              const callInfo = enrollment.bookedCalls?.find(c => c.mentorId === mentor.id);

              return (
                <div
                  key={mentor.id}
                  className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text truncate">{mentor.name}</h4>
                      {mentor.experience && (
                        <p className="text-xs text-textMuted truncate">{mentor.experience}</p>
                      )}
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="text-sm text-textSoft mb-3 line-clamp-2">{mentor.bio}</p>
                  )}

                  <div className="space-y-2 mb-3">
                    {mentor.email && (
                      <div className="flex items-center gap-2 text-xs text-textMuted">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{mentor.email}</span>
                      </div>
                    )}
                    {mentor.availableSlots !== undefined && (
                      <div className="flex items-center gap-2 text-xs text-textMuted">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{mentor.availableSlots} slots available</span>
                      </div>
                    )}
                  </div>

                  {/* Call Status */}
                  {hasCall && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center gap-2 text-xs text-blue-700">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {callInfo?.status === 'PENDING' && 'Call request sent'}
                          {callInfo?.status === 'SCHEDULED' && callInfo?.scheduledDate && (
                            <>Scheduled: {new Date(callInfo.scheduledDate).toLocaleString()}</>
                          )}
                          {callInfo?.status === 'COMPLETED' && 'Call completed ✓'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!hasCall ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBookCall(mentor.id)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Request Call
                      </Button>
                    ) : hasCompleted ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSelectMentor(mentor.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Select Mentor
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Call Pending
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowMentorModal(true);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4 opacity-50" />
              <p className="text-textMuted">No sessions found for the selected filter.</p>
              <p className="text-sm text-textMuted mt-2">Try selecting a different filter or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-brintelli-border/60 bg-white">
              <table className="min-w-full divide-y divide-brintelli-border/40">
                <thead className="bg-gradient-to-b from-brand-50/50 to-transparent">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-textMuted first:pl-6 last:pr-6"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-brintelli-border/30">
                  {filteredSessions.map((row, rowIndex) => {
                    const rowId = row.id || rowIndex;
                    return (
                      <tr
                        key={rowId}
                        className="transition-all duration-200 hover:bg-brand-50/30 border-l-4 border-l-transparent"
                      >
                        {columns.map((column) => {
                          const value = row[column.key];
                          return (
                            <td
                              key={column.key}
                              className={`px-6 py-4 text-sm font-medium first:pl-6 last:pr-6 ${
                                column.className || 'text-text'
                              } ${column.nowrap !== false ? 'whitespace-nowrap' : ''}`}
                            >
                              {column.render 
                                ? column.render(value, row, rowIndex)
                                : (value ?? <span className="text-textMuted">—</span>)
                              }
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mentor Profile Modal */}
      {showMentorModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          setShowMentorModal(false);
          setSelectedMentor(null);
        }}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Mentor Profile</h3>
              <button
                onClick={() => {
                  setShowMentorModal(false);
                  setSelectedMentor(null);
                }}
                className="text-textMuted hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-brand-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-text">{selectedMentor.name}</h4>
                  {selectedMentor.experience && (
                    <p className="text-sm text-textMuted">{selectedMentor.experience}</p>
                  )}
                </div>
              </div>

              {selectedMentor.bio && (
                <div>
                  <h5 className="font-semibold text-text mb-2">About</h5>
                  <p className="text-sm text-textSoft">{selectedMentor.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedMentor.email && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-sm text-text">{selectedMentor.email}</p>
                  </div>
                )}
                {selectedMentor.phone && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-sm text-text">{selectedMentor.phone}</p>
                  </div>
                )}
                {selectedMentor.availableSlots !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">Availability</span>
                    </div>
                    <p className="text-sm text-text">{selectedMentor.availableSlots} slots available</p>
                  </div>
                )}
              </div>

              {selectedMentor.specialization && selectedMentor.specialization.length > 0 && (
                <div>
                  <h5 className="font-semibold text-text mb-2">Specializations</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.specialization.map((spec, idx) => (
                      <span key={idx} className="px-2 py-1 bg-brand-500/10 text-brand-600 rounded text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Call Status */}
              {(() => {
                const hasCall = hasBookedCall(selectedMentor.id);
                const hasCompleted = hasCompletedCall(selectedMentor.id);
                const callInfo = enrollment?.bookedCalls?.find(c => c.mentorId === selectedMentor.id);

                return (
                  <div className="pt-4 border-t border-brintelli-border">
                    {hasCall && (
                      <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Call Status</span>
                        </div>
                        <p className="text-sm text-blue-600">
                          {callInfo?.status === 'PENDING' && 'Call request sent. Waiting for mentor to schedule.'}
                          {callInfo?.status === 'SCHEDULED' && callInfo?.scheduledDate && (
                            <>Scheduled for: {new Date(callInfo.scheduledDate).toLocaleString()}</>
                          )}
                          {callInfo?.status === 'COMPLETED' && 'Call completed. You can now select this mentor.'}
                        </p>
                        {callInfo?.meetingLink && (
                          <a
                            href={callInfo.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 underline mt-2 inline-block"
                          >
                            Join Meeting
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!hasCall ? (
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={() => {
                            handleBookCall(selectedMentor.id);
                            setShowMentorModal(false);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Request Call
                        </Button>
                      ) : hasCompleted ? (
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={() => {
                            handleSelectMentor(selectedMentor.id);
                            setShowMentorModal(false);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Select as My Mentor
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          className="flex-1"
                          disabled
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Call Pending
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentLiveClasses;

