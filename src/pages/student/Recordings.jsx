import { Download, Video } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import LectureCard from "../../components/LectureCard";

const recordings = [
  {
    id: 1,
    title: "System Design Deep Dive: Feed Platform",
    description: "Discussing consistency models, fan-out strategies, and caching layers.",
    duration: "Recorded · 1h 28m",
    status: "recording",
    type: "recording",
  },
  {
    id: 2,
    title: "DSA Intensive: Dynamic Programming",
    description: "Patterns and heuristics for tackling DP problems under constraints.",
    duration: "Recorded · 2h 05m",
    status: "recording",
    type: "recording",
  },
  {
    id: 3,
    title: "Career Accelerator: Interview Strategies",
    description: "Breaking down interview loops, storytelling and negotiation tips.",
    duration: "Recorded · 1h 15m",
    status: "recording",
    type: "recording",
  },
  {
    id: 4,
    title: "Low Level Design: Notification Service",
    description: "Designing for scale with queues, retries, and template systems.",
    duration: "Recorded · 1h 48m",
    status: "recording",
    type: "recording",
  },
];

const StudentRecordings = () => {
  return (
    <>
      <PageHeader
        title="Class Recordings Library"
        description="Catch up on recorded sessions, bookmark key moments, and stay aligned with your cohort."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {recordings.map((item) => (
          <div key={item.id} className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <LectureCard
              title={item.title}
              description={item.description}
              duration={item.duration}
              status={item.status}
              type={item.type}
            />
            <div className="mt-4 flex items-center justify-between text-sm text-textMuted">
              <span>Added 2 days ago</span>
              <Button variant="secondary" className="w-full justify-center gap-2">
                <Download className="h-4 w-4" />
                Download Recording
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentRecordings;

