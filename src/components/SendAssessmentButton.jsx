import { useState } from "react";
import { Send, Mail, ClipboardList } from "lucide-react";
import Button from "./Button";
import ScheduleAssessmentModal from "./ScheduleAssessmentModal";
import toast from "react-hot-toast";

/**
 * Send Assessment Button Component
 * 
 * Button that opens a modal to send assessment to a lead
 * When assessment is sent, it sends an email and moves the lead to assessment stage
 */
const SendAssessmentButton = ({ lead, onSuccess, variant = "primary", size = "sm", showIcon = true, className = "" }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!lead || !lead.id) {
    return null;
  }

  const handleSuccess = async (updatedLead) => {
    if (onSuccess) {
      await onSuccess(updatedLead);
    }
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className={className}
        disabled={loading}
      >
        {showIcon && <Send className="h-4 w-4 mr-1" />}
        Send Assessment
      </Button>

      <ScheduleAssessmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        lead={lead}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default SendAssessmentButton;

