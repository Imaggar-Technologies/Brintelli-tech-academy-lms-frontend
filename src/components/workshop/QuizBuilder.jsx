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
        <label className="mb-1 block text-sm font-medium text-text">Quiz title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm"
          placeholder="Workshop Quiz"
        />
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text">Questions</h4>
        <Button type="button" size="sm" variant="ghost" onClick={addQuestion} className="gap-1">
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-textMuted">No questions yet. Add a question to build the quiz, poll, or review.</p>
      ) : (
        <ul className="space-y-6">
          {questions.map((q, qIdx) => (
            <li key={qIdx} className="rounded-xl border border-brintelli-border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-textMuted">Question {qIdx + 1}</span>
                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-red-600 hover:text-red-700" aria-label="Remove question">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-textMuted">Type</label>
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
                    className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-textMuted">Question text</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                    className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                    placeholder="Enter the question"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-textMuted">Question image URL (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={q.questionImage || ""}
                      onChange={(e) => updateQuestion(qIdx, { questionImage: e.target.value })}
                      className="flex-1 rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                      placeholder="https://..."
                    />
                    {q.questionImage && (
                      <img src={q.questionImage} alt="" className="h-10 w-10 rounded object-cover" onError={(e) => e.target.style.display = "none"} />
                    )}
                  </div>
                </div>
                {q.type === "review" && q.reviewType === "scale" && (
                  <p className="text-xs text-textMuted">Rating 1–5 is used. Students pick one option.</p>
                )}
                {q.type !== "review" && (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-textMuted">Options</label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => addOption(qIdx)}>+ Option</Button>
                    </div>
                    <ul className="space-y-2">
                      {(q.options || []).map((opt, oIdx) => (
                        <li key={oIdx} className="flex flex-wrap items-center gap-2 rounded-lg border border-brintelli-border/60 bg-brintelli-baseAlt/30 p-2">
                          {q.type === "quiz" && (
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctIndex === oIdx}
                              onChange={() => updateQuestion(qIdx, { correctIndex: oIdx })}
                              className="rounded-full"
                              aria-label={`Correct answer: option ${oIdx + 1}`}
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
                              className="rounded"
                              aria-label={`Correct answer: option ${oIdx + 1}`}
                            />
                          )}
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(qIdx, oIdx, "text", e.target.value)}
                            className="min-w-[120px] flex-1 rounded border border-brintelli-border px-2 py-1 text-sm"
                            placeholder="Option text"
                          />
                          <span className="text-xs text-textMuted">or image URL:</span>
                          <input
                            type="url"
                            value={opt.image || ""}
                            onChange={(e) => updateOption(qIdx, oIdx, "image", e.target.value)}
                            className="min-w-[140px] flex-1 rounded border border-brintelli-border px-2 py-1 text-sm"
                            placeholder="https://..."
                          />
                          {opt.image && <img src={opt.image} alt="" className="h-8 w-8 rounded object-cover" onError={(e) => e.target.style.display = "none"} />}
                          {(q.options?.length || 0) > 1 && (
                            <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-red-600 hover:text-red-700" aria-label="Remove option">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {q.type === "review" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-textMuted">Review kind</label>
                    <select
                      value={q.reviewType || "scale"}
                      onChange={(e) => {
                        const reviewType = e.target.value;
                        updateQuestion(qIdx, {
                          reviewType,
                          options: reviewType === "scale" ? [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }] : [],
                        });
                      }}
                      className="rounded-lg border border-brintelli-border px-3 py-2 text-sm"
                    >
                      <option value="scale">Rating 1–5</option>
                      <option value="freetext">Free text feedback</option>
                    </select>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
