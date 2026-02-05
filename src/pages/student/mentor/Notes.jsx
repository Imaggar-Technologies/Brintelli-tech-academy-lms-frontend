import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, Calendar, FileText, AlertCircle, User } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import { studentAPI } from '../../../api/student';

const Notes = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [sessionNotes, setSessionNotes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollment to get current mentor and session notes
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

        // Get session notes from bookedCalls (completed sessions with notes)
        if (enrollmentData.bookedCalls) {
          const notes = enrollmentData.bookedCalls
            .filter(call => call.status === 'COMPLETED' && (call.notes || call.report || call.outcome))
            .map(call => ({
              ...call,
              scheduledDate: call.scheduledDate ? new Date(call.scheduledDate) : null,
              createdAt: call.createdAt ? new Date(call.createdAt) : new Date(),
            }))
            .sort((a, b) => {
              const dateA = a.scheduledDate || a.createdAt;
              const dateB = b.scheduledDate || b.createdAt;
              return dateB - dateA;
            });
          
          setSessionNotes(notes);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load session notes');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not available';
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

  return (
    <>
      <PageHeader
        title="Session Notes"
        description="View notes and reports from your mentoring sessions"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading session notes...</p>
        </div>
      ) : !currentMentor ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No mentor assigned yet</p>
          <p className="text-sm text-textMuted mt-2">
            Please select a mentor first to view session notes
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
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textMuted mb-1">Total Notes</p>
                <p className="text-3xl font-bold text-brand-600">{sessionNotes.length}</p>
              </div>
              <MessageSquare className="h-12 w-12 text-brand-600 opacity-20" />
            </div>
          </div>

          {/* Session Notes */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            {sessionNotes.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
                <p className="text-textMuted">No session notes available yet</p>
                <p className="text-sm text-textMuted mt-2">
                  Notes from completed sessions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col gap-3 rounded-xl border border-brintelli-border bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-5 w-5 text-brand-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-text">
                            {note.reason || 'Mentoring Session'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDateTime(note.scheduledDate || note.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Completed
                      </span>
                    </div>

                    {note.notes && (
                      <div className="p-3 bg-brintelli-baseAlt rounded-lg">
                        <p className="text-xs font-semibold text-textMuted mb-1">Session Notes:</p>
                        <p className="text-sm text-text whitespace-pre-wrap">{note.notes}</p>
                      </div>
                    )}

                    {note.outcome && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Outcome:</p>
                        <p className="text-sm text-text whitespace-pre-wrap">{note.outcome}</p>
                      </div>
                    )}

                    {note.report && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 mb-1">Meeting Report:</p>
                        <p className="text-sm text-text whitespace-pre-wrap">{note.report}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Notes;









