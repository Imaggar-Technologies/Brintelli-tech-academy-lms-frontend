import { CalendarClock, BriefcaseBusiness, NotebookPen, UsersRound } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Table from "../../components/Table";

const pipelineColumns = [
  { key: "student", title: "Student" },
  { key: "program", title: "Program" },
  { key: "company", title: "Company" },
  { key: "stage", title: "Stage" },
  { key: "next", title: "Next Step" },
];

const pipeline = [
  { id: 1, student: "Aishwarya Kumar", program: "Backend Engineering", company: "Razorpay", stage: "Final HR", next: "Send salary bracket" },
  { id: 2, student: "Karan Gupta", program: "Backend Engineering", company: "Atlassian", stage: "System Design", next: "Schedule prep call" },
  { id: 3, student: "Shraddha Patil", program: "Problem Solving", company: "Meesho", stage: "Online Assessment", next: "Confirm timeline" },
];

const interviews = [
  { company: "Atlassian", role: "Platform Engineer", date: "Nov 24 · 7:30 PM", mentor: "Rahul Iyer" },
  { company: "Gojek", role: "Backend Engineer II", date: "Nov 25 · 6:00 PM", mentor: "Aman Sharma" },
];

const companies = [
  { name: "Razorpay", roles: "Backend, Platform", status: "Offers 3", highlight: "Finalizing compensation" },
  { name: "Atlassian", roles: "Platform, Developer", status: "Interviews 5", highlight: "Need panel confirmation" },
  { name: "Meesho", roles: "SDE II", status: "Shortlist 8", highlight: "OA scheduled weekend" },
];

const PlacementDashboard = () => {
  return (
    <>
      <PageHeader
        title="Placement Operations Desk"
        description="Coordinate student pipelines, upcoming interviews, and partner companies in one view."
      />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col gap-5">
          <div id="pipeline" className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Students in Pipeline</h3>
              <UsersRound className="h-5 w-5 text-brand-500" />
            </div>
            <div className="mt-4">
              <Table columns={pipelineColumns} data={pipeline} />
            </div>
          </div>

          <div id="interviews" className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Upcoming Interviews</h3>
              <CalendarClock className="h-5 w-5 text-brand-500" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {interviews.map((item) => (
                <div key={item.company} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm">
                  <p className="text-base font-semibold text-text">{item.company}</p>
                  <p className="text-xs uppercase tracking-wide text-textMuted">{item.role}</p>
                  <p className="mt-2 text-sm text-textSoft">{item.date}</p>
                  <p className="mt-1 text-xs text-textMuted">Mentor: {item.mentor}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <div id="companies" className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Company List</h3>
              <BriefcaseBusiness className="h-5 w-5 text-brand-500" />
            </div>
            <div className="mt-4 space-y-3 text-sm text-textSoft">
              {companies.map((company) => (
                <div key={company.name} className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3">
                  <p className="text-base font-semibold text-text">{company.name}</p>
                  <p className="text-xs uppercase tracking-wide text-textMuted">{company.roles}</p>
                  <p className="mt-2 text-sm text-textSoft">{company.status}</p>
                  <p className="text-xs text-textMuted">{company.highlight}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Quick Notes</h3>
              <NotebookPen className="h-5 w-5 text-brand-500" />
            </div>
            <textarea
              rows={8}
              className="mt-3 w-full rounded-xl border border-brintelli-border px-4 py-3 text-sm text-textSoft outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
              placeholder="Team updates, company follow-ups, or interview feedback..."
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default PlacementDashboard;


