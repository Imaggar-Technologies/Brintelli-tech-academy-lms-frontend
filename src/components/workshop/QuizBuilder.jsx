import React, { useState } from "react";
import Button from "../Button";
import { Plus, Trash2, Upload, CheckSquare, Square } from "lucide-react";
import {
  QUESTION_TYPES,
  emptyOption,
  emptyQuestion,
  normalizeQuestion,
} from "./quizUtils";

export default function QuizBuilder({ quiz, onChange, onUploadFile }) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions.map(normalizeQuestion) : [];
  const title = quiz?.title ?? "Workshop Quiz";
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [uploadingFor, setUploadingFor] = useState(null); // { qIdx, kind: 'question' | 'option', oIdx }

  const setTitle = (t) => onChange({ ...quiz, title: t });
  const setQuestions = (qList) => onChange({ ...quiz, questions: qList });

  const toggleSelect = (qIdx) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qIdx)) next.delete(qIdx);
      else next.add(qIdx);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(questions.map((_, i) => i)));
  const clearSelection = () => setSelectedIds(new Set());
  const publishSelected = (published) => {
    const next = questions.map((q, i) => (selectedIds.has(i) ? { ...q, published } : q));
    setQuestions(next);
    setSelectedIds(new Set());
  };

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

  const handleUpload = (qIdx, kind, oIdx, file) => {
    if (!onUploadFile || !file) return;
    const key = kind === "question" ? `q-${qIdx}` : `q-${qIdx}-o-${oIdx}`;
    setUploadingFor(key);
    Promise.resolve(onUploadFile(file, "workshop-quiz"))
      .then((res) => {
        if (res?.success && res?.data?.url) {
          if (kind === "question") updateQuestion(qIdx, { questionImage: res.data.url });
          else updateOption(qIdx, oIdx, "image", res.data.url);
        }
      })
      .finally(() => setUploadingFor(null));
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-textSoft">Questions</h4>
        <Button type="button" size="sm" variant="secondary" onClick={addQuestion} className="gap-1">
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>

      {questions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-2 border-b border-brintelli-border/60 mb-4">
          <button type="button" onClick={selectAll} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" /> Select all
          </button>
          <button type="button" onClick={clearSelection} className="text-xs text-textMuted hover:underline flex items-center gap-1">
            <Square className="h-3.5 w-3.5" /> Clear
          </button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-textMuted">({selectedIds.size} selected)</span>
              <Button type="button" size="sm" variant="secondary" className="h-7 text-xs" onClick={() => publishSelected(true)}>
                Publish selected
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => publishSelected(false)}>
                Unpublish selected
              </Button>
            </>
          )}
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-sm text-textMuted py-4">No questions yet. Add a question to build the quiz, poll, or review.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className={`rounded-xl border-2 p-4 transition-colors ${q.published ? "border-brand-500/50 bg-brand-50/30" : "border-brintelli-border bg-white"}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelect(qIdx)}
                    className="shrink-0 p-1 rounded text-textMuted hover:bg-brintelli-baseAlt/50"
                    aria-label={selectedIds.has(qIdx) ? "Deselect" : "Select"}
                  >
                    {selectedIds.has(qIdx) ? <CheckSquare className="h-5 w-5 text-brand-600" /> : <Square className="h-5 w-5" />}
                  </button>
                  <span className="text-xs font-medium text-textMuted">Question {qIdx + 1}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.published}
                      onChange={(e) => updateQuestion(qIdx, { published: e.target.checked })}
                      className="rounded border-brintelli-border"
                    />
                    <span className="text-xs text-textSoft">Published</span>
                  </label>
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
                    className="rounded border border-brintelli-border/60 bg-white px-2 py-1 text-xs text-textMuted focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-textMuted hover:text-red-600 p-1 shrink-0" aria-label="Remove question">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm font-medium bg-white"
                  placeholder="Enter the question"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                {q.questionImage && (
                  <img src={q.questionImage} alt="" className="max-h-40 rounded-lg object-contain border border-brintelli-border/40" onError={(e) => e.target.style.display = "none"} />
                )}
                {onUploadFile && (
                  <label className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-brintelli-border bg-white text-xs font-medium text-text cursor-pointer hover:bg-brintelli-baseAlt/30">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingFor === `q-${qIdx}` ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingFor === `q-${qIdx}`}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(qIdx, "question", null, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
                <input
                  type="url"
                  value={q.questionImage || ""}
                  onChange={(e) => updateQuestion(qIdx, { questionImage: e.target.value })}
                  className="flex-1 min-w-[140px] rounded border border-brintelli-border/60 px-2 py-1.5 text-xs text-textMuted placeholder:text-textMuted bg-white/80"
                  placeholder="Or paste image URL"
                />
              </div>

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
                        className="flex items-start gap-3 rounded-lg border border-brintelli-border/60 p-2 hover:bg-brintelli-baseAlt/30"
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
                        {onUploadFile && (
                          <label className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-brintelli-border/60 bg-white text-xs cursor-pointer hover:bg-brintelli-baseAlt/30">
                            <Upload className="h-3 w-3" />
                            {uploadingFor === `q-${qIdx}-o-${oIdx}` ? "…" : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingFor === `q-${qIdx}-o-${oIdx}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(qIdx, "option", oIdx, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                        <input
                          type="url"
                          value={opt.image || ""}
                          onChange={(e) => updateOption(qIdx, oIdx, "image", e.target.value)}
                          className="w-28 rounded border border-brintelli-border/40 px-2 py-1 text-xs text-textMuted placeholder:text-textMuted bg-white"
                          placeholder="URL"
                        />
                        {(q.options?.length || 0) > 1 && (
                          <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-textMuted hover:text-red-600 p-1 shrink-0" aria-label="Remove option">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
