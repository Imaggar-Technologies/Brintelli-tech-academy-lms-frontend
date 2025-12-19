import { Award, CalendarCheck, ClipboardList, Target } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import ProgressBar from "../../components/ProgressBar";

const tracks = [
  {
    id: 1,
    title: "AWS Cloud Practitioner",
    description: "Core cloud concepts, pricing models, shared responsibility.",
    progress: 68,
  },
  {
    id: 2,
    title: "AWS Solutions Architect",
    description: "Design scalable architectures across networking and storage.",
    progress: 42,
  },
  {
    id: 3,
    title: "Azure Fundamentals",
    description: "Azure services overview, management tools, and governance.",
    progress: 54,
  },
  {
    id: 4,
    title: "GCP Associate",
    description: "GCP compute, storage, and networking primitives with case studies.",
    progress: 26,
  },
];

const CertificationsMock = () => {
  return (
    <>
      <PageHeader
        title="Certification Mock Center"
        description="Pick a certification track, monitor progress, and launch full-length timed mock tests."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex flex-col gap-4 rounded-2xl border border-brintelli-border bg-brintelli-card p-5 shadow-soft transition hover:-translate-y-1 hover:border-brand-200"
          >
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 text-brand-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{track.title}</h3>
                <p className="text-sm text-textMuted">{track.description}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-textMuted">
                <span>Progress</span>
                <span className="text-textSoft">{track.progress}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={track.progress} />
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between text-xs text-textMuted">
              <span>Mock tests attempted: 3</span>
              <span>Average score: 72%</span>
            </div>
            <Button className="inline-flex w-full items-center justify-center gap-2">
              Launch MCQ Marathon
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default CertificationsMock;


