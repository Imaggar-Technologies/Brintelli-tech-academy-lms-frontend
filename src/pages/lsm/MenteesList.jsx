import { CalendarClock, GraduationCap, MessageCircle, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "name", title: "Mentee" },
  { key: "track", title: "Track" },
  { key: "risk", title: "Risk Level" },
  { key: "progress", title: "Progress" },
  { key: "nextStep", title: "Next Action" },
];

const data = [
  {
    id: 1,
    name: "Aishwarya Kumar",
    track: "Backend Engineering",
    risk: "Low",
    progress: "78%",
    nextStep: "Resume review",
  },
  {
    id: 2,
    name: "Karan Gupta",
    track: "Backend Engineering",
    risk: "Medium",
    progress: "61%",
    nextStep: "Follow-up call",
  },
  {
    id: 3,
    name: "Shraddha Patil",
    track: "Problem Solving",
    risk: "Low",
    progress: "82%",
    nextStep: "Schedule mock interview",
  },
  {
    id: 4,
    name: "Harsh Yadav",
    track: "Backend Engineering",
    risk: "High",
    progress: "58%",
    nextStep: "Escalate to mentor",
  },
];

const LsmMenteesList = () => {
  return (
    <>
      <PageHeader
        title="Mentee Portfolio"
        description="Consolidated view of all assigned mentees with risk flags and next action steps."
        actions={
          <Button variant="secondary" className="gap-2">
            Export List
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text">Active Mentees</h3>
            <p className="text-sm text-textMuted">Sort by risk level to prioritize conversations.</p>
          </div>
          <Button variant="ghost" className="gap-2">
            Share with mentor
          </Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default LsmMenteesList;

