import React from "react";
import Button from "../Button";
import { Plus, Trash2 } from "lucide-react";

const QUESTION_TYPES = [
  { value: "quiz", label: "Single choice (one correct answer)" },
  { value: "quiz-multi", label: "Multiple choice (multiple correct answers)" },
  { value: "poll", label: "Poll (multiple choice, no correct answer)" },
  { value: "review", label: "Review (rating 1–5 or free text)" },
];

const emptyOption = () => ({ text: "", image: "" });
const emptyQuestion = () => ({
  type: "quiz",
  question: "",
  questionImage: "",
  options: [{ ...emptyOption() }, { ...emptyOption() }],
  correctIndex: 0,
  correctIndices: [],
  reviewType: "scale",
});

function normalizeOptions(q) {
  const opts = q.options || [];
  return opts.map((o) => (typeof o === "object" && o != null ? { text: o.text || "", image: o.image || "" } : { text: String(o), image: "" }));
}

function normalizeQuestion(q) {
  const type = q.type || "quiz";
  let options = normalizeOptions(q);
  if (type === "review" && options.length === 0) options = [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }];
  if (options.length < 2 && type !== "review") options = [emptyOption(), emptyOption()];
  const isMulti = type === "quiz-multi";
  const correctIndices = isMulti && Array.isArray(q.correctIndices)
    ? q.correctIndices.filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < options.length)
    : (isMulti && q.correctIndex != null ? [Math.max(0, Math.min(q.correctIndex, options.length - 1))] : []);
  const correctIndex = !isMulti && q.correctIndex != null ? Math.max(0, Math.min(q.correctIndex, options.length - 1)) : 0;
  return {
    type,
    question: q.question || q.text || "",
    questionImage: q.questionImage || "",
    options,
    correctIndex,
    correctIndices,
    reviewType: q.reviewType || "scale",
  };
}

