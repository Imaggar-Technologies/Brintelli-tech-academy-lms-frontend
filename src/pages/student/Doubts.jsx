import { MessageCircleQuestion, Plus, Target } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const doubts = [
  {
    id: 1,
    title: "When to choose write-through cache over write-back?",
    category: "System Design",
    status: "Mentor replying",
    timestamp: "12 mins ago",
  },
  {
    id: 2,
    title: "Optimizing DP solution for partition problem",
    category: "DSA",
    status: "Peer discussion",
    timestamp: "25 mins ago",
  },
  {
    id: 3,
    title: "Handling auth in microservices without tight coupling",
    category: "Architecture",
    status: "Escalated to mentor",
    timestamp: "1 hour ago",
  },
];

const StudentDoubts = () => {
  return (
    <>
      <PageHeader
        title="Doubt Resolution Queue"
        description="Drop technical questions, track mentor responses, and leverage peer community support."
        actions={
          <Button>Ask a Doubt</Button>
        }
      />
      <div className="flex flex-col gap-4">
        {doubts.map((doubt) => (
          <div
            key={doubt.id}
            className="flex flex-col gap-3 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-text">{doubt.title}</h3>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-brintelli-baseAlt px-3 py-1 text-xs font-semibold text-textMuted">
                  <Tag className="h-3.5 w-3.5" />
                  {doubt.category}
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                <MessageCircleQuestion className="h-3.5 w-3.5" />
                {doubt.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-textMuted">
              <span>Submitted by you</span>
              <span>{doubt.timestamp}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="gap-2">
                Resolve Doubt
              </Button>
              <Button variant="ghost">View Thread</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentDoubts;

