import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Bug } from "lucide-react";
import bugReportAPI from "../api/bugReport";

export default function ReportBugModal({ isOpen, onClose, onSuccess }) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed) {
      setError("Please describe the bug.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await bugReportAPI.submit({
        description: trimmed,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });
      if (res?.success && res?.data) {
        setDescription("");
        onClose();
        onSuccess?.(res.data);
      } else {
        setError(res?.message || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setError(err?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report a bug" size="md">
      <div className="space-y-4">
        <p className="text-sm text-textMuted">
          Help us improve by reporting a bug. You’ll earn <strong className="text-amber-600">20 Brintelli points</strong> when you submit a report.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bug-description" className="block text-sm font-medium text-textSoft mb-1">
              What went wrong?
            </label>
            <textarea
              id="bug-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the bug or issue..."
              rows={4}
              className="w-full rounded-xl border border-brintelli-border px-4 py-3 text-sm bg-white placeholder:text-textMuted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              disabled={submitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              <Bug className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit & earn 20 points"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
