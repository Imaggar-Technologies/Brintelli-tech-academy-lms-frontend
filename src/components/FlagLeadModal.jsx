import { useState } from "react";
import { Flag, X } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

/**
 * Flag Lead Modal Component
 * 
 * Allows users to flag leads with different types and reasons
 */
const FlagLeadModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [loading, setLoading] = useState(false);

  const flagTypes = {
    red: {
      label: "Red Flag",
      color: "red",
      reasons: [
        { value: "not_interested", label: "Not Interested" },
        { value: "not_picking_long", label: "Not Picking Call for Long Time" },
        { value: "inappropriate_lead", label: "Inappropriate Lead" },
        { value: "duplicate_lead", label: "Duplicate Lead" },
      ],
    },
    green: {
      label: "Green Flag",
      color: "green",
      reasons: [
        { value: "might_join", label: "Might Join" },
      ],
    },
    blue: {
      label: "Blue Flag",
      color: "blue",
      reasons: [
        { value: "may_or_may_not", label: "May or May Not" },
      ],
    },
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedReason) {
      return;
    }

    setLoading(true);
    try {
      const { leadAPI } = await import("../api/lead");
      await leadAPI.flagLead(lead.id, {
        type: selectedType,
        reason: selectedReason,
        reasonText: reasonText.trim(),
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      // Reset form
      setSelectedType("");
      setSelectedReason("");
      setReasonText("");
    } catch (error) {
      console.error("Error flagging lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlag = async () => {
    setLoading(true);
    try {
      const { leadAPI } = await import("../api/lead");
      await leadAPI.removeFlag(lead.id);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      setSelectedType("");
      setSelectedReason("");
      setReasonText("");
    } catch (error) {
      console.error("Error removing flag:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Flag Lead: ${lead?.name || "Lead"}`}
      size="md"
    >
      <div className="space-y-4">
        {lead?.flag ? (
          <>
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag className={`h-5 w-5 ${
                  lead.flag.type === 'red' ? 'text-red-600' : 
                  lead.flag.type === 'green' ? 'text-green-600' : 
                  'text-blue-600'
                }`} />
                <span className="font-semibold text-text">
                  Current Flag: {flagTypes[lead.flag.type]?.label || lead.flag.type}
                </span>
              </div>
              <p className="text-sm text-textMuted mb-1">
                Reason: {flagTypes[lead.flag.type]?.reasons.find(r => r.value === lead.flag.reason)?.label || lead.flag.reason}
              </p>
              {lead.flag.reasonText && (
                <p className="text-sm text-text">{lead.flag.reasonText}</p>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleRemoveFlag}
              disabled={loading}
              className="w-full"
            >
              Remove Flag
            </Button>
          </>
        ) : (
          <>
            {/* Flag Type Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Flag Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(flagTypes).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setSelectedReason("");
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedType === type
                        ? type === 'red' 
                          ? 'border-red-500 bg-red-50'
                          : type === 'green'
                          ? 'border-green-500 bg-green-50'
                          : 'border-blue-500 bg-blue-50'
                        : "border-brintelli-border bg-brintelli-baseAlt hover:border-brand"
                    }`}
                  >
                    <Flag className={`h-5 w-5 mx-auto mb-1 ${
                      type === 'red' ? 'text-red-600' : 
                      type === 'green' ? 'text-green-600' : 
                      'text-blue-600'
                    }`} />
                    <p className="text-xs font-medium text-text">{config.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Selection */}
            {selectedType && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Reason
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Select a reason...</option>
                  {flagTypes[selectedType].reasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Additional Reason Text */}
            {selectedReason && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Add any additional notes or context..."
                  rows="3"
                  className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedType || !selectedReason || loading}
              >
                {loading ? "Flagging..." : "Flag Lead"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default FlagLeadModal;

