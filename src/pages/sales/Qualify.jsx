import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const SalesQualify = () => {
  const qualificationCriteria = [
    { criteria: "Budget Confirmed", status: true },
    { criteria: "Decision Maker Identified", status: true },
    { criteria: "Timeline Defined", status: false },
    { criteria: "Need Validated", status: true },
  ];

  const leads = [
    { company: "TechCorp Inc.", score: 85, status: "Qualified", owner: "John Doe", value: "₹250K" },
    { company: "StartupXYZ", score: 72, status: "Qualifying", owner: "Jane Smith", value: "₹180K" },
    { company: "Digital Solutions", score: 45, status: "Needs Work", owner: "Mike Johnson", value: "₹320K" },
  ];

  return (
    <>
      <PageHeader
        title="Lead Qualification"
        description="Evaluate and qualify leads based on BANT criteria (Budget, Authority, Need, Timeline)."
        actions={
          <Button variant="secondary" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Qualification Guide
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard icon={CheckCircle2} value="45" label="Qualified Leads" trend="32% of total" />
        <StatsCard icon={Clock} value="28" label="In Qualification" trend="20% of total" />
        <StatsCard icon={AlertCircle} value="18" label="Needs Work" trend="13% of total" />
        <StatsCard icon={XCircle} value="51" label="Disqualified" trend="36% of total" />
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-text mb-4">Qualification Checklist</h3>
        <div className="space-y-3">
          {qualificationCriteria.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3">
              <div className="flex items-center gap-3">
                {item.status ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <p className="font-semibold text-text">{item.criteria}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {item.status ? "Yes" : "No"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <h3 className="text-lg font-semibold text-text">Leads Under Qualification</h3>
        </div>
        <div className="divide-y divide-brintelli-border">
          {leads.map((lead, idx) => (
            <div key={idx} className="p-4 transition hover:bg-brintelli-baseAlt">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-text">{lead.company}</h4>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        lead.status === "Qualified"
                          ? "bg-green-100 text-green-700"
                          : lead.status === "Qualifying"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-textSoft">Owner: {lead.owner} • Value: {lead.value}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-text">{lead.score}%</p>
                    <p className="text-xs text-textMuted">Qualification Score</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Review
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

export default SalesQualify;