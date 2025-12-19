import { useState } from "react";
import { ClipboardList, Mail } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

/**
 * Schedule Assessment Modal Component
 * 
 * Sends an assessment link to the lead via email.
 * The lead will take the test online using the provided link.
 */
const ScheduleAssessmentModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [assessmentType, setAssessmentType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!lead || !lead.id) {
      toast.error("Invalid lead data");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending assessment for lead:", lead.id, { assessmentType });
      
      const response = await leadAPI.sendAssessment(lead.id, {
        assessmentType: assessmentType || null,
      });

      console.log("Assessment response:", response);

      if (response && response.success) {
        toast.success(response.message || "Assessment link sent successfully");
        
        // Wait a bit for the database to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        // Reset form
        setAssessmentType("");
      } else {
        throw new Error(response?.message || "Failed to send assessment link");
      }
    } catch (error) {
      console.error("Error sending assessment:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });
      const errorMessage = error.message || error.response?.data?.error || "Failed to send assessment link";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Assessment Link: ${lead?.name || "Lead"}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">Assessment Link Will Be Sent</p>
              <p className="text-sm text-blue-700">
                An assessment link will be generated and sent to <strong>{lead?.email}</strong>. 
                The lead will be able to take the test online using this link.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Assessment Type (Optional)
          </label>
          <select
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">Select type...</option>
            <option value="technical">Technical Assessment</option>
            <option value="aptitude">Aptitude Test</option>
            <option value="coding">Coding Challenge</option>
            <option value="behavioral">Behavioral Interview</option>
            <option value="combined">Combined Assessment</option>
          </select>
          <p className="mt-1 text-xs text-textMuted">
            This helps categorize the assessment type for tracking purposes.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Sending..." : "Send Assessment Link"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleAssessmentModal;
