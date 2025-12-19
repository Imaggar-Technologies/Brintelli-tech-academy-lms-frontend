import { Megaphone } from "lucide-react";

const AnnouncementCard = ({ title, description, date }) => {
  return (
    <div className="flex gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft/40 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 text-brand-600">
        <div className="flex h-full items-center justify-center">
          <Megaphone className="h-6 w-6" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-base font-semibold text-text">{title}</h4>
          <span className="text-xs font-medium uppercase tracking-wide text-textMuted">
            {date}
          </span>
        </div>
        <p className="text-sm text-textMuted">{description}</p>
      </div>
    </div>
  );
};

export default AnnouncementCard;

