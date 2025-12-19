import { useState, useEffect } from "react";
import { Calendar, Clock, Video, Phone } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import { leadAPI } from "../api/lead";
import toast from "react-hot-toast";

/**
 * Reschedule Meeting Modal Component
 * 
 * Allows users to reschedule demo or counseling meetings
 */
const RescheduleMeetingModal = ({ isOpen, onClose, lead, meetingType, onSuccess }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const meetingInfo = meetingType === 'demo' 
    ? {
        title: 'Reschedule Demo',
        currentDate: lead?.demoDate,
        currentTime: lead?.demoTime,
        currentLink: lead?.demoMeetingLink,
        currentNotes: lead?.demoNotes,
      }
    : {
        title: 'Reschedule Counseling',
        currentDate: lead?.counselingDate,
        currentTime: lead?.counselingTime,
        currentLink: lead?.counselingMeetingLink,
        currentNotes: lead?.counselingNotes,
      };

  // Initialize form with current values
  useEffect(() => {
    if (isOpen && lead) {
      setDate(meetingInfo.currentDate || "");
      setTime(meetingInfo.currentTime || "");
      setMeetingLink(meetingInfo.currentLink || "");
      setNotes(meetingInfo.currentNotes || "");
    }
  }, [isOpen, lead, meetingType]);

  const handleSubmit = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (meetingType === 'demo') {
        response = await leadAPI.rescheduleDemo(lead.id, {
          date,
          time,
          meetingLink: meetingLink.trim() || null,
          notes: notes.trim() || null,
        });
      } else {
        response = await leadAPI.rescheduleCounseling(lead.id, {
          date,
          time,
          meetingLink: meetingLink.trim() || null,
          notes: notes.trim() || null,
        });
      }

      if (response && response.success) {
        toast.success(response.message || `${meetingInfo.title} rescheduled successfully`);
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        throw new Error(response?.message || `Failed to reschedule ${meetingInfo.title}`);
      }
    } catch (error) {
      console.error(`Error rescheduling ${meetingInfo.title}:`, error);
      const errorMessage = error.message || error.response?.data?.error || `Failed to reschedule ${meetingInfo.title}`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${meetingInfo.title}: ${lead?.name || "Lead"}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Current Meeting Info */}
        {meetingInfo.currentDate && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">Current Schedule:</p>
            <p className="text-blue-700">
              {new Date(meetingInfo.currentDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })} at {meetingInfo.currentTime}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              New Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
              <Clock className="h-4 w-4" />
              New Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Meeting Link (Optional)
          </label>
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows="3"
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!date || !time || loading}>
            {loading ? "Rescheduling..." : "Reschedule Meeting"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RescheduleMeetingModal;

