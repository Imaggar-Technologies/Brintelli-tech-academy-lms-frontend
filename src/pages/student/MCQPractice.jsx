import { useMemo, useState } from "react";
import { Timer, Filter, Tag, Target, CheckCircle2, XCircle, ArrowRight, ArrowLeft } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const certifications = ["AWS Cloud Practitioner", "AWS Solutions Architect", "Azure Fundamentals", "GCP Associate"];
const difficulties = ["Easy", "Medium", "Hard"];
const topics = ["Storage", "Networking", "Security", "Databases"];

const questions = [
  {
    id: 1,
    question: "Which AWS service should you use to create a decoupled architecture between microservices?",
    options: [
      { value: "a", label: "Amazon S3" },
      { value: "b", label: "Amazon SQS", correct: true },
      { value: "c", label: "Amazon DynamoDB" },
      { value: "d", label: "AWS Lambda" },
    ],
    tags: ["AWS – SQS", "Easy"],
    timer: "02:15",
    status: "correct",
  },
  {
    id: 2,
    question: "You need to design a highly available relational database on Azure. Which service fits best?",
    options: [
      { value: "a", label: "Azure Blob Storage" },
      { value: "b", label: "Azure Cosmos DB" },
      { value: "c", label: "Azure SQL Database", correct: true },
      { value: "d", label: "Azure Table Storage" },
    ],
    tags: ["Azure – SQL", "Medium"],
    timer: "01:32",
    status: "incorrect",
  },
];

const MCQPractice = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeQuestion = useMemo(() => questions[currentIndex], [currentIndex]);
  const totalQuestions = questions.length;

  const handleNext = () => {
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  return (
    <>
      <PageHeader
        title="MCQ Practice Hub"
        description="Sharpen certification fundamentals across AWS, Azure, and GCP with timed MCQ drills."
        actions={<Button variant="secondary">Browse question banks</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="flex max-h-[calc(100vh-220px)] flex-col gap-5 overflow-y-auto rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Filters</h3>
            <Filter className="h-4 w-4 text-textMuted" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Certification</p>
            <select className="w-full rounded-2xl border border-brintelli-border bg-white px-4 py-2 text-sm text-textSoft outline-none transition duration-160 focus:border-brand focus:ring-2 focus:ring-brand/20">
              {certifications.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((item) => (
                <Button key={item} variant="ghost" className="px-4 py-2 text-xs font-semibold">
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Topics</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-brintelli-baseAlt px-3 py-1 text-xs font-medium text-textSoft"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <Button variant="primary" className="mt-auto w-full">
            Start 30-question Set
          </Button>
        </aside>

        <section className="flex flex-col gap-6">
          <article className="relative rounded-3xl border border-brintelli-border bg-brintelli-card p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-textMuted">
                  Question {currentIndex + 1} of {totalQuestions}
                </p>
                <h3 className="text-xl font-semibold text-text">{activeQuestion.question}</h3>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-soft/50 bg-brand-soft/15 px-4 py-1.5 text-xs font-semibold text-brand">
                <Timer className="h-3.5 w-3.5" />
                {activeQuestion.timer}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {activeQuestion.options.map((option) => (
                <label
                  key={option.value}
                  className={[
                    "flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3 text-sm",
                    option.correct
                      ? "border-brand/40 bg-brand/10 text-brand"
                      : "border-brintelli-border bg-white text-textSoft hover:border-brand/30",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name={`question-${activeQuestion.id}`}
                    className="h-5 w-5 rounded-full border border-brintelli-border text-brand focus:ring-brand/40"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-textMuted">
              <div className="flex flex-wrap items-center gap-2">
                {activeQuestion.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brintelli-baseAlt px-3 py-1 text-xs text-textMuted">
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                  activeQuestion.status === "correct"
                    ? "bg-brand/15 text-brand"
                    : "bg-brand-dark/15 text-brand-dark",
                ].join(" ")}
              >
                {activeQuestion.status === "correct" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Correct last attempt
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" /> Needs review
                  </>
                )}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-textSoft">
                <span>
                  Question {currentIndex + 1} / {totalQuestions}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0} className="gap-2 disabled:opacity-40">
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="primary" onClick={handleNext} disabled={currentIndex === totalQuestions - 1} className="gap-2 disabled:opacity-40">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-textMuted">Session Summary</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Score</p>
                <p className="mt-1 text-lg font-semibold text-text">18 / 25</p>
              </div>
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Accuracy</p>
                <p className="mt-1 text-lg font-semibold text-text">72%</p>
              </div>
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Time Taken</p>
                <p className="mt-1 text-lg font-semibold text-text">32 mins</p>
              </div>
            </div>
            <Button variant="secondary" className="mt-5 gap-2">
              <Target className="h-4 w-4" />
              Start Adaptive Set
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default MCQPractice;


