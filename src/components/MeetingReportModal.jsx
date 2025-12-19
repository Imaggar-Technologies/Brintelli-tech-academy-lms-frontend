import { useState } from "react";
import { FileText, X, ClipboardList } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

/**
 * Meeting Report Modal Component
 * 
 * Allows users to submit reports for demo or counseling meetings
 */
const MeetingReportModal = ({ isOpen, onClose, lead, meetingType, onSuccess }) => {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const meetingInfo = meetingType === 'demo' 
    ? {
        title: 'Demo Report',
        date: lead?.demoDate,
        time: lead?.demoTime,
        meetingLink: lead?.demoMeetingLink,
      }
    : {
        title: 'Counseling Report',
        date: lead?.counselingDate,
        time: lead?.counselingTime,
        meetingLink: lead?.counselingMeetingLink,
      };

  const existingReport = meetingType === 'demo' 
    ? lead?.demoReport 
    : lead?.counselingReport;

  const handleSubmit = async () => {
    if (!report.trim()) {
      toast.error("Please enter a report");
      return;
    }

    setLoading(true);
    try {
      if (meetingType === 'demo') {
        await leadAPI.submitDemoReport(lead.id, report);
      } else {
        await leadAPI.submitCounselingReport(lead.id, report);
      }

      toast.success(`${meetingInfo.title} submitted successfully! You can now assign assessment.`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Show option to assign assessment
      setTimeout(() => {
        const shouldAssignAssessment = window.confirm(
          "Report submitted successfully! Would you like to assign an assessment now?"
        );
        
        if (shouldAssignAssessment) {
          window.location.href = `/sales/assessments?leadId=${lead.id}`;
        }
      }, 500);
      
      onClose();
      setReport("");
    } catch (error) {
      console.error(`Error submitting ${meetingInfo.title}:`, error);
      toast.error(error.message || `Failed to submit ${meetingInfo.title}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${meetingInfo.title}: ${lead?.name || "Lead"}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Meeting Details */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
          <h3 className="text-sm font-semibold text-text mb-2">Meeting Details</h3>
          <div className="grid gap-2 text-sm">
            <div>
              <span className="text-textMuted">Date: </span>
              <span className="text-text">
                {meetingInfo.date ? new Date(meetingInfo.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-textMuted">Time: </span>
              <span className="text-text">{meetingInfo.time || 'N/A'}</span>
            </div>
            {meetingInfo.meetingLink && (
              <div>
                <span className="text-textMuted">Meeting Link: </span>
                <a 
                  href={meetingInfo.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  {meetingInfo.meetingLink}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Existing Report */}
        {existingReport?.submitted && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Report Already Submitted</span>
            </div>
            <p className="text-sm text-green-800 mb-2">
              Submitted on: {new Date(existingReport.submittedAt).toLocaleString('en-US')}
            </p>
            <div className="rounded-lg bg-white p-3">
              <p className="text-sm text-text whitespace-pre-wrap">{existingReport.report}</p>
            </div>
          </div>
        )}

        {/* Report Textarea */}
        {!existingReport?.submitted && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Meeting Report <span className="text-red-500">*</span>
              </label>
              <textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="Enter meeting report... Include discussion points, outcomes, next steps, etc."
                rows="8"
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-textMuted">
                Report is required before assessment can be assigned.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!report.trim() || loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </>
        )}

        {existingReport?.submitted && (
          <div className="flex justify-end pt-4 border-t border-brintelli-border">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MeetingReportModal;

