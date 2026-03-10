import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Plus, User, Briefcase, ChevronRight } from 'lucide-react';
import { interviewAPI } from '../../api/interview';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const InterviewsList = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInterviews(); }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewAPI.getAllInterviews({});
      if (res.success && res.data?.interviews) setInterviews(res.data.interviews);
      else setInterviews([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load interviews');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Interviews</h1>
        <Button variant="primary" onClick={() => navigate('/hr/interviews/create')}>
          <Plus className="h-4 w-4 mr-2" /> Create interview
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <CalendarClock className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">No interviews yet.</p>
          <Button variant="primary" onClick={() => navigate('/hr/interviews/create')}>Create first interview</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((i) => (
            <div
              key={i.id}
              className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 flex flex-wrap items-center justify-between gap-4 hover:border-brand-500/30 cursor-pointer"
              onClick={() => navigate(`/hr/interviews/${i.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{i.candidateName || 'Candidate'}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-600">{i.status}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-textMuted mt-1">
                  {i.jobTitle && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{i.jobTitle}</span>}
                  {i.scheduledDate && <span className="flex items-center gap-1"><CalendarClock className="h-4 w-4" />{new Date(i.scheduledDate).toLocaleString()}</span>}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-textMuted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewsList;