export default function QuizBuilder({ quiz, onChange }) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions.map(normalizeQuestion) : [];
  const title = quiz?.title ?? "Workshop Quiz";

  const setTitle = (t) => onChange({ ...quiz, title: t });
  const setQuestions = (qList) => onChange({ ...quiz, questions: qList });

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx, upd) => {
    const next = questions.map((q, i) => (i === idx ? { ...q, ...upd } : q));
    setQuestions(next);
  };

  const addOption = (qIdx) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { options: [...(q.options || []), emptyOption()] });
  };
  const removeOption = (qIdx, oIdx) => {
    const q = questions[qIdx];
    const opts = (q.options || []).filter((_, i) => i !== oIdx);
    const isMulti = q.type === "quiz-multi";
    if (isMulti) {
      const correctIndices = (q.correctIndices || [])
        .filter((i) => i !== oIdx)
        .map((i) => (i > oIdx ? i - 1 : i));
      updateQuestion(qIdx, { options: opts.length ? opts : [emptyOption()], correctIndices });
    } else {
      let correctIndex = q.correctIndex;
      if (correctIndex === oIdx) correctIndex = opts.length ? 0 : 0;
      else if (correctIndex > oIdx) correctIndex--;
      updateQuestion(qIdx, { options: opts.length ? opts : [emptyOption()], correctIndex });
    }
  };
  const updateOption = (qIdx, oIdx, field, value) => {
    const q = questions[qIdx];
    const opts = [...(q.options || [])];
    opts[oIdx] = { ...opts[oIdx], [field]: value };
    updateQuestion(qIdx, { options: opts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-textSoft mb-2">Quiz title</h4>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm bg-white"
          placeholder="Workshop Quiz"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-textSoft">Questions</h4>
        <Button type="button" size="sm" variant="secondary" onClick={addQuestion} className="gap-1">
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-textMuted py-4">No questions yet. Add a question to build the quiz, poll, or review.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-textMuted font-medium">
                  Question {qIdx + 1}
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      let opts = q.options;
                      if (type === "review") opts = [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }];
                      if (type === "poll") updateQuestion(qIdx, { type, options: opts, correctIndex: undefined, correctIndices: [] });
                      else if (type === "quiz-multi") updateQuestion(qIdx, { type, options: opts, correctIndices: q.correctIndex != null ? [q.correctIndex] : (q.correctIndices || []), correctIndex: undefined });
                      else updateQuestion(qIdx, { type, options: opts, correctIndex: Array.isArray(q.correctIndices) && q.correctIndices.length ? q.correctIndices[0] : (q.correctIndex ?? 0), correctIndices: [] });
                    }}
                    className="ml-2 rounded border border-brintelli-border/60 bg-white px-2 py-1 text-xs text-textMuted focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </span>
                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-textMuted hover:text-red-600 p-1" aria-label="Remove question">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="font-medium text-sm text-text mb-1">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-transparent hover:border-brintelli-border/40 focus:border-brand-500 focus:outline-none py-1 text-sm font-medium"
                  placeholder="Enter the question"
                />
              </p>
              {q.questionImage && (
                <img src={q.questionImage} alt="" className="my-2 max-h-48 rounded-lg object-contain" onError={(e) => e.target.style.display = "none"} />
              )}
              <input
                type="url"
                value={q.questionImage || ""}
                onChange={(e) => updateQuestion(qIdx, { questionImage: e.target.value })}
                className="mt-1 block w-full rounded border border-brintelli-border/60 px-2 py-1.5 text-xs text-textMuted placeholder:text-textMuted bg-white/80"
                placeholder="Question image URL (optional)"
              />
              {q.type === "review" && q.reviewType === "scale" && (
                <p className="text-xs text-textMuted mt-2">Rating 1–5. Learners pick one option.</p>
              )}
              {q.type !== "review" && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-textMuted">Options</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qIdx)} className="h-7 text-xs">+ Option</Button>
                  </div>
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="flex items-start gap-3 cursor-default rounded-lg border border-brintelli-border/60 p-2 hover:bg-brintelli-baseAlt/30"
                      >
                        {q.type === "quiz" && (
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === oIdx}
                            onChange={() => updateQuestion(qIdx, { correctIndex: oIdx })}
                            className="mt-1 shrink-0"
                            aria-label={`Correct: option ${oIdx + 1}`}
                          />
                        )}
                        {q.type === "quiz-multi" && (
                          <input
                            type="checkbox"
                            checked={(q.correctIndices || []).includes(oIdx)}
                            onChange={() => {
                              const prev = q.correctIndices || [];
                              const next = prev.includes(oIdx) ? prev.filter((i) => i !== oIdx) : [...prev, oIdx].sort((a, b) => a - b);
                              updateQuestion(qIdx, { correctIndices: next });
                            }}
                            className="mt-1 shrink-0 rounded"
                            aria-label={`Correct: option ${oIdx + 1}`}
                          />
                        )}
                        <span className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                          {opt.image && <img src={opt.image} alt="" className="max-h-16 rounded object-contain shrink-0" onError={(e) => e.target.style.display = "none"} />}
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(qIdx, oIdx, "text", e.target.value)}
                            className="flex-1 min-w-0 text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-textMuted"
                            placeholder={opt.image ? "" : "Option text"}
                          />
                        </span>
                        {(q.options?.length || 0) > 1 && (
                          <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-textMuted hover:text-red-600 p-1 shrink-0 mt-0.5" aria-label="Remove option">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 space-y-1.5">
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 pl-8">
                        <span className="text-xs text-textMuted w-16">Option {oIdx + 1} image:</span>
                        <input
                          type="url"
                          value={opt.image || ""}
                          onChange={(e) => updateOption(qIdx, oIdx, "image", e.target.value)}
                          className="flex-1 max-w-xs rounded border border-brintelli-border/40 px-2 py-1 text-xs text-textMuted placeholder:text-textMuted bg-white"
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {q.type === "review" && (
                <div className="mt-2">
                  <select
                    value={q.reviewType || "scale"}
                    onChange={(e) => {
                      const reviewType = e.target.value;
                      updateQuestion(qIdx, {
                        reviewType,
                        options: reviewType === "scale" ? [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }] : [],
                      });
                    }}
                    className="rounded-lg border border-brintelli-border px-3 py-2 text-sm bg-white"
                  >
                    <option value="scale">Rating 1–5</option>
                    <option value="freetext">Free text feedback</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
