import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, FileText, ExternalLink, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { jobsAPI } from '../../api/jobs';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Breadcrumb from '../../components/Breadcrumb';

const PAGE_SIZE = 20;

const HrCandidatesList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, [page]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getCandidates({ page, limit: PAGE_SIZE });
      if (res.success && res.data?.candidates) {
        setCandidates(res.data.candidates);
        setTotal(res.data.total ?? 0);
      } else setCandidates([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load candidates');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (applicationId, shortlisted) => {
    try {
      await jobsAPI.shortlistApplication(applicationId, shortlisted);
      toast.success(shortlisted ? 'Added to shortlist' : 'Removed from shortlist');
      loadCandidates();
    } catch (e) {
      toast.error(e.message || 'Failed to update shortlist');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Candidates' }]} />
      <div>
        <h1 className="text-2xl font-bold text-text">Candidates</h1>
        <p className="text-textMuted mt-1 text-sm">
          Everyone who applied to jobs is listed here. They are also created as leads with source &quot;Job Drive&quot;.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <User className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No candidates yet. Applications from the careers page will appear here.</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/hr/jobs')}>
            View jobs
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 flex flex-wrap gap-4 items-start"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <User className="h-4 w-4 text-textMuted" />
                    <span className="font-medium text-text">{c.name}</span>
                    {c.shortlisted && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-700">Shortlisted</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-textMuted">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href={`mailto:${c.email}`} className="hover:text-brand-500 truncate">{c.email}</a>
                  </div>
                  {c.whatsappNumber && (
                    <div className="flex items-center gap-2 text-sm text-textMuted mt-1">
                      <Phone className="h-4 w-4" />
                      {c.whatsappNumber}
                    </div>
                  )}
                  {c.collegeName && (
                    <div className="flex items-center gap-2 text-sm text-textMuted mt-1">
                      <Building2 className="h-4 w-4" />
                      {c.collegeName}
                    </div>
                  )}
                  {c.jobTitle && (
                    <p className="text-xs text-textMuted mt-2">Applied for: {c.jobTitle}</p>
                  )}
                  {c.resumeUrl && (
                    <div className="mt-2">
                      <a
                        href={c.resumeUrl}
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
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant={c.shortlisted ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleShortlist(c.id, !c.shortlisted)}
                    className="flex items-center gap-1"
                  >
                    <Star className={`h-4 w-4 ${c.shortlisted ? 'fill-amber-500' : ''}`} />
                    {c.shortlisted ? 'Shortlisted' : 'Shortlist'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/hr/jobs/${c.jobId}`)}>
                    View job
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="ghost" onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={!hasPrev}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm text-textMuted px-2">
                Page {page} of {totalPages} ({total} total)
              </span>
              <Button variant="ghost" onClick={() => setPage((x) => Math.min(totalPages, x + 1))} disabled={!hasNext}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HrCandidatesList;
