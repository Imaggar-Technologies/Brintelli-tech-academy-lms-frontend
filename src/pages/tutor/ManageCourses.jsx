import { Pencil, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "title", title: "Course" },
  { key: "cohort", title: "Cohort" },
  { key: "students", title: "Students" },
  { key: "status", title: "Status" },
  {
    key: "actions",
    title: "Actions",
    render: () => (
      <Button className="px-4 py-2 text-xs font-semibold">
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
    ),
  },
];

const data = [
  { id: 1, title: "Backend Engineering Mastery", cohort: "BE-2025A", students: 118, status: "Active" },
  { id: 2, title: "Advanced DSA Sprint", cohort: "DSA-2025A", students: 96, status: "Active" },
  { id: 3, title: "System Design: Scaling Products", cohort: "SD-2025A", students: 84, status: "Active" },
  { id: 4, title: "Career Accelerator Bootcamp", cohort: "CA-2025A", students: 60, status: "Upcoming" },
];

const TutorManageCourses = () => {
  return (
    <>
      <PageHeader
        title="Manage Courses"
        description="Update curriculum, monitor cohort rosters, and keep course delivery aligned with outcomes."
        actions={
          <Button variant="secondary" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Course
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Course Inventory</h3>
          <Button variant="ghost">Export Roster</Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default TutorManageCourses;

