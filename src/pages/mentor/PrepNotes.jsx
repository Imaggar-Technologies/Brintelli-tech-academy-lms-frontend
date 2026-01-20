import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Clock, User, Calendar, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const PrepNotes = () => {
  const [loading, setLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [prepNote, setPrepNote] = useState('');
  const [notes, setNotes] = useState({}); // meetingId -> note

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  const fetchUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getAllMeetings('SCHEDULED');
      
      if (response.success) {
        const allMeetings = response.data.meetings || [];
        // Filter to only future meetings
        const now = new Date();
        const upcoming = allMeetings
          .filter(meeting => {
            if (!meeting.scheduledDate) return false;
            return new Date(meeting.scheduledDate) >= now;
          })
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
        
        setUpcomingMeetings(upcoming);
        
        // Load existing notes from localStorage
        const savedNotes = localStorage.getItem('mentorPrepNotes');
        if (savedNotes) {
          try {
            setNotes(JSON.parse(savedNotes));
          } catch (e) {
            console.error('Error loading saved notes:', e);
          }
        }
      } else {
        toast.error(response.message || 'Failed to load upcoming meetings');
        setUpcomingMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      toast.error(error.message || 'Failed to load upcoming meetings');
      setUpcomingMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = () => {
    if (!selectedMeeting) return;

    const newNotes = {
      ...notes,
      [selectedMeeting.id]: prepNote,
    };
    setNotes(newNotes);
    localStorage.setItem('mentorPrepNotes', JSON.stringify(newNotes));
    toast.success('Prep note saved successfully');
    setShowNoteModal(false);
    setSelectedMeeting(null);
    setPrepNote('');
  };

  const handleEditNote = (meeting) => {
    setSelectedMeeting(meeting);
    setPrepNote(notes[meeting.id] || '');
    setShowNoteModal(true);
  };

  const handleDeleteNote = (meetingId) => {
    if (!confirm('Are you sure you want to delete this prep note?')) return;
    
    const newNotes = { ...notes };
    delete newNotes[meetingId];
    setNotes(newNotes);
    localStorage.setItem('mentorPrepNotes', JSON.stringify(newNotes));
    toast.success('Prep note deleted');
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not scheduled';
    try {
      return new Date(date).toLocaleString('en-US', {
        weekday: 'short',
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

  const getTimeUntil = (date) => {
    if (!date) return '';
    try {
      const now = new Date();
      const meetingDate = new Date(date);
      const diff = meetingDate - now;
      
      if (diff < 0) return 'Past';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}`;
      if (hours > 0) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
      return 'Soon';
    } catch (error) {
      return '';
    }
  };

  return (
    <>
      <PageHeader
        title="Prep Notes"
        description="Create and manage preparation notes for upcoming sessions"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-brand-600">{upcomingMeetings.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Notes Created</p>
              <p className="text-3xl font-bold text-accent-600">{Object.keys(notes).length}</p>
            </div>
            <FileText className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Upcoming Meetings with Prep Notes */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Upcoming Sessions</h3>
            <p className="text-sm text-textMuted mt-1">
              Prepare notes for your upcoming mentoring sessions
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchUpcomingMeetings}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading upcoming sessions...</p>
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => {
              const hasNote = notes[meeting.id];
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
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-textMuted">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(meeting.scheduledDate)}</span>
                        </div>
                        {meeting.duration && (
                          <span className="text-textMuted">• {meeting.duration} min</span>
                        )}
                        {meeting.scheduledDate && (
                          <span className="text-brand-600 font-semibold">
                            {getTimeUntil(meeting.scheduledDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasNote && (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Note Ready
                      </span>
                    )}
                  </div>

                  {hasNote && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold mb-1">Prep Note:</p>
                      <p className="text-sm text-text whitespace-pre-wrap">{notes[meeting.id]}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={hasNote ? "secondary" : "primary"}
                      onClick={() => handleEditNote(meeting)}
                      className="flex-1"
                    >
                      {hasNote ? (
                        <>
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit Note
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Prep Note
                        </>
                      )}
                    </Button>
                    {hasNote && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(meeting.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prep Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setSelectedMeeting(null);
          setPrepNote('');
        }}
        title={selectedMeeting ? `Prep Note: ${selectedMeeting.studentName}` : 'Prep Note'}
        size="lg"
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Student: {selectedMeeting.studentName}</p>
              <p className="text-xs text-textMuted">{selectedMeeting.studentEmail}</p>
              {selectedMeeting.scheduledDate && (
                <p className="text-xs text-textMuted mt-1">
                  Scheduled: {formatDateTime(selectedMeeting.scheduledDate)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Preparation Notes
              </label>
              <textarea
                value={prepNote}
                onChange={(e) => setPrepNote(e.target.value)}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[200px]"
                placeholder="Add your preparation notes here. Include topics to discuss, student progress points, concerns, goals, etc."
              />
              <p className="text-xs text-textMuted mt-1">
                Include topics to discuss, student progress, concerns, goals, and any other relevant information.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSaveNote}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Save Note
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedMeeting(null);
                  setPrepNote('');
                }}
              >
                Cancel
              </Button>
      </div>
    </div>
        )}
      </Modal>
    </>
  );
};

export default PrepNotes;

