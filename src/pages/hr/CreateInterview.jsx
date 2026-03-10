import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../../api/interview';
import { jobsAPI } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const CreateInterview = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    candidateName: '',
    jobId: '',
    jobTitle: '',
    companyName: '',
    position: '',
    scheduledDate: '',
    location: '',
    status: 'scheduled',
  });

  useEffect(() => {
    jobsAPI.list({ status: 'OPEN' }).then((r) => r.success && r.data?.jobs && setJobs(r.data.jobs)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'jobId') {
      const job = jobs.find((j) => j.id === value);
      if (job) setForm((prev) => ({ ...prev, jobTitle: job.title }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidateName?.trim()) { toast.error('Candidate name is required'); return; }
    setSaving(true);
    try {
      const res = await interviewAPI.createInterview({
        candidateName: form.candidateName.trim(),
        jobId: form.jobId || undefined,
        jobTitle: form.jobTitle || undefined,
        companyName: form.companyName || undefined,
        position: form.position || undefined,
        scheduledDate: form.scheduledDate || undefined,
        location: form.location || undefined,
        status: form.status || 'scheduled',
      });
      if (res.success) { toast.success('Interview created'); navigate('/hr/interviews'); }
      else throw new Error(res.error);
    } catch (err) { toast.error(err.message || 'Failed to create interview'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text mb-6">Create interview</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Candidate name *</label>
          <input type="text" name="candidateName" value={form.candidateName} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Job</label>
          <select name="jobId" value={form.jobId} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text">
            <option value="">— Select —</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Job title (optional)</label>
          <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Company name</label>
            <input type="text" name="companyName" value={form.companyName} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Position</label>
            <input type="text" name="position" value={form.position} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Scheduled date & time</label>
          <input type="datetime-local" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Location</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create interview'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/hr/interviews')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInterview;
