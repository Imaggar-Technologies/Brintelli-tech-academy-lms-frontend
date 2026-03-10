import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobDrivesAPI } from '../../api/jobDrives';
import { partnersAPI } from '../../api/partners';
import { jobsAPI } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const CreateJobDrive = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    partnerId: '',
    location: '',
    driveDate: '',
    jobIds: [],
  });

  useEffect(() => {
    partnersAPI.list().then((r) => r.success && r.data?.partners && setPartners(r.data.partners)).catch(() => {});
    jobsAPI.list({ status: 'OPEN' }).then((r) => r.success && r.data?.jobs && setJobs(r.data.jobs)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleJob = (jobId) => {
    setForm((prev) => ({
      ...prev,
      jobIds: prev.jobIds.includes(jobId) ? prev.jobIds.filter((id) => id !== jobId) : [...prev.jobIds, jobId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const res = await jobDrivesAPI.create({
        ...form,
        partnerId: form.partnerId || undefined,
        driveDate: form.driveDate || undefined,
      });
      if (res.success) { toast.success('Job drive created'); navigate('/hr/job-drives'); }
      else throw new Error(res.error);
    } catch (err) { toast.error(err.message || 'Failed to create job drive'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text mb-6">Create job drive</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Title *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Partner (company/college)</label>
          <select name="partnerId" value={form.partnerId} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text">
            <option value="">— Select —</option>
            {partners.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Location</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Drive date</label>
          <input type="date" name="driveDate" value={form.driveDate} onChange={handleChange} className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Link jobs (optional)</label>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-3 space-y-2">
            {jobs.length === 0 ? <p className="text-textMuted text-sm">No open jobs.</p> : jobs.map((j) => (
              <label key={j.id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.jobIds.includes(j.id)} onChange={() => toggleJob(j.id)} className="rounded" />
                <span className="text-sm text-text">{j.title}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating...' : 'Create job drive'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/hr/job-drives')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobDrive;
