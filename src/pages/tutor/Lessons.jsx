import { FilePlus2, ListChecks } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import LectureCard from "../../components/LectureCard";

const lessons = [
  {
    id: 1,
    title: "Week 5 • Consistency Models",
    description: "CAP theorem refresh, strong vs eventual consistency, patterns at scale.",
    duration: "Live · Nov 23 · 7:00 PM",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Week 5 Labs • Implementing Write-Ahead Logs",
    description: "Hands-on lab using Go to build WAL backed storage.",
    duration: "Workshop · Nov 24 · 8:30 PM",
    status: "upcoming",
  },
  {
    id: 3,
    title: "Week 4 Recap • Design Review",
    description: "Asynchronous recap with Q&A and sample solution walkthroughs.",
    duration: "Recorded · 58 mins",
    status: "completed",
    type: "recording",
  },
];

const TutorLessons = () => {
  return (
    <>
      <PageHeader
        title="Lesson Planner"
        description="Structure weekly lessons, attach resources, and monitor completion across cohorts."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            <FilePlus2 className="h-4 w-4" />
            Create Lesson
          </button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft"
          >
            <LectureCard
              title={lesson.title}
              description={lesson.description}
              duration={lesson.duration}
              status={lesson.status}
              type={lesson.type}
            />
            <div className="flex items-center justify-between text-sm text-textMuted">
              <span>Linked cohorts: BE-2025A, DS-2025A</span>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                <ListChecks className="h-4 w-4" />
                View Checklist
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TutorLessons;

