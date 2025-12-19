import PageHeader from "../../components/PageHeader";

const AdminSettings = () => {
  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Manage feature flags, notifications, and compliance controls for the LMS."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">General Configuration</h3>
          <div className="mt-4 space-y-4 text-sm text-textSoft">
            <div className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3">
              <div>
                <p className="font-semibold text-text">Enable mentor announcements</p>
                <p className="text-xs text-textMuted">Allow mentors to broadcast updates to cohorts.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="h-6 w-11 rounded-full bg-brintelli-baseAlt transition peer-checked:bg-brand-500" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-brintelli-card transition peer-checked:translate-x-5" />
              </label>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3">
              <div>
                <p className="font-semibold text-text">Auto-record live sessions</p>
                <p className="text-xs text-textMuted">Store recordings in the shared library automatically.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="h-6 w-11 rounded-full bg-brintelli-baseAlt transition peer-checked:bg-brand-500" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-brintelli-card transition peer-checked:translate-x-5" />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Communication Preferences</h3>
          <div className="mt-4 space-y-3">
            {[
              { label: "Notify tutors about new assignments", checked: true },
              { label: "Send placement alerts to LSMs", checked: true },
              { label: "Enable SMS alerts for interviews", checked: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3 text-sm text-textSoft">
                <span>{item.label}</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked={item.checked} />
                  <div className="h-6 w-11 rounded-full bg-brintelli-baseAlt transition peer-checked:bg-brand-500" />
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-brintelli-card transition peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;

