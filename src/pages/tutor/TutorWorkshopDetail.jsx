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
  Users,
  HelpCircle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  Eye,
} from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import QuizQuestionCards from '../../components/workshop/QuizQuestionCards';
import QuestionEditModal from '../../components/workshop/QuestionEditModal';
import CreateAssessmentModal from '../../components/workshop/CreateAssessmentModal';
import workshopAPI from '../../api/workshop';
import uploadAPI from '../../api/upload';

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
  const [quizQuestionModalOpen, setQuizQuestionModalOpen] = useState(false);
  const [quizQuestionEditIndex, setQuizQuestionEditIndex] = useState(null);
  const [answerDraft, setAnswerDraft] = useState({});
  const [answeringId, setAnsweringId] = useState(null);
  const [resourceList, setResourceList] = useState([]);
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [resourcesSaving, setResourcesSaving] = useState(false);
  const [resourcesNotify, setResourcesNotify] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSending, setNoteSending] = useState(false);
  const [resourcesNotesSubTab, setResourcesNotesSubTab] = useState('resources'); // 'resources' | 'notes'
  const [resourceUploading, setResourceUploading] = useState(false);
  const [createAssessmentModalOpen, setCreateAssessmentModalOpen] = useState(false);
  const [assessmentCreating, setAssessmentCreating] = useState(false);
  const [attendanceStarting, setAttendanceStarting] = useState(false);
  const [participantsWithPresence, setParticipantsWithPresence] = useState([]);
  const [presenceOnlineCount, setPresenceOnlineCount] = useState(0);
  const [attendanceStopping, setAttendanceStopping] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certsGenerating, setCertsGenerating] = useState(false);
  const [certsSending, setCertsSending] = useState(false);
  const [certPreviewOpen, setCertPreviewOpen] = useState(false);
  const [certPreviewObjectUrl, setCertPreviewObjectUrl] = useState(null);
  const [certPreviewLoading, setCertPreviewLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

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

  useEffect(() => {
    if (activeOption !== 'dashboard' || !workshopId) return;
    (async () => {
      try {
        const res = await workshopAPI.getDashboardStats(workshopId);
        if (res?.success && res.data) setDashboardStats(res.data);
      } catch (_) {
        setDashboardStats(null);
      }
    })();
  }, [activeOption, workshopId]);

  // Heartbeat: touch presence when viewing workshop (tutor/LSM/PM)
  useEffect(() => {
    if (!workshopId) return;
    const touch = () => workshopAPI.touchPresence(workshopId).catch(() => {});
    touch();
    const interval = setInterval(touch, 60 * 1000);
    return () => clearInterval(interval);
  }, [workshopId]);

  // Fetch participants with presence when on dashboard (poll every 30s)
  useEffect(() => {
    if (activeOption !== 'dashboard' || !workshopId) return;
    const fetchPresence = async () => {
      try {
        const res = await workshopAPI.getParticipantsWithPresence(workshopId);
        if (res?.success && res.data) {
          setParticipantsWithPresence(res.data.participants || []);
          setPresenceOnlineCount(res.data.onlineCount ?? 0);
        }
      } catch (_) {}
    };
    fetchPresence();
    const interval = setInterval(fetchPresence, 30 * 1000);
    return () => clearInterval(interval);
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

  const handleResourceFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setResourceUploading(true);
    try {
      const res = await uploadAPI.uploadFile(file, 'workshop-resources');
      if (res?.success && res?.data?.url) {
        setResourceList((prev) => [...prev, { label: file.name, url: res.data.url }]);
        toast.success('File added to list. Save resources to store.');
      } else throw new Error(res?.error || 'Upload failed');
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setResourceUploading(false);
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

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-lg border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Attendees</span>
              </div>
              <p className="text-2xl font-semibold text-text">{dashboardStats?.attendeesCount ?? (workshop?.attendees?.length ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <HelpCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Questions</span>
              </div>
              <p className="text-2xl font-semibold text-text">{dashboardStats?.questionsCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Correct</span>
              </div>
              <p className="text-2xl font-semibold text-green-700">{dashboardStats?.totalCorrect ?? 0}</p>
            </div>
            <div className="rounded-lg border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <XCircle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium">Wrong</span>
              </div>
              <p className="text-2xl font-semibold text-amber-700">{dashboardStats?.totalWrong ?? 0}</p>
            </div>
            <div className="rounded-lg border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <p className="text-2xl font-semibold text-text">{dashboardStats?.durationMinutes != null ? `${dashboardStats.durationMinutes} min` : '—'}</p>
            </div>
            <div className="rounded-lg border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-textMuted mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium">Resources</span>
              </div>
              <p className="text-2xl font-semibold text-text">{dashboardStats?.resourcesCount ?? (workshop?.resources?.length ?? 0)}</p>
            </div>
          </div>

          {/* Participants (who's online / last active) */}
          <div className="rounded-lg border border-brintelli-border p-4 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Participants
              <span className="text-textMuted font-normal">
                ({presenceOnlineCount} online · {participantsWithPresence.length} enrolled)
              </span>
            </h4>
            <p className="text-sm text-textMuted">Enrolled learners. Green = currently viewing workshop; otherwise last active time.</p>
            {participantsWithPresence.length === 0 ? (
              <p className="text-sm text-textMuted">No enrolled participants yet.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {participantsWithPresence.map((p) => {
                  const lastActive = p.lastActiveAt ? (() => {
                    const sec = Math.floor((Date.now() - new Date(p.lastActiveAt).getTime()) / 1000);
                    if (sec < 60) return 'just now';
                    if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
                    if (sec < 86400) return `${Math.floor(sec / 3600)} h ago`;
                    return `${Math.floor(sec / 86400)} d ago`;
                  })() : null;
                  return (
                    <li key={p.userId} className="flex items-center justify-between gap-2 py-1.5 border-b border-brintelli-border/40 last:border-0">
                      <span className="font-medium text-text truncate">{p.fullName}</span>
                      <span className="shrink-0 flex items-center gap-1.5 text-xs">
                        {p.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden /> Online
                          </span>
                        ) : lastActive ? (
                          <span className="text-textMuted">Last active: {lastActive}</span>
                        ) : (
                          <span className="text-textMuted">—</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Attendance */}
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

          {/* Resources & downloads */}
          <div className="rounded-lg border border-brintelli-border p-4 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4" /> Resources &amp; who downloaded
            </h4>
            <p className="text-sm text-textMuted">Downloads are recorded when learners open a resource link from the workshop page.</p>
            {(!dashboardStats?.resourceStats || dashboardStats.resourceStats.length === 0) ? (
              <p className="text-sm text-textMuted">No resources added yet. Add links in Resources &amp; Notes.</p>
            ) : (
              <ul className="space-y-3">
                {dashboardStats.resourceStats.map((rs) => (
                  <li key={rs.resourceIndex} className="border-b border-brintelli-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <a href={rs.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:underline inline-flex items-center gap-1">
                        {rs.label || rs.url || `Resource ${rs.resourceIndex + 1}`}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-sm text-textMuted">{rs.downloadCount} download{rs.downloadCount !== 1 ? 's' : ''}</span>
                    </div>
                    {rs.downloadCount > 0 && rs.downloadedByNames && (
                      <p className="text-xs text-textMuted mt-1">Who: {rs.downloadedByNames.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => { loadAll(); workshopAPI.getDashboardStats(workshopId).then((r) => r?.success && r.data && setDashboardStats(r.data)); }} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      )}

        {activeOption === 'resources-notes' && (
          <div className="p-6 flex flex-col min-h-[420px]">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" /> Resources & Notes
            </h3>

            {/* Content area: list of resources and notes */}
            <div className="flex-1 space-y-4 mb-4">
              {resourceList.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-textMuted mb-3">Resources</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resourceList.map((r, i) => (
                      <div key={`res-${i}`} className="rounded-xl border border-brintelli-border bg-white p-4 shadow-sm flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0 flex-1 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-brand-500 shrink-0" />
                            <span className="font-medium text-text truncate" title={r.label || r.url}>{r.label || 'Resource'}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 shrink-0 -mt-1 -mr-1" onClick={() => setResourceList((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove resource">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 font-medium text-sm transition-colors"
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
                  <h4 className="text-xs font-medium text-textMuted mb-2">Notes</h4>
                  <ul className="space-y-1 text-sm text-text">
                    {(workshop?.tutorAnnouncements || []).map((note, i) => (
                      <li key={`note-${i}`} className="py-2 border-b border-brintelli-border/40 last:border-0">
                        {typeof note === 'string' ? note : (note?.content ?? note?.text ?? '')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {resourceList.length === 0 && !hasNotes && (
                <p className="text-sm text-textMuted">No resources or notes yet. Use the bar below to add files, links, or notes.</p>
              )}
            </div>

            {/* Bottom option bar (Resources | Notes) */}
            <div className="rounded-xl bg-gradient-to-r from-brintelli-primary/90 to-brintelli-primaryDark shadow-sm px-3 py-3 mt-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setResourcesNotesSubTab('resources')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${resourcesNotesSubTab === 'resources' ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <FileText className="h-4 w-4" /> Resources
                </button>
                <button
                  type="button"
                  onClick={() => setResourcesNotesSubTab('notes')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${resourcesNotesSubTab === 'notes' ? 'bg-white/20 text-white' : 'text-white/90 hover:bg-white/10'}`}
                >
                  <StickyNote className="h-4 w-4" /> Notes
                </button>
              </div>

              {resourcesNotesSubTab === 'resources' && (
                <div className="space-y-2">
                  <p className="text-white/90 text-xs">Upload a file or add a link. Save to store; optionally notify participants.</p>
                  <div className="flex flex-wrap items-end gap-2">
                    <input
                      type="file"
                      id="workshop-resource-file"
                      className="hidden"
                      onChange={handleResourceFileChange}
                    />
                    <label
                      htmlFor="workshop-resource-file"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 text-white border-0 hover:bg-white/30 cursor-pointer ${resourceUploading ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      <Upload className="h-4 w-4" /> {resourceUploading ? 'Uploading…' : 'Upload file'}
                    </label>
                    <input
                      type="text"
                      value={newResourceLabel}
                      onChange={(e) => setNewResourceLabel(e.target.value)}
                      placeholder="Label"
                      className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white placeholder:text-white/60 w-28"
                    />
                    <input
                      type="url"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      placeholder="https://... (or use Upload)"
                      className="rounded-lg border border-white/30 bg-white/10 px-2 py-1.5 text-sm text-white placeholder:text-white/60 flex-1 min-w-[160px]"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 text-white border-0 hover:bg-white/30"
                      onClick={() => {
                        const label = newResourceLabel.trim();
                        const url = newResourceUrl.trim();
                        if (!url && !label) return;
                        setResourceList((prev) => [...prev, { label: label || url, url: url || label }]);
                        setNewResourceLabel('');
                        setNewResourceUrl('');
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="flex items-center gap-2 text-sm text-white/90 cursor-pointer">
                      <input type="checkbox" checked={resourcesNotify} onChange={(e) => setResourcesNotify(e.target.checked)} className="rounded border-white/50" />
                      Notify participants when saving
                    </label>
                    <Button
                      size="sm"
                      disabled={resourcesSaving}
                      onClick={async () => {
                        setResourcesSaving(true);
                        try {
                          const res = await workshopAPI.updateResources(workshopId, { resources: resourceList, notifyParticipants: resourcesNotify });
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
                      className="bg-white text-brand-600 hover:bg-white/90"
                    >
                      {resourcesSaving ? 'Saving…' : 'Save resources'}
                    </Button>
                  </div>
                </div>
              )}

              {resourcesNotesSubTab === 'notes' && (
                <div className="space-y-2">
                  <p className="text-white/90 text-xs">Add an announcement or note. Save only or save and email participants.</p>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Announcement or note for students..."
                    rows={2}
                    className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 resize-none"
                  />
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
                      className="bg-white/20 text-white border-0 hover:bg-white/30"
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
                      className="bg-white text-brand-600 hover:bg-white/90"
                    >
                      {noteSending ? 'Sending…' : 'Save & push to participants'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeOption === 'quiz' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5" /> Quiz
            </h3>
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 p-4 sm:p-6 space-y-6">
              <p className="text-sm text-textMuted">Build quiz, poll, or review questions. View and edit questions as cards; add or edit opens the question in a modal.</p>
              <div>
                <label htmlFor="quiz-title-input" className="text-sm font-medium text-textSoft mb-2 block">Quiz title</label>
                <input
                  id="quiz-title-input"
                  type="text"
                  value={quiz?.title ?? 'Workshop Quiz'}
                  onChange={(e) => setQuiz({ ...(quiz || { questions: [] }), title: e.target.value })}
                  className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm bg-white"
                  placeholder="Workshop Quiz"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {quiz && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={quizPublishing}
                    onClick={() => handlePublishQuiz(!quiz.published)}
                    className="text-textMuted hover:text-text"
                  >
                    {quiz?.published ? 'Published' : 'Unpublished'} · click to toggle
                  </Button>
                )}
                <Button size="sm" disabled={quizSaving} onClick={handleSaveQuiz}>
                  {quizSaving ? 'Saving…' : quiz ? 'Update quiz' : 'Create quiz'}
                </Button>
              </div>
              <QuizQuestionCards
                questions={quiz?.questions ?? []}
                onAddQuestion={() => {
                  setQuizQuestionEditIndex(null);
                  setQuizQuestionModalOpen(true);
                }}
                onEditQuestion={(index) => {
                  setQuizQuestionEditIndex(index);
                  setQuizQuestionModalOpen(true);
                }}
                onDeleteQuestion={(index) => {
                  const base = quiz || { title: 'Workshop Quiz' };
                  const next = (base.questions ?? []).filter((_, i) => i !== index);
                  setQuiz({ ...base, questions: next });
                }}
              />
              <QuestionEditModal
                isOpen={quizQuestionModalOpen}
                onClose={() => {
                  setQuizQuestionModalOpen(false);
                  setQuizQuestionEditIndex(null);
                }}
                question={quizQuestionEditIndex === null ? null : (quiz?.questions ?? [])[quizQuestionEditIndex]}
                onSave={(questionData) => {
                  const base = quiz || { title: 'Workshop Quiz', questions: [] };
                  const questions = [...(base.questions ?? [])];
                  if (quizQuestionEditIndex === null) {
                    questions.push(questionData);
                  } else {
                    questions[quizQuestionEditIndex] = questionData;
                  }
                  setQuiz({ ...base, questions });
                  setQuizQuestionModalOpen(false);
                  setQuizQuestionEditIndex(null);
                }}
                onUploadFile={async (file, folder) => {
                  try {
                    const res = await uploadAPI.uploadFile(file, folder || 'workshop-quiz');
                    if (res?.success) toast.success('Image uploaded');
                    return res;
                  } catch (e) {
                    toast.error(e?.message || 'Upload failed');
                    throw e;
                  }
                }}
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileCheck className="h-5 w-5" /> Assessment & Assignments
              </h3>
              <Button size="sm" onClick={() => setCreateAssessmentModalOpen(true)} className="gap-1.5 bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0">
                <Plus className="h-4 w-4" /> Create assessment
              </Button>
            </div>
            <p className="text-sm text-textMuted mb-4">Assignments appear as cards below. Students can submit from their workshop view.</p>
            {assignments.length === 0 ? (
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 p-8 text-center">
                <FileCheck className="h-12 w-12 text-textMuted mx-auto mb-3 opacity-60" />
                <p className="text-sm text-textMuted mb-4">No assessments yet. Create one to get started.</p>
                <Button size="sm" onClick={() => setCreateAssessmentModalOpen(true)}>Create assessment</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div
                    key={a.id || a._id}
                    className="rounded-xl border border-brintelli-border bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text mb-1">{a.title || 'Untitled'}</h4>
                        {a.description && (
                          <p className="text-sm text-textMuted mb-2 line-clamp-2">{a.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {a.dueDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                              <Clock className="h-3.5 w-3.5" /> Due: {new Date(a.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-brintelli-baseAlt text-xs text-textMuted">
                            Assignment
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        onClick={() =>
                          workshopAPI.getSubmissions(workshopId, a.id || a._id).then((r) => {
                            if (r?.success) toast.success(`${(r.data?.submissions || []).length} submission(s)`);
                          })
                        }
                      >
                        View submissions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <CreateAssessmentModal
              isOpen={createAssessmentModalOpen}
              onClose={() => setCreateAssessmentModalOpen(false)}
              loading={assessmentCreating}
              onSubmit={async (data) => {
                setAssessmentCreating(true);
                try {
                  const res = await workshopAPI.createAssignment(workshopId, data);
                  if (res?.success && res?.data?.assignment) {
                    setAssignments((prev) => [res.data.assignment, ...prev]);
                    setCreateAssessmentModalOpen(false);
                    toast.success('Assessment created');
                  } else throw new Error(res?.error);
                } catch (e) {
                  toast.error(e?.message || 'Failed to create assessment');
                } finally {
                  setAssessmentCreating(false);
                }
              }}
            />
          </div>
        )}

        {activeOption === 'leaderboard' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-brand-500" /> Leaderboard
            </h3>
            <p className="text-sm text-textMuted mb-6">Participants ranked by quiz score. Top 3 highlighted below.</p>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-textMuted py-8 rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 text-center">No attempts yet. Quiz scores will appear here.</p>
            ) : (
              <>
                {/* Top 3 cards – gold / silver / bronze in theme */}
                {leaderboard.length >= 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {/* 2nd place */}
                    <div className="order-2 sm:order-1 rounded-xl border-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden flex items-center justify-center bg-brintelli-baseAlt shrink-0 mb-2">
                        {leaderboard[1].profileImageUrl ? (
                          <img src={leaderboard[1].profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-gray-500">2</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Medal className="h-5 w-5 text-gray-400" aria-hidden />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">2nd</span>
                      </div>
                      <span className="font-semibold text-text truncate w-full">{leaderboard[1].userName}</span>
                      <span className="text-sm text-brand-600 font-medium mt-0.5">{leaderboard[1].score} pts</span>
                    </div>
                    {/* 1st place */}
                    <div className="order-1 sm:order-2 rounded-xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white p-5 shadow-md flex flex-col items-center text-center -mt-2 sm:mt-0">
                      <div className="w-16 h-16 rounded-full border-2 border-amber-400 overflow-hidden flex items-center justify-center bg-amber-50 shrink-0 mb-2">
                        {leaderboard[0].profileImageUrl ? (
                          <img src={leaderboard[0].profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-amber-600">1</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Trophy className="h-6 w-6 text-amber-500" aria-hidden />
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">1st</span>
                      </div>
                      <span className="font-semibold text-text truncate w-full">{leaderboard[0].userName}</span>
                      <span className="text-brand-600 font-semibold mt-0.5">{leaderboard[0].score} pts</span>
                    </div>
                    {/* 3rd place */}
                    <div className="order-3 rounded-xl border-2 border-amber-700/50 bg-gradient-to-b from-amber-100/50 to-white p-4 shadow-sm flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-700/50 overflow-hidden flex items-center justify-center bg-amber-50/50 shrink-0 mb-2">
                        {leaderboard[2].profileImageUrl ? (
                          <img src={leaderboard[2].profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-amber-700">3</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Medal className="h-5 w-5 text-amber-700/70" aria-hidden />
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">3rd</span>
                      </div>
                      <span className="font-semibold text-text truncate w-full">{leaderboard[2].userName}</span>
                      <span className="text-sm text-brand-600 font-medium mt-0.5">{leaderboard[2].score} pts</span>
                    </div>
                  </div>
                )}
                {/* Table: Place | Player name | Points */}
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
                        <tr
                          key={r.userId}
                          className={`border-b border-brintelli-border/60 last:border-0 ${idx < 3 ? 'bg-brintelli-baseAlt/20' : ''}`}
                        >
                          <td className="py-3 px-4 font-medium text-textMuted">#{r.rank}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full border border-brintelli-border overflow-hidden bg-brintelli-baseAlt shrink-0 flex items-center justify-center text-xs font-semibold text-textMuted">
                                {r.profileImageUrl ? <img src={r.profileImageUrl} alt="" className="w-full h-full object-cover" /> : `#${r.rank}`}
                              </div>
                              <span className="font-medium text-text truncate">{r.userName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-brand-600">{r.score} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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
            <p className="text-sm text-textMuted">Preview how the certificate will look, then generate and send.</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={certPreviewLoading}
                onClick={async () => {
                  setCertPreviewLoading(true);
                  try {
                    const blob = await workshopAPI.getCertificatePreview(workshopId, attendees[0]?.userId || null);
                    if (certPreviewObjectUrl) URL.revokeObjectURL(certPreviewObjectUrl);
                    setCertPreviewObjectUrl(URL.createObjectURL(blob));
                    setCertPreviewOpen(true);
                  } catch (e) {
                    toast.error(e?.message || 'Failed to load preview');
                  } finally {
                    setCertPreviewLoading(false);
                  }
                }}
              >
                {certPreviewLoading ? 'Loading…' : 'Preview certificate'}
              </Button>
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
                  <li key={c.id || c.userId} className="flex justify-between items-center gap-2 text-sm py-1 border-b border-brintelli-border/40 last:border-0">
                    <span>{c.userName || c.userEmail}</span>
                    <span className="text-textMuted font-mono text-xs">{c.certificateNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      disabled={certPreviewLoading}
                      onClick={async () => {
                        setCertPreviewLoading(true);
                        try {
                          const blob = await workshopAPI.downloadCertificate(workshopId, c.id, true);
                          if (certPreviewObjectUrl) URL.revokeObjectURL(certPreviewObjectUrl);
                          setCertPreviewObjectUrl(URL.createObjectURL(blob));
                          setCertPreviewOpen(true);
                        } catch (e) {
                          toast.error(e?.message || 'Failed to load preview');
                        } finally {
                          setCertPreviewLoading(false);
                        }
                      }}
                    >
                      Preview
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Modal
            isOpen={certPreviewOpen}
            onClose={() => {
              setCertPreviewOpen(false);
              if (certPreviewObjectUrl) {
                URL.revokeObjectURL(certPreviewObjectUrl);
                setCertPreviewObjectUrl(null);
              }
            }}
            title="Certificate preview"
            size="xl"
          >
            <div className="min-h-[70vh] -m-6">
              {certPreviewObjectUrl ? (
                <iframe
                  src={certPreviewObjectUrl}
                  title="Certificate preview"
                  className="w-full h-[75vh] rounded-b-2xl border-0"
                />
              ) : (
                <p className="text-textMuted py-8 text-center">Loading…</p>
              )}
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default TutorWorkshopDetail;
