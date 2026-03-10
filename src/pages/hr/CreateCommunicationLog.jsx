import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationLogsAPI } from '../../api/communicationLogs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const AUDIENCE_OPTIONS = [
  { value: 'candidate', label: 'Candidates (students)' },
  { value: 'hr', label: 'HR' },
  { value: 'partners', label: 'Partners' },
];

const CreateCommunicationLog = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audienceTypes, setAudienceTypes] = useState([]);

  const toggleAudience = (value) => {
    setAudienceTypes((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!message.trim()) { toast.error('Message is required'); return; }
    if (audienceTypes.length === 0) { toast.error('Select at least one audience (Candidate, HR, or Partners)'); return; }
    setSaving(true);
    try {
      const res = await communicationLogsAPI.create({ title: title.trim(), message: message.trim(), audienceTypes });
      if (res.success) {
        toast.success('Notification sent to selected audience');
        navigate('/hr/communications');
      } else throw new Error(res.error);
    } catch (err) {
      toast.error(err.message || 'Failed to create notification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text mb-2">Create notification</h1>
      <p className="text-sm text-textMuted mb-6">Send a notification that will pop for the selected audience.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Message *</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">Send to (choose one or more) *</label>
          <div className="space-y-2 rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-4">
            {AUDIENCE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={audienceTypes.includes(opt.value)} onChange={() => toggleAudience(opt.value)} className="rounded" />
                <span className="text-text">{opt.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-textMuted mt-1">Candidates and HR will see this as an in-app notification. Partners are logged (partner user accounts can be added later).</p>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Sending...' : 'Send notification'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/hr/communications')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunicationLog;
