import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { getPublicJobById, submitJobApplication } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const EmploymentTypeLabel = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

const CareerApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    collegeName: '',
    resumeUrl: '',
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await getPublicJobById(jobId);
      if (res.success && res.data?.job) setJob(res.data.job);
      else setJob(null);
    } catch (e) {
      toast.error(e.message || 'Job not found');
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.email?.trim()) {
      toast.error('Email is required');
      return;
    }
    setSubmitting(true);
    try {
      if (resumeFile) {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('email', form.email.trim().toLowerCase());
        if (form.whatsappNumber?.trim()) fd.append('whatsappNumber', form.whatsappNumber.trim());
        if (form.collegeName?.trim()) fd.append('collegeName', form.collegeName.trim());
        fd.append('resume', resumeFile);
        await submitJobApplication(jobId, fd);
      } else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          whatsappNumber: form.whatsappNumber?.trim() || undefined,
          collegeName: form.collegeName?.trim() || undefined,
          resumeUrl: form.resumeUrl?.trim() || undefined,
        };
        await submitJobApplication(jobId, payload);
      }
      toast.success('Application submitted successfully!');
      navigate('/careers');
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-textMuted mb-4">Job not found or no longer open.</p>
          <Button onClick={() => navigate('/careers')}>Back to Careers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/careers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Careers
        </Button>

        <div className="rounded-2xl border border-brintelli-border bg-white p-6 mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">{job.title}</h1>
          {job.department && (
            <p className="text-sm text-textMuted mb-2">{job.department}</p>
          )}
          {job.location && (
            <p className="text-sm text-textMuted mb-2">{job.location}</p>
          )}
          <p className="text-sm text-brand-600">
            {EmploymentTypeLabel[job.employmentType] || job.employmentType}
          </p>
          {job.description && (
            <div className="mt-4 text-sm text-textMuted whitespace-pre-wrap">{job.description}</div>
          )}
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-white p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Apply for this position</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">WhatsApp number</label>
              <input
                type="text"
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">College name</label>
              <input
                type="text"
                name="collegeName"
                value={form.collegeName}
                onChange={handleChange}
                className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
                placeholder="Your college or institution"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Resume (PDF or Word)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text text-sm"
              />
              <p className="text-xs text-textMuted mt-1">Optional: or paste a link to your resume below</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Resume URL (optional)</label>
              <input
                type="url"
                name="resumeUrl"
                value={form.resumeUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-text"
                placeholder="https://..."
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CareerApply;
