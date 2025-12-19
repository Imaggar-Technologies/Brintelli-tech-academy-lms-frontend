import { X, Phone, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

/**
 * View All Call Notes Modal
 * 
 * Displays all call notes for a lead in a modal
 */
const ViewAllCallNotesModal = ({ isOpen, onClose, lead }) => {
  if (!isOpen || !lead) return null;

  const callNotes = lead.callNotes || [];

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
              <div className="p-6">
                {sortedNotes.length === 0 ? (
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

