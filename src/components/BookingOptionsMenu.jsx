import { useState, useRef, useEffect } from "react";
import { Calendar, Video, MoreVertical, X } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

/**
 * Booking Options Menu Component
 * 
 * 3-button menu for booking demo and counseling calls
 */
const BookingOptionsMenu = ({ lead, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [demoData, setDemoData] = useState({
    date: "",
    time: "",
    notes: "",
  });
  const [counselingData, setCounselingData] = useState({
    date: "",
    time: "",
    meetingLink: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleBookDemo = async () => {
    if (!demoData.date || !demoData.time) {
      return;
    }

    setLoading(true);
    try {
      const { leadAPI } = await import("../api/lead");
      const response = await leadAPI.bookDemo(lead.id, demoData);
      
      // Show success with auto-generated meeting link
      const secureLink = response.data?.salesCall?.secureMeetingLink;
      if (secureLink) {
        alert(`Demo call booked successfully!\n\nMeeting Link: ${secureLink}\n\nThis link has been sent via email.`);
      } else {
        alert("Demo call booked successfully!");
      }
      
      if (onSuccess) {
        onSuccess();
      }
      setShowDemoModal(false);
      setDemoData({ date: "", time: "", notes: "" });
    } catch (error) {
      console.error("Error booking demo:", error);
      alert(error.message || "Failed to book demo");
    } finally {
      setLoading(false);
    }
  };

  const handleBookCounseling = async () => {
    if (!counselingData.date || !counselingData.time) {
      return;
    }

    setLoading(true);
    try {
      const { leadAPI } = await import("../api/lead");
      await leadAPI.bookCounseling(lead.id, counselingData);
      
      if (onSuccess) {
        onSuccess();
      }
      setShowCounselingModal(false);
      setCounselingData({ date: "", time: "", meetingLink: "", notes: "" });
    } catch (error) {
      console.error("Error booking counseling:", error);
      alert(error.message || "Failed to book counseling");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MoreVertical className="h-3 w-3" />
          Book
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-brintelli-border bg-white shadow-lg z-50">
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowDemoModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brintelli-baseAlt transition-colors text-left"
              >
                <Video className="h-4 w-4 text-brand" />
                <span className="text-sm text-text">Book Demo</span>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCounselingModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brintelli-baseAlt transition-colors text-left"
              >
                <Calendar className="h-4 w-4 text-brand" />
                <span className="text-sm text-text">Book Counseling</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Demo Modal */}
      <Modal
        isOpen={showDemoModal}
        onClose={() => {
          setShowDemoModal(false);
          setDemoData({ date: "", time: "", meetingLink: "", notes: "" });
        }}
        title={`Book Demo: ${lead?.name || "Lead"}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Demo Date
              </label>
              <input
                type="date"
                value={demoData.date}
                onChange={(e) => setDemoData({ ...demoData, date: e.target.value })}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Demo Time
              </label>
              <input
                type="time"
                value={demoData.time}
                onChange={(e) => setDemoData({ ...demoData, time: e.target.value })}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Notes (Optional)
            </label>
            <textarea
              value={demoData.notes}
              onChange={(e) => setDemoData({ ...demoData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows="3"
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDemoModal(false);
                setDemoData({ date: "", time: "", notes: "" });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleBookDemo} disabled={!demoData.date || !demoData.time || loading}>
              {loading ? "Booking..." : "Book Demo"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Book Counseling Modal */}
      <Modal
        isOpen={showCounselingModal}
        onClose={() => {
          setShowCounselingModal(false);
          setCounselingData({ date: "", time: "", meetingLink: "", notes: "" });
        }}
        title={`Book Counseling: ${lead?.name || "Lead"}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Counseling Date
              </label>
              <input
                type="date"
                value={counselingData.date}
                onChange={(e) => setCounselingData({ ...counselingData, date: e.target.value })}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Counseling Time
              </label>
              <input
                type="time"
                value={counselingData.time}
                onChange={(e) => setCounselingData({ ...counselingData, time: e.target.value })}
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
              value={counselingData.meetingLink}
              onChange={(e) => setCounselingData({ ...counselingData, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Notes (Optional)
            </label>
            <textarea
              value={counselingData.notes}
              onChange={(e) => setCounselingData({ ...counselingData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows="3"
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCounselingModal(false);
                setCounselingData({ date: "", time: "", meetingLink: "", notes: "" });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleBookCounseling} disabled={!counselingData.date || !counselingData.time || loading}>
              {loading ? "Booking..." : "Book Counseling"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BookingOptionsMenu;

