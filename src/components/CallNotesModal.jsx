import { useState, useEffect } from "react";
import { X, Phone, Calendar, Clock, FileText, CheckCircle } from "lucide-react";
import Button from "./Button";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

/**
 * Call Notes Templates
 */
const CALL_NOTE_TEMPLATES = [
  {
    id: "no-answer",
    label: "Didn't Pick Call",
    notes: "Called the lead but they didn't answer. Will try again later.",
    icon: Phone,
  },
  {
    id: "not-interested",
    label: "Not Interested",
    notes: "Lead picked up the call but expressed no interest in the program. Reason: [Add reason]",
    icon: X,
  },
  {
    id: "interested",
    label: "Interested - Follow Up Needed",
    notes: "Lead showed interest in the program. Discussed course details and next steps. Follow-up scheduled.",
    icon: CheckCircle,
  },
  {
    id: "callback-requested",
    label: "Callback Requested",
    notes: "Lead requested a callback at a more convenient time. Preferred time: [Add time]",
    icon: Calendar,
  },
  {
    id: "wrong-number",
    label: "Wrong Number",
    notes: "The number provided is incorrect or doesn't belong to the lead.",
    icon: X,
  },
  {
    id: "busy",
    label: "Busy - Will Call Back",
    notes: "Lead was busy during the call. They mentioned they will call back later.",
    icon: Phone,
  },
  {
    id: "interested-demo",
    label: "Interested - Demo Scheduled",
    notes: "Lead is interested and wants to see a demo. Demo scheduled for [Add date/time].",
    icon: Calendar,
  },
  {
    id: "needs-time",
    label: "Needs Time to Decide",
    notes: "Lead needs more time to think about it. Will follow up in [Add timeframe].",
    icon: Clock,
  },
];

/**
 * Call Notes Modal Component
 * 
 * Allows sales agents to add call notes with templates
 */
const CallNotesModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [notes, setNotes] = useState("");
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState(new Date().toTimeString().slice(0, 5));
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(null);
      setNotes("");
      setCallDate(new Date().toISOString().split('T')[0]);
      setCallTime(new Date().toTimeString().slice(0, 5));
    }
  }, [isOpen]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setNotes(template.notes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!notes.trim()) {
      toast.error("Please enter call notes");
      return;
    }

    try {
      setLoading(true);
      const response = await leadAPI.addCallNotes(lead.id, {
        notes: notes.trim(),
        callDate,
        callTime,
      });

      if (response.success) {
        toast.success("Call notes added successfully");
        onSuccess?.(response.data.lead);
        onClose();
      } else {
        toast.error(response.message || "Failed to add call notes");
      }
    } catch (error) {
      console.error("Error adding call notes:", error);
      toast.error(error.message || "Failed to add call notes");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-brintelli-border bg-brintelli-card rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-text">Add Call Notes</h2>
            <p className="text-sm text-textMuted mt-1">
              {lead?.name} • {lead?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-brintelli-border transition-colors"
          >
            <X className="h-5 w-5 text-textMuted" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Templates */}
          <div>
            <label className="block text-sm font-semibold text-text mb-3">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CALL_NOTE_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedTemplate?.id === template.id
                        ? "border-brand bg-brand/10"
                        : "border-brintelli-border hover:border-brand/50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${
                      selectedTemplate?.id === template.id ? "text-brand" : "text-textMuted"
                    }`} />
                    <p className="text-xs font-medium text-text">{template.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Call Date
              </label>
              <input
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Call Time
              </label>
              <input
                type="time"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Call Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter call notes... You can use a template above or write your own notes."
              rows={6}
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm focus:border-brand-500 focus:outline-none resize-none"
              required
            />
            <p className="text-xs text-textMuted mt-1">
              {notes.length} characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brintelli-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !notes.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Save Call Notes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CallNotesModal;

