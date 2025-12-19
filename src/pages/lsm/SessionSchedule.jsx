import { CalendarClock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import CalendarWidget from "../../components/CalendarWidget";
import Table from "../../components/Table";

const columns = [
  { key: "mentee", title: "Mentee" },
  { key: "topic", title: "Focus Area" },
  { key: "slot", title: "Schedule" },
  { key: "status", title: "Status" },
];

const sessions = [
  {
    id: 1,
    mentee: "Arjun M",
    topic: "Wellbeing check-in",
    slot: "Nov 22 · 7:00 PM",
    status: "Confirmed",
  },
  {
    id: 2,
    mentee: "Karan Gupta",
    topic: "Accountability sync",
    slot: "Nov 23 · 7:30 PM",
    status: "Pending",
  },
  {
    id: 3,
    mentee: "Shraddha Patil",
    topic: "Mock interview feedback",
    slot: "Nov 24 · 8:30 PM",
    status: "Confirmed",
  },
];

const LsmSessionSchedule = () => {
  return (
    <>
      <PageHeader
        title="Session Schedule"
        description="Upcoming mentorship sessions, wellbeing check-ins, and placement reviews."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            <CalendarClock className="h-4 w-4" />
            Sync Calendar
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Upcoming Sessions</h3>
          <div className="mt-4">
            <Table columns={columns} data={sessions} />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <CalendarWidget highlights={[5, 12, 18, 22, 24]} />
        </div>
      </div>
    </>
  );
};

export default LsmSessionSchedule;

