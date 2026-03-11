import { useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Award, Share2 } from "lucide-react";
import { confettiBurst } from "../utils/confetti";

const LINKEDIN_SHARE_BASE = "https://www.linkedin.com/sharing/share-offsite/";

function buildLinkedInShareUrl({ pointsEarned, reason = "reporting a bug" }) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const summary = `I just earned ${pointsEarned} Brintelli points for ${reason} and helping improve the platform! 🎉 #BrintelliTechAcademy`;
  const params = new URLSearchParams({
    url,
    summary,
  });
  return `${LINKEDIN_SHARE_BASE}?${params.toString()}`;
}

export default function PointsEarnedModal({ isOpen, onClose, pointsEarned = 20, totalPoints, reason = "reporting a bug" }) {
  const shareUrl = buildLinkedInShareUrl({ pointsEarned, reason });

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => confettiBurst(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleShareLinkedIn = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Points earned!" size="sm">
      <div className="text-center py-4 px-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
          <Award className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">
          You earned {pointsEarned} points!
        </h3>
        <p className="text-textMuted text-sm mb-1">
          Thank you for helping us improve. Your Brintelli points have been added to your account.
        </p>
        {totalPoints != null && (
          <p className="text-sm font-semibold text-amber-700 mb-4">
            Your total: {totalPoints} pts
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            type="button"
            onClick={handleShareLinkedIn}
            variant="secondary"
            className="gap-2 inline-flex items-center justify-center"
          >
            <Share2 className="h-4 w-4" />
            Share on LinkedIn
          </Button>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
