const StatsCard = ({
  icon: Icon,
  value,
  label,
  sublabel,
  trend,
  trendType = "positive",
}) => {
  const isPositive = trendType === "positive";
  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/60 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 via-brand-50/0 to-brand-50/0 transition-all duration-300 group-hover:from-brand-50/30 group-hover:via-brand-50/20 group-hover:to-transparent" />
      <div className="relative flex items-start justify-between">
        <div className="rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-600/10 p-3.5 text-brand-600 shadow-sm transition-all duration-300 group-hover:from-brand-500/20 group-hover:to-brand-600/20 group-hover:shadow-md">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend && (
          <span
            className={[
              "rounded-full px-3 py-1.5 text-xs font-bold shadow-sm",
              isPositive 
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50" 
                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50",
            ].join(" ")}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="relative">
        <p className="text-3xl font-bold text-text">{value}</p>
        <p className="mt-1 text-sm font-semibold text-textSoft">{label}</p>
        {sublabel && <p className="mt-1.5 text-xs text-textMuted">{sublabel}</p>}
      </div>
    </div>
  );
};

export default StatsCard;

