import { BriefcaseBusiness, CalendarClock, FileText, Target, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "company", title: "Company" },
  { key: "roles", title: "Roles" },
  { key: "offers", title: "Offers" },
  { key: "avgCtc", title: "Avg CTC" },
  { key: "status", title: "Status" },
];

const data = [
  { id: 1, company: "Razorpay", roles: "Backend Engineer", offers: 12, avgCtc: "26 LPA", status: "Closed" },
  { id: 2, company: "Atlassian", roles: "Platform Engineer", offers: 9, avgCtc: "32 LPA", status: "Interviews" },
  { id: 3, company: "Meesho", roles: "SDE II", offers: 15, avgCtc: "24 LPA", status: "Shortlisting" },
];

const AdminPlacement = () => {
  return (
    <>
      <PageHeader
        title="Placement Operations"
        description="Orchestrate company collaborations, track offers, and maximize learner outcomes."
        actions={
          <Button variant="secondary" className="gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Add Hiring Partner
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">Company Pipeline</h3>
            <Button variant="ghost">Export Pipeline</Button>
          </div>
          <div className="mt-4">
            <Table columns={columns} data={data} />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text">Priority Actions</h3>
          <div className="mt-4 space-y-3 text-sm text-textSoft">
            {[
              "Follow up with Razorpay HR for offer letters.",
              "Confirm interview slots with Atlassian panel.",
              "Share success stories for upcoming marketing push.",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3">
                {item}
              </div>
            ))}
          </div>
          <Button variant="primary" className="mt-5 gap-2">
            <Target className="h-4 w-4" />
            Create Drive
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminPlacement;

