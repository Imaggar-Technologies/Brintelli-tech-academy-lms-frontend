import { BriefcaseBusiness, HeartHandshake } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const columns = [
  { key: "name", title: "LSM" },
  { key: "mentees", title: "Mentees" },
  { key: "satisfaction", title: "CSAT" },
  { key: "risk", title: "Risk Cases" },
  { key: "status", title: "Status" },
];

const data = [
  {
    id: 1,
    name: "Priya Sharma",
    mentees: 48,
    satisfaction: "4.9",
    risk: 3,
    status: "Active",
  },
  {
    id: 2,
    name: "Harish Kumar",
    mentees: 40,
    satisfaction: "4.7",
    risk: 5,
    status: "Active",
  },
  {
    id: 3,
    name: "Shalini Menon",
    mentees: 35,
    satisfaction: "4.6",
    risk: 2,
    status: "Onboarding",
  },
];

const AdminLsMs = () => {
  return (
    <>
      <PageHeader
        title="Learning Success Managers"
        description="Track LSM capacity, mentee satisfaction, and wellbeing escalations."
        actions={
          <Button variant="secondary" className="gap-2">
            Onboard LSM
          </Button>
        }
      />
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">LSM Network Overview</h3>
          <Button variant="ghost">Export Snapshot</Button>
        </div>
        <div className="mt-4">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </>
  );
};

export default AdminLsMs;

