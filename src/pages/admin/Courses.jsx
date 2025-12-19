import { BookOpen, ClipboardList, Target } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "title", title: "Course" },
  { key: "category", title: "Category" },
  { key: "batches", title: "Batches" },
  { key: "students", title: "Learners" },
  { key: "status", title: "Status" },
];

const data = [
  {
    id: 1,
    title: "Backend Engineering Mastery",
    category: "Backend",
    batches: 3,
    students: 340,
    status: "Active",
  },
  {
    id: 2,
    title: "Advanced Data Structures & Algorithms",
    category: "DSA",
    batches: 4,
    students: 480,
    status: "Active",
  },
  {
    id: 3,
    title: "System Design for Scale",
    category: "Architecture",
    batches: 2,
    students: 210,
    status: "Active",
  },
];

const AdminCourses = () => {
  return (
    <>
      <PageHeader
        title="Course Catalog"
        description="Keep the curriculum fresh, align mentors, and track learner adoption per course."
        actions={
          <Button variant="secondary" className="gap-2">
            Add Program
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Active Programs</h3>
          <Button variant="ghost">Export Overview</Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default AdminCourses;

