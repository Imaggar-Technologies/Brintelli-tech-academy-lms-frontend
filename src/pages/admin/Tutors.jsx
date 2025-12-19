import { CircleCheck, GraduationCap, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "name", title: "Tutor" },
  { key: "expertise", title: "Expertise" },
  { key: "cohorts", title: "Cohorts" },
  { key: "rating", title: "Rating" },
  { key: "status", title: "Status" },
];

const data = [
  {
    id: 1,
    name: "Aman Sharma",
    expertise: "Backend Engineering",
    cohorts: 3,
    rating: "4.9",
    status: "Active",
  },
  {
    id: 2,
    name: "Sneha Kapoor",
    expertise: "Problem Solving",
    cohorts: 2,
    rating: "4.8",
    status: "Active",
  },
  {
    id: 3,
    name: "Rahul Iyer",
    expertise: "System Design",
    cohorts: 2,
    rating: "4.7",
    status: "Onboarding",
  },
];

const AdminTutors = () => {
  return (
    <>
      <PageHeader
        title="Tutor Network"
        description="Manage tutor assignments, onboarding, and performance indicators across programs."
        actions={
          <Button variant="secondary" className="gap-2">
            Invite Tutor
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Active Tutors</h3>
          <Button variant="ghost">Export List</Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default AdminTutors;

