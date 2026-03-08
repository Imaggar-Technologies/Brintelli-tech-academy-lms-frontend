import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  ChevronLeft,
  Link2,
  FileText,
  CheckCircle,
  MessageSquare,
  Trophy,
  Gift,
  ExternalLink,
  RefreshCw,
  StickyNote,
  LayoutDashboard,
  FileCheck,
  Award,
  Medal,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import workshopAPI from '../../api/workshop';
import { selectCurrentUser } from '../../store/slices/authSlice';

const StudentWorkshopDetail = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || currentUser?._id?.toString();

  const [workshop, setWorkshop] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myVoucher, setMyVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(null);
  const [submissionContent, setSubmissionContent] = useState({});
  const [activeOption, setActiveOption] = useState('dashboard');
  const [myCertificate, setMyCertificate] = useState(null);

  const isRegistered = workshop?.participants?.some((p) => (p?.toString?.() || p) === userId);

  const optionsNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources-notes', label: 'Resources & Notes', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: Trophy },
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
      const [wRes, aRes, qRes, lbRes, vRes, myFbRes, myCertRes] = await Promise.all([
        workshopAPI.getWorkshopById(workshopId),
        workshopAPI.getAssignments(workshopId),
        workshopAPI.getQuiz(workshopId),
        workshopAPI.getLeaderboard(workshopId),
        workshopAPI.getMyVoucher(workshopId),
        workshopAPI.getMyFeedback(workshopId),
        workshopAPI.getMyCertificate(workshopId),
      ]);
      if (wRes.success && wRes.data?.workshop) setWorkshop(wRes.data.workshop);
      if (aRes.success && aRes.data?.assignments) setAssignments(aRes.data.assignments);
      if (qRes.success && qRes.data?.quiz) setQuiz(qRes.data.quiz);
      if (lbRes.success && lbRes.data?.leaderboard) setLeaderboard(lbRes.data.leaderboard);
      if (vRes.success && vRes.data?.voucher) setMyVoucher(vRes.data.voucher);
      if (myFbRes.success && myFbRes.data?.feedback) setFeedbackSubmitted(true);
      if (myCertRes.success && myCertRes.data?.certificate) setMyCertificate(myCertRes.data.certificate);
      else setMyCertificate(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load workshop');
      setWorkshop(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!isRegistered) return;
    setSubmittingFeedback(true);
    try {
      const res = await workshopAPI.submitFeedback(workshopId, { rating: feedbackForm.rating, comment: feedbackForm.comment });
      if (res.success) {
        toast.success('Thank you for your feedback!');
        setFeedbackSubmitted(true);
      } else toast.error(res.message || 'Failed to submit');
    } catch (e) {
      toast.error(e.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!quiz || !isRegistered) return;
    setSubmittingQuiz(true);
    try {
      const res = await workshopAPI.submitQuizAttempt(workshopId, { answers: quizAnswers });
      if (res.success) {
        toast.success(`Quiz submitted! Score: ${res.data?.attempt?.score ?? 0}/${res.data?.attempt?.totalQuestions ?? 0}`);
        setQuizSubmitted(true);
        loadAll();
      } else toast.error(res.message || 'Failed to submit');
    } catch (e) {
      toast.error(e.message || 'Failed to submit quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const content = submissionContent[assignmentId]?.trim();
    if (!content) {
      toast.error('Please enter your submission');
      return;
    }
    setAssignmentSubmitting(assignmentId);
    try {
      const res = await workshopAPI.submitAssignment(workshopId, assignmentId, { content });
      if (res.success) {
        toast.success('Assignment submitted!');
        setSubmissionContent((prev) => ({ ...prev, [assignmentId]: '' }));
        loadAll();
      } else toast.error(res.message || 'Failed to submit');
    } catch (e) {
      toast.error(e.message || 'Failed to submit');
    } finally {
      setAssignmentSubmitting(null);
    }
  };

  if (loading && !workshop) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }
  if (!workshop) {
    return (
      <>
        <PageHeader title="Workshop" description="Workshop not found" />
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-8 text-center">
          <p className="text-textMuted mb-4">This workshop could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/student/workshops')}>
            Back to Workshops
          </Button>
        </div>
      </>
    );
  }

  const hasMeetingLink = workshop.meetingLink && (workshop.deliveryMode === 'LIVE' || workshop.meetingLink);
  const resources = Array.isArray(workshop.resources) ? workshop.resources : [];
  const quizPublished = quiz?.published === true;
  const hasNotes = Array.isArray(workshop.tutorAnnouncements) && workshop.tutorAnnouncements.length > 0;

  const handleOptionClick = (item) => setActiveOption(item.id);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student/workshops')} className="text-brand-600">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Workshops
        </Button>
      </div>

      {/* Tab bar – each tab is a page */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-gradient-to-r from-brintelli-primary/90 to-brintelli-primaryDark shadow-sm px-3 py-2 mb-6">
        {optionsNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleOptionClick(item)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeOption === item.id ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Single active page card */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
        {/* Page: Dashboard */}
        {activeOption === 'dashboard' && (
          <div className="p-6 space-y-6">
            {hasMeetingLink && isRegistered && (
              <div className="rounded-xl border border-brand-200/60 bg-brand-50/50 p-4">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-2">
                  <Link2 className="h-5 w-5 text-brand-500" />
                  Join online
                </h3>
                <a
                  href={workshop.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-600 hover:underline font-medium"
                >
                  {workshop.meetingLink}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            {isRegistered && workshop?.feedbackPollPublished && (
              <div className="rounded-xl border border-brintelli-border p-4">
                {feedbackSubmitted ? (
                  <p className="text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Thank you! Your feedback has been submitted.
                  </p>
                ) : (
                  <>
                    <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5" /> Submit feedback
                    </h3>
                    <form onSubmit={handleSubmitFeedback} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Rating (1–5)</label>
                        <select
                          value={feedbackForm.rating}
                          onChange={(e) => setFeedbackForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                          className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                        <textarea
                          value={feedbackForm.comment}
                          onChange={(e) => setFeedbackForm((f) => ({ ...f, comment: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Your feedback..."
                        />
                      </div>
                      <Button type="submit" disabled={submittingFeedback}>
                        {submittingFeedback ? 'Submitting...' : 'Submit feedback'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            )}
            {myVoucher && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-amber-600" /> Your voucher
                </h3>
                <p className="text-amber-800 font-mono text-xl font-bold">{myVoucher.code}</p>
                {myVoucher.description && <p className="text-sm text-amber-700 mt-1">{myVoucher.description}</p>}
              </div>
            )}
            {!hasMeetingLink && !(isRegistered && workshop?.feedbackPollPublished && !feedbackSubmitted) && !myVoucher && (
              <p className="text-textMuted">Use the tabs above to open Resources & Notes, Quiz, Assignments, Leaderboard, or Certifications.</p>
            )}
          </div>
        )}

        {/* Page: Resources & Notes */}
        {activeOption === 'resources-notes' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" /> Resources & Notes
            </h3>
            {resources.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-textSoft mb-2">Resources</h4>
                <ul className="space-y-2">
                  {resources.map((r, i) => (
                    <li key={`res-${i}`}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:underline">
                        {r.label || 'Resource'} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasNotes && (
              <div>
                <h4 className="text-sm font-medium text-textSoft mb-2 flex items-center gap-1.5">
                  <StickyNote className="h-4 w-4" /> Notes
                </h4>
                <ul className="space-y-2">
                  {(workshop.tutorAnnouncements || []).map((note, i) => (
                    <li key={`note-${i}`} className="py-2 border-b border-gray-100 last:border-0 text-sm text-text">
                      {typeof note === 'string' ? note : (note?.text || note?.content || JSON.stringify(note))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {resources.length === 0 && !hasNotes && <p className="text-sm text-textMuted">No resources or notes yet.</p>}
          </div>
        )}

        {/* Page: Quiz */}
        {activeOption === 'quiz' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" /> Quiz
            </h3>
            {quiz && quizPublished && isRegistered ? (
              <>
                <h4 className="text-sm font-medium text-textSoft mb-3">{quiz.title}</h4>
                {!quizSubmitted ? (
                  <form onSubmit={handleSubmitQuiz} className="space-y-4">
                    {quiz.questions?.map((q, i) => (
                      <div key={`q-${i}`} className="border-b border-gray-100 pb-3">
                        <p className="font-medium text-sm mb-2">{i + 1}. {q.question || q.text}</p>
                        <div className="space-y-1">
                          {[0, 1, 2, 3].map((j) => (
                            <label key={j} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`q${i}`}
                                checked={(quizAnswers[i] ?? '') === (q.options?.[j] ?? '')}
                                onChange={() => {
                                  const next = [...quizAnswers];
                                  next[i] = q.options?.[j] ?? '';
                                  setQuizAnswers(next);
                                }}
                              />
                              <span className="text-sm">{q.options?.[j] ?? `Option ${j + 1}`}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Button type="submit" disabled={submittingQuiz || !quiz.questions?.length}>
                      {submittingQuiz ? 'Submitting...' : 'Submit quiz'}
                    </Button>
                  </form>
                ) : (
                  <p className="text-textMuted">You have submitted the quiz. Your score is added to your total points. Check the Leaderboard tab.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-textMuted">No quiz available yet.</p>
            )}
          </div>
        )}

        {/* Page: Assessment & Assignments */}
        {activeOption === 'assessment-assignments' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileCheck className="h-5 w-5" /> Assessment & Assignments
            </h3>
            {assignments.length > 0 && isRegistered ? (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div key={a.id || a._id} className="border border-brintelli-border rounded-lg p-4">
                    <h4 className="font-medium mb-1">{a.title}</h4>
                    {a.description && <p className="text-sm text-textMuted mb-2">{a.description}</p>}
                    {a.dueDate && <p className="text-xs text-textMuted mb-2">Due: {a.dueDate}</p>}
                    <div className="flex gap-2 items-end">
                      <textarea
                        value={submissionContent[a.id || a._id] || ''}
                        onChange={(e) => setSubmissionContent((prev) => ({ ...prev, [a.id || a._id]: e.target.value }))}
                        placeholder="Your submission..."
                        className="flex-1 min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitAssignment(a.id || a._id)}
                        disabled={assignmentSubmitting === (a.id || a._id)}
                      >
                        {assignmentSubmitting === (a.id || a._id) ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-textMuted">No assignments at the moment.</p>
            )}
          </div>
        )}

        {/* Page: Leaderboard – all participants, quiz points count toward total */}
        {activeOption === 'leaderboard' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-brand-500" /> Leaderboard
            </h3>
            <p className="text-sm text-textMuted mb-4">Everyone who joined this workshop. Quiz scores are added to your total learner points.</p>
            {leaderboard.length > 0 ? (
              <ul className="space-y-2">
                {leaderboard.map((entry) => (
                  <li
                    key={entry.userId}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl border ${
                      entry.userId === userId ? 'border-brand-300 bg-brand-50' : 'border-brintelli-border bg-brintelli-baseAlt/30'
                    }`}
                  >
                    <span className="font-medium">
                      #{entry.rank} {entry.userName}
                      {entry.userId === userId && <span className="ml-2 text-xs text-brand-600">(You)</span>}
                    </span>
                    <span className="text-brand-600 font-semibold">{entry.score} pts</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-textMuted">No participants yet. Leaderboard will list everyone who joins; quiz scores add to total points.</p>
            )}
          </div>
        )}

        {/* Page: Certifications */}
        {activeOption === 'certifications' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Award className="h-5 w-5" /> Certifications
            </h3>
            {myCertificate ? (
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 space-y-3">
                <p className="text-sm text-green-800">Your certificate of completion is ready.</p>
                <p className="text-xs text-green-700 font-mono">Certificate number: {myCertificate.certificateNumber}</p>
                <Button
                  size="sm"
                  onClick={() => {
                    workshopAPI.downloadCertificate(workshopId, myCertificate.id).then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `certificate-${myCertificate.certificateNumber}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }).catch(() => toast.error('Download failed'));
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> Download certificate (PDF)
                </Button>
              </div>
            ) : (
              <p className="text-sm text-textMuted">Workshop completion certificates will appear here once generated and sent by your program manager.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentWorkshopDetail;
