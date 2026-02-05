import { useState } from "react";
import { ArchiveX, AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import toast from "react-hot-toast";
import { leadAPI } from "../api/lead";

/**
 * Deactivate Lead Modal Component
 * 
 * Shows a modal to collect deactivation reason before deactivating a lead
 */
const DeactivateLeadModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const handleConfirmDeactivate = async () => {
    if (!deactivationReason || deactivationReason.trim() === '') {
      toast.error('Please provide a reason for deactivation');
      return;
    }

    if (!lead) return;

    try {
      setDeactivating(true);
      await leadAPI.deactivateLead(lead.id || lead._id, deactivationReason.trim());
      toast.success('Lead deactivated successfully');
      setDeactivationReason('');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error deactivating lead:', error);
      toast.error(error?.message || 'Failed to deactivate lead');
    } finally {
      setDeactivating(false);
    }
  };

  const handleClose = () => {
    setDeactivationReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deactivate Lead"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 mb-1">Warning</p>
            <p className="text-sm text-yellow-800">
              Are you sure you want to deactivate <span className="font-semibold">{lead?.name || 'this lead'}</span>? 
              This will move the lead to inactive status (Lead Dump).
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="deactivationReason" className="block text-sm font-semibold text-text mb-2">
            Reason for Deactivation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="deactivationReason"
            value={deactivationReason}
            onChange={(e) => setDeactivationReason(e.target.value)}
            placeholder="e.g., Not interested, Budget constraints, Found another program, No response, etc."
            rows={4}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none resize-none"
            disabled={deactivating}
          />
          <p className="mt-1 text-xs text-textMuted">
            Please provide a clear reason for deactivating this lead. This information will be stored in the lead's history.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-brintelli-border">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={deactivating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmDeactivate}
            disabled={!deactivationReason.trim() || deactivating}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {deactivating ? (
              <>
                <ArchiveX className="h-4 w-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <ArchiveX className="h-4 w-4" />
                Deactivate Lead
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeactivateLeadModal;

