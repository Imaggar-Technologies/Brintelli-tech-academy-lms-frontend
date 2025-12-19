import { CalendarClock, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "name", title: "Batch" },
  { key: "program", title: "Program" },
  { key: "learners", title: "Learners" },
  { key: "status", title: "Status" },
  { key: "start", title: "Start Date" },
];

const data = [
  {
    id: 1,
    name: "BE-2025A",
    program: "Backend Engineering Mastery",
    learners: 120,
    status: "Live",
    start: "Aug 2025",
  },
  {
    id: 2,
    name: "FS-2025A",
    program: "Full Stack Accelerator",
    learners: 96,
    status: "Live",
    start: "Sep 2025",
  },
  {
    id: 3,
    name: "DSA-2025B",
    program: "Advanced DSA Sprint",
    learners: 140,
    status: "Admissions Open",
    start: "Dec 2025",
  },
];

const AdminBatches = () => {
  return (
    <>
      <PageHeader
        title="Batch Management"
        description="Create cohorts, assign mentors, and monitor batch lifecycle from admissions to placements."
        actions={
          <Button variant="secondary" className="gap-2">
            Create Batch
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Active & Upcoming Batches</h3>
          <Button variant="ghost">Export Schedule</Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default AdminBatches;

