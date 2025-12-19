import { GraduationCap, UserPlus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "name", title: "Learner" },
  { key: "program", title: "Program" },
  { key: "status", title: "Status" },
  { key: "engagement", title: "Engagement" },
  { key: "placement", title: "Placement Stage" },
];

const data = [
  {
    id: 1,
    name: "Aishwarya Kumar",
    program: "Backend Engineering",
    status: "Active",
    engagement: "High",
    placement: "Ready",
  },
  {
    id: 2,
    name: "Karan Gupta",
    program: "Backend Engineering",
    status: "Active",
    engagement: "Medium",
    placement: "In Progress",
  },
  {
    id: 3,
    name: "Shraddha Patil",
    program: "Problem Solving",
    status: "Active",
    engagement: "High",
    placement: "Offer",
  },
];

const AdminStudents = () => {
  return (
    <>
      <PageHeader
        title="Learner Directory"
        description="Organisation-wide view of all learners, their programs, and placement readiness."
        actions={
          <Button variant="secondary" className="gap-2">
            Add Student
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Active Students</h3>
          <Button variant="ghost">Export CSV</Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default AdminStudents;

