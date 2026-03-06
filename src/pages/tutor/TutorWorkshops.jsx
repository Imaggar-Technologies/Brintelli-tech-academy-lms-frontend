import { useState, useEffect } from "react";
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
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import workshopAPI from "../../api/workshop";
import { selectCurrentUser } from "../../store/slices/authSlice";

const TutorWorkshops = () => {
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
    </>
  );
};

export default TutorWorkshops;
