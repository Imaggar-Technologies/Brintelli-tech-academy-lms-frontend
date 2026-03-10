import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, MapPin, Building2, Users, ChevronRight } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const EmploymentTypeLabel = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

const StatusBadge = ({ status }) => {
  const colors = {
    OPEN: 'bg-green-500/10 text-green-600',
    CLOSED: 'bg-slate-500/10 text-slate-600',
    DRAFT: 'bg-amber-500/10 text-amber-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-slate-500/10'}`}>
      {status}
    </span>
  );
};

const HrJobsList = ({ employmentTypeFilter }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const isInternships = employmentTypeFilter === 'INTERNSHIP';
  const createPath = isInternships ? '/hr/jobs/create?employmentType=INTERNSHIP' : '/hr/jobs/create';

  useEffect(() => {
    loadJobs();
  }, [statusFilter, employmentTypeFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = { ...(statusFilter && { status: statusFilter }), ...(employmentTypeFilter && { employmentType: employmentTypeFilter }) };
      const res = await jobsAPI.list(params);
      if (res.success && res.data?.jobs) {
        setJobs(res.data.jobs);
        setTotal(res.data.total ?? res.data.jobs.length);
      } else {
        setJobs([]);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">
          {isInternships ? 'Internship opportunities' : 'Job postings'}
        </h1>
        <Button variant="primary" onClick={() => navigate(createPath)}>
          <Plus className="h-4 w-4 mr-2" />
          {isInternships ? 'Create internship' : 'Create job'}
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!statusFilter ? 'bg-brand-500 text-white' : 'bg-brintelli-card text-textMuted hover:bg-brintelli-border'}`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('OPEN')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === 'OPEN' ? 'bg-brand-500 text-white' : 'bg-brintelli-card text-textMuted hover:bg-brintelli-border'}`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('CLOSED')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === 'CLOSED' ? 'bg-brand-500 text-white' : 'bg-brintelli-card text-textMuted hover:bg-brintelli-border'}`}
        >
          Closed
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('DRAFT')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === 'DRAFT' ? 'bg-brand-500 text-white' : 'bg-brintelli-card text-textMuted hover:bg-brintelli-border'}`}
        >
          Draft
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <Briefcase className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">{isInternships ? 'No internships yet.' : 'No jobs yet.'}</p>
          <Button variant="primary" onClick={() => navigate(createPath)}>
            {isInternships ? 'Create first internship' : 'Create first job'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 flex flex-wrap items-center justify-between gap-4 hover:border-brand-500/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/hr/jobs/${job.id}`)}
              role="button"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-text">{job.title}</h3>
                  <StatusBadge status={job.status} />
                </div>
                {job.department && (
                  <span className="inline-flex items-center gap-1 text-sm text-textMuted">
                    <Building2 className="h-4 w-4" />
                    {job.department}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center gap-1 text-sm text-textMuted ml-3">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                <span className="text-sm text-textMuted ml-3">
                  {EmploymentTypeLabel[job.employmentType] || job.employmentType}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-textMuted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HrJobsList;
