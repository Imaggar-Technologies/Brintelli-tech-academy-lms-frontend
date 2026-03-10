import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const CreateJob = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    employmentType: 'FULL_TIME',
    status: 'OPEN',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const res = await jobsAPI.create(form);
      if (res.success && res.data?.job?.id) {
        toast.success('Job created');
        navigate(`/hr/jobs/${res.data.job.id}`);
      } else {
        toast.error(res.error || 'Failed to create job');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text mb-6">Create job posting</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
            placeholder="e.g. Software Engineer"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
            placeholder="Job description and requirements..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Department</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
            placeholder="e.g. Engineering"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
            placeholder="e.g. Remote, Bangalore"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Employment type</label>
          <select
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
          >
            <option value="OPEN">Open</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create job'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/hr/jobs')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
