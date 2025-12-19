import { ArrowLeftCircle, BookOpenText, Brain, CalendarClock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import LectureCard from "../../components/LectureCard";
import AnnouncementCard from "../../components/AnnouncementCard";
import Button from "../../components/Button";

const CourseDetail = () => {
  const { id } = useParams();

  const syllabus = [
    {
      id: 1,
      title: "Week 1 • Foundations & Requirements",
      description: "Clarifying product expectations, scale targets, constraints, and SLOs.",
      duration: "Recorded · 1h 10m",
      status: "completed",
      type: "recording",
    },
    {
      id: 2,
      title: "Week 2 • Designing APIs & Contracts",
      description: "Contract-first design with schema versioning and backward compatibility.",
      duration: "Live · Nov 22, 7 PM",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Week 3 • Deep Dive: Caching Strategy",
      description: "Choosing cache topology, eviction strategies, and consistency guarantees.",
      duration: "Live · Nov 29, 7 PM",
      status: "upcoming",
    },
    {
      id: 4,
      title: "Week 4 • Designing for Failure",
      description: "Disaster recovery, circuit breakers, retries, mitigations.",
      duration: "Recorded · Coming Soon",
      status: "upcoming",
    },
  ];

  return (
    <>
      <PageHeader
        title="Backend Engineering Mastery"
        description="Build resilient, scalable backend architectures under mentorship from industry experts."
        actions={
          <>
            <Link
              to="/student/my-courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <ArrowLeftCircle className="h-4 w-4" />
              Back to courses
            </Link>
            <button className="inline-flex items-center gap-2 rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
              Join Community Forum
            </button>
          </>
        }
      >
        <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-wide text-white/80">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <BookOpenText className="h-4 w-4" />
            12-week mentor-led program
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <Brain className="h-4 w-4" />
            Problem solving + system design
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <CalendarClock className="h-4 w-4" />
            Cohort #{id ?? "01"}
          </span>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Course Progress</h3>
            <p className="mt-1 text-sm text-textMuted">
              Great momentum! Keep attending live classes and completing assignments.
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-sm font-semibold text-textSoft">
                <span>Overall Completion</span>
                <span>64%</span>
              </div>
              <ProgressBar value={64} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3 text-sm text-textSoft">
                  <span className="font-semibold text-text">Assignments:</span> 6 / 10 submitted
                </div>
                <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3 text-sm text-textSoft">
                  <span className="font-semibold text-text">Mock Interviews:</span> 2 scheduled
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Syllabus & Sessions</h3>
              <button className="text-sm font-semibold text-brand-600">Download Outline</button>
            </div>
            <div className="mt-4 space-y-4">
              {syllabus.map((item) => (
                <LectureCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  duration={item.duration}
                  status={item.status}
                  type={item.type}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Mentor Connect</h3>
            <div className="mt-4 space-y-4 text-sm text-textSoft">
              <div className="rounded-xl bg-brintelli-baseAlt px-4 py-3">
                <p className="font-semibold text-text">Aman Sharma</p>
                <p className="text-xs text-textMuted">Principal Engineer, Ex-Uber</p>
                <p className="mt-3 text-textSoft">
                  Weekly office hours on Fridays. Drop questions in the doubt queue before Thursday.
                </p>
              </div>
              <Button className="w-full justify-center">
                Join Next Live Class
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Course Announcements</h3>
            <div className="mt-4 space-y-4">
              <AnnouncementCard
                title="Backend Hackathon Sprint"
                description="Form teams of 4 and build your microservice use case. Demos on Dec 5."
                date="Nov 19"
              />
              <AnnouncementCard
                title="Mentor AMA"
                description="Ask anything about real-world system design challenges. Submit questions in advance."
                date="Nov 18"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;

