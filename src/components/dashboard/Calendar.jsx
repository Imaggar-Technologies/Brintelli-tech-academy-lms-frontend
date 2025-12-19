import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimationWrapper from "../AnimationWrapper";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Calendar = () => {
  const today = new Date();
  const [reference, setReference] = useState(new Date());
  const [selected, setSelected] = useState(today.getDate());

  const { monthName, year, days } = useMemo(() => {
    const month = reference.getMonth();
    const yearValue = reference.getFullYear();
    const firstDay = new Date(yearValue, month, 1).getDay();
    const totalDays = new Date(yearValue, month + 1, 0).getDate();
    const placeholderStart = (firstDay + 6) % 7;
    const grid = [];

    for (let i = 0; i < placeholderStart; i += 1) {
      grid.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      grid.push(day);
    }

    return {
      monthName: monthNames[month],
      year: yearValue,
      days: grid,
    };
  }, [reference]);

  const moveMonth = (delta) => {
    const newDate = new Date(reference);
    newDate.setMonth(reference.getMonth() + delta);
    setReference(newDate);
    setSelected(1);
  };

  const currentMonth =
    reference.getMonth() === today.getMonth() && reference.getFullYear() === today.getFullYear();

  return (
    <AnimationWrapper className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-card transition duration-160 hover:shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-text">
            {monthName} {year}
          </h3>
          <p className="text-sm text-textSoft">Track live classes, assignments, and mentoring sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => moveMonth(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brintelli-border bg-white/70 text-textSoft transition duration-160 hover:border-brand hover:text-brand"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => moveMonth(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brintelli-border bg-white/70 text-textSoft transition duration-160 hover:border-brand hover:text-brand"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-wide text-textMuted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-3 text-center text-sm text-textSoft">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`placeholder-${index}`} className="h-12" />;
          }

          const isToday = currentMonth && day === today.getDate();
          const isSelected = day === selected;

          return (
            <button
              key={day}
              onClick={() => setSelected(day)}
              className={[
                "flex h-12 w-full items-center justify-center rounded-full border border-transparent transition duration-160",
                isSelected
                  ? "bg-brand text-white shadow-glow"
                  : isToday
                  ? "border border-brand/40 text-brand"
                  : "bg-white/65 hover:border-brand/40 hover:text-brand",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </AnimationWrapper>
  );
};

export default Calendar;

