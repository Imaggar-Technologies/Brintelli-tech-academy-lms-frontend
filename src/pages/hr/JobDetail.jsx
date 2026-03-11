import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, FileText, Building2, ExternalLink, Star } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Breadcrumb from '../../components/Breadcrumb';

const HrJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJob();
      loadApplications();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const res = await jobsAPI.getById(jobId);
      if (res.success && res.data?.job) setJob(res.data.job);
      else setJob(null);
    } catch (e) {
      toast.error(e.message || 'Failed to load job');
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const res = await jobsAPI.getApplications(jobId, { limit: 100 });
      if (res.success && res.data?.applications) {
        setApplications(res.data.applications);
        setTotal(res.data.total ?? res.data.applications.length);
      } else {
        setApplications([]);
      }
    } catch (e) {
      setApplications([]);
    }
  };

  const handleShortlist = async (applicationId, shortlisted) => {
    try {
      await jobsAPI.shortlistApplication(applicationId, shortlisted);
      toast.success(shortlisted ? 'Added to shortlist' : 'Removed from shortlist');
      loadApplications();
    } catch (e) {
      toast.error(e.message || 'Failed to update shortlist');
    }
  };

  if (loading && !job) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <p className="text-textMuted mb-4">Job not found.</p>
        <Button onClick={() => navigate('/hr/jobs')}>Back to jobs</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Job Opportunities', path: '/hr/jobs' }, { label: job.title }]} />

      <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">{job.title}</h1>
            {job.department && <p className="text-textMuted mt-1">{job.department}</p>}
            {job.location && <p className="text-sm text-textMuted">{job.location}</p>}
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600">
              {job.status}
            </span>
          </div>
        </div>
        {job.description && (
          <div className="mt-4 text-sm text-textMuted whitespace-pre-wrap">{job.description}</div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text mb-3">
          Applications ({total})
        </h2>
        {applications.length === 0 ? (
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-8 text-center text-textMuted">
            No applications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-brintelli-border bg-brintelli-card p-4"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <User className="h-4 w-4 text-textMuted" />
                      <span className="font-medium text-text">{app.name}</span>
                      {app.shortlisted && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-700">Shortlisted</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${app.email}`} className="hover:text-brand-500">{app.email}</a>
                    </div>
                    {app.whatsappNumber && (
                      <div className="flex items-center gap-2 text-sm text-textMuted mt-1">
                        <Phone className="h-4 w-4" />
                        {app.whatsappNumber}
                      </div>
                    )}
                    {app.collegeName && (
                      <div className="flex items-center gap-2 text-sm text-textMuted mt-1">
                        <Building2 className="h-4 w-4" />
                        {app.collegeName}
                      </div>
                    )}
                    {app.resumeUrl && (
                      <div className="mt-2">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-brand-500 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View resume
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-textMuted">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant={app.shortlisted ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleShortlist(app.id, !app.shortlisted)}
                      className="flex items-center gap-1"
                    >
                      <Star className={app.shortlisted ? 'h-4 w-4 fill-amber-500' : 'h-4 w-4'} />
                      {app.shortlisted ? 'Shortlisted' : 'Shortlist'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HrJobDetail;
