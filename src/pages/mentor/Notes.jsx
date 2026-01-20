import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, User, Calendar, Clock, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const Notes = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    // Filter meetings based on search
    if (!searchTerm.trim()) {
      setFilteredMeetings(meetings);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = meetings.filter(m =>
        m.studentName?.toLowerCase().includes(term) ||
        m.studentEmail?.toLowerCase().includes(term) ||
        m.notes?.toLowerCase().includes(term)
      );
      setFilteredMeetings(filtered);
    }
  }, [searchTerm, meetings]);

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
        toast.error(response.message || 'Failed to load meetings');
        setMeetings([]);
        setFilteredMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error(error.message || 'Failed to load meetings');
      setMeetings([]);
      setFilteredMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedMeeting || !noteText.trim()) {
      toast.error('Please enter notes');
      return;
    }

    try {
      // If meeting is completed, update via completeMeeting endpoint
      if (selectedMeeting.status === 'COMPLETED') {
        const response = await mentorAPI.completeMeeting(selectedMeeting.id, {
          notes: noteText.trim(),
          outcome: selectedMeeting.outcome || null,
        });

        if (response.success) {
          toast.success('Notes updated successfully');
          setShowNoteModal(false);
          setSelectedMeeting(null);
          setNoteText('');
          fetchMeetings();
        }
      } else {
        // For other statuses, we might need a different endpoint
        // For now, we'll show a message
        toast.error('Notes can only be updated for completed meetings');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error(error.message || 'Failed to save notes');
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

  const meetingsWithNotes = meetings.filter(m => m.notes || m.report);

  return (
    <>
      <PageHeader
        title="Session Notes"
        description="Create and manage session notes and observations"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
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
              <p className="text-sm text-textMuted mb-1">Sessions with Notes</p>
              <p className="text-3xl font-bold text-accent-600">{meetingsWithNotes.length}</p>
            </div>
            <FileText className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by student name, email, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMeetings}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Session Notes</h3>
            <p className="text-sm text-textMuted mt-1">
              {filteredMeetings.length} session{filteredMeetings.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading session notes...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm ? 'No sessions found matching your search' : 'No session notes available'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
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
                      </div>
                    )}
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    meeting.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    meeting.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {meeting.status}
                  </span>
                </div>

                {meeting.notes && (
                  <div className="mt-2 p-3 bg-brintelli-baseAlt rounded-lg">
                    <p className="text-xs text-textMuted mb-1 font-semibold">Session Notes:</p>
                    <p className="text-sm text-text whitespace-pre-wrap">{meeting.notes}</p>
                  </div>
                )}

                {meeting.report && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 mb-1 font-semibold">Meeting Report:</p>
                    <p className="text-sm text-text whitespace-pre-wrap">{meeting.report}</p>
                  </div>
                )}

                {meeting.outcome && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 mb-1 font-semibold">Outcome:</p>
                    <p className="text-sm text-text whitespace-pre-wrap">{meeting.outcome}</p>
                  </div>
                )}

                {meeting.status === 'COMPLETED' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setNoteText(meeting.notes || '');
                        setShowNoteModal(true);
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      {meeting.notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Notes Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setSelectedMeeting(null);
          setNoteText('');
        }}
        title={selectedMeeting ? `Edit Notes: ${selectedMeeting.studentName}` : 'Edit Notes'}
        size="lg"
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Student: {selectedMeeting.studentName}</p>
              <p className="text-xs text-textMuted">{selectedMeeting.studentEmail}</p>
              {selectedMeeting.scheduledDate && (
                <p className="text-xs text-textMuted mt-1">
                  Meeting Date: {formatDateTime(selectedMeeting.scheduledDate)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Session Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[200px]"
                placeholder="Add your session notes here..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Save Notes
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedMeeting(null);
                  setNoteText('');
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

export default Notes;

