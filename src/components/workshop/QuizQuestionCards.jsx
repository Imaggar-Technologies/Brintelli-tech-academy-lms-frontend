import React from "react";
import Button from "../Button";
import { Plus, Pencil, Trash2, Eye, EyeOff, StopCircle, PlayCircle } from "lucide-react";
import { QUESTION_TYPES, normalizeQuestion } from "./quizUtils";

const typeLabel = (value) => QUESTION_TYPES.find((t) => t.value === value)?.label || value;

function optionText(opt) {
  return typeof opt === "object" && opt != null ? (opt.text || "") : String(opt);
}

/** For quiz/quiz-multi: return label for correct answer(s) */
function correctAnswerLabel(q) {
  const type = q.type || "quiz";
  const opts = q.options || [];
  if (type === "quiz") {
    const idx = q.correctIndex;
    if (idx == null || idx < 0 || idx >= opts.length) return "—";
    return optionText(opts[idx]) || `Option ${idx + 1}`;
  }
  if (type === "quiz-multi") {
    const indices = Array.isArray(q.correctIndices) ? q.correctIndices : [];
    if (indices.length === 0) return "—";
    const texts = indices
      .filter((i) => i >= 0 && i < opts.length)
      .map((i) => optionText(opts[i]) || `Option ${i + 1}`);
    return texts.length ? texts.join(", ") : "—";
  }
  return null;
}

export default function QuizQuestionCards({
  questions = [],
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onTogglePublish,
  onToggleStop,
  listView = true,
}) {
  const list = (questions || []).map((q, i) => ({ ...normalizeQuestion(q), index: i }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-textSoft">Questions</h4>
        <Button type="button" size="sm" variant="secondary" onClick={onAddQuestion} className="gap-1">
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-textMuted py-4">No questions yet. Add a question to build the quiz, poll, or review.</p>
      ) : listView ? (
        <ul className="space-y-2">
          {list.map(({ index, type, question, options, correctIndex, correctIndices, published, closed }) => {
            const correctLabel = correctAnswerLabel({ type, options, correctIndex, correctIndices });
            return (
              <li
                key={index}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-brintelli-border/80 bg-white p-3 sm:p-4 hover:border-brand-500/40 transition-colors"
              >
                <span className="text-sm font-medium text-textMuted w-8 shrink-0">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text line-clamp-2">{question || "(No question text)"}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brintelli-baseAlt/60 text-textSoft">
                      {typeLabel(type)}
                    </span>
                    {published ? (
                      closed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <StopCircle className="h-3 w-3" /> Stopped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Eye className="h-3 w-3" /> Published
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                    {(type === "quiz" || type === "quiz-multi") && (
                      <span className="text-xs text-green-700 font-medium">
                        Correct: {correctLabel}
                      </span>
                    )}
                    <span className="text-xs text-textMuted">{Array.isArray(options) ? options.length : 0} options</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {onTogglePublish && (
                    <button
                      type="button"
                      onClick={() => onTogglePublish(index)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${published ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-amber-700 bg-amber-50 hover:bg-amber-100"}`}
                      aria-label={published ? "Unpublish question" : "Publish question"}
                      title={published ? "Unpublish (hide from learners)" : "Publish (show to learners)"}
                    >
                      {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{published ? "Published" : "Publish"}</span>
                    </button>
                  )}
                  {onToggleStop && published && (
                    <button
                      type="button"
                      onClick={() => onToggleStop(index)}
                      className={`p-1.5 rounded ${closed ? "text-red-600 hover:bg-red-50" : "text-gray-500 hover:bg-gray-100"}`}
                      aria-label={closed ? "Reopen for answers" : "Stop (close for answers)"}
                      title={closed ? "Reopen so learners can answer" : "Stop — learners cannot answer this question"}
                    >
                      {closed ? <PlayCircle className="h-4 w-4" /> : <StopCircle className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEditQuestion(index)}
                    className="p-1.5 rounded text-textMuted hover:bg-brintelli-baseAlt/50 hover:text-text"
                    aria-label="Edit question"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(index)}
                    className="p-1.5 rounded text-textMuted hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ index, type, question, options, published, closed }) => (
            <div
              key={index}
              className="rounded-xl border-2 border-brintelli-border bg-white p-4 transition-colors flex flex-col min-h-0"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-textMuted">Question {index + 1}</span>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {onTogglePublish && (
                    <button
                      type="button"
                      onClick={() => onTogglePublish(index)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${published ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-amber-700 bg-amber-50 hover:bg-amber-100"}`}
                      aria-label={published ? "Unpublish question" : "Publish question"}
                      title={published ? "Unpublish" : "Publish (show to learners)"}
                    >
                      {published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      <span>{published ? "Published" : "Publish"}</span>
                    </button>
                  )}
                  {onToggleStop && published && (
                    <button
                      type="button"
                      onClick={() => onToggleStop(index)}
                      className={`p-1.5 rounded ${closed ? "text-red-600 hover:bg-red-50" : "text-gray-500 hover:bg-gray-100"}`}
                      aria-label={closed ? "Reopen for answers" : "Stop"}
                      title={closed ? "Reopen" : "Stop (close for answers)"}
                    >
                      {closed ? <PlayCircle className="h-4 w-4" /> : <StopCircle className="h-4 w-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEditQuestion(index)}
                    className="p-1.5 rounded text-textMuted hover:bg-brintelli-baseAlt/50 hover:text-text"
                    aria-label="Edit question"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(index)}
                    className="p-1.5 rounded text-textMuted hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-text line-clamp-2 flex-1 mb-2">
                {question || "(No question text)"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brintelli-baseAlt/60 text-textSoft">
                  {typeLabel(type)}
                </span>
                {published ? (
                  closed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Stopped</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Published</span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Draft</span>
                )}
                <span className="text-xs text-textMuted">{Array.isArray(options) ? options.length : 0} options</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
