import { MessageSquare, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const SalesFollowUps = () => {
  const followUps = [
    { company: "TechCorp Inc.", type: "Email", due: "Today", status: "Pending", priority: "High" },
    { company: "StartupXYZ", type: "Call", due: "Tomorrow", status: "Scheduled", priority: "Medium" },
    { company: "Digital Solutions", type: "Meeting", due: "Jan 18", status: "Completed", priority: "High" },
    { company: "Cloud Systems", type: "Email", due: "Jan 20", status: "Pending", priority: "Low" },
  ];

  return (
    <>
      <PageHeader
        title="Follow-ups"
        description="Track and manage follow-up activities with prospects and customers."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Follow-up
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={Clock} value="18" label="Pending" trend="Due soon" />
        <StatsCard icon={CheckCircle} value="24" label="Completed" trend="This week" />
        <StatsCard icon={AlertCircle} value="5" label="Overdue" trend="Needs attention" />
        <StatsCard icon={MessageSquare} value="47" label="Total" trend="All time" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Follow-up Activities</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {followUps.map((item, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft/20 text-brand">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">{item.company}</h4>
                    <p className="text-sm text-textSoft">Type: {item.type} • Due: {item.due}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SalesFollowUps;