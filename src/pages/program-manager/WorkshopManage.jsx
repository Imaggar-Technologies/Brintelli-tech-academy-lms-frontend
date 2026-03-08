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
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
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

  useEffect(() => {
    if (workshopId) {
      loadWorkshop();
      loadManageData();
      fetchTutors();
    }
  }, [workshopId]);

  const loadWorkshop = async () => {
    try {
      const res = await workshopAPI.getWorkshopById(workshopId);
      if (res?.success && res.data?.workshop) {
        const w = res.data.workshop;
        setWorkshop(w);
        setResources(Array.isArray(w.resources) ? w.resources.map((r) => ({ label: r.label || '', url: r.url || '' })) : []);
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
      const [pRes, aRes, fRes, qRes, vRes, cRes] = await Promise.all([
        workshopAPI.getParticipants(workshopId),
        workshopAPI.getAssignments(workshopId),
        workshopAPI.getFeedback(workshopId),
        workshopAPI.getQuiz(workshopId),
        workshopAPI.getVouchers(workshopId),
        workshopAPI.getCertificates(workshopId),
      ]);
      if (pRes?.success && pRes.data?.participants) setParticipants(pRes.data.participants);
      if (aRes?.success && aRes.data?.assignments) setAssignments(aRes.data.assignments);
      if (fRes?.success && fRes.data?.feedback) setFeedback(fRes.data.feedback);
      if (qRes?.success && qRes.data?.quiz) setQuiz(qRes.data.quiz);
      if (vRes?.success && vRes.data?.vouchers) setVouchers(vRes.data.vouchers);
      if (cRes?.success && cRes.data?.certificates) setCertificates(cRes.data.certificates);
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
          id: t.id || t._id?.toString(),
          name: t.fullName || t.name || t.email?.split('@')[0] || 'Unknown',
        })));
      }
    } catch (e) {
      setTutors([]);
    }
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

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <PageHeader
        title={title}
        description={workshop.description || `${workshop.subject || 'Workshop'} · ${workshop.date || ''} ${workshop.time || ''}`}
        actions={
          <Button variant="secondary" className="gap-2" onClick={() => navigate('/program-manager/workshops')}>
            <ArrowLeft className="h-4 w-4" />
            Back to workshops
          </Button>
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => { loadWorkshop(); loadManageData(); }}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="primary" size="sm" className="gap-1.5" onClick={saveResources} disabled={savingResources}>
            <Save className="h-4 w-4" />
            {savingResources ? 'Saving...' : 'Save resources'}
          </Button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resources */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Resources</h2>
          </div>
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
          </div>
        </section>

        {/* Tutor */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <UserCircle className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Tutor</h2>
          </div>
          <select
            value={workshop.tutorId?.toString() || ''}
            onChange={(e) => updateTutor(e.target.value)}
            className="w-full rounded-lg border border-brintelli-border bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">No tutor assigned</option>
            {tutors.map((t) => (
              <option key={t.id || t._id} value={t.id || t._id}>
                {t.name || t.fullName} ({t.email})
              </option>
            ))}
          </select>
        </section>

        {/* Registered participants + Email */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm lg:col-span-2">
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

        {/* Assignments */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Assignments</h2>
          </div>
          <ul className="mb-4 space-y-2">
            {assignments.length === 0 ? (
              <li className="text-sm text-textMuted">No assignments yet.</li>
            ) : (
              assignments.map((a) => (
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
          <div className="flex gap-2">
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

        {/* Feedback */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Feedback ({feedback.length})</h2>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
            {feedback.length === 0 ? (
              <p className="text-textMuted">No feedback yet.</p>
            ) : (
              feedback.map((f) => (
                <div key={f.id || f._id} className="rounded-lg border border-brintelli-border/40 px-3 py-2">
                  <span className="font-medium text-text">{f.userName || '—'}</span>
                  {f.rating != null && <span className="text-textMuted ml-2">{f.rating}/5</span>}
                  {f.comment && <p className="mt-1 text-textMuted text-xs line-clamp-2">{f.comment}</p>}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quiz */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <Trophy className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Quiz</h2>
          </div>
          <p className="text-sm text-textMuted">
            {quiz ? (
              <>Quiz &quot;{quiz.title}&quot; is set. Attendees see it on the workshop page. Leaderboard lists all participants; quiz points are added to learners&apos; total points.</>
            ) : (
              'No quiz yet. Create one via the workshop quiz API (POST /api/workshops/:id/quiz).'
            )}
          </p>
        </section>

        {/* Certificates – generate, send, list */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Award className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Certificate maker</h2>
          </div>
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
        </section>

        {/* Vouchers */}
        <section className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
              <Gift className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-text">Vouchers</h2>
          </div>
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
        </section>
      </div>
    </div>
  );
};

export default WorkshopManage;
