import { CheckCircle2, CalendarDays, ClipboardCheck, FileUp, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";
import Button from "../../components/Button";

const checklist = [
  "Update resume with latest project outcomes",
  "Collect mentor feedback quotes",
  "Polish LinkedIn headline & summary",
  "Prepare STAR stories for leadership rounds",
];

const upcomingDrivesColumns = [
  { key: "company", title: "Company" },
  { key: "role", title: "Role" },
  { key: "date", title: "Date" },
  { key: "status", title: "Status" },
];

const upcomingDrives = [
  { id: 1, company: "Razorpay", role: "Backend Engineer II", date: "Nov 28", status: "Applied" },
  { id: 2, company: "Atlassian", role: "Platform Engineer", date: "Dec 02", status: "Shortlisted" },
  { id: 3, company: "Meesho", role: "SDE II", date: "Dec 05", status: "Preparing" },
];

const myApplicationsColumns = [
  { key: "company", title: "Company" },
  { key: "stage", title: "Stage" },
  { key: "next", title: "Next Action" },
];

const applications = [
  { id: 1, company: "Razorpay", stage: "Round 2 scheduled", next: "Prep LLD round" },
  { id: 2, company: "Swiggy", stage: "Offer under review", next: "Await HR update" },
  { id: 3, company: "PhonePe", stage: "Applied", next: "Follow up with recruiter" },
];

const PlacementAssistance = () => {
  return (
    <>
      <PageHeader
        title="Placement Assistance Center"
        description="Manage interview preparation, track company drives, and stay coordinated with the placement team."
      />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col gap-5">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-text text-lg font-semibold">Resume Checklist</h3>
              <ClipboardCheck className="h-5 w-5 text-brand-500" />
            </div>
            <ul className="mt-3 space-y-3 text-sm text-textSoft">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3">
              <Button className="gap-2">
                Book Mock HR Interview
              </Button>
              <Button variant="secondary" className="gap-2">
                <FileUp className="h-4 w-4" /> Upload Resume
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-text text-lg font-semibold">Upcoming Company Drives</h3>
              <CalendarDays className="h-5 w-5 text-brand-500" />
            </div>
            <div className="mt-4">
              <Table columns={upcomingDrivesColumns} data={upcomingDrives} />
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-text text-lg font-semibold">My Applications</h3>
              <Users className="h-5 w-5 text-brand-500" />
            </div>
            <div className="mt-4">
              <Table columns={myApplicationsColumns} data={applications} />
            </div>
          </div>
          <Button variant="secondary" className="mt-5 gap-2">
            <Users className="h-4 w-4" />
            Request Placement Review
          </Button>
        </section>

        <aside className="flex flex-col gap-5">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <h3 className="text-text text-lg font-semibold">Mock HR Interview Tips</h3>
            <div className="mt-3 space-y-3 text-sm text-textSoft">
              <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3">
                <p className="font-semibold text-text">Tell me about yourself</p>
                <p className="text-textMuted text-xs">Use the past → present → future structure; keep it under 2 mins.</p>
              </div>
              <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3">
                <p className="font-semibold text-text">Handling conflicts</p>
                <p className="text-textMuted text-xs">Explain context, action, and resolution. Highlight empathy & clarity.</p>
              </div>
              <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3">
                <p className="font-semibold text-text">Salary discussions</p>
                <p className="text-textMuted text-xs">Share expected range based on market benchmarks and value drivers.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <h3 className="text-text text-lg font-semibold">Quick Notes</h3>
            <textarea
              rows={8}
              className="mt-3 w-full rounded-xl border border-brintelli-border px-4 py-3 text-sm text-textSoft outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Draft follow-ups, recruiter notes, or reminders…"
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default PlacementAssistance;


