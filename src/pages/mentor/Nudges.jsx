import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Lightbulb, User, Send, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const Nudges = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [selectedMentees, setSelectedMentees] = useState([]);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [nudgeData, setNudgeData] = useState({
    message: '',
    type: 'REMINDER',
  });
  const [sentNudges, setSentNudges] = useState([]);

  useEffect(() => {
    fetchMentees();
    loadSentNudges();
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

  const loadSentNudges = () => {
    const saved = localStorage.getItem('mentorSentNudges');
    if (saved) {
      try {
        setSentNudges(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading sent nudges:', e);
      }
    }
  };

  const handleSendNudge = () => {
    if (selectedMentees.length === 0) {
      toast.error('Please select at least one mentee');
      return;
    }

    if (!nudgeData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const nudge = {
      id: Date.now().toString(),
      ...nudgeData,
      mentees: selectedMentees.map(m => ({
        id: m.id || m.enrollmentId,
        name: m.studentName,
        email: m.studentEmail,
      })),
      sentAt: new Date().toISOString(),
    };

    const newNudges = [nudge, ...sentNudges];
    setSentNudges(newNudges);
    localStorage.setItem('mentorSentNudges', JSON.stringify(newNudges));
    toast.success(`Nudge sent to ${selectedMentees.length} mentee${selectedMentees.length !== 1 ? 's' : ''}`);
    setShowNudgeModal(false);
    setSelectedMentees([]);
    setNudgeData({ message: '', type: 'REMINDER' });
  };

  const quickNudges = [
    { message: 'Reminder: Complete your assignments before the deadline', type: 'REMINDER' },
    { message: 'Great progress! Keep up the excellent work!', type: 'ENCOURAGEMENT' },
    { message: 'Don\'t forget about our upcoming session', type: 'REMINDER' },
    { message: 'Check out the new resources I shared with you', type: 'RESOURCE' },
  ];

  return (
    <>
      <PageHeader
        title="Quick Nudges"
        description="Send quick reminders and nudges to mentees"
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
              <p className="text-sm text-textMuted mb-1">Nudges Sent</p>
              <p className="text-3xl font-bold text-accent-600">{sentNudges.length}</p>
            </div>
            <Lightbulb className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Nudges */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">Quick Nudges</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {quickNudges.map((nudge, idx) => (
            <button
              key={idx}
              onClick={() => {
                setNudgeData({ message: nudge.message, type: nudge.type });
                setShowNudgeModal(true);
              }}
              className="text-left p-4 rounded-lg border border-brintelli-border bg-white hover:border-brand-200 hover:bg-brand-50 transition-all"
            >
              <p className="text-sm text-text">{nudge.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Send Custom Nudge */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Send Custom Nudge</h3>
            <p className="text-sm text-textMuted mt-1">Create and send a personalized nudge to your mentees</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowNudgeModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Nudge
          </Button>
        </div>
      </div>

      {/* Sent Nudges History */}
      {sentNudges.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Sent Nudges</h3>
          <div className="space-y-3">
            {sentNudges.slice(0, 10).map((nudge) => (
              <div
                key={nudge.id}
                className="flex flex-col gap-2 rounded-xl border border-brintelli-border bg-white/70 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text">{nudge.message}</p>
                    <p className="text-xs text-textMuted mt-1">
                      To: {nudge.mentees.map(m => m.name).join(', ')}
                    </p>
                    <p className="text-xs text-textMuted">
                      {new Date(nudge.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Nudge Modal */}
      <Modal
        isOpen={showNudgeModal}
        onClose={() => {
          setShowNudgeModal(false);
          setSelectedMentees([]);
          setNudgeData({ message: '', type: 'REMINDER' });
        }}
        title="Send Nudge"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Mentees <span className="text-red-500">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto border border-brintelli-border rounded-lg p-3 space-y-2">
              {mentees.map((mentee) => {
                const menteeId = mentee.id || mentee.enrollmentId;
                const isSelected = selectedMentees.some(m => (m.id || m.enrollmentId) === menteeId);
                return (
                  <label
                    key={menteeId}
                    className="flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-brintelli-baseAlt"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMentees([...selectedMentees, mentee]);
                        } else {
                          setSelectedMentees(selectedMentees.filter(m => (m.id || m.enrollmentId) !== menteeId));
                        }
                      }}
                      className="rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-text">{mentee.studentName}</p>
                      <p className="text-xs text-textMuted">{mentee.studentEmail}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedMentees.length > 0 && (
              <p className="text-xs text-textMuted mt-2">
                {selectedMentees.length} mentee{selectedMentees.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Nudge Type
            </label>
            <select
              value={nudgeData.type}
              onChange={(e) => setNudgeData({ ...nudgeData, type: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="REMINDER">Reminder</option>
              <option value="ENCOURAGEMENT">Encouragement</option>
              <option value="RESOURCE">Resource</option>
              <option value="DEADLINE">Deadline</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={nudgeData.message}
              onChange={(e) => setNudgeData({ ...nudgeData, message: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px]"
              placeholder="Enter your nudge message..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSendNudge}
              disabled={selectedMentees.length === 0 || !nudgeData.message.trim()}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Nudge
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNudgeModal(false);
                setSelectedMentees([]);
                setNudgeData({ message: '', type: 'REMINDER' });
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

export default Nudges;

