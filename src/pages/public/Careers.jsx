import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Building2, Clock, ChevronRight } from 'lucide-react';
import { getPublicJobs } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const EmploymentTypeLabel = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

const Careers = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await getPublicJobs({ limit: 50 });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text mb-2">Careers at Brintelli</h1>
          <p className="text-textMuted">
            Explore open positions and apply with your resume. No login required.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-brintelli-border bg-white p-12 text-center">
            <Briefcase className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No open positions at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-brintelli-border bg-white p-5 shadow-sm hover:border-brand-500/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/careers/${job.id}`)}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-text mb-1">{job.title}</h3>
                    {job.department && (
                      <span className="inline-flex items-center gap-1 text-sm text-textMuted mb-2">
                        <Building2 className="h-4 w-4" />
                        {job.department}
                      </span>
                    )}
                    {job.description && (
                      <p className="text-sm text-textMuted mb-3 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-textMuted">
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {EmploymentTypeLabel[job.employmentType] || job.employmentType}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-textMuted flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/auth/signin')}>
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Careers;
