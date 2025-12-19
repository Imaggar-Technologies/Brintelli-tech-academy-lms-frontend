import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CalendarWidget = ({ month = "November 2025", highlights = [] }) => {
  const highlighted = new Set(highlights);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 p-3 text-brand-500">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-textMuted">Schedule</p>
            <p className="text-base font-semibold text-text">{month}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brintelli-border text-textMuted hover:text-text">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-brintelli-border text-textMuted hover:text-text">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-textMuted">
        {days.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {Array.from({ length: 30 }, (_, index) => index + 1).map((date) => {
          const isHighlighted = highlighted.has(date);
          return (
            <div
              key={date}
              className={[
                "flex h-10 w-full items-center justify-center rounded-xl border text-sm font-semibold",
                isHighlighted
                  ? "border-none bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft"
                  : "border-brintelli-border text-textSoft",
              ].join(" ")}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;

