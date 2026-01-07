import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarDays, MessageSquare, Video, Clock, Users, ChevronDown, ChevronUp, Mic, Video as VideoIcon } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';
import { apiRequest } from '../../api/apiClient';

const BatchSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchSessions();
    }
  }, [selectedBatchId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getAllBatches();
      if (response.success && response.data) {
        setBatches(response.data.batches || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getBatchSessions(selectedBatchId);
      if (response.success && response.data?.sessions) {
        // Fetch detailed session data including timeline
        const sessionsWithTimeline = await Promise.all(
          response.data.sessions.map(async (session) => {
            try {
              const sessionId = session.id || session._id;
              const detailResponse = await apiRequest(`/api/programs/sessions/${sessionId}`);
              if (detailResponse.success && detailResponse.data?.session) {
                return {
                  ...session,
                  timeline: detailResponse.data.session.timeline || [],
                  attendance: detailResponse.data.session.attendance || [],
                };
              }
              return session;
            } catch (error) {
              console.error(`Error fetching session ${session.id} details:`, error);
              return session;
            }
          })
        );
        setSessions(sessionsWithTimeline);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSession = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const openTimelineModal = (session) => {
    setSelectedSession(session);
    setShowTimelineModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatTimelineDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'ONGOING':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group timeline events by type
  const getTimelineEvents = (timeline) => {
    if (!timeline || !Array.isArray(timeline)) return { chats: [], grants: [], resources: [], quizzes: [] };
    
    const chats = timeline.filter(ev => ev.type === 'comment' || ev.type === 'message');
    const grants = timeline.filter(ev => ev.type === 'grant' || ev.message?.includes('grant') || ev.message?.includes('Allow'));
    const resources = timeline.filter(ev => ev.type === 'resource');
    const quizzes = timeline.filter(ev => ev.type === 'quiz');
    
    return { chats, grants, resources, quizzes };
  };

  return (
    <>
      <PageHeader
        title="Batch Schedule"
        description="View session schedules with chat messages and grant information from live classes."
      />

      <div className="space-y-6">
        {/* Batch Selection */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-text mb-2">Select Batch</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name} {batch.courseId ? `- ${batch.programName || 'Program'}` : ''}
              </option>
            ))}
          </select>
        </div>

        {loading && selectedBatchId ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-textMuted">Loading sessions...</div>
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => {
              const sessionId = session.id || session._id;
              const isExpanded = expandedSessions.has(sessionId);
              const timeline = session.timeline || [];
              const events = getTimelineEvents(timeline);
              const hasActivity = timeline.length > 0;

              return (
                <div
                  key={sessionId}
                  className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden"
                >
                  {/* Session Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-text">{session.name || 'Unnamed Session'}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status || 'SCHEDULED'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-textMuted">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(session.scheduledDate)}</span>
                          </div>
                          {session.duration && (
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              <span>Duration: {session.duration} minutes</span>
                            </div>
                          )}
                          {session.attendance && session.attendance.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{session.attendance.length} students attended</span>
                            </div>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-textMuted mt-2">{session.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasActivity && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTimelineModal(session)}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            View Timeline
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSession(sessionId)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    {hasActivity && (
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        {events.chats.length > 0 && (
                          <div className="flex items-center gap-1 text-textMuted">
                            <MessageSquare className="h-4 w-4" />
                            <span>{events.chats.length} chat{events.chats.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {events.grants.length > 0 && (
                          <div className="flex items-center gap-1 text-textMuted">
                            <Mic className="h-4 w-4" />
                            <span>{events.grants.length} grant{events.grants.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {events.resources.length > 0 && (
                          <div className="flex items-center gap-1 text-textMuted">
                            <VideoIcon className="h-4 w-4" />
                            <span>{events.resources.length} resource{events.resources.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {events.quizzes.length > 0 && (
                          <div className="flex items-center gap-1 text-textMuted">
                            <MessageSquare className="h-4 w-4" />
                            <span>{events.quizzes.length} quiz{events.quizzes.length !== 1 ? 'zes' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded Timeline Preview */}
                  {isExpanded && hasActivity && (
                    <div className="border-t border-brintelli-border/60 bg-brintelli-baseAlt/30 p-6">
                      <h4 className="text-sm font-semibold text-text mb-3">Recent Activity</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {timeline.slice(-10).reverse().map((event, idx) => (
                          <div key={event.id || idx} className="flex items-start gap-3 p-2 rounded bg-white">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-text">
                                  {event.user?.name || event.user?.fullName || event.user?.email || 'System'}
                                </span>
                                <span className="text-xs text-textMuted">
                                  {formatTimelineDate(event.ts)}
                                </span>
                              </div>
                              {event.type === 'comment' || event.type === 'message' ? (
                                <p className="text-sm text-text">{event.message}</p>
                              ) : event.type === 'grant' ? (
                                <p className="text-sm text-text">
                                  <Mic className="h-3 w-3 inline mr-1" />
                                  Granted {event.kind || 'permission'} to {event.to || 'student'}
                                </p>
                              ) : event.type === 'resource' ? (
                                <p className="text-sm text-text">
                                  <VideoIcon className="h-3 w-3 inline mr-1" />
                                  Shared resource: {event.resource?.title || event.resource?.url || 'Resource'}
                                </p>
                              ) : event.type === 'quiz' ? (
                                <p className="text-sm text-text">
                                  <MessageSquare className="h-3 w-3 inline mr-1" />
                                  Created quiz
                                </p>
                              ) : (
                                <p className="text-sm text-text">{event.message || 'Event'}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {timeline.length > 10 && (
                        <div className="mt-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTimelineModal(session)}
                          >
                            View All {timeline.length} Events
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : selectedBatchId ? (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
            <CalendarDays className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-lg font-semibold text-text">No sessions found</p>
            <p className="text-sm text-textMuted mt-2">
              This batch doesn't have any scheduled sessions yet.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
            <CalendarDays className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-lg font-semibold text-text">Select a batch to view schedule</p>
          </div>
        )}
      </div>

      {/* Timeline Modal */}
      <Modal
        isOpen={showTimelineModal}
        onClose={() => {
          setShowTimelineModal(false);
          setSelectedSession(null);
        }}
        title={
          selectedSession ? (
            <div>
              <h2 className="text-xl font-semibold text-text">{selectedSession.name || 'Session Timeline'}</h2>
              <p className="text-sm text-textMuted mt-1">
                {formatDate(selectedSession.scheduledDate)} • {(selectedSession.timeline || []).length} events
              </p>
            </div>
          ) : (
            'Session Timeline'
          )
        }
        size="lg"
      >
        {selectedSession && selectedSession.timeline && selectedSession.timeline.length > 0 ? (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {selectedSession.timeline.slice().reverse().map((event, idx) => (
              <div key={event.id || idx} className="flex items-start gap-3 p-4 rounded-lg border border-brintelli-border/60 bg-brintelli-baseAlt/30">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-text">
                      {event.user?.name || event.user?.fullName || event.user?.email || 'System'}
                    </span>
                    <span className="text-xs text-textMuted">
                      {formatTimelineDate(event.ts)}
                    </span>
                    {event.type && (
                      <span className="text-xs px-2 py-0.5 rounded bg-brand-100 text-brand-700">
                        {event.type}
                      </span>
                    )}
                  </div>
                  {event.type === 'comment' || event.type === 'message' ? (
                    <div>
                      <p className="text-sm text-text">{event.message}</p>
                      {event.mentions && event.mentions.length > 0 && (
                        <div className="mt-1 text-xs text-textMuted">
                          Mentions: {event.mentions.map(m => m.name || m.email).join(', ')}
                        </div>
                      )}
                    </div>
                  ) : event.type === 'grant' || (event.message && (event.message.includes('grant') || event.message.includes('Allow'))) ? (
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-brand-600" />
                      <p className="text-sm text-text">
                        {event.message || `Granted ${event.kind || 'permission'} to ${event.to || 'student'}`}
                      </p>
                    </div>
                  ) : event.type === 'resource' ? (
                    <div className="flex items-center gap-2">
                      <VideoIcon className="h-4 w-4 text-brand-600" />
                      <div>
                        <p className="text-sm text-text font-medium">
                          {event.resource?.title || 'Resource Shared'}
                        </p>
                        {event.resource?.url && (
                          <a
                            href={event.resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-600 hover:underline"
                          >
                            {event.resource.url}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : event.type === 'quiz' ? (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-600" />
                      <p className="text-sm text-text">
                        Quiz created: {event.quizId || 'Quiz'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-text">{event.message || JSON.stringify(event)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-textMuted">
            No timeline events found for this session.
          </div>
        )}
      </Modal>
    </>
  );
};

export default BatchSchedule;





