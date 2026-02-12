import { useState, useEffect } from "react";
import { X, Phone, Calendar, Clock, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

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
                        }}
                        className="text-textMuted hover:text-text"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddCallNote} className="space-y-4">
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
                          placeholder="Enter call notes..."
                          rows="4"
                          className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setShowAddForm(false);
                            setNotes("");
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

