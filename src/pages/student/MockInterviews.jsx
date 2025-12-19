import { CalendarPlus, Clock3, UserCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const slots = [
  {
    id: 1,
    mentor: "Rohit Nair",
    role: "Sr. Engineering Manager, Swiggy",
    slot: "Nov 24 • 7:00 PM - 8:00 PM",
    focus: "System Design Round",
  },
  {
    id: 2,
    mentor: "Ishita Sharma",
    role: "Staff Engineer, Atlassian",
    slot: "Nov 25 • 8:00 PM - 9:00 PM",
    focus: "Problem Solving + CS Fundamentals",
  },
  {
    id: 3,
    mentor: "Sagar Patel",
    role: "Engineering Leader, Google",
    slot: "Nov 26 • 6:30 PM - 7:30 PM",
    focus: "Behavioral + Leadership",
  },
];

const StudentMockInterviews = () => {
  return (
    <>
      <PageHeader
        title="Mock Interviews Scheduler"
        description="Book feedback-driven mocks with industry mentors. Boost your confidence across rounds."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            View Interview Preparation Guide
          </button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 text-brand-600">
                <div className="flex h-full items-center justify-center">
                  <UserCircle2 className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{slot.mentor}</h3>
                <p className="text-sm text-textMuted">{slot.role}</p>
              </div>
            </div>
            <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3 text-sm text-textSoft">
              <span className="font-semibold text-text">Focus Area:</span> {slot.focus}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
              <Clock3 className="h-4 w-4" />
              {slot.slot}
            </div>
            <Button className="inline-flex w-full items-center justify-center gap-2">
              Book Mentor Slot
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentMockInterviews;

