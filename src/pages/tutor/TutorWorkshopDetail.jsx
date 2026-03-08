import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft,
  FileText,
  Trophy,
  MessageSquare,
  LayoutDashboard,
  FileCheck,
  Award,
  Medal,
  StickyNote,
  ExternalLink,
  RefreshCw,
  Video,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import workshopAPI from '../../api/workshop';

const TutorWorkshopDetail = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOption, setActiveOption] = useState('dashboard');
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizPublishing, setQuizPublishing] = useState(false);
  const [answerDraft, setAnswerDraft] = useState({});
  const [answeringId, setAnsweringId] = useState(null);

  const hasMeetingLink = workshop?.meetingLink && (workshop?.deliveryMode === 'LIVE' || workshop?.meetingLink);
  const resources = Array.isArray(workshop?.resources) ? workshop.resources : [];
  const hasNotes = Array.isArray(workshop?.tutorAnnouncements) && workshop.tutorAnnouncements.length > 0;

  const optionsNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources-notes', label: 'Resources & Notes', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: Trophy },
    { id: 'doubts', label: 'Doubts', icon: MessageSquare },
    { id: 'assessment-assignments', label: 'Assessment & Assignments', icon: FileCheck },
    { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  useEffect(() => {
    if (workshopId) loadAll();
  }, [workshopId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [wRes, qRes, lbRes, aRes, dRes] = await Promise.all([
        workshopAPI.getWorkshopById(workshopId),
        workshopAPI.getQuiz(workshopId),
        workshopAPI.getLeaderboard(workshopId),
        workshopAPI.getAssignments(workshopId),
        workshopAPI.getDoubts(workshopId),
      ]);
      if (wRes.success && wRes.data?.workshop) setWorkshop(wRes.data.workshop);
      if (qRes.success && qRes.data?.quiz) setQuiz(qRes.data.quiz);
      if (lbRes.success && lbRes.data?.leaderboard) setLeaderboard(lbRes.data.leaderboard);
      if (aRes.success && aRes.data?.assignments) setAssignments(aRes.data.assignments || []);
      if (dRes.success && dRes.data?.doubts) setDoubts(dRes.data.doubts || []);
    } catch (e) {
      toast.error(e.message || 'Failed to load workshop');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    setQuizSaving(true);
    try {
      const res = await workshopAPI.createOrUpdateQuiz(workshopId, {
        title: quiz?.title || 'Workshop Quiz',
        questions: quiz?.questions || [],
      });
      if (res?.success) {
        setQuiz(res.data?.quiz || quiz);
        toast.success('Quiz saved');
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || 'Failed to save quiz');
    } finally {
      setQuizSaving(false);
    }
  };

  const handlePublishQuiz = async (published) => {
    setQuizPublishing(true);
    try {
      const res = await workshopAPI.publishQuiz(workshopId, published);
      if (res?.success) {
        setQuiz(res.data?.quiz || quiz);
        toast.success(res.message || (published ? 'Quiz published' : 'Quiz unpublished'));
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || 'Failed to update');
    } finally {
      setQuizPublishing(false);
    }
  };

  const handleAnswerDoubt = async (doubtId) => {
    const answer = answerDraft[doubtId]?.trim();
    if (!answer) {
      toast.error('Enter an answer');
      return;
    }
    setAnsweringId(doubtId);
    try {
      const res = await workshopAPI.answerDoubt(workshopId, doubtId, { answer });
      if (res?.success) {
        setDoubts((prev) => prev.map((d) => (d.id === doubtId || d._id === doubtId ? { ...d, answer, answeredAt: new Date().toISOString(), answeredBy: res.data?.doubt?.answeredBy } : d)));
        setAnswerDraft((p) => ({ ...p, [doubtId]: '' }));
        toast.success('Answer posted');
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || 'Failed to post answer');
    } finally {
      setAnsweringId(null);
    }
  };

  if (loading || !workshop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  const title = workshop.title || 'Workshop';

  return (
    <>
      <PageHeader
        title={title}
        description={workshop.description || workshop.subject || ''}
        actions={
          <div className="flex items-center gap-2">
            {hasMeetingLink && (
              <Button
                variant="primary"
                size="sm"
                className="gap-2"
                onClick={() => window.open(workshop.meetingLink, '_blank')}
              >
                <Video className="h-4 w-4" /> Join
              </Button>
            )}
            <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate('/tutor/workshops')}>
              <ChevronLeft className="h-4 w-4" /> Back to Workshops
            </Button>
          </div>
        }
      />

      <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-1 p-2 border-b border-brintelli-border/60 bg-brintelli-baseAlt/40">
          {optionsNavItems.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActiveOption(opt.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeOption === opt.id
                  ? 'bg-brand-500 text-white'
                  : 'text-textMuted hover:bg-brintelli-baseAlt hover:text-text'
              }`}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>

        {activeOption === 'dashboard' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </h3>
            <p className="text-sm text-textMuted mb-4">Overview of this workshop. Use the tabs to manage quiz, doubts, resources, and certificates.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={loadAll} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>
        )}

        {activeOption === 'resources-notes' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" /> Resources & Notes
            </h3>
            {resources.length > 0 && (
              <ul className="space-y-2 mb-4">
                {resources.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:underline">
                      {r.label || 'Resource'} <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {hasNotes && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2"><StickyNote className="h-4 w-4" /> Notes</h4>
                <ul className="space-y-2 text-sm text-text">
                  {workshop.tutorAnnouncements.map((note, i) => (
                    <li key={i}>{typeof note === 'string' ? note : (note?.text || note?.content || '')}</li>
                  ))}
                </ul>
              </div>
            )}
            {resources.length === 0 && !hasNotes && <p className="text-sm text-textMuted">No resources or notes yet.</p>}
          </div>
        )}

        {activeOption === 'quiz' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" /> Quiz
            </h3>
            <p className="text-sm text-textMuted mb-4">
              {quiz ? 'Edit and publish the quiz. Students can attempt only when published.' : 'Create a quiz and publish it for participants.'}
            </p>
            {quiz && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-text">Status:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={quizPublishing}
                  onClick={() => handlePublishQuiz(!quiz.published)}
                >
                  {quiz.published ? 'Published' : 'Unpublished'} – click to toggle
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" disabled={quizSaving} onClick={handleSaveQuiz}>
                {quizSaving ? 'Saving…' : quiz ? 'Update quiz' : 'Create quiz'}
              </Button>
            </div>
          </div>
        )}

        {activeOption === 'doubts' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" /> Doubts
            </h3>
            <p className="text-sm text-textMuted mb-4">Student doubts. Answer them below.</p>
            {doubts.length === 0 ? (
              <p className="text-sm text-textMuted">No doubts yet.</p>
            ) : (
              <ul className="space-y-4">
                {doubts.map((d) => {
                  const id = d.id || d._id;
                  const answered = !!d.answer;
                  return (
                    <li key={id} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/30 p-4">
                      <p className="font-medium text-text mb-1">{d.userName || 'Student'}</p>
                      <p className="text-sm text-text mb-2">{d.question}</p>
                      {answered ? (
                        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{d.answer}</p>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          <textarea
                            placeholder="Your answer..."
                            value={answerDraft[id] || ''}
                            onChange={(e) => setAnswerDraft((p) => ({ ...p, [id]: e.target.value }))}
                            className="flex-1 min-w-[200px] min-h-[80px] rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                          />
                          <Button size="sm" disabled={answeringId === id} onClick={() => handleAnswerDoubt(id)}>
                            {answeringId === id ? 'Posting…' : 'Post answer'}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <Button variant="ghost" size="sm" onClick={() => { loadAll(); }} className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh doubts
            </Button>
          </div>
        )}

        {activeOption === 'assessment-assignments' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5" /> Assessment & Assignments
            </h3>
            {assignments.length === 0 ? (
              <p className="text-sm text-textMuted">No assignments yet.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map((a) => (
                  <li key={a.id || a._id} className="flex justify-between items-center py-2 border-b border-brintelli-border/40">
                    <span>{a.title || 'Untitled'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        workshopAPI.getSubmissions(workshopId, a.id || a._id).then((r) =>
                          r?.success ? toast.success(`${(r.data?.submissions || []).length} submission(s)`) : null
                        )
                      }
                    >
                      View submissions
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeOption === 'leaderboard' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Medal className="h-5 w-5" /> Leaderboard
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-textMuted">No attempts yet.</p>
            ) : (
              <ul className="space-y-2">
                {leaderboard.map((r) => (
                  <li key={r.userId} className="flex justify-between py-2 border-b border-brintelli-border/40">
                    <span>#{r.rank} {r.userName}</span>
                    <span className="font-medium">{r.score} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeOption === 'certifications' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Award className="h-5 w-5" /> Certifications
            </h3>
            <p className="text-sm text-textMuted">Certificate generation and sending is available in the Program Manager workshop manage page.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TutorWorkshopDetail;
