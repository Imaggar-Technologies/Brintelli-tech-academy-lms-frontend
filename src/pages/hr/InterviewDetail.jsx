import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, CalendarClock, MapPin } from 'lucide-react';
import { interviewAPI } from '../../api/interview';
import Button from '../../components/Button';

const InterviewDetail = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (interviewId) interviewAPI.getInterviewById(interviewId).then((r) => { if (r.success && r.data?.interview) setInterview(r.data.interview); else setInterview(null); }).catch(() => setInterview(null)).finally(() => setLoading(false));
  }, [interviewId]);

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  if (!interview) return <div><p className="text-textMuted mb-4">Interview not found.</p><Button onClick={() => navigate('/hr/interviews')}>Back to interviews</Button></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-2" onClick={() => navigate('/hr/interviews')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-text">{interview.candidateName || 'Candidate'}</h1>
          <span className="px-2 py-0.5 rounded text-sm font-medium bg-brand-500/10 text-brand-600 capitalize">{interview.status}</span>
        </div>
        <div className="space-y-2 text-textMuted">
          {interview.jobTitle && <p className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{interview.jobTitle}</p>}
          {interview.scheduledDate && <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4" />{new Date(interview.scheduledDate).toLocaleString()}</p>}
          {interview.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{interview.location}</p>}
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;
