import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Presentation,
  Users,
  MessageSquare,
  Send,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  RefreshCw,
  Mail,
  Settings,
  Trophy,
  FileText,
  Gift,
  Award,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import QuizBuilder from "../../components/workshop/QuizBuilder";
import workshopAPI from "../../api/workshop";
import { selectCurrentUser } from "../../store/slices/authSlice";

const TutorWorkshops = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const tutorId = user?.id || user?._id?.toString();

  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState([]);
  const [feedbackPollLoading, setFeedbackPollLoading] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, workshop: null, list: [] });
  const [notesModal, setNotesModal] = useState({
    open: false,
    workshop: null,
    content: "",
    links: [""],
    subject: "",
    sendEmail: true,
  });
  const [sendingNote, setSendingNote] = useState(false);
  const [manageModal, setManageModal] = useState({ open: false, workshop: null, tab: "quiz" });
  const [quizData, setQuizData] = useState({ quiz: null, loading: false, saving: false, publishing: false });
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [resourcesList, setResourcesList] = useState([]);
  const [resourceLabel, setResourceLabel] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourcesSaving, setResourcesSaving] = useState(false);
  const [vouchersList, setVouchersList] = useState([]);
  const [newVoucherCode, setNewVoucherCode] = useState("");
  const [newVoucherDesc, setNewVoucherDesc] = useState("");
  const [voucherSaving, setVoucherSaving] = useState(false);
  const [bulkEmailForm, setBulkEmailForm] = useState({ type: "custom", subject: "", body: "" });
  const [bulkEmailSending, setBulkEmailSending] = useState(false);
  const [certificatesList, setCertificatesList] = useState([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsGenerating, setCertsGenerating] = useState(false);
  const [certsSending, setCertsSending] = useState(false);

  useEffect(() => {
    if (tutorId) fetchWorkshops();
  }, [tutorId]);

  const fetchWorkshops = async () => {
    if (!tutorId) return;
    setLoading(true);
    try {
      const res = await workshopAPI.getAllWorkshops({ tutorId });
      if (res.success) setWorkshops(res.data?.workshops || []);
      else setWorkshops([]);
    } catch (e) {
      toast.error(e.message || "Failed to load workshops");
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishFeedbackPoll = async (workshop, published) => {
    setFeedbackPollLoading(workshop.id || workshop._id);
    try {
      const res = await workshopAPI.publishFeedbackPoll(workshop.id || workshop._id, published);
      if (res.success) {
        toast.success(res.message || (published ? "Feedback poll opened" : "Feedback poll closed"));
        fetchWorkshops();
      } else toast.error(res.error || "Failed to update");
    } catch (e) {
      toast.error(e.message || "Failed to update feedback poll");
    } finally {
      setFeedbackPollLoading(null);
    }
  };

  const openFeedbackModal = async (workshop) => {
    setFeedbackModal({ open: true, workshop, list: [] });
    try {
      const res = await workshopAPI.getFeedback(workshop.id || workshop._id);
      if (res.success) setFeedbackModal((m) => ({ ...m, list: res.data?.feedback || [] }));
    } catch (e) {
      toast.error(e.message || "Failed to load feedback");
    }
  };

  const openNotesModal = (workshop) => {
    setNotesModal({
      open: true,
      workshop,
      content: "",
      links: [""],
      subject: `Update: ${workshop.title || "Workshop"}`,
      sendEmail: true,
    });
  };

  const addLinkRow = () => setNotesModal((m) => ({ ...m, links: [...m.links, ""] }));
  const setLink = (index, value) =>
    setNotesModal((m) => ({
      ...m,
      links: m.links.map((l, i) => (i === index ? value : l)),
    }));
  const removeLink = (index) =>
    setNotesModal((m) => ({ ...m, links: m.links.filter((_, i) => i !== index) }));

  const handleSendNote = async (e) => {
    e.preventDefault();
    const { workshop, content, links, subject, sendEmail } = notesModal;
    if (!workshop) return;
    setSendingNote(true);
    try {
      const cleanLinks = links.filter((l) => (typeof l === "string" ? l.trim() : l?.url || l?.href));
      const res = await workshopAPI.postWorkshopNote(workshop.id || workshop._id, {
        content: content.trim(),
        links: cleanLinks,
        subject: subject.trim() || undefined,
        sendEmail,
      });
      if (res.success) {
        toast.success(res.message || "Note sent");
        setNotesModal((m) => ({ ...m, open: false }));
      } else toast.error(res.error || "Failed to send note");
    } catch (e) {
      toast.error(e.message || "Failed to send note");
    } finally {
      setSendingNote(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const openManageModal = (workshop, tab = "quiz") => {
    setManageModal({ open: true, workshop, tab });
    setQuizData({ quiz: null, loading: false, saving: false, publishing: false });
    setLeaderboard([]);
    setResourcesList(workshop?.resources || []);
    setResourceLabel("");
    setResourceUrl("");
    setVouchersList([]);
    setCertificatesList([]);
    if (workshop?.id || workshop?._id) {
      const id = workshop.id || workshop._id;
      (async () => {
        setQuizData((q) => ({ ...q, loading: true }));
        try {
          const res = await workshopAPI.getQuiz(id);
          if (res?.success && res?.data?.quiz) setQuizData((q) => ({ ...q, quiz: res.data.quiz, loading: false }));
          else setQuizData((q) => ({ ...q, loading: false }));
        } catch {
          setQuizData((q) => ({ ...q, loading: false }));
        }
      })();
    }
  };

  const loadLeaderboard = async () => {
    const w = manageModal.workshop;
    if (!w) return;
    setLeaderboardLoading(true);
    try {
      const res = await workshopAPI.getLeaderboard(w.id || w._id);
      setLeaderboard(res?.data?.leaderboard || []);
    } catch (e) {
      toast.error(e.message || "Failed to load leaderboard");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const loadVouchers = async () => {
    const w = manageModal.workshop;
    if (!w) return;
    try {
      const res = await workshopAPI.getVouchers(w.id || w._id);
      setVouchersList(res?.data?.vouchers || []);
    } catch {
      setVouchersList([]);
    }
  };

  const loadCertificates = async () => {
    const w = manageModal.workshop;
    if (!w) return;
    setCertsLoading(true);
    try {
      const res = await workshopAPI.getCertificates(w.id || w._id);
      setCertificatesList(res?.data?.certificates || []);
    } catch {
      setCertificatesList([]);
    } finally {
      setCertsLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    const w = manageModal.workshop;
    if (!w) return;
    setQuizData((q) => ({ ...q, saving: true }));
    try {
      const id = w.id || w._id;
      const questions = (quizData.quiz?.questions ?? []).map((q) => ({ ...q, published: true }));
      const res = await workshopAPI.createOrUpdateQuiz(id, {
        title: quizData.quiz?.title || "Workshop Quiz",
        questions,
      });
      if (res?.success) {
        toast.success("Quiz saved");
        setQuizData((q) => ({ ...q, quiz: res.data?.quiz || q.quiz, saving: false }));
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to save quiz");
      setQuizData((q) => ({ ...q, saving: false }));
    }
  };

  const handlePublishQuiz = async (published) => {
    const w = manageModal.workshop;
    if (!w) return;
    setQuizData((q) => ({ ...q, publishing: true }));
    try {
      const res = await workshopAPI.publishQuiz(w.id || w._id, published);
      if (res?.success) {
        toast.success(res.message || (published ? "Quiz published" : "Quiz unpublished"));
        setQuizData((q) => ({ ...q, quiz: res.data?.quiz || q.quiz, publishing: false }));
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to update");
      setQuizData((q) => ({ ...q, publishing: false }));
    }
  };

  const handleSaveResources = async (notify) => {
    const w = manageModal.workshop;
    if (!w) return;
    setResourcesSaving(true);
    try {
      const res = await workshopAPI.updateResources(w.id || w._id, {
        resources: resourcesList,
        notifyParticipants: !!notify,
      });
      if (res?.success) {
        toast.success(res.message || "Resources updated");
        if (w.resources) w.resources = res.data?.resources || resourcesList;
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to save resources");
    } finally {
      setResourcesSaving(false);
    }
  };

  const addResourceRow = () => {
    if (resourceLabel.trim() || resourceUrl.trim()) {
      setResourcesList((prev) => [...prev, { label: resourceLabel.trim() || resourceUrl.trim(), url: resourceUrl.trim() }]);
      setResourceLabel("");
      setResourceUrl("");
    }
  };

  const removeResource = (i) => setResourcesList((prev) => prev.filter((_, idx) => idx !== i));

  const handleCreateVoucher = async () => {
    const w = manageModal.workshop;
    if (!w || !newVoucherCode.trim()) return;
    setVoucherSaving(true);
    try {
      const res = await workshopAPI.createVoucher(w.id || w._id, {
        code: newVoucherCode.trim(),
        type: "ATTENDANCE",
        description: newVoucherDesc.trim() || undefined,
      });
      if (res?.success) {
        toast.success("Voucher created");
        setNewVoucherCode("");
        setNewVoucherDesc("");
        loadVouchers();
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to create voucher");
    } finally {
      setVoucherSaving(false);
    }
  };

  const handleSendVoucherToAttendees = async (voucherId) => {
    const w = manageModal.workshop;
    if (!w) return;
    try {
      const res = await workshopAPI.sendVoucherToAttendees(w.id || w._id, voucherId);
      if (res?.success) {
        toast.success(res.message || "Voucher sent");
        loadVouchers();
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to send");
    }
  };

  const handleBulkEmail = async (e) => {
    e.preventDefault();
    const w = manageModal.workshop;
    if (!w) return;
    setBulkEmailSending(true);
    try {
      const res = await workshopAPI.sendEmailToEnrolled(w.id || w._id, {
        type: bulkEmailForm.type,
        subject: bulkEmailForm.subject,
        body: bulkEmailForm.body,
      });
      if (res?.success) {
        toast.success(res.message || "Email sent");
        setManageModal((m) => ({ ...m, open: false }));
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to send email");
    } finally {
      setBulkEmailSending(false);
    }
  };

  const handleGenerateCertificates = async () => {
    const w = manageModal.workshop;
    if (!w) return;
    setCertsGenerating(true);
    try {
      const res = await workshopAPI.generateCertificates(w.id || w._id);
      if (res?.success) {
        toast.success(`Generated ${(res.data?.certificates || []).length} certificate(s)`);
        loadCertificates();
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to generate");
    } finally {
      setCertsGenerating(false);
    }
  };

  const handleSendCertificates = async () => {
    const w = manageModal.workshop;
    if (!w) return;
    setCertsSending(true);
    try {
      const res = await workshopAPI.sendCertificatesToParticipants(w.id || w._id);
      if (res?.success) {
        toast.success(res.message || "Certificates sent");
      } else throw new Error(res?.error);
    } catch (e) {
      toast.error(e.message || "Failed to send");
    } finally {
      setCertsSending(false);
    }
  };

  const tabs = [
    { id: "quiz", label: "Quiz", icon: FileText },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "resources", label: "Resources", icon: FileText },
    { id: "vouchers", label: "Vouchers", icon: Gift },
    { id: "email", label: "Bulk email", icon: Mail },
    { id: "certificates", label: "Certificates", icon: Award },
  ];

  return (
    <>
      <PageHeader
        title="My Workshops"
        description="Manage feedback polls and send notes or links to participants (e.g. review materials)."
        actions={
          <Button variant="secondary" onClick={fetchWorkshops} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-brintelli-border/60 bg-white p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : workshops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brintelli-border/60 bg-brintelli-baseAlt/30 p-12 text-center">
          <Presentation className="h-12 w-12 text-textMuted mx-auto mb-3" />
          <p className="text-text font-medium">No workshops assigned</p>
          <p className="text-sm text-textMuted mt-1">Workshops you are tutoring will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brintelli-border/60 bg-brintelli-baseAlt/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Workshop</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Participants</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Feedback poll</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-textMuted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workshops.map((w) => {
                  const id = w.id || w._id;
                  const published = w.feedbackPollPublished === true;
                  const loadingThis = feedbackPollLoading === id;
                  return (
                    <tr key={id} className="border-b border-brintelli-border/40 hover:bg-brintelli-baseAlt/20">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">{w.title || "Untitled"}</p>
                        {w.subject && <p className="text-xs text-textMuted">{w.subject}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-textMuted">{formatDate(w.date)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm text-text">
                          <Users className="h-4 w-4" />
                          {w.participantsCount ?? w.participants?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          disabled={loadingThis}
                          onClick={() => handlePublishFeedbackPoll(w, !published)}
                        >
                          {published ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-textMuted" />}
                          <span className="text-sm">{published ? "Open" : "Closed"}</span>
                          {loadingThis && <span className="text-xs opacity-70">Updating…</span>}
                        </Button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-sm"
                            onClick={() => openFeedbackModal(w)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Feedback
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1 text-sm"
                            onClick={() => openNotesModal(w)}
                          >
                            <Send className="h-4 w-4" />
                            Send notes
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="gap-1 text-sm"
                            onClick={() => navigate(`/tutor/workshops/${id}`)}
                          >
                            Open
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-sm"
                            onClick={() => openManageModal(w, "quiz")}
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback list modal */}
      <Modal
        isOpen={feedbackModal.open}
        onClose={() => setFeedbackModal((m) => ({ ...m, open: false }))}
        title={feedbackModal.workshop ? `Feedback – ${feedbackModal.workshop.title || "Workshop"}` : "Feedback"}
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {feedbackModal.list.length === 0 ? (
            <p className="text-textMuted text-sm py-4">No feedback submitted yet.</p>
          ) : (
            <ul className="space-y-3">
              {feedbackModal.list.map((f) => (
                <li key={f.id || f._id} className="border border-brintelli-border/60 rounded-lg p-3">
                  <p className="text-sm font-medium text-text">{f.userName || f.userEmail || "—"}</p>
                  {f.rating != null && <p className="text-xs text-textMuted">Rating: {f.rating}</p>}
                  {f.comment && <p className="text-sm text-text mt-1">{f.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      {/* Send notes / announcements modal */}
      <Modal
        isOpen={notesModal.open}
        onClose={() => setNotesModal((m) => ({ ...m, open: false }))}
        title={notesModal.workshop ? `Send notes – ${notesModal.workshop.title || "Workshop"}` : "Send notes"}
      >
        <form onSubmit={handleSendNote} className="space-y-4">
          <p className="text-sm text-textMuted">
            Add a message and optional links (e.g. &quot;Please review the following materials&quot;). You can send this as an email to all enrolled participants.
          </p>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Message</label>
            <textarea
              className="w-full rounded-lg border border-brintelli-border/60 bg-white px-3 py-2 text-sm text-text min-h-[100px]"
              placeholder="e.g. Please review the slides and practice problems before the next session."
              value={notesModal.content}
              onChange={(e) => setNotesModal((m) => ({ ...m, content: e.target.value }))}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text">Links</label>
              <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={addLinkRow}>
                <Plus className="h-3 w-3" /> Add link
              </Button>
            </div>
            {notesModal.links.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="url"
                  className="flex-1 rounded-lg border border-brintelli-border/60 bg-white px-3 py-2 text-sm"
                  placeholder="https://..."
                  value={typeof link === "string" ? link : link?.url || link?.href || ""}
                  onChange={(e) => setLink(i, e.target.value)}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email subject (when sending email)</label>
            <input
              type="text"
              className="w-full rounded-lg border border-brintelli-border/60 bg-white px-3 py-2 text-sm"
              placeholder="e.g. Review materials for next session"
              value={notesModal.subject}
              onChange={(e) => setNotesModal((m) => ({ ...m, subject: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notesModal.sendEmail}
              onChange={(e) => setNotesModal((m) => ({ ...m, sendEmail: e.target.checked }))}
              className="rounded border-brintelli-border"
            />
            <span className="text-sm text-text">Send email to all enrolled participants</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setNotesModal((m) => ({ ...m, open: false }))}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendingNote} className="gap-2">
              <Mail className="h-4 w-4" />
              {notesModal.sendEmail ? "Save & send email" : "Save note"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage workshop modal (Quiz, Leaderboard, Resources, Vouchers, Bulk email, Certificates) */}
      <Modal
        isOpen={manageModal.open}
        onClose={() => setManageModal((m) => ({ ...m, open: false }))}
        title={manageModal.workshop ? `Manage – ${manageModal.workshop.title || "Workshop"}` : "Manage workshop"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1 border-b border-brintelli-border/60 pb-2">
            {tabs.map((t) => (
              <Button
                key={t.id}
                variant={manageModal.tab === t.id ? "primary" : "ghost"}
                size="sm"
                className="gap-1"
                onClick={() => {
                  setManageModal((m) => ({ ...m, tab: t.id }));
                  if (t.id === "leaderboard") loadLeaderboard();
                  if (t.id === "vouchers") loadVouchers();
                  if (t.id === "certificates") loadCertificates();
                }}
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </Button>
            ))}
          </div>

          {manageModal.tab === "quiz" && (
            <div className="space-y-3">
              {quizData.loading ? (
                <p className="text-sm text-textMuted">Loading quiz…</p>
              ) : (
                <>
                  <p className="text-sm text-textMuted">
                    Add quiz questions (multiple choice), polls, or reviews. When published, learners see the quiz and can answer; when closed, it is visible only here and learners cannot answer.
                  </p>
                  {quizData.quiz && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={quizData.publishing}
                        onClick={() => handlePublishQuiz(!quizData.quiz?.published)}
                        className={quizData.quiz?.published ? "bg-amber-600 hover:bg-amber-700 border-0" : "bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0"}
                      >
                        {quizData.quiz?.published ? "Close quiz" : "Publish to learners"}
                      </Button>
                      <Button size="sm" variant="secondary" disabled={quizData.saving} onClick={handleSaveQuiz}>
                        {quizData.saving ? "Saving…" : "Save quiz"}
                      </Button>
                    </div>
                  )}
                  <QuizBuilder
                    quiz={quizData.quiz || { title: "Workshop Quiz", questions: [] }}
                    onChange={(next) => setQuizData((q) => ({ ...q, quiz: next }))}
                  />
                  {!quizData.quiz && (
                    <Button size="sm" disabled={quizData.saving} onClick={handleSaveQuiz}>
                      {quizData.saving ? "Saving…" : "Create quiz"}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {manageModal.tab === "leaderboard" && (
            <div>
              <Button variant="ghost" size="sm" onClick={loadLeaderboard} disabled={leaderboardLoading} className="mb-2">
                {leaderboardLoading ? "Loading…" : "Refresh"}
              </Button>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-textMuted">No attempts yet.</p>
              ) : (
                <ul className="space-y-1 max-h-64 overflow-y-auto">
                  {leaderboard.map((r, i) => (
                    <li key={i} className="flex justify-between text-sm py-1 border-b border-brintelli-border/40">
                      <span>#{r.rank} {r.userName}</span>
                      <span className="font-medium">{r.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {manageModal.tab === "resources" && (
            <div className="space-y-3">
              <p className="text-sm text-textMuted">Add resources (links). Optionally notify participants.</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Label"
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm w-32"
                  value={resourceLabel}
                  onChange={(e) => setResourceLabel(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="URL"
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm flex-1 min-w-0"
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                />
                <Button type="button" size="sm" variant="secondary" onClick={addResourceRow}>
                  Add
                </Button>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {resourcesList.map((r, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 truncate max-w-[200px]">
                      {r.label || r.url}
                    </a>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeResource(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button size="sm" disabled={resourcesSaving} onClick={() => handleSaveResources(false)}>
                  Save
                </Button>
                <Button size="sm" disabled={resourcesSaving} onClick={() => handleSaveResources(true)}>
                  Save and notify participants
                </Button>
              </div>
            </div>
          )}

          {manageModal.tab === "vouchers" && (
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap items-center">
                <input
                  type="text"
                  placeholder="Voucher code"
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm flex-1 min-w-0"
                  value={newVoucherDesc}
                  onChange={(e) => setNewVoucherDesc(e.target.value)}
                />
                <Button size="sm" disabled={voucherSaving || !newVoucherCode.trim()} onClick={handleCreateVoucher}>
                  Create voucher
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-text mb-1">Vouchers</p>
                {vouchersList.length === 0 ? (
                  <p className="text-sm text-textMuted">None yet. Create one and send to attendees.</p>
                ) : (
                  <ul className="space-y-2">
                    {vouchersList.map((v) => (
                      <li key={v.id || v._id} className="flex justify-between items-center text-sm border border-brintelli-border/60 rounded-lg p-2">
                        <span><strong>{v.code}</strong> {v.description && `– ${v.description}`}</span>
                        <Button size="sm" variant="secondary" onClick={() => handleSendVoucherToAttendees(v.id || v._id)}>
                          Send to attendees
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {manageModal.tab === "email" && (
            <form onSubmit={handleBulkEmail} className="space-y-3">
              <p className="text-sm text-textMuted">Send an email to all enrolled participants.</p>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Type</label>
                <select
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm w-full"
                  value={bulkEmailForm.type}
                  onChange={(e) => setBulkEmailForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="custom">Custom</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Subject</label>
                <input
                  type="text"
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm w-full"
                  value={bulkEmailForm.subject}
                  onChange={(e) => setBulkEmailForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Body (HTML ok)</label>
                <textarea
                  className="rounded-lg border border-brintelli-border/60 px-2 py-1.5 text-sm w-full min-h-[100px]"
                  value={bulkEmailForm.body}
                  onChange={(e) => setBulkEmailForm((f) => ({ ...f, body: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={bulkEmailSending}>
                {bulkEmailSending ? "Sending…" : "Send email"}
              </Button>
            </form>
          )}

          {manageModal.tab === "certificates" && (
            <div className="space-y-3">
              <p className="text-sm text-textMuted">Generate certificates for participants, then send by email.</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" disabled={certsGenerating} onClick={handleGenerateCertificates}>
                  {certsGenerating ? "Generating…" : "Generate certificates"}
                </Button>
                <Button size="sm" variant="secondary" disabled={certsSending || certificatesList.length === 0} onClick={handleSendCertificates}>
                  {certsSending ? "Sending…" : "Send to participants"}
                </Button>
                <Button size="sm" variant="ghost" onClick={loadCertificates} disabled={certsLoading}>
                  Refresh list
                </Button>
              </div>
              {certificatesList.length === 0 ? (
                <p className="text-sm text-textMuted">No certificates yet. Generate for all enrolled participants.</p>
              ) : (
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {certificatesList.map((c) => (
                    <li key={c.id} className="flex justify-between text-sm py-1 border-b border-brintelli-border/40">
                      <span>{c.userName} – {c.certificateNumber}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default TutorWorkshops;
