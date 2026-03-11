import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  FileText,
  UserCircle,
  Users,
  Mail,
  Gift,
  Trophy,
  MessageSquare,
  Plus,
  X,
  Save,
  Calendar,
  Clock,
  Link2,
  RefreshCw,
  Award,
  Send,
  Download,
  Video,
  LayoutDashboard,
  Settings,
  Medal,
  Mic,
  Eye,
  EyeOff,
  StopCircle,
  PlayCircle,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import QuizQuestionCards from '../../components/workshop/QuizQuestionCards';
import workshopAPI from '../../api/workshop';
import { apiRequest } from '../../api/apiClient';

const WorkshopManage = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshop, setWorkshop] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [resources, setResources] = useState([]);
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [savingResources, setSavingResources] = useState(false);

  const [emailForm, setEmailForm] = useState({ type: 'reminder', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherExpiry, setNewVoucherExpiry] = useState('');
  const [savingVoucher, setSavingVoucher] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsGenerating, setCertsGenerating] = useState(false);
  const [certsSending, setCertsSending] = useState(false);
  const [doubts, setDoubts] = useState([]);
  const [answerDraft, setAnswerDraft] = useState({});
  const [answeringId, setAnsweringId] = useState(null);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizPublishing, setQuizPublishing] = useState(false);

  const [activeOption, setActiveOption] = useState('dashboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [lsms, setLsms] = useState([]);
  const [speakerIds, setSpeakerIds] = useState([]);
  const [savingSpeakers, setSavingSpeakers] = useState(false);

  const optionsNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: Trophy },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
    { id: 'certificate', label: 'Certificate', icon: Award },
    { id: 'doubts', label: 'Doubts', icon: MessageSquare },
  ];

  useEffect(() => {
    if (workshopId) {
      loadWorkshop();
      loadManageData();
      fetchTutors();
      fetchLsms();
    }
  }, [workshopId]);

  useEffect(() => {
    if (activeOption === 'leaderboard' && workshopId) {
      workshopAPI.getLeaderboard(workshopId).then((res) => {
        if (res?.success && res.data?.leaderboard) setLeaderboard(res.data.leaderboard);
        else setLeaderboard([]);
      }).catch(() => setLeaderboard([]));
    }
  }, [activeOption, workshopId]);

  const loadWorkshop = async () => {
    try {
      const res = await workshopAPI.getWorkshopById(workshopId);
      if (res?.success && res.data?.workshop) {
        const w = res.data.workshop;
        setWorkshop(w);
        setResources(Array.isArray(w.resources) ? w.resources.map((r) => ({ label: r.label || '', url: r.url || '' })) : []);
        const ids = (Array.isArray(w.speakerIds) ? w.speakerIds : []).map((s) => (s && (s._id || s)).toString()).filter(Boolean);
        setSpeakerIds(ids);
      } else {
        setWorkshop(null);
      }
    } catch (e) {
      console.error('Failed to load workshop:', e);
      toast.error('Failed to load workshop');
      setWorkshop(null);
    } finally {
      setLoading(false);
    }
  };

  const loadManageData = async () => {
    if (!workshopId) return;
    try {
      const [pRes, aRes, fRes, qRes, vRes, cRes, dRes] = await Promise.all([
        workshopAPI.getParticipants(workshopId),
        workshopAPI.getAssignments(workshopId),
        workshopAPI.getFeedback(workshopId),
        workshopAPI.getQuiz(workshopId),
        workshopAPI.getVouchers(workshopId),
        workshopAPI.getCertificates(workshopId),
        workshopAPI.getDoubts(workshopId),
      ]);
      if (pRes?.success && pRes.data?.participants) setParticipants(pRes.data.participants);
      if (aRes?.success && aRes.data?.assignments) setAssignments(aRes.data.assignments);
      if (fRes?.success && fRes.data?.feedback) setFeedback(fRes.data.feedback);
      if (qRes?.success && qRes.data?.quiz) setQuiz(qRes.data.quiz);
      if (vRes?.success && vRes.data?.vouchers) setVouchers(vRes.data.vouchers);
      if (cRes?.success && cRes.data?.certificates) setCertificates(cRes.data.certificates);
      if (dRes?.success && dRes.data?.doubts) setDoubts(dRes.data.doubts);
    } catch (e) {
      console.error('Error loading manage data:', e);
      toast.error('Failed to load some data');
    }
  };

  const loadCertificates = async () => {
    if (!workshopId) return;
    setCertsLoading(true);
    try {
      const res = await workshopAPI.getCertificates(workshopId);
      if (res?.success && res.data?.certificates) setCertificates(res.data.certificates);
    } catch (e) {
      toast.error('Failed to load certificates');
    } finally {
      setCertsLoading(false);
    }
  };

  const handleGenerateCertificates = async () => {
    setCertsGenerating(true);
    try {
      const res = await workshopAPI.generateCertificates(workshopId);
      if (res?.success) {
        const count = (res.data?.certificates || []).length;
        toast.success(count ? `Generated ${count} certificate(s)` : 'Certificates already exist for all participants');
        loadCertificates();
      } else toast.error(res?.message || 'Failed to generate');
    } catch (e) {
      toast.error(e?.message || 'Failed to generate certificates');
    } finally {
      setCertsGenerating(false);
    }
  };

  const handleSendCertificates = async () => {
    setCertsSending(true);
    try {
      const res = await workshopAPI.sendCertificatesToParticipants(workshopId);
      if (res?.success) {
        toast.success(res.message || 'Certificates sent to participants');
        loadCertificates();
      } else toast.error(res?.message || 'Failed to send');
    } catch (e) {
      toast.error(e?.message || 'Failed to send certificates');
    } finally {
      setCertsSending(false);
    }
  };

  const handleDownloadCertificate = (certId) => {
    workshopAPI.downloadCertificate(workshopId, certId).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }).catch(() => toast.error('Download failed'));
  };

  const fetchTutors = async () => {
    try {
      const res = await apiRequest('/api/users/role/tutor');
      if (res?.success && res.data?.users) {
        setTutors(res.data.users.map((t) => ({
          ...t,
          id: (t.id || t._id)?.toString(),
          name: t.fullName || t.name || t.email?.split('@')[0] || 'Unknown',
        })));
      }
    } catch (e) {
      setTutors([]);
    }
  };

  const fetchLsms = async () => {
    try {
      const res = await apiRequest('/api/users/role/lsm');
      if (res?.success && res.data?.users) {
        setLsms(res.data.users.map((u) => ({
          ...u,
          id: (u.id || u._id)?.toString(),
          name: u.fullName || u.name || u.email?.split('@')[0] || 'Unknown',
        })));
      }
    } catch (e) {
      setLsms([]);
    }
  };

  const saveSpeakers = async () => {
    if (!workshopId) return;
    setSavingSpeakers(true);
    try {
      await workshopAPI.updateWorkshop(workshopId, { ...workshop, speakerIds });
      setWorkshop((w) => (w ? { ...w, speakerIds } : null));
      toast.success('Speakers saved');
    } catch (e) {
      toast.error(e?.message || 'Failed to save speakers');
    } finally {
      setSavingSpeakers(false);
    }
  };

  const addSpeaker = (userId) => {
    if (!userId || speakerIds.includes(userId)) return;
    setSpeakerIds((prev) => [...prev, userId]);
  };

  const removeSpeaker = (userId) => {
    setSpeakerIds((prev) => prev.filter((id) => id !== userId));
  };

  const addResource = () => {
    if (!newResourceLabel.trim() || !newResourceUrl.trim()) return;
    setResources((r) => [...r, { label: newResourceLabel.trim(), url: newResourceUrl.trim() }]);
    setNewResourceLabel('');
    setNewResourceUrl('');
  };

  const removeResource = (idx) => setResources((r) => r.filter((_, i) => i !== idx));

  const saveResources = async () => {
    if (!workshop) return;
    setSavingResources(true);
    try {
      await workshopAPI.updateWorkshop(workshopId, { ...workshop, resources });
      setWorkshop((w) => (w ? { ...w, resources } : null));
      toast.success('Resources saved');
    } catch (e) {
      toast.error(e.message || 'Failed to save resources');
    } finally {
      setSavingResources(false);
    }
  };

  const updateTutor = async (tutorId) => {
    if (!workshop) return;
    try {
      await workshopAPI.updateWorkshop(workshopId, { ...workshop, tutorId: tutorId || null });
      setWorkshop((w) => (w ? { ...w, tutorId: tutorId || null } : null));
      toast.success('Tutor updated');
    } catch (e) {
      toast.error(e.message || 'Failed to update tutor');
    }
  };

  const sendEmail = async () => {
    if (!workshop) return;
    setSendingEmail(true);
    try {
      await workshopAPI.sendEmailToEnrolled(workshopId, {
        type: emailForm.type,
        subject: emailForm.subject || undefined,
        body: emailForm.body || undefined,
      });
      toast.success('Email sent to enrolled participants');
      setEmailForm({ type: 'reminder', subject: '', body: '' });
    } catch (e) {
      toast.error(e.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const addAssignment = async () => {
    if (!newAssignmentTitle.trim()) return;
    setSavingAssignment(true);
    try {
      const res = await workshopAPI.createAssignment(workshopId, { title: newAssignmentTitle.trim(), description: '' });
      if (res?.success && res.data?.assignment) {
        setAssignments((a) => [res.data.assignment, ...a]);
        setNewAssignmentTitle('');
        toast.success('Assignment added');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to add assignment');
    } finally {
      setSavingAssignment(false);
    }
  };

  const createVoucherAndSend = async () => {
    if (!workshop) return;
    setSavingVoucher(true);
    try {
      const res = await workshopAPI.createVoucher(workshopId, {
        code: newVoucherCode.trim() || undefined,
        type: 'ATTENDANCE',
        expiresAt: newVoucherExpiry.trim() ? new Date(newVoucherExpiry).toISOString() : undefined,
      });
      if (res?.success && res.data?.voucher) {
        await workshopAPI.sendVoucherToAttendees(workshopId, res.data.voucher.id);
        setVouchers((v) => [res.data.voucher, ...v]);
        setNewVoucherCode('');
        setNewVoucherExpiry('');
        toast.success('Voucher created and sent to attendees');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to create/send voucher');
    } finally {
      setSavingVoucher(false);
    }
  };

  if (loading || !workshop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading workshop...</p>
        </div>
      </div>
    );
  }

  const title = workshop.title || 'Untitled Workshop';
  const hasMeetingLink = workshop.meetingLink && (workshop.deliveryMode === 'LIVE' || workshop.meetingLink);

  const handleSaveQuiz = async () => {
    setQuizSaving(true);
    try {
      const questions = (quiz?.questions ?? []).map((q) => ({
        ...q,
        published: q && Object.prototype.hasOwnProperty.call(q, 'published') ? q.published === true : true,
        closed: q && Object.prototype.hasOwnProperty.call(q, 'closed') ? q.closed === true : false,
      }));
      const res = await workshopAPI.createOrUpdateQuiz(workshopId, {
        title: quiz?.title || 'Workshop Quiz',
        questions,
      });
      if (res?.success && res.data?.quiz) {
        setQuiz(res.data.quiz);
        toast.success('Quiz saved');
      } else toast.error(res?.message || 'Failed to save');
    } catch (e) {
      toast.error(e?.message || 'Failed to save quiz');
    } finally {
      setQuizSaving(false);
    }
  };

  const handlePublishQuiz = async (published) => {
    setQuizPublishing(true);
    try {
      const res = await workshopAPI.publishQuiz(workshopId, published);
      if (res?.success && res.data?.quiz) {
        setQuiz(res.data.quiz);
        toast.success(res.message || (published ? 'Quiz published' : 'Quiz unpublished'));
      } else toast.error(res?.message || 'Failed to update');
    } catch (e) {
      toast.error(e?.message || 'Failed to update');
    } finally {
      setQuizPublishing(false);
    }
  };

  const saveQuizWithQuestions = async (questions, { toastMessage } = {}) => {
    setQuizSaving(true);
    try {
      const res = await workshopAPI.createOrUpdateQuiz(workshopId, {
        title: quiz?.title || 'Workshop Quiz',
        questions: (questions || quiz?.questions ?? []).map((q) => ({
          ...q,
          published: q && Object.prototype.hasOwnProperty.call(q, 'published') ? q.published === true : true,
          closed: q && Object.prototype.hasOwnProperty.call(q, 'closed') ? q.closed === true : false,
        })),
      });
      if (res?.success && res.data?.quiz) {
        setQuiz(res.data.quiz);
        if (toastMessage) toast.success(toastMessage);
      } else toast.error(res?.message || 'Failed to save');
    } catch (e) {
      toast.error(e?.message || 'Failed to save quiz');
    } finally {
      setQuizSaving(false);
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
        setDoubts((prev) => prev.map((d) => {
          const id = d.id || d._id;
          return id === doubtId ? { ...d, answer, answeredAt: new Date().toISOString() } : d;
        }));
        setAnswerDraft((p) => ({ ...p, [doubtId]: '' }));
        toast.success('Answer posted');
      } else toast.error(res?.message || 'Failed to post answer');
    } catch (e) {
      toast.error(e?.message || 'Failed to post answer');
    } finally {
      setAnsweringId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <PageHeader
        title={title}
        description={workshop.description || `${workshop.subject || 'Workshop'} · ${workshop.date || ''} ${workshop.time || ''}`}
        actions={
          <div className="flex items-center gap-2">
            {hasMeetingLink && (
              <Button variant="primary" size="sm" className="gap-2" onClick={() => window.open(workshop.meetingLink, '_blank')}>
                <Video className="h-4 w-4" /> Join
              </Button>
            )}
            <Button variant="secondary" className="gap-2" onClick={() => navigate('/program-manager/workshops')}>
              <ArrowLeft className="h-4 w-4" />
              Back to workshops
            </Button>
          </div>
        }
      />

      {/* Secondary topbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brintelli-border/60 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-textMuted">
            <Calendar className="h-4 w-4" />
            {workshop.date || '—'}
          </span>
          <span className="flex items-center gap-1.5 text-textMuted">
            <Clock className="h-4 w-4" />
            {workshop.time || '—'}
          </span>
          <span className="flex items-center gap-1.5 text-textMuted">
            <Users className="h-4 w-4" />
            {participants.length} registered
          </span>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { loadWorkshop(); loadManageData(); }}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Tab bar (like Tutor workshop view) */}
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

      {/* Dashboard */}
      {activeOption === 'dashboard' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-brintelli-border/60 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Registered</span>
              </div>
              <p className="text-2xl font-semibold text-text">{participants.length}</p>
            </div>
            <div className="rounded-xl border border-brintelli-border/60 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Resources</span>
              </div>
              <p className="text-2xl font-semibold text-text">{resources.length}</p>
            </div>
            <div className="rounded-xl border border-brintelli-border/60 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-medium">Quiz</span>
              </div>
              <p className="text-2xl font-semibold text-text">{quiz ? (quiz.published ? 'Published' : 'Draft') : '—'}</p>
            </div>
            <div className="rounded-xl border border-brintelli-border/60 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <Award className="h-4 w-4" />
                <span className="text-xs font-medium">Certificates</span>
              </div>
              <p className="text-2xl font-semibold text-text">{certificates.length}</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Assignments
              </h4>
              <ul className="mb-4 space-y-2">
                {assignments.length === 0 ? (
                  <li className="text-sm text-textMuted">No assignments yet.</li>
                ) : (
                  assignments.slice(0, 5).map((a) => (
                    <li key={a.id || a._id} className="flex items-center justify-between rounded-lg bg-brintelli-baseAlt/50 px-3 py-2 text-sm">
                      <span>{a.title || 'Untitled'}</span>
                      <button
                        type="button"
                        onClick={() =>
                          workshopAPI.getSubmissions(workshopId, a.id || a._id).then((r) =>
                            r?.success && toast.success(`${(r.data?.submissions || []).length} submission(s)`)
                          )
                        }
                        className="text-brand-600 hover:underline text-xs"
                      >
                        View submissions
                      </button>
                    </li>
                  ))
                )}
              </ul>
              {assignments.length > 5 && <p className="text-xs text-textMuted">+ more. Add below.</p>}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="Assignment title"
                  className="flex-1 rounded-lg border border-brintelli-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                <Button variant="secondary" size="sm" onClick={addAssignment} disabled={savingAssignment} className="gap-1">
                  {savingAssignment ? 'Adding...' : 'Add assignment'}
                </Button>
              </div>
            </section>
            <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Feedback ({feedback.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
                {feedback.length === 0 ? (
                  <p className="text-textMuted">No feedback yet.</p>
                ) : (
                  feedback.slice(0, 5).map((f) => (
                    <div key={f.id || f._id} className="rounded-lg border border-brintelli-border/40 px-3 py-2">
                      <span className="font-medium text-text">{f.userName || '—'}</span>
                      {f.rating != null && <span className="text-textMuted ml-2">{f.rating}/5</span>}
                      {f.comment && <p className="mt-1 text-textMuted text-xs line-clamp-2">{f.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Settings: Speakers, LSM list, Tutor list */}
      {activeOption === 'settings' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" /> Settings
          </h3>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Mic className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-text">Speakers</h2>
              </div>
              <p className="text-sm text-textMuted mb-3">Add speakers for this workshop. You can select from Tutors and LSMs.</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {speakerIds.map((id) => {
                  const u = [...tutors, ...lsms].find((x) => (x.id || x._id) === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 text-brand-800 px-3 py-1 text-sm">
                      {u?.name || u?.email || id}
                      <button type="button" onClick={() => removeSpeaker(id)} className="hover:bg-brand-200 rounded-full p-0.5">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <select
                  value=""
                  onChange={(e) => { const v = e.target.value; if (v) { addSpeaker(v); e.target.value = ''; } }}
                  className="rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none min-w-[200px]"
                >
                  <option value="">Add speaker…</option>
                  <optgroup label="Tutors">
                    {tutors.filter((t) => !speakerIds.includes(t.id || t._id)).map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </optgroup>
                  <optgroup label="LSMs">
                    {lsms.filter((l) => !speakerIds.includes(l.id || l._id)).map((l) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.email})</option>
                    ))}
                  </optgroup>
                </select>
                <Button variant="primary" size="sm" onClick={saveSpeakers} disabled={savingSpeakers} className="gap-1">
                  {savingSpeakers ? 'Saving…' : 'Save speakers'}
                </Button>
              </div>
            </section>
            <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <UserCircle className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-text">Tutor</h2>
              </div>
              <p className="text-sm text-textMuted mb-3">Assign the main tutor for this workshop.</p>
              <select
                value={workshop.tutorId?.toString() || ''}
                onChange={(e) => updateTutor(e.target.value)}
                className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">No tutor assigned</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </section>
          </div>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" /> LSM (Learning Success Managers)
            </h2>
            <p className="text-sm text-textMuted mb-4">List of LSMs in the system. Assign speakers above to add them to this workshop.</p>
            <div className="rounded-xl border border-brintelli-border/60 max-h-48 overflow-y-auto">
              {lsms.length === 0 ? (
                <p className="p-4 text-sm text-textMuted">No LSM users found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-brintelli-baseAlt/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Name</th>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lsms.map((l) => (
                      <tr key={l.id} className="border-t border-brintelli-border/40">
                        <td className="px-4 py-2.5">{l.name || '—'}</td>
                        <td className="px-4 py-2.5 text-textMuted">{l.email || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-violet-600" /> Tutors
            </h2>
            <p className="text-sm text-textMuted mb-4">List of tutors. Assigned tutor for this workshop is selected above.</p>
            <div className="rounded-xl border border-brintelli-border/60 max-h-48 overflow-y-auto">
              {tutors.length === 0 ? (
                <p className="p-4 text-sm text-textMuted">No tutors found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-brintelli-baseAlt/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Name</th>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Email</th>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutors.map((t) => (
                      <tr key={t.id} className="border-t border-brintelli-border/40">
                        <td className="px-4 py-2.5">{t.name || '—'}</td>
                        <td className="px-4 py-2.5 text-textMuted">{t.email || '—'}</td>
                        <td className="px-4 py-2.5">
                          {workshop.tutorId?.toString() === t.id ? (
                            <span className="text-green-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-textMuted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Resources */}
      {activeOption === 'resources' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" /> Resources
          </h3>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm max-w-2xl">
            <ul className="mb-4 space-y-2">
              {resources.length === 0 ? (
                <li className="text-sm text-textMuted">No resources yet. Add links for participants.</li>
              ) : (
                resources.map((r, i) => (
                  <li key={`${r.url}-${i}`} className="flex items-center justify-between rounded-lg bg-brintelli-baseAlt/50 px-3 py-2 text-sm">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-600 hover:underline truncate max-w-[70%]">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      {r.label || r.url}
                    </a>
                    <button type="button" onClick={() => removeResource(i)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newResourceLabel}
                onChange={(e) => setNewResourceLabel(e.target.value)}
                placeholder="Label"
                className="w-32 rounded-lg border border-brintelli-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <input
                type="url"
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                placeholder="https://..."
                className="min-w-[180px] flex-1 rounded-lg border border-brintelli-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <Button variant="secondary" size="sm" onClick={addResource} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
              <Button variant="primary" size="sm" onClick={saveResources} disabled={savingResources} className="gap-1">
                <Save className="h-4 w-4" />
                {savingResources ? 'Saving...' : 'Save resources'}
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* Quiz */}
      {activeOption === 'quiz' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" /> Quiz
          </h3>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm max-w-2xl">
            <p className="text-sm text-textMuted mb-4">
              {quiz ? (
                <>Quiz &quot;{quiz.title}&quot;. Publish each question so learners can see and answer it. Use &quot;Publish&quot; per question below.</>
              ) : (
                'Create a quiz and publish it when ready so learners can see and answer it.'
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {quiz && (
                <>
                  <Button
                    size="sm"
                    disabled={quizPublishing}
                    onClick={() => handlePublishQuiz(!quiz.published)}
                    className={quiz.published ? 'bg-amber-600 hover:bg-amber-700 border-0' : 'bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0'}
                  >
                    {quiz.published ? 'Close quiz' : 'Publish to learners'}
                  </Button>
                  <Button variant="secondary" size="sm" disabled={quizSaving} onClick={handleSaveQuiz}>
                    {quizSaving ? 'Saving…' : 'Save quiz'}
                  </Button>
                </>
              )}
              {!quiz && (
                <Button size="sm" disabled={quizSaving} onClick={handleSaveQuiz}>
                  {quizSaving ? 'Saving…' : 'Create quiz'}
                </Button>
              )}
            </div>
            {quiz && (quiz.questions?.length > 0) && (
              <QuizQuestionCards
                questions={quiz.questions}
                onAddQuestion={() => {}}
                onEditQuestion={() => {}}
                onDeleteQuestion={() => {}}
                onTogglePublish={(index) => {
                  const base = quiz || { title: 'Workshop Quiz', questions: [] };
                  const questions = [...(base.questions ?? [])];
                  const q = questions[index];
                  if (!q) return;
                  const nextPublished = !(q.published === true);
                  questions[index] = { ...q, published: nextPublished, closed: nextPublished ? q.closed : false };
                  setQuiz({ ...base, questions });
                  saveQuizWithQuestions(questions, {
                    toastMessage: nextPublished ? 'Question published — learners will see it' : 'Question unpublished',
                  });
                }}
                onToggleStop={(index) => {
                  const base = quiz || { title: 'Workshop Quiz', questions: [] };
                  const questions = [...(base.questions ?? [])];
                  const q = questions[index];
                  if (!q) return;
                  questions[index] = { ...q, closed: !(q.closed === true) };
                  setQuiz({ ...base, questions });
                  saveQuizWithQuestions(questions, {
                    toastMessage: q.closed ? 'Question opened for answers' : 'Question closed for answers',
                  });
                }}
                listView={true}
              />
            )}
          </section>
        </div>
      )}

      {/* Participants */}
      {activeOption === 'participants' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" /> Participants
          </h3>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Users className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-text">Registered participants ({participants.length})</h2>
            </div>
            <div className="mb-6 max-h-48 overflow-y-auto rounded-xl border border-brintelli-border/60">
              {participants.length === 0 ? (
                <p className="p-4 text-sm text-textMuted">No one enrolled yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-brintelli-baseAlt/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Name</th>
                      <th className="px-4 py-2.5 text-left font-medium text-textMuted">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id || p.email} className="border-t border-brintelli-border/40">
                        <td className="px-4 py-2.5">{p.fullName || '—'}</td>
                        <td className="px-4 py-2.5 text-textMuted">{p.email || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="rounded-xl border border-brintelli-border/60 bg-brintelli-baseAlt/20 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                <Mail className="h-4 w-4" /> Send email to enrolled
              </h3>
              <div className="space-y-3">
                <select
                  value={emailForm.type}
                  onChange={(e) => setEmailForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="reminder">Reminder (date, time, link)</option>
                  <option value="custom">Custom message</option>
                </select>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Subject (optional for reminder)"
                  className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                <textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Body (optional – uses default reminder text)"
                  rows={3}
                  className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={sendEmail}
                  disabled={sendingEmail || participants.length === 0}
                  className="gap-2"
                >
                  {sendingEmail ? 'Sending...' : `Send to ${participants.length} participant(s)`}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Leaderboard */}
      {activeOption === 'leaderboard' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-500" /> Leaderboard
          </h3>
          <p className="text-sm text-textMuted">Participants ranked by quiz score.</p>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-textMuted py-8 rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 text-center">No attempts yet. Quiz scores will appear here.</p>
          ) : (
            <div className="rounded-xl border border-brintelli-border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-brintelli-primary/10 to-brintelli-primaryDark/10 border-b border-brintelli-border">
                    <th className="text-left py-3 px-4 font-semibold text-text w-20">Place</th>
                    <th className="text-left py-3 px-4 font-semibold text-text">Player name</th>
                    <th className="text-right py-3 px-4 font-semibold text-text">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((r, idx) => (
                    <tr key={r.userId} className={`border-b border-brintelli-border/60 last:border-0 ${idx < 3 ? 'bg-brintelli-baseAlt/20' : ''}`}>
                      <td className="py-3 px-4 font-medium text-textMuted">#{r.rank}</td>
                      <td className="py-3 px-4 font-medium text-text">{r.userName}</td>
                      <td className="py-3 px-4 text-right font-semibold text-brand-600">{r.score} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Certificate */}
      {activeOption === 'certificate' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" /> Certificate
          </h3>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <p className="text-sm text-textMuted mb-4">
              Generate completion certificates for participants, then send them by email. Participants can download from their workshop page.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateCertificates}
                disabled={certsGenerating || participants.length === 0}
                className="gap-2"
              >
                {certsGenerating ? 'Generating...' : 'Generate certificates'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendCertificates}
                disabled={certsSending || certificates.length === 0}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {certsSending ? 'Sending...' : 'Send to participants'}
              </Button>
              <Button variant="ghost" size="sm" onClick={loadCertificates} disabled={certsLoading} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="rounded-xl border border-brintelli-border/60 max-h-48 overflow-y-auto">
              {certificates.length === 0 ? (
                <p className="p-4 text-sm text-textMuted">No certificates yet. Generate for all enrolled participants first.</p>
              ) : (
                <ul className="divide-y divide-brintelli-border/60">
                  {certificates.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="font-medium text-text">{c.userName}</span>
                      <span className="text-textMuted font-mono text-xs">{c.certificateNumber}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadCertificate(c.id)} className="gap-1">
                        <Download className="h-3.5 w-3.5" /> Download
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-brintelli-border/60">
              <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4" /> Vouchers
              </h4>
              <ul className="mb-4 space-y-2 text-sm">
                {vouchers.map((v) => (
                  <li key={v.id || v._id} className="flex justify-between items-center rounded-lg bg-brintelli-baseAlt/50 px-3 py-2">
                    <code className="font-mono text-brand-600">{v.code}</code>
                    <span className="text-textMuted text-xs">Sent to {Array.isArray(v.sentTo) ? v.sentTo.length : 0}</span>
                  </li>
                ))}
                {vouchers.length === 0 && <p className="text-textMuted">No vouchers yet.</p>}
              </ul>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value)}
                  placeholder="Code (optional)"
                  className="w-32 rounded-lg border border-brintelli-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={newVoucherExpiry}
                  onChange={(e) => setNewVoucherExpiry(e.target.value)}
                  className="rounded-lg border border-brintelli-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                <Button variant="primary" size="sm" onClick={createVoucherAndSend} disabled={savingVoucher} className="gap-1">
                  {savingVoucher ? 'Creating...' : 'Create & send to attendees'}
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Doubts */}
      {activeOption === 'doubts' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Doubts
          </h3>
          <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <p className="text-sm text-textMuted mb-4">Student doubts. Answer them below.</p>
            {doubts.length === 0 ? (
              <p className="text-sm text-textMuted">No doubts yet.</p>
            ) : (
              <ul className="space-y-4">
                {doubts.map((d) => {
                  const id = d.id || d._id;
                  const answered = !!d.answer;
                  return (
                    <li key={id} className="rounded-xl border border-brintelli-border/60 bg-brintelli-baseAlt/30 p-4">
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
                            className="flex-1 min-w-[200px] min-h-[80px] rounded-lg border border-brintelli-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
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
            <Button variant="ghost" size="sm" onClick={loadManageData} className="mt-4 gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh doubts
            </Button>
          </section>
        </div>
      )}
    </div>
  );
};

export default WorkshopManage;
