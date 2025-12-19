import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, ClipboardList, BriefcaseBusiness, CheckCircle2 } from "lucide-react";

const iconMap = {
  live: CalendarClock,
  assignment: ClipboardList,
  placement: BriefcaseBusiness,
  default: CheckCircle2,
};

const NotificationsDropdown = ({ open, notifications = [], onClose, onMarkAll }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute right-0 top-14 z-40 w-[min(340px,85vw)] rounded-2xl border border-white/30 bg-white/70 p-4 shadow-glass backdrop-blur"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">Notifications</h3>
            <button
              onClick={onMarkAll}
              className="text-xs font-medium text-brand hover:text-brand-dark"
              type="button"
            >
              Mark all as read
            </button>
          </div>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {notifications.map((item) => {
              const Icon = iconMap[item.type] ?? iconMap.default;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-white/30 bg-white/40 px-3 py-3 text-sm text-text shadow-card"
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${item.read ? "bg-brand-soft/60" : "bg-brand"}`}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft/20 text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text">{item.title}</p>
                    <p className="text-xs text-textMuted">{item.timestamp}</p>
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="rounded-xl border border-dashed border-brintelli-border bg-white/60 px-3 py-5 text-center text-sm text-textMuted">
                You are all caught up! 🎉
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;
