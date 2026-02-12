import { useState, useEffect } from "react";
import { FileText, X, ClipboardList, Clock, User, Globe } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

/**
 * Meeting Report Modal Component
 * 
 * Allows users to submit reports for demo or counseling meetings
 * Supports resubmission of existing reports
 */
const MeetingReportModal = ({ isOpen, onClose, lead, meetingType, onSuccess, allowResubmit = false }) => {
  // Get all reports (array) and latest report (for backward compatibility)
  const allReports = meetingType === 'demo' 
    ? (lead?.demoReports || []) 
    : (lead?.counselingReports || []);
  
  const latestReport = meetingType === 'demo' 
    ? lead?.demoReport 
    : lead?.counselingReport;
  
  // Get report logs
  const reportLogs = meetingType === 'demo'
    ? (lead?.demoReportLogs || [])
    : (lead?.counselingReportLogs || []);
  
  // If no reports array exists but latestReport exists, create array from it
  const reportsHistory = allReports.length > 0 
    ? allReports 
    : (latestReport?.submitted ? [{
        report: latestReport.report,
        submittedAt: latestReport.submittedAt,
        submittedBy: latestReport.submittedBy,
        version: 1
      }] : []);
  
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Initialize report state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (allowResubmit && latestReport?.submitted) {
        setReport(latestReport.report || "");
        setIsResubmitting(true);
      } else {
        setReport("");
        setIsResubmitting(false);
      }
    } else {
      // Reset when modal closes
      setReport("");
      setIsResubmitting(false);
    }
  }, [isOpen, allowResubmit, latestReport]);

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

      toast.success(
        `${meetingInfo.title} submitted successfully!${reportsHistory.length === 0 ? ' You can now assign assessment.' : ''}`
      );
      
      // Get updated lead data with report logs
      let updatedLead = lead;
      try {
        const response = await leadAPI.getLeadById(lead.id);
        if (response.success && response.data?.lead) {
          updatedLead = response.data.lead;
        }
      } catch (error) {
        console.error('Error fetching updated lead:', error);
      }
      
      if (onSuccess) {
        onSuccess(updatedLead);
      }
      
      // Show option to assign assessment (only for first submission, not subsequent ones)
      if (reportsHistory.length === 0) {
        setTimeout(() => {
          const shouldAssignAssessment = window.confirm(
            "Report submitted successfully! Would you like to assign an assessment now?"
          );
          
          if (shouldAssignAssessment) {
            window.location.href = `/sales/assessments?leadId=${lead.id}`;
          }
        }, 500);
      }
      
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

        {/* Reports History */}
        {reportsHistory.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              <h3 className="text-lg font-semibold text-text">Report History ({reportsHistory.length})</h3>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {[...reportsHistory]
                .sort((a, b) => new Date(b.submittedAt || b.submittedAt || 0).getTime() - new Date(a.submittedAt || a.submittedAt || 0).getTime())
                .map((r, idx) => (
                  <div key={`${r.submittedAt || idx}-${r.version || idx}`} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-brand px-2 py-0.5 rounded bg-brand/10">
                          Report #{r.version || (reportsHistory.length - idx)}
                        </span>
                        {idx === 0 && (
                          <span className="text-xs font-semibold text-green-600 px-2 py-0.5 rounded bg-green-100">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-textMuted whitespace-nowrap">
                        {new Date(r.submittedAt || r.submittedAt).toLocaleString('en-US')}
                      </div>
                    </div>
                    {r.submittedBy && (
                      <p className="text-xs text-textMuted mb-2">
                        Submitted by: {r.submittedBy}
                      </p>
                    )}
                    <div className="rounded-lg bg-white p-3">
                      <p className="text-sm text-text whitespace-pre-wrap">{r.report}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Report Logs */}
        {reportLogs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand" />
              <h3 className="text-lg font-semibold text-text">Submission Logs ({reportLogs.length})</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[...reportLogs]
                .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
                .map((log, idx) => (
                  <div key={idx} className="rounded-lg border border-brintelli-border bg-brintelli-baseAlt p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          log.action === 'REPORT_SUBMITTED' 
                            ? 'text-green-700 bg-green-100' 
                            : 'text-blue-700 bg-blue-100'
                        }`}>
                          {log.action === 'REPORT_SUBMITTED' ? 'Submitted' : 'Resubmitted'}
                        </span>
                        <span className="text-xs text-textMuted">v{log.version}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-textMuted">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(log.submittedAt).toLocaleString('en-US')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-textMuted">
                      {log.submittedBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>User: {log.submittedBy}</span>
                        </div>
                      )}
                      {log.reportLength > 0 && (
                        <span>Length: {log.reportLength} chars</span>
                      )}
                      {log.ipAddress && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{log.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add New Report Section */}
        <div className="space-y-4 border-t border-brintelli-border pt-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" />
            <h3 className="text-lg font-semibold text-text">
              {reportsHistory.length > 0 ? "Add New Report" : "Submit Report"}
            </h3>
          </div>
          
          {isResubmitting && latestReport?.submitted && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Editing Latest Report</span>
              </div>
              <p className="text-sm text-blue-800">
                Latest report submitted on: {new Date(latestReport.submittedAt).toLocaleString('en-US')}
              </p>
            </div>
          )}
          
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
              {reportsHistory.length > 0 
                ? "Add a new report entry. All previous reports will be preserved."
                : "Report is required before assessment can be assigned."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!report.trim() || loading}>
              {loading 
                ? "Submitting..." 
                : (reportsHistory.length > 0 ? "Add Report" : "Submit Report")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MeetingReportModal;

