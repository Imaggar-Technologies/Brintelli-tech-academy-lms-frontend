import React, { useState, useEffect } from "react";
import Button from "../Button";
import Modal from "../Modal";
import { Trash2, Upload } from "lucide-react";
import {
  QUESTION_TYPES,
  emptyOption,
  emptyQuestion,
  normalizeQuestion,
} from "./quizUtils";

export default function QuestionEditModal({ isOpen, onClose, question: initialQuestion, onSave, onUploadFile }) {
  const [q, setQ] = useState(() =>
    normalizeQuestion(initialQuestion != null ? initialQuestion : emptyQuestion())
  );
  const [uploadingFor, setUploadingFor] = useState(null);

  useEffect(() => {
    if (isOpen)
      setQ(normalizeQuestion(initialQuestion != null ? initialQuestion : emptyQuestion()));
  }, [isOpen, initialQuestion]);

  const updateQ = (upd) => setQ((prev) => ({ ...prev, ...upd }));

  const setType = (type) => {
    let opts = q.options;
    if (type === "review") opts = [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }];
    if (type === "poll")
      updateQ({ type, options: opts, correctIndex: undefined, correctIndices: [] });
    else if (type === "quiz-multi")
      updateQ({
        type,
        options: opts,
        correctIndices: q.correctIndex != null ? [q.correctIndex] : q.correctIndices || [],
        correctIndex: undefined,
      });
    else
      updateQ({
        type,
        options: opts,
        correctIndex:
          Array.isArray(q.correctIndices) && q.correctIndices.length ? q.correctIndices[0] : q.correctIndex ?? 0,
        correctIndices: [],
      });
  };

  const addOption = () => updateQ({ options: [...(q.options || []), emptyOption()] });
  const removeOption = (oIdx) => {
    const opts = (q.options || []).filter((_, i) => i !== oIdx);
    const nextOpts = opts.length ? opts : [emptyOption()];
    if (q.type === "quiz-multi") {
      const correctIndices = (q.correctIndices || [])
        .filter((i) => i !== oIdx)
        .map((i) => (i > oIdx ? i - 1 : i));
      updateQ({ options: nextOpts, correctIndices });
    } else {
      const correctIndex =
        q.correctIndex === oIdx ? 0 : q.correctIndex > oIdx ? q.correctIndex - 1 : q.correctIndex;
      updateQ({ options: nextOpts, correctIndex });
    }
  };
  const updateOption = (oIdx, field, value) => {
    const opts = [...(q.options || [])];
    if (!opts[oIdx]) return;
    opts[oIdx] = { ...opts[oIdx], [field]: value };
    updateQ({ options: opts });
  };

  const handleUpload = async (kind, oIdx, file) => {
    if (!onUploadFile || !file) return;
    const key = kind === "question" ? "question" : `option-${oIdx}`;
    setUploadingFor(key);
    try {
      const res = await onUploadFile(file, "workshop-quiz");
      if (res?.success && res?.data?.url) {
        if (kind === "question") updateQ({ questionImage: res.data.url });
        else updateOption(oIdx, "image", res.data.url);
      }
    } finally {
      setUploadingFor(null);
    }
  };

  const handleSave = () => {
    onSave(normalizeQuestion(q));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuestion == null ? "Add question" : "Edit question"}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={q.type}
            onChange={(e) => setType(e.target.value)}
            className="rounded border border-brintelli-border/60 bg-white px-2 py-1 text-xs text-textMuted focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            value={q.question}
            onChange={(e) => updateQ({ question: e.target.value })}
            className="w-full rounded-lg border border-brintelli-border px-3 py-2 text-sm font-medium bg-white"
            placeholder="Enter the question"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {q.questionImage && (
            <img
              src={q.questionImage}
              alt=""
              className="max-h-40 rounded-lg object-contain border border-brintelli-border/40"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          {onUploadFile && (
            <label className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-brintelli-border bg-white text-xs font-medium text-text cursor-pointer hover:bg-brintelli-baseAlt/30">
              <Upload className="h-3.5 w-3.5" />
              {uploadingFor === "question" ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingFor === "question"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload("question", null, file);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          <input
            type="url"
            value={q.questionImage || ""}
            onChange={(e) => updateQ({ questionImage: e.target.value })}
            className="flex-1 min-w-[140px] rounded border border-brintelli-border/60 px-2 py-1.5 text-xs text-textMuted placeholder:text-textMuted bg-white/80"
            placeholder="Or paste image URL"
          />
        </div>

        {q.type === "review" && q.reviewType === "scale" && (
          <p className="text-xs text-textMuted">Rating 1–5. Learners pick one option.</p>
        )}
        {q.type === "review" && (
          <div>
            <select
              value={q.reviewType || "scale"}
              onChange={(e) => {
                const reviewType = e.target.value;
                updateQ({
                  reviewType,
                  options:
                    reviewType === "scale"
                      ? [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }]
                      : [],
                });
              }}
              className="rounded-lg border border-brintelli-border px-3 py-2 text-sm bg-white"
            >
              <option value="scale">Rating 1–5</option>
              <option value="freetext">Free text feedback</option>
            </select>
          </div>
        )}

        {q.type !== "review" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-textSoft">
                {q.type === "quiz"
                  ? "Options — select the correct answer (single choice)"
                  : q.type === "quiz-multi"
                    ? "Options — select all correct answers (multiple choice)"
                    : "Options"}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={addOption} className="h-7 text-xs">
                + Option
              </Button>
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
                      name="correct-single"
                      checked={q.correctIndex === oIdx}
                      onChange={() => updateQ({ correctIndex: oIdx })}
                      className="mt-1 shrink-0"
                      aria-label={`Correct: option ${oIdx + 1}`}
                      title="Select as correct answer"
                    />
                  )}
                  {q.type === "quiz-multi" && (
                    <input
                      type="checkbox"
                      checked={(q.correctIndices || []).includes(oIdx)}
                      onChange={() => {
                        const prev = q.correctIndices || [];
                        const next = prev.includes(oIdx)
                          ? prev.filter((i) => i !== oIdx)
                          : [...prev, oIdx].sort((a, b) => a - b);
                        updateQ({ correctIndices: next });
                      }}
                      className="mt-1 shrink-0 rounded"
                      aria-label={`Correct: option ${oIdx + 1}`}
                      title="Select as correct answer"
                    />
                  )}
                  <span className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
                    {opt.image && (
                      <img
                        src={opt.image}
                        alt=""
                        className="max-h-16 rounded object-contain shrink-0"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(oIdx, "text", e.target.value)}
                      className="flex-1 min-w-0 text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-textMuted"
                      placeholder={opt.image ? "" : "Option text"}
                    />
                  </span>
                  {onUploadFile && (
                    <label className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-brintelli-border/60 bg-white text-xs cursor-pointer hover:bg-brintelli-baseAlt/30">
                      <Upload className="h-3 w-3" />
                      {uploadingFor === `option-${oIdx}` ? "…" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingFor === `option-${oIdx}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload("option", oIdx, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  <input
                    type="url"
                    value={opt.image || ""}
                    onChange={(e) => updateOption(oIdx, "image", e.target.value)}
                    className="w-28 rounded border border-brintelli-border/40 px-2 py-1 text-xs text-textMuted placeholder:text-textMuted bg-white"
                    placeholder="URL"
                  />
                  {(q.options?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(oIdx)}
                      className="text-textMuted hover:text-red-600 p-1 shrink-0"
                      aria-label="Remove option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-brintelli-border space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={q.published === true}
                onChange={(e) => updateQ({ published: e.target.checked })}
                className="rounded border-brintelli-border text-brand-500 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-text">Publish</span>
            </label>
            {q.published && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={q.closed === true}
                  onChange={(e) => updateQ({ closed: e.target.checked })}
                  className="rounded border-brintelli-border text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-text">Stop (close for answers)</span>
              </label>
            )}
          </div>
          <p className="text-xs text-textMuted">
            {!q.published && "Draft — learners will not see this question until you publish it."}
            {q.published && !q.closed && "Learners can see and answer this question."}
            {q.published && q.closed && "Question is closed — learners cannot answer it."}
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save question
          </Button>
        </div>
      </div>
    </Modal>
  );
}
