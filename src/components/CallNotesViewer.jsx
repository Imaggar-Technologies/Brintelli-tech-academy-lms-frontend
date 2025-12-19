import { useState } from "react";
import { Phone, Calendar, Clock, User, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Call Notes Viewer Component
 * 
 * Displays call notes for a lead, with expandable view
 */
const CallNotesViewer = ({ callNotes, showLastOnly = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!callNotes || !Array.isArray(callNotes) || callNotes.length === 0) {
    return (
      <span className="text-xs text-textMuted italic">No call notes yet</span>
    );
  }

  // Sort by createdAt (newest first)
  const sortedNotes = [...callNotes].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.callDate);
    const dateB = new Date(b.createdAt || b.callDate);
    return dateB - dateA;
  });

  const lastNote = sortedNotes[0];
  const otherNotes = sortedNotes.slice(1);

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
    // If it's just time (HH:MM), return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    // If it's a full datetime, extract time
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

  if (showLastOnly) {
    return (
      <div className="text-xs">
        <div className="flex items-start gap-2">
          <Phone className="h-3.5 w-3.5 text-brand mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-text">{formatDate(lastNote.callDate || lastNote.createdAt)}</span>
              {lastNote.callTime && (
                <>
                  <span className="text-textMuted">•</span>
                  <span className="text-textMuted">{formatTime(lastNote.callTime)}</span>
                </>
              )}
            </div>
            <p className="text-textMuted line-clamp-2">{lastNote.notes}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Last Note (Always Visible) */}
      <div className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-3">
        <div className="flex items-start gap-2">
          <Phone className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-text">Last Call</span>
              <span className="text-xs text-textMuted">
                {formatDate(lastNote.callDate || lastNote.createdAt)}
              </span>
              {lastNote.callTime && (
                <>
                  <span className="text-textMuted">•</span>
                  <span className="text-xs text-textMuted">{formatTime(lastNote.callTime)}</span>
                </>
              )}
            </div>
            <p className="text-sm text-text">{lastNote.notes}</p>
          </div>
        </div>
      </div>

      {/* Other Notes (Expandable) */}
      {otherNotes.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-medium text-brand hover:text-brand-600 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Hide {otherNotes.length} previous call{otherNotes.length > 1 ? 's' : ''}
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show {otherNotes.length} previous call{otherNotes.length > 1 ? 's' : ''}
              </>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2"
              >
                {otherNotes.map((note, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-3"
                  >
                    <div className="flex items-start gap-2">
                      <Phone className="h-3.5 w-3.5 text-textMuted mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-textMuted">
                            {formatDate(note.callDate || note.createdAt)}
                          </span>
                          {note.callTime && (
                            <>
                              <span className="text-textMuted">•</span>
                              <span className="text-xs text-textMuted">{formatTime(note.callTime)}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-text">{note.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CallNotesViewer;

