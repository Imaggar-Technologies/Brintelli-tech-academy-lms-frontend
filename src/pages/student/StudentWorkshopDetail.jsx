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
  Lock,
  Share2,
  ClipboardCheck,
  Eye,
  Clock,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
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
  const [quizResult, setQuizResult] = useState(null);
  const [clockingIn, setClockingIn] = useState(false);

  const isRegistered = workshop?.participants?.some((p) => (p?.toString?.() || p) === userId);
  const hasMeetingLink = workshop?.meetingLink && (workshop?.deliveryMode === 'LIVE' || workshop?.meetingLink);

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

  // Heartbeat: mark participant as "viewing workshop" so tutor/PM/LSM see online / last active
  useEffect(() => {
    if (!workshopId) return;
    const touch = () => workshopAPI.touchPresence(workshopId).catch(() => {});
    touch();
    const interval = setInterval(touch, 60 * 1000);
    return () => clearInterval(interval);
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
      if (qRes.success && qRes.data?.quiz) {
        try {
          const rr = await workshopAPI.getQuizResult(workshopId);
          if (rr?.success && rr.data?.withAnswers) setQuizResult(rr.data);
          else setQuizResult(null);
        } catch {
          setQuizResult(null);
        }
      } else setQuizResult(null);
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
        const attempt = res.data?.attempt;
        const score = attempt?.score ?? 0;
        const total = attempt?.totalQuestions ?? 0;
        const hasQuiz = (quiz.questions || []).some((q) => (q.type || 'quiz') === 'quiz' || (q.type || '') === 'quiz-multi');
        if (hasQuiz && total > 0) {
          const pct = Math.round((score / total) * 100);
          toast.success(`Quiz submitted! Score: ${score}/${total} — ${pct}% correct`, { duration: 5000 });
        } else {
          toast.success('Response submitted. Thank you!');
        }
        setQuizSubmitted(true);
        loadAll();
      } else toast.error(res.message || 'Failed to submit');
    } catch (e) {
      const msg = e?.message || 'Failed to submit quiz';
      if (msg.toLowerCase().includes('already submitted')) {
        toast.error('You have already submitted this quiz. Your answers are saved below.');
        setQuizSubmitted(true);
        loadAll();
      } else {
        toast.error(msg);
      }
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

  const resources = Array.isArray(workshop.resources) ? workshop.resources : [];
  const quizPublished = quiz?.published === true;
  const hasNotes = Array.isArray(workshop.tutorAnnouncements) && workshop.tutorAnnouncements.length > 0;

  const handleOptionClick = (item) => setActiveOption(item.id);

  const showClockInModal = !!(
    workshop?.attendanceOpen &&
    isRegistered &&
    !workshop?.currentUserClockedIn &&
    !workshop?.clockInDismissed
  );

  return (
    <>
      {showClockInModal && (
        <Modal
          isOpen={showClockInModal}
          onClose={() => setWorkshop((w) => (w ? { ...w, clockInDismissed: true } : null))}
          title="Mark your attendance"
        >
          <div className="p-4 space-y-4">
            <p className="text-sm text-text">
              Attendance is open for this workshop. Clock in to record your attendance. This will be reflected in your certificate.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="primary"
                disabled={clockingIn}
                onClick={async () => {
                  setClockingIn(true);
                  try {
                    const res = await workshopAPI.clockIn(workshopId);
                    if (res?.success) {
                      const updated = res.data?.workshop;
                      if (updated) setWorkshop((w) => (w ? { ...w, ...updated, currentUserClockedIn: true } : null));
                      else setWorkshop((w) => (w ? { ...w, currentUserClockedIn: true } : null));
                      toast.success(res?.message || 'You have clocked in.');
                    } else throw new Error(res?.error);
                  } catch (e) {
                    toast.error(e?.message || 'Failed to clock in');
                  } finally {
                    setClockingIn(false);
                  }
                }}
                className="gap-2"
              >
                <ClipboardCheck className="h-4 w-4" />
                {clockingIn ? 'Clocking in…' : 'Clock in'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/workshops')} className="text-brand-600">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Workshops
          </Button>
          {hasMeetingLink && isRegistered && (
            <a
              href={workshop.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Link2 className="h-4 w-4" />
              Join session
            </a>
          )}
        </div>
      </div>

      {/* Tab bar – learner style (gradient banner + options) */}
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
                <h4 className="text-sm font-medium text-textSoft mb-3">Resources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((r, i) => (
                    <div key={`res-${i}`} className="rounded-xl border border-brintelli-border bg-white p-4 shadow-sm flex flex-col">
                      <div className="flex items-center gap-2 mb-3 min-w-0">
                        <FileText className="h-5 w-5 text-brand-500 shrink-0" />
                        <span className="font-medium text-text truncate" title={r.label || r.url}>{r.label || 'Resource'}</span>
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 font-medium text-sm transition-colors"
                        onClick={() => workshopAPI.recordResourceDownload(workshopId, i).catch(() => {})}
                      >
                        <Eye className="h-4 w-4" /> View
                      </a>
                    </div>
                  ))}
                </div>
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

        {/* Page: Quiz / Polls / Reviews */}
        {activeOption === 'quiz' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" /> Quiz
            </h3>
            {quiz && quizPublished && isRegistered ? (
              <>
                <h4 className="text-sm font-medium text-textSoft mb-3">{quiz.title}</h4>
                {!quizSubmitted && !quizResult?.withAnswers ? (
                  (quiz.questions?.length ?? 0) === 0 ? (
                    <p className="text-sm text-textMuted">No questions in this quiz yet.</p>
                  ) : (
                  <form onSubmit={handleSubmitQuiz} className="space-y-6">
                    {(quiz.questions || []).map((q, i) => {
                      const type = q.type || 'quiz';
                      const opts = q.options || [];
                      const isReviewFreetext = type === 'review' && (q.reviewType === 'freetext' || opts.length <= 1);
                      return (
                        <div key={`q-${i}`} className="border-b border-gray-100 pb-4">
                          <p className="font-medium text-sm mb-1">{i + 1}. {q.question || q.text}</p>
                          {q.questionImage && (
                            <img src={q.questionImage} alt="" className="my-2 max-h-48 rounded-lg object-contain" onError={(e) => e.target.style.display = 'none'} />
                          )}
                          {isReviewFreetext ? (
                            <textarea
                              className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm min-h-[80px]"
                              placeholder="Your feedback..."
                              value={typeof quizAnswers[i] === 'string' ? quizAnswers[i] : ''}
                              onChange={(e) => {
                                const next = [...quizAnswers];
                                next[i] = e.target.value;
                                setQuizAnswers(next);
                              }}
                            />
                          ) : type === 'quiz-multi' ? (
                            <div className="space-y-2 mt-2">
                              <p className="text-xs text-textMuted mb-1">Select all that apply.</p>
                              {opts.map((opt, j) => {
                                const text = typeof opt === 'object' && opt != null ? (opt.text || '') : String(opt);
                                const img = typeof opt === 'object' && opt != null ? (opt.image || '') : '';
                                const selected = Array.isArray(quizAnswers[i]) ? quizAnswers[i] : [];
                                const checked = selected.includes(j);
                                return (
                                  <label key={j} className="flex items-start gap-3 cursor-pointer rounded-lg border border-brintelli-border/60 p-2 hover:bg-brintelli-baseAlt/30">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const next = [...quizAnswers];
                                        const current = Array.isArray(next[i]) ? next[i] : [];
                                        next[i] = current.includes(j) ? current.filter((k) => k !== j) : [...current, j].sort((a, b) => a - b);
                                        setQuizAnswers(next);
                                      }}
                                      className="mt-1"
                                    />
                                    <span className="flex-1 flex items-center gap-2 flex-wrap">
                                      {img && <img src={img} alt="" className="max-h-16 rounded object-contain" onError={(e) => e.target.style.display = 'none'} />}
                                      <span className="text-sm">{text || `Option ${j + 1}`}</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="space-y-2 mt-2">
                              {opts.map((opt, j) => {
                                const text = typeof opt === 'object' && opt != null ? (opt.text || '') : String(opt);
                                const img = typeof opt === 'object' && opt != null ? (opt.image || '') : '';
                                const value = j;
                                return (
                                  <label key={j} className="flex items-start gap-3 cursor-pointer rounded-lg border border-brintelli-border/60 p-2 hover:bg-brintelli-baseAlt/30">
                                    <input
                                      type="radio"
                                      name={`q${i}`}
                                      checked={quizAnswers[i] === value}
                                      onChange={() => {
                                        const next = [...quizAnswers];
                                        next[i] = value;
                                        setQuizAnswers(next);
                                      }}
                                      className="mt-1"
                                    />
                                    <span className="flex-1 flex items-center gap-2 flex-wrap">
                                      {img && <img src={img} alt="" className="max-h-16 rounded object-contain" onError={(e) => e.target.style.display = 'none'} />}
                                      <span className="text-sm">{text || `Option ${j + 1}`}</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <Button type="submit" disabled={submittingQuiz || !quiz.questions?.length}>
                      {submittingQuiz ? 'Submitting...' : 'Submit'}
                    </Button>
                  </form>
                  )
                ) : (
                  <>
                    {quizResult?.attempt && (quizResult.attempt.totalQuestions > 0) && (
                      <div className="rounded-xl border-2 border-brand-200 bg-brand-50/80 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                            {quizResult.attempt.score}/{quizResult.attempt.totalQuestions}
                          </div>
                          <div>
                            <p className="font-semibold text-text">Your quiz score</p>
                            <p className="text-sm text-textMuted">
                              {Math.round((quizResult.attempt.score / quizResult.attempt.totalQuestions) * 100)}% accuracy — added to your total points
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <p className="text-textMuted mb-3">
                      {(quiz.questions || []).some((q) => { const t = q.type || 'quiz'; return t === 'quiz' || t === 'quiz-multi'; })
                        ? 'You have submitted. You cannot answer again. Your answers are saved below.'
                        : 'Thank you for your response.'}
                    </p>
                    {quizResult?.quiz?.questions?.length > 0 && (
                      <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/30 p-4 space-y-4">
                        <h4 className="font-semibold text-text">Your answers</h4>
                        {quizResult.quiz.questions.map((qq, idx) => {
                          const yourAnswerDisplay = qq.yourAnswer != null && qq.yourAnswer !== '' ? String(qq.yourAnswer) : '—';
                          return (
                            <div key={`qq-${idx}`} className="border border-brintelli-border rounded-lg p-3 bg-white space-y-2">
                              <p className="font-medium text-sm text-text">{idx + 1}. {qq.question || 'Question'}</p>
                              {qq.questionImage && (
                                <img src={qq.questionImage} alt="" className="max-h-40 rounded object-contain" />
                              )}
                              <div className="text-sm">
                                <p className="text-textMuted mb-0.5">Your answer:</p>
                                <p className={qq.correct === true ? 'text-green-600 font-medium' : qq.correct === false ? 'text-amber-600 font-medium' : 'text-text'}>
                                  {yourAnswerDisplay}
                                </p>
                                {qq.correct === false && (qq.correctAnswer != null && qq.correctAnswer !== '') && (
                                  <>
                                    <p className="text-textMuted mt-1 mb-0.5">Correct answer:</p>
                                    <p className="text-green-600 font-medium">{String(qq.correctAnswer)}</p>
                                  </>
                                )}
                                {qq.type !== 'poll' && qq.type !== 'review' && qq.correct === true && (
                                  <span className="inline-block mt-1 text-green-600 text-xs font-medium">Correct</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {quizResult.attempt && (quizResult.attempt.totalQuestions > 0) && (
                          <p className="text-sm text-brand-600 font-medium pt-2">Score: {quizResult.attempt.score} / {quizResult.attempt.totalQuestions}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : quiz && !quizPublished ? (
              <p className="text-sm text-textMuted">Quiz is not yet published. Your instructor will open it when ready.</p>
            ) : (
              <p className="text-sm text-textMuted">No quiz available yet.</p>
            )}
          </div>
        )}

        {/* Page: Assessment & Assignments – cards like Coding Challenges */}
        {activeOption === 'assessment-assignments' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <FileCheck className="h-5 w-5" /> Assessment & Assignments
            </h3>
            <p className="text-sm text-textMuted mb-6">Submit your work for each assignment below.</p>
            {assignments.length > 0 && isRegistered ? (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div
                    key={a.id || a._id}
                    className="rounded-xl border border-brintelli-border bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text mb-1">{a.title}</h4>
                        {a.description && <p className="text-sm text-textMuted line-clamp-2">{a.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {a.dueDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                              <Clock className="h-3.5 w-3.5" /> Due: {new Date(a.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-brintelli-baseAlt text-xs text-textMuted">Assignment</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-brintelli-border/60">
                      <textarea
                        value={submissionContent[a.id || a._id] || ''}
                        onChange={(e) => setSubmissionContent((prev) => ({ ...prev, [a.id || a._id]: e.target.value }))}
                        placeholder="Your submission..."
                        className="flex-1 min-h-[80px] px-3 py-2 border border-brintelli-border rounded-xl text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      <Button
                        size="sm"
                        className="shrink-0 self-end sm:self-center bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0"
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
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 p-8 text-center">
                <FileCheck className="h-12 w-12 text-textMuted mx-auto mb-3 opacity-60" />
                <p className="text-sm text-textMuted">No assignments at the moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Page: Leaderboard – profile pics, top 3 podium */}
        {activeOption === 'leaderboard' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-brand-500" /> Leaderboard
            </h3>
            <p className="text-sm text-textMuted mb-4">Everyone who joined. Quiz scores add to your total points.</p>
            {leaderboard.length > 0 ? (
              <>
                {/* Top 3 podium */}
                {leaderboard.length >= 3 && (
                  <div className="flex items-end justify-center gap-4 mb-6 py-4 px-4 rounded-2xl bg-gradient-to-b from-amber-50/80 to-transparent border border-amber-100">
                    <div className="flex flex-col items-center flex-1 order-2">
                      <div className={`relative w-14 h-14 rounded-full border-2 overflow-hidden flex items-center justify-center text-lg font-bold ${leaderboard[1].userId === userId ? 'border-brand-400 ring-2 ring-brand-200' : 'border-amber-200'}`}>
                        {leaderboard[1].profileImageUrl ? (
                          <img src={leaderboard[1].profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-600">2</span>
                        )}
                        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">2</span>
                      </div>
                      <span className="mt-2 text-sm font-semibold text-text truncate max-w-[80px] text-center">{leaderboard[1].userName}</span>
                      <span className="text-xs text-brand-600 font-medium">{leaderboard[1].score} pts</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 order-1">
                      <div className={`relative w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center text-xl font-bold ${leaderboard[0].userId === userId ? 'border-brand-500 ring-2 ring-brand-300' : 'border-amber-400'}`}>
                        {leaderboard[0].profileImageUrl ? (
                          <img src={leaderboard[0].profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-600">1</span>
                        )}
                        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">1</span>
                      </div>
                      <span className="mt-2 text-sm font-semibold text-text truncate max-w-[90px] text-center">{leaderboard[0].userName}</span>
                      <span className="text-sm text-brand-600 font-semibold">{leaderboard[0].score} pts</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 order-3">
                      <div className={`relative w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center text-base font-bold ${leaderboard[2].userId === userId ? 'border-brand-400 ring-2 ring-brand-200' : 'border-amber-200'}`}>
                        {leaderboard[2].profileImageUrl ? (
                          <img src={leaderboard[2].profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-600">3</span>
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-[10px] font-bold text-white">3</span>
                      </div>
                      <span className="mt-2 text-sm font-semibold text-text truncate max-w-[80px] text-center">{leaderboard[2].userName}</span>
                      <span className="text-xs text-brand-600 font-medium">{leaderboard[2].score} pts</span>
                    </div>
                  </div>
                )}
                {/* Rest of list with avatars (skip top 3 when podium is shown) */}
                <ul className="space-y-2">
                  {leaderboard
                    .filter((_, idx) => leaderboard.length < 3 || idx >= 3)
                    .map((entry) => (
                      <li
                        key={entry.userId}
                        className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border ${entry.userId === userId ? 'border-brand-300 bg-brand-50' : 'border-brintelli-border bg-brintelli-baseAlt/30'}`}
                      >
                        <div className="w-9 h-9 rounded-full border border-brintelli-border overflow-hidden bg-brintelli-baseAlt flex-shrink-0 flex items-center justify-center text-sm font-semibold text-textMuted">
                          {entry.profileImageUrl ? <img src={entry.profileImageUrl} alt="" className="w-full h-full object-cover" /> : `#${entry.rank}`}
                        </div>
                        <span className="font-medium flex-1 min-w-0 truncate">
                          {entry.userName}
                          {entry.userId === userId && <span className="ml-2 text-xs text-brand-600">(You)</span>}
                        </span>
                        <span className="text-brand-600 font-semibold">{entry.score} pts</span>
                      </li>
                    ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-textMuted">No participants yet. Leaderboard will list everyone who joins; quiz scores add to total points.</p>
            )}
          </div>
        )}

        {/* Page: Certifications – locked when no cert; PDF + image download; share with Brintelli tag */}
        {activeOption === 'certifications' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Award className="h-5 w-5" /> Certifications
            </h3>
            {myCertificate ? (
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 space-y-4">
                <p className="text-sm text-green-800">Your certificate of completion is ready.</p>
                <p className="text-xs text-green-700 font-mono">Certificate number: {myCertificate.certificateNumber}</p>
                <div className="flex flex-wrap gap-2">
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
                    <ExternalLink className="h-4 w-4" /> Download PDF
                  </Button>
                  {typeof workshopAPI.downloadCertificateImage === 'function' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        workshopAPI.downloadCertificateImage(workshopId, myCertificate.id).then((blob) => {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `certificate-${myCertificate.certificateNumber}.png`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }).catch(() => toast.error('Image download failed'));
                      }}
                      className="gap-2"
                    >
                      Download image
                    </Button>
                  )}
                </div>
                <div className="pt-2 border-t border-green-200">
                  <p className="text-xs text-green-800 font-medium mb-2 flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Share (tag @Brintelli Tech Academy)</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/workshops/' + workshopId)}&summary=${encodeURIComponent('I completed this workshop at Brintelli Tech Academy! @BrintelliTechAcademy')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white text-sm hover:opacity-90"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/workshops/' + workshopId)}&quote=${encodeURIComponent('I completed this workshop at Brintelli Tech Academy! @BrintelliTechAcademy')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] text-white text-sm hover:opacity-90"
                    >
                      Facebook
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent('I completed this workshop at Brintelli Tech Academy! @BrintelliTechAcademy ' + window.location.origin + '/workshops/' + workshopId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-sm hover:opacity-90"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('I completed this workshop at Brintelli Tech Academy! @BrintelliTechAcademy')}&url=${encodeURIComponent(window.location.origin + '/workshops/' + workshopId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DA1F2] text-white text-sm hover:opacity-90"
                    >
                      X (Twitter)
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `I completed this workshop at Brintelli Tech Academy! @BrintelliTechAcademy ${window.location.origin}/workshops/${workshopId}`;
                        navigator.clipboard?.writeText(text).then(() => toast.success('Link and text copied')).catch(() => toast.error('Copy failed'));
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-300 bg-white text-green-800 text-sm hover:bg-green-50"
                    >
                      Copy link & text
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/40 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-textMuted/20 flex items-center justify-center mb-3">
                  <Lock className="h-7 w-7 text-textMuted" />
                </div>
                <p className="font-medium text-textMuted">Certificate locked</p>
                <p className="text-sm text-textMuted mt-1">Complete the workshop and meet requirements to unlock. Certificates are issued by your program manager.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentWorkshopDetail;
