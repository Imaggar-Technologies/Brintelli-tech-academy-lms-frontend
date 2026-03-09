import React from "react";
import Button from "../Button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { QUESTION_TYPES, normalizeQuestion } from "./quizUtils";

const typeLabel = (value) => QUESTION_TYPES.find((t) => t.value === value)?.label || value;

export default function QuizQuestionCards({ questions = [], onAddQuestion, onEditQuestion, onDeleteQuestion }) {
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
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ index, type, question, published, options }) => (
            <div
              key={index}
              className={`rounded-xl border-2 p-4 transition-colors flex flex-col min-h-0 ${
                published ? "border-brand-500/50 bg-brand-50/30" : "border-brintelli-border bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-textMuted">Question {index + 1}</span>
                <div className="flex items-center gap-1 shrink-0">
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
                {published && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700">
                    Published
                  </span>
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
