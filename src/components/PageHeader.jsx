const PageHeader = ({ title, description, actions, children }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-brintelli-border/60 bg-gradient-cta text-white shadow-glow">
      <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-brand-soft/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
      <div className="relative flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between md:p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Brintelli LMS Portal
          </p>
          <h2 className="text-2xl font-semibold md:text-2xl">{title}</h2>
          {description && <p className="max-w-2xl text-xs text-white/80">{description}</p>}
          {children}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;

