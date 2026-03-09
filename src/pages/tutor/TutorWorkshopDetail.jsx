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
  Plus,
  Trash2,
  ClipboardCheck,
} from 'lucide-react';
import Button from '../../components/Button';
import QuizBuilder from '../../components/workshop/QuizBuilder';
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
  const [resourceList, setResourceList] = useState([]);
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [resourcesSaving, setResourcesSaving] = useState(false);
  const [resourcesNotify, setResourcesNotify] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSending, setNoteSending] = useState(false);
  const [attendanceStarting, setAttendanceStarting] = useState(false);
  const [attendanceStopping, setAttendanceStopping] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certsGenerating, setCertsGenerating] = useState(false);
  const [certsSending, setCertsSending] = useState(false);

  const hasMeetingLink = workshop?.meetingLink && (workshop?.deliveryMode === 'LIVE' || workshop?.meetingLink);
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

  useEffect(() => {
    const list = Array.isArray(workshop?.resources) ? workshop.resources : [];
    setResourceList(list.map((r) => ({ label: r.label || '', url: r.url || '' })));
  }, [workshop?.resources]);

  useEffect(() => {
    if (activeOption !== 'certifications' || !workshopId) return;
    (async () => {
      try {
        const [attRes, certRes] = await Promise.all([workshopAPI.getAttendance(workshopId), workshopAPI.getCertificates(workshopId)]);
        if (attRes?.success && attRes.data?.attendees) setAttendees(attRes.data.attendees);
        if (certRes?.success && certRes.data?.certificates) setCertificates(certRes.data.certificates || []);
      } catch (_) {}
    })();
  }, [activeOption, workshopId]);

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

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/tutor/workshops')}>
          <ChevronLeft className="h-4 w-4" /> Back to Workshops
        </Button>
        {hasMeetingLink && (
          <Button variant="primary" size="sm" className="gap-2" onClick={() => window.open(workshop.meetingLink, '_blank')}>
            <Video className="h-4 w-4" /> Join
          </Button>
        )}
      </div>

      {/* Option bar at top */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl bg-gradient-to-r from-brintelli-primary/90 to-brintelli-primaryDark shadow-sm px-3 py-2 mb-6">
        {optionsNavItems.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setActiveOption(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeOption === opt.id ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white'
            }`}
          >
            <opt.icon className="h-4 w-4" />
            {opt.label}
          </button>
        ))}
      </div>

      {activeOption === 'dashboard' && (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </h3>
          <div className="rounded-lg border border-brintelli-border p-4 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> Attendance
            </h4>
            <p className="text-sm text-textMuted">Start attendance so learners can clock in from the workshop page. They will receive an email notification.</p>
            {workshop?.attendanceOpen ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-green-700 font-medium">Attendance in progress</span>
                <span className="text-sm text-textMuted">({(workshop.attendees || []).length} clocked in)</span>
                <Button size="sm" variant="secondary" disabled={attendanceStopping} onClick={async () => {
                  setAttendanceStopping(true);
                  try {
                    const res = await workshopAPI.stopAttendance(workshopId);
                    if (res?.success && res?.data?.workshop) setWorkshop((w) => (w ? { ...w, attendanceOpen: false } : null));
                    toast.success(res?.message || 'Attendance closed');
                  } catch (e) { toast.error(e.message || 'Failed to stop'); }
                  finally { setAttendanceStopping(false); }
                }}>
                  {attendanceStopping ? 'Stopping…' : 'Stop attendance'}
                </Button>
              </div>
            ) : (
              <Button size="sm" disabled={attendanceStarting} onClick={async () => {
                setAttendanceStarting(true);
                try {
                  const res = await workshopAPI.startAttendance(workshopId);
                  if (res?.success) {
                    setWorkshop((w) => (w ? { ...w, attendanceOpen: true } : null));
                    toast.success(res?.message || 'Attendance started. Learners have been notified.');
                  } else throw new Error(res?.error);
                } catch (e) { toast.error(e.message || 'Failed to start'); }
                finally { setAttendanceStarting(false); }
              }}>
                {attendanceStarting ? 'Starting…' : 'Start attendance'}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={loadAll} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      )}

        {activeOption === 'resources-notes' && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" /> Resources & Notes
            </h3>

            {/* Create & manage resources */}
            <div className="rounded-lg border border-brintelli-border p-4 space-y-4">
              <h4 className="text-sm font-medium text-text">Resources</h4>
              <p className="text-sm text-textMuted">Add links (docs, slides, videos). Save to store; check "Notify participants" to push and email students.</p>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-textMuted mb-1">Label</label>
                  <input
                    type="text"
                    value={newResourceLabel}
                    onChange={(e) => setNewResourceLabel(e.target.value)}
                    placeholder="e.g. Slide deck"
                    className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-textMuted mb-1">URL</label>
                  <input
                    type="url"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const label = newResourceLabel.trim();
                    const url = newResourceUrl.trim();
                    if (!url && !label) return;
                    setResourceList((prev) => [...prev, { label: label || url, url: url || label }]);
                    setNewResourceLabel('');
                    setNewResourceUrl('');
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add resource
                </Button>
              </div>
              {resourceList.length > 0 && (
                <ul className="space-y-2">
                  {resourceList.map((r, i) => (
                    <li key={`res-${i}`} className="flex items-center justify-between gap-2 py-1 border-b border-brintelli-border/50">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:underline truncate">
                        {r.label || 'Resource'} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setResourceList((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resourcesNotify}
                    onChange={(e) => setResourcesNotify(e.target.checked)}
                    className="rounded border-brintelli-border"
                  />
                  Notify participants (email when saving)
                </label>
                <Button
                  size="sm"
                  disabled={resourcesSaving}
                  onClick={async () => {
                    setResourcesSaving(true);
                    try {
                      const res = await workshopAPI.updateResources(workshopId, {
                        resources: resourceList,
                        notifyParticipants: resourcesNotify,
                      });
                      if (res?.success) {
                        setWorkshop((w) => (w ? { ...w, resources: res.data?.resources ?? resourceList } : null));
                        toast.success(res.message || 'Resources saved');
                        if (resourcesNotify) setResourcesNotify(false);
                      } else throw new Error(res?.error);
                    } catch (e) {
                      toast.error(e.message || 'Failed to save resources');
                    } finally {
                      setResourcesSaving(false);
                    }
                  }}
                >
                  {resourcesSaving ? 'Saving…' : 'Save resources'}
                </Button>
              </div>
            </div>

            {/* Notes (announcements) */}
            <div className="rounded-lg border border-brintelli-border p-4 space-y-4">
              <h4 className="text-sm font-medium text-text flex items-center gap-1.5">
                <StickyNote className="h-4 w-4" /> Notes
              </h4>
              {hasNotes && (
                <ul className="space-y-2 text-sm text-text">
                  {(workshop?.tutorAnnouncements || []).map((note, i) => (
                    <li key={`note-${i}`} className="py-2 border-b border-brintelli-border/50 last:border-0">
                      {typeof note === 'string' ? note : (note?.content ?? note?.text ?? '')}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <label className="block text-xs font-medium text-textMuted mb-1">New note</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Announcement or note for students..."
                  rows={3}
                  className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={noteSending || !noteContent.trim()}
                  onClick={async () => {
                    setNoteSending(true);
                    try {
                      const res = await workshopAPI.postWorkshopNote(workshopId, { content: noteContent.trim(), sendEmail: false });
                      if (res?.success) {
                        setWorkshop((w) => (w ? { ...w, tutorAnnouncements: res.data?.notes ?? [...(w.tutorAnnouncements || []), { content: noteContent.trim() }] } : null));
                        setNoteContent('');
                        toast.success('Note saved');
                      } else throw new Error(res?.error);
                    } catch (e) {
                      toast.error(e.message || 'Failed to save note');
                    } finally {
                      setNoteSending(false);
                    }
                  }}
                >
                  {noteSending ? 'Saving…' : 'Save note'}
                </Button>
                <Button
                  size="sm"
                  disabled={noteSending || !noteContent.trim()}
                  onClick={async () => {
                    setNoteSending(true);
                    try {
                      const res = await workshopAPI.postWorkshopNote(workshopId, { content: noteContent.trim(), sendEmail: true });
                      if (res?.success) {
                        setWorkshop((w) => (w ? { ...w, tutorAnnouncements: res.data?.notes ?? [...(w.tutorAnnouncements || []), { content: noteContent.trim() }] } : null));
                        setNoteContent('');
                        toast.success(res.message || 'Note saved and participants notified');
                      } else throw new Error(res?.error);
                    } catch (e) {
                      toast.error(e.message || 'Failed to save and send');
                    } finally {
                      setNoteSending(false);
                    }
                  }}
                >
                  {noteSending ? 'Sending…' : 'Save & push to participants'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeOption === 'quiz' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" /> Quiz
            </h3>
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 p-4 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-textMuted">Build quiz, poll, or review questions. Learners will see this same layout when they take it.</p>
                <div className="flex flex-wrap items-center gap-2">
                  {quiz && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={quizPublishing}
                      onClick={() => handlePublishQuiz(!quiz.published)}
                      className="text-textMuted hover:text-text"
                    >
                      {quiz.published ? 'Published' : 'Unpublished'} · click to toggle
                    </Button>
                  )}
                  <Button size="sm" disabled={quizSaving} onClick={handleSaveQuiz}>
                    {quizSaving ? 'Saving…' : quiz ? 'Update quiz' : 'Create quiz'}
                  </Button>
                </div>
              </div>
              <QuizBuilder
                quiz={quiz || { title: 'Workshop Quiz', questions: [] }}
                onChange={(next) => setQuiz(next)}
              />
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
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Award className="h-5 w-5" /> Certifications
          </h3>
          <div className="rounded-lg border border-brintelli-border p-4 space-y-3">
            <h4 className="text-sm font-medium text-text">Attendees</h4>
            <p className="text-sm text-textMuted">Learners who clocked in. Their attendance is reflected below and in certificates.</p>
            {attendees.length === 0 ? (
              <p className="text-sm text-textMuted">No attendees yet. Start attendance from the Dashboard and have learners clock in.</p>
            ) : (
              <ul className="space-y-1">
                {attendees.map((a, i) => (
                  <li key={a.userId || i} className="flex justify-between text-sm py-1 border-b border-brintelli-border/40 last:border-0">
                    <span>{a.userName || a.userId}</span>
                    <span className="text-textMuted">{a.clockedAt ? new Date(a.clockedAt).toLocaleString() : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-brintelli-border p-4 space-y-3">
            <h4 className="text-sm font-medium text-text">Certificates</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={certsGenerating}
                onClick={async () => {
                  const ids = attendees.length > 0 ? attendees.map((a) => a.userId) : (workshop?.participants || []).map((p) => p.toString?.() || p);
                  setCertsGenerating(true);
                  try {
                    const genRes = await workshopAPI.generateCertificates(workshopId, ids.length ? { participantIds: ids } : {});
                    if (genRes?.success) {
                      const certList = await workshopAPI.getCertificates(workshopId);
                      if (certList?.success && certList.data?.certificates) setCertificates(certList.data.certificates);
                      toast.success(`Generated ${(genRes.data?.certificates || []).length} certificate(s)`);
                    } else throw new Error(genRes?.error);
                  } catch (e) { toast.error(e.message || 'Failed to generate'); }
                  finally { setCertsGenerating(false); }
                }}
              >
                {certsGenerating ? 'Generating…' : 'Generate for attendees'}
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={certsGenerating || certsSending}
                onClick={async () => {
                  const ids = attendees.length > 0 ? attendees.map((a) => a.userId) : (workshop?.participants || []).map((p) => p.toString?.() || p);
                  setCertsSending(true);
                  try {
                    if (ids.length) await workshopAPI.generateCertificates(workshopId, { participantIds: ids });
                    const sendRes = await workshopAPI.sendCertificatesToParticipants(workshopId, ids.length ? { participantIds: ids } : {});
                    if (sendRes?.success) {
                      const certList = await workshopAPI.getCertificates(workshopId);
                      if (certList?.success && certList.data?.certificates) setCertificates(certList.data.certificates);
                      toast.success(sendRes?.message || 'Certificates generated and sent to all');
                    } else throw new Error(sendRes?.error);
                  } catch (e) { toast.error(e.message || 'Failed to unlock and send'); }
                  finally { setCertsSending(false); }
                }}
              >
                {certsSending ? 'Sending…' : 'Unlock and send certificate to all'}
              </Button>
            </div>
            {certificates.length === 0 ? (
              <p className="text-sm text-textMuted">No certificates yet. Generate for attendees first, then send to all.</p>
            ) : (
              <ul className="space-y-1">
                {certificates.map((c) => (
                  <li key={c.id || c.userId} className="flex justify-between text-sm py-1 border-b border-brintelli-border/40 last:border-0">
                    <span>{c.userName || c.userEmail}</span>
                    <span className="text-textMuted font-mono text-xs">{c.certificateNumber}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TutorWorkshopDetail;
