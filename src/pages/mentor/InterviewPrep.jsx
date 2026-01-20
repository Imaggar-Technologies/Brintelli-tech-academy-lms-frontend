import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, User, Calendar, CheckCircle2, AlertCircle, Plus, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const InterviewPrep = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [prepData, setPrepData] = useState({
    interviewType: 'TECHNICAL',
    scheduledDate: '',
    company: '',
    role: '',
    notes: '',
    feedback: '',
  });
  const [prepSessions, setPrepSessions] = useState({}); // menteeId -> sessions

  useEffect(() => {
    fetchMentees();
    loadPrepSessions();
  }, []);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMentees();
      
      if (response.success) {
        setMentees(response.data.mentees || []);
      } else {
        toast.error(response.message || 'Failed to load mentees');
        setMentees([]);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error(error.message || 'Failed to load mentees');
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPrepSessions = () => {
    const saved = localStorage.getItem('mentorInterviewPrep');
    if (saved) {
      try {
        setPrepSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading prep sessions:', e);
      }
    }
  };

  const handleSavePrep = () => {
    if (!selectedMentee || !prepData.interviewType) {
      toast.error('Please fill in all required fields');
      return;
    }

    const session = {
      id: Date.now().toString(),
      ...prepData,
      createdAt: new Date().toISOString(),
    };

    const menteeId = selectedMentee.id || selectedMentee.enrollmentId;
    const newSessions = {
      ...prepSessions,
      [menteeId]: [...(prepSessions[menteeId] || []), session],
    };

    setPrepSessions(newSessions);
    localStorage.setItem('mentorInterviewPrep', JSON.stringify(newSessions));
    toast.success('Interview prep session saved');
    setShowPrepModal(false);
    setSelectedMentee(null);
    setPrepData({
      interviewType: 'TECHNICAL',
      scheduledDate: '',
      company: '',
      role: '',
      notes: '',
      feedback: '',
    });
  };

  return (
    <>
      <PageHeader
        title="Interview Prep"
        description="Help mentees prepare for interviews"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Mentees</p>
              <p className="text-3xl font-bold text-brand-600">{mentees.length}</p>
            </div>
            <User className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Prep Sessions</p>
              <p className="text-3xl font-bold text-accent-600">
                {Object.values(prepSessions).reduce((sum, sessions) => sum + sessions.length, 0)}
              </p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Add Prep Session */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Interview Prep Sessions</h3>
            <p className="text-sm text-textMuted mt-1">Record and track interview preparation sessions</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowPrepModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prep Session
          </Button>
        </div>
      </div>

      {/* Prep Sessions by Mentee */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading mentees...</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No mentees assigned yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mentees.map((mentee) => {
              const menteeId = mentee.id || mentee.enrollmentId;
              const sessions = prepSessions[menteeId] || [];
              return (
                <div
                  key={menteeId}
                  className="rounded-xl border border-brintelli-border bg-white/70 p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="font-semibold text-text">{mentee.studentName}</p>
                      <p className="text-xs text-textMuted">{mentee.studentEmail}</p>
                    </div>
                    <span className="ml-auto text-xs text-textMuted">
                      {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {sessions.length === 0 ? (
                    <p className="text-sm text-textMuted text-center py-4">
                      No prep sessions recorded yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-3 bg-brintelli-baseAlt rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-text">
                                {session.interviewType} Interview
                              </p>
                              {session.company && (
                                <p className="text-xs text-textMuted">
                                  {session.company} - {session.role}
                                </p>
                              )}
                              {session.scheduledDate && (
                                <p className="text-xs text-textMuted">
                                  Scheduled: {new Date(session.scheduledDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          {session.notes && (
                            <p className="text-sm text-text mt-2">{session.notes}</p>
                          )}
                          {session.feedback && (
                            <div className="mt-2 p-2 bg-blue-50 rounded">
                              <p className="text-xs text-blue-700 font-semibold">Feedback:</p>
                              <p className="text-sm text-text">{session.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Prep Session Modal */}
      <Modal
        isOpen={showPrepModal}
        onClose={() => {
          setShowPrepModal(false);
          setSelectedMentee(null);
          setPrepData({
            interviewType: 'TECHNICAL',
            scheduledDate: '',
            company: '',
            role: '',
            notes: '',
            feedback: '',
          });
        }}
        title="Add Interview Prep Session"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Mentee <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMentee?.id || selectedMentee?.enrollmentId || ''}
              onChange={(e) => {
                const mentee = mentees.find(m => (m.id || m.enrollmentId) === e.target.value);
                setSelectedMentee(mentee);
              }}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select a mentee...</option>
              {mentees.map((mentee) => (
                <option key={mentee.id || mentee.enrollmentId} value={mentee.id || mentee.enrollmentId}>
                  {mentee.studentName} ({mentee.studentEmail})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <select
              value={prepData.interviewType}
              onChange={(e) => setPrepData({ ...prepData, interviewType: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="HR">HR</option>
              <option value="MOCK">Mock Interview</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Company</label>
              <input
                type="text"
                value={prepData.company}
                onChange={(e) => setPrepData({ ...prepData, company: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Company name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Role</label>
              <input
                type="text"
                value={prepData.role}
                onChange={(e) => setPrepData({ ...prepData, role: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Job role..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Scheduled Date</label>
            <input
              type="date"
              value={prepData.scheduledDate}
              onChange={(e) => setPrepData({ ...prepData, scheduledDate: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Prep Notes</label>
            <textarea
              value={prepData.notes}
              onChange={(e) => setPrepData({ ...prepData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
              placeholder="Interview preparation notes, topics covered, areas to focus on..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Feedback</label>
            <textarea
              value={prepData.feedback}
              onChange={(e) => setPrepData({ ...prepData, feedback: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
              placeholder="Feedback and recommendations..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSavePrep}
              disabled={!selectedMentee || !prepData.interviewType}
              className="flex-1"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Save Prep Session
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowPrepModal(false);
                setSelectedMentee(null);
                setPrepData({
                  interviewType: 'TECHNICAL',
                  scheduledDate: '',
                  company: '',
                  role: '',
                  notes: '',
                  feedback: '',
                });
              }}
            >
              Cancel
            </Button>
      </div>
    </div>
      </Modal>
    </>
  );
};

export default InterviewPrep;

