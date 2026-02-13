import { useState, useEffect } from "react";
import { X, Phone, Calendar, Clock, Plus, PhoneOff, PhoneCall, MessageSquare, UserX, Ban, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

/**
 * Call Note Templates - Matching the style from CallNotesModal
 */
const CALL_NOTE_TEMPLATES = [
  {
    id: "no-answer",
    label: "Didn't Pick Call",
    notes: "Called the lead but they didn't answer. Will try again later.",
    icon: PhoneOff,
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
    icon: CheckCircle2,
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
    icon: PhoneCall,
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
 * View All Call Notes Modal
 * 
 * Displays all call notes for a lead in a modal
 * Allows adding new call notes in the same session
 */
const ViewAllCallNotesModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [callDate, setCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState(new Date().toTimeString().slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [currentLead, setCurrentLead] = useState(lead);
  const [selectedReason, setSelectedReason] = useState(null);

  // Update current lead when prop changes
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  if (!isOpen || !currentLead) return null;

  const callNotes = currentLead.callNotes || [];

  // Sort by createdAt (newest first)
  const sortedNotes = [...callNotes].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.callDate);
    const dateB = new Date(b.createdAt || b.callDate);
    return dateB - dateA;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timeString;
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedReason(template);
    setNotes(template.notes);
  };

  const handleAddCallNote = async (e) => {
    e?.preventDefault();
    
    if (!notes.trim()) {
      toast.error("Please enter call notes");
      return;
    }

    try {
      setLoading(true);
      const response = await leadAPI.addCallNotes(currentLead.id, {
        notes: notes.trim(),
        callDate,
        callTime,
      });

      if (response.success) {
        toast.success("Call notes added successfully");
        // Update the lead with new call notes
        setCurrentLead({
          ...currentLead,
          callNotes: response.data.lead.callNotes || [],
        });
        // Reset form
        setNotes("");
        setCallDate(new Date().toISOString().split('T')[0]);
        setCallTime(new Date().toTimeString().slice(0, 5));
        setSelectedReason(null);
        setShowAddForm(false);
        // Notify parent component
        if (onSuccess) {
          onSuccess(response.data.lead);
        }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-brintelli-border bg-brintelli-card rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-semibold text-text">Call Notes History</h2>
                  <p className="text-sm text-textMuted mt-1">
                    {currentLead?.name} • {currentLead?.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!showAddForm && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Notes
                    </Button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-brintelli-border transition-colors"
                  >
                    <X className="h-5 w-5 text-textMuted" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Add Call Notes Form */}
                {showAddForm && (
                  <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-text">Add New Call Note</h3>
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNotes("");
                          setSelectedReason(null);
                        }}
                        className="text-textMuted hover:text-text"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddCallNote} className="space-y-4">
                      {/* Quick Templates - 2 rows x 4 columns */}
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
                                  selectedReason?.id === template.id
                                    ? "border-brand bg-brand/10"
                                    : "border-brintelli-border hover:border-brand/50"
                                }`}
                              >
                                <Icon className={`h-4 w-4 mb-1 ${
                                  selectedReason?.id === template.id ? "text-brand" : "text-textMuted"
                                }`} />
                                <p className="text-xs font-medium text-text">{template.label}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={callDate}
                            onChange={(e) => setCallDate(e.target.value)}
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={callTime}
                            onChange={(e) => setCallTime(e.target.value)}
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Call Notes <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter call notes... You can use a template above or write your own notes."
                          rows="6"
                          className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                          required
                        />
                        <p className="text-xs text-textMuted mt-1">
                          {notes.length} characters
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setShowAddForm(false);
                            setNotes("");
                            setSelectedReason(null);
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={!notes.trim() || loading}
                        >
                          {loading ? "Adding..." : "Add Note"}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Call Notes List */}
                {sortedNotes.length === 0 && !showAddForm ? (
                  <div className="text-center py-12">
                    <Phone className="h-12 w-12 text-textMuted mx-auto mb-4" />
                    <p className="text-textMuted">No call notes yet</p>
                    <p className="text-sm text-textMuted mt-2">Add your first call note to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedNotes.map((note, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
                              <Phone className="h-4 w-4 text-brand" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-1.5 text-xs text-textMuted">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(note.callDate || note.createdAt)}</span>
                              </div>
                              {note.callTime && (
                                <>
                                  <span className="text-textMuted">•</span>
                                  <div className="flex items-center gap-1.5 text-xs text-textMuted">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatTime(note.callTime)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-text whitespace-pre-wrap">{note.notes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-brintelli-border bg-brintelli-card rounded-b-2xl">
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ViewAllCallNotesModal;

