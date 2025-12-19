import { Video } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "topic", title: "Session" },
  { key: "mentor", title: "Mentor" },
  { key: "time", title: "Time" },
  {
    key: "action",
    title: "Join",
    render: () => (
      <Button className="px-4 py-2 text-xs font-semibold">
        Join Room
        <Video className="h-3.5 w-3.5" />
      </Button>
    ),
  },
];

const schedule = [
  {
    id: 1,
    topic: "Advanced Graph Algorithms",
    mentor: "Sneha Kapoor",
    time: "Nov 21 · 7:00 PM - 9:00 PM",
  },
  {
    id: 2,
    topic: "Low Level Design: Observability",
    mentor: "Harish Kulkarni",
    time: "Nov 22 · 6:30 PM - 8:00 PM",
  },
  {
    id: 3,
    topic: "Mock Interview Live Review",
    mentor: "Arpit Jain",
    time: "Nov 23 · 8:00 PM - 9:30 PM",
  },
  {
    id: 4,
    topic: "Project Standup: Sprint Retro",
    mentor: "Aman Sharma",
    time: "Nov 24 · 8:30 PM - 9:30 PM",
  },
];

const StudentLiveClasses = () => {
  return (
    <>
      <PageHeader
        title="Live Classes & Cohort Schedule"
        description="All your upcoming live sessions, mentor hours, and cohort syncs in one place."
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-text text-lg font-semibold tracking-tight">This Week</h3>
            <p className="text-sm text-textSoft">Join classes at least 5 minutes before they start.</p>
          </div>
          <Button variant="secondary" className="gap-2">
            Sync with Calendar
          </Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={schedule} />
        </div>
      </div>
    </>
  );
};

export default StudentLiveClasses;

