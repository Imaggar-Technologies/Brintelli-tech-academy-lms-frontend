import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, ClipboardList, BriefcaseBusiness, CheckCircle2, X } from "lucide-react";

const iconMap = {
  live: CalendarClock,
  assignment: ClipboardList,
  placement: BriefcaseBusiness,
  default: CheckCircle2,
};

const NotificationsDropdown = ({ open, notifications = [], onClose, onMarkAll, onNotificationClick }) => {
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
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute right-0 top-14 z-50 w-[min(380px,90vw)] rounded-2xl border border-gray-200/80 bg-white shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.filter(n => !n.read).length > 0 && (
                <button
                  onClick={onMarkAll}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  type="button"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                type="button"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <CheckCircle2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">All caught up!</p>
                <p className="mt-1 text-xs text-gray-500">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((item) => {
                  const Icon = iconMap[item.type] ?? iconMap.default;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        if (onNotificationClick) {
                          onNotificationClick(item);
                        }
                      }}
                      className={`group relative flex items-start gap-4 px-5 py-4 transition-all ${
                        onNotificationClick ? 'cursor-pointer hover:bg-gray-50/80' : ''
                      } ${item.read ? 'bg-white' : 'bg-blue-50/30'}`}
                    >
                      {/* Unread Indicator */}
                      {!item.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full" />
                      )}
                      
                      {/* Icon */}
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        item.read 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-brand-100 text-brand-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${
                          item.read 
                            ? 'font-medium text-gray-700' 
                            : 'font-semibold text-gray-900'
                        }`}>
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{item.timestamp}</p>
                      </div>

                      {/* Unread Dot */}
                      {!item.read && (
                        <div className="mt-1.5 shrink-0">
                          <span className="inline-flex h-2 w-2 rounded-full bg-brand-500" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer (optional - can add "View all" link here) */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 px-5 py-3 backdrop-blur-sm">
              <button
                className="w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                type="button"
              >
                View all notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDropdown;
