import { CalendarClock, Video, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const SalesDemos = () => {
  const demos = [
    { company: "TechCorp Inc.", date: "2024-01-15", time: "10:00 AM", status: "Scheduled", owner: "John Doe" },
    { company: "StartupXYZ", date: "2024-01-15", time: "2:00 PM", status: "Completed", owner: "Jane Smith" },
    { company: "Digital Solutions", date: "2024-01-16", time: "11:00 AM", status: "Scheduled", owner: "Mike Johnson" },
    { company: "Cloud Systems", date: "2024-01-16", time: "3:30 PM", status: "Cancelled", owner: "Sarah Williams" },
  ];

  return (
    <>
      <PageHeader
        title="Demo Schedule"
        description="Schedule, track, and manage product demonstrations for prospects."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Demo
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={CalendarClock} value="28" label="Scheduled" trend="This week" />
        <StatsCard icon={CheckCircle} value="12" label="Completed" trend="This week" />
        <StatsCard icon={Clock} value="8" label="Upcoming Today" trend="Next 24 hours" />
        <StatsCard icon={XCircle} value="3" label="Cancelled" trend="This week" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Demo Calendar</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {demos.map((demo, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft/20 text-brand">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{demo.company}</h4>
                    <p className="text-sm text-textSoft">
                      {demo.date} at {demo.time}
                    </p>
                    <p className="text-xs text-textMuted">Owner: {demo.owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      demo.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : demo.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {demo.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesDemos;