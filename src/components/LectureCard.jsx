import { Clock3, MonitorPlay, Video } from "lucide-react";

const statusClasses = {
  live: "bg-brand-700/15 text-brand-700",
  upcoming: "bg-brand-600/15 text-brand-600",
  completed: "bg-brintelli-baseAlt text-brand-700",
  recording: "bg-brand-500/15 text-brand-600",
};

const LectureCard = ({ title, duration, status = "upcoming", type = "live", description }) => {
  const StatusIcon = type === "recording" ? Video : MonitorPlay;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft/50 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-text">{title}</h4>
          {description && <p className="mt-1 text-sm text-textMuted">{description}</p>}
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold capitalize",
            statusClasses[status] ?? statusClasses.upcoming,
          ].join(" ")}
        >
          {status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-sm text-textMuted">
        <StatusIcon className="h-4 w-4 text-brand-500" />
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-4 w-4 text-textMuted" />
          {duration}
        </span>
      </div>
    </div>
  );
};

export default LectureCard;

