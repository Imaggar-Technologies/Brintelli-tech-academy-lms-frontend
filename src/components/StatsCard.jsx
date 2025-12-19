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
    <div className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-white p-6 shadow-card transition duration-160 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div className="rounded-2xl bg-brand-soft/20 p-3 text-brand shadow-card">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend && (
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-semibold",
              isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600",
            ].join(" ")}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold text-text">{value}</p>
        <p className="text-sm font-medium text-textSoft">{label}</p>
        {sublabel && <p className="mt-1 text-xs text-textMuted">{sublabel}</p>}
      </div>
    </div>
  );
};

export default StatsCard;

