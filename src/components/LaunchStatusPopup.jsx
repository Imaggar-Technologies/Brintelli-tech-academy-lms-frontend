import { useEffect, useRef, useState } from "react";
import { getLaunchStatus } from "../api/launch";
import { confettiBurst } from "../utils/confetti";
import Modal from "./Modal";
import { Rocket, X, Sparkles, Heart } from "lucide-react";
import Button from "./Button";

const STORAGE_KEY = "brintelli_launch_last_seen_launchedAt";

const LaunchStatusPopup = () => {
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const showModal = () => {
      clearHideTimer();
      setVisible(true);
      confettiBurst();
      // Don't auto-hide - user must close it
    };

    const tick = async () => {
      try {
        const { isLaunched, launchedAt } = await getLaunchStatus();
        const lastSeen = sessionStorage.getItem(STORAGE_KEY) || "";

        if (isLaunched) {
          const launchedAtStr = launchedAt ? String(launchedAt) : "launched";
          if (launchedAtStr && launchedAtStr !== lastSeen) {
            sessionStorage.setItem(STORAGE_KEY, launchedAtStr);
            showModal();
          }
        } else {
          // Reset so the next launch triggers a popup
          if (lastSeen) sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // ignore (don't spam users with errors)
      }
    };

    tick();
    const interval = setInterval(tick, 10000);
    return () => {
      clearHideTimer();
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal
      isOpen={visible}
      onClose={handleClose}
      title={null}
      size="lg"
    >
      <div className="relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 rounded-lg p-1.5 sm:p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-indigo-200/20 rounded-full blur-3xl -mr-16 sm:-mr-24 md:-mr-32 -mt-16 sm:-mt-24 md:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-pink-200/20 rounded-full blur-3xl -ml-16 sm:-ml-24 md:-ml-32 -mb-16 sm:-mb-24 md:-mb-32"></div>
        
        <div className="relative p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 sm:mb-4 shadow-lg">
              <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 px-2">
              Application Launched!
            </h2>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Special Announcement</span>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border border-indigo-100 shadow-sm">
            <div className="space-y-3 sm:space-y-4 text-gray-700">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                We are honored to announce that this application has been launched by{" "}
                <span className="font-bold text-indigo-700">Dr. Hemachandran Ravikumar</span>.
              </p>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                Dr. Hemachandran Ravikumar is a distinguished Scientist and Research Leader, 
                whose guidance, vision, and unwavering support have been instrumental in 
                bringing Brintelli Tech Academy and Brintelli LMS to life.
              </p>
              <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                His commitment to excellence, innovation, and empowering the next generation 
                of learners continues to inspire us every day. We are deeply grateful for 
                his mentorship and trust in our mission.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
            <span className="text-center">Thank you for being part of this journey</span>
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 flex-shrink-0" />
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleClose}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg text-sm sm:text-base"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LaunchStatusPopup;


