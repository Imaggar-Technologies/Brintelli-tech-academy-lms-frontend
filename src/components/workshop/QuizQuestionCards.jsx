import React, { useState } from "react";
import Button from "../Button";
import { Plus, Pencil, Trash2, CheckSquare, Square } from "lucide-react";
import { QUESTION_TYPES, normalizeQuestion } from "./quizUtils";

const typeLabel = (value) => QUESTION_TYPES.find((t) => t.value === value)?.label || value;

export default function QuizQuestionCards({
  questions = [],
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onPublishQuestion,
  onUnpublishQuestion,
  onPublishAll,
  onUnpublishAll,
  onPublishSelected,
  onUnpublishSelected,
}) {
  const list = (questions || []).map((q, i) => ({ ...normalizeQuestion(q), index: i }));
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelect = (index) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(list.map((_, i) => i)));
  const clearSelection = () => setSelectedIds(new Set());

  const handlePublishSelected = () => {
    if (onPublishSelected && selectedIds.size > 0) {
      onPublishSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };
  const handleUnpublishSelected = () => {
    if (onUnpublishSelected && selectedIds.size > 0) {
      onUnpublishSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-textSoft">Questions</h4>
        <Button type="button" size="sm" variant="secondary" onClick={onAddQuestion} className="gap-1">
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>

      {list.length > 0 && (onPublishAll || onUnpublishAll || onPublishSelected) && (
        <div className="flex flex-wrap items-center gap-2 py-2 border-b border-brintelli-border/60">
          {onPublishAll && (
            <Button type="button" size="sm" variant="secondary" onClick={onPublishAll} className="h-8 text-xs">
              Publish all
            </Button>
          )}
          {onUnpublishAll && (
            <Button type="button" size="sm" variant="ghost" onClick={onUnpublishAll} className="h-8 text-xs">
              Unpublish all
            </Button>
          )}
          {onPublishSelected && (
            <>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-brand-600 hover:underline flex items-center gap-1"
              >
                <CheckSquare className="h-3.5 w-3.5" /> Select all
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-textMuted hover:underline flex items-center gap-1"
              >
                <Square className="h-3.5 w-3.5" /> Clear
              </button>
              {selectedIds.size > 0 && (
                <>
                  <span className="text-xs text-textMuted">({selectedIds.size} selected)</span>
                  <Button type="button" size="sm" variant="secondary" className="h-8 text-xs" onClick={handlePublishSelected}>
                    Publish selected
                  </Button>
                  {onUnpublishSelected && (
                    <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={handleUnpublishSelected}>
                      Unpublish selected
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

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
                <div className="flex items-center gap-2 min-w-0">
                  {onPublishSelected != null && (
                    <button
                      type="button"
                      onClick={() => toggleSelect(index)}
                      className="shrink-0 p-1 rounded text-textMuted hover:bg-brintelli-baseAlt/50"
                      aria-label={selectedIds.has(index) ? "Deselect" : "Select"}
                    >
                      {selectedIds.has(index) ? (
                        <CheckSquare className="h-5 w-5 text-brand-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  )}
                  <span className="text-xs font-medium text-textMuted">Question {index + 1}</span>
                </div>
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
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
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
              {onPublishQuestion && onUnpublishQuestion && (
                <div className="mt-auto pt-2 border-t border-brintelli-border/60">
                  {published ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnpublishQuestion(index)}
                      className="w-full text-xs text-textMuted hover:text-text"
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onPublishQuestion(index)}
                      className="w-full text-xs"
                    >
                      Publish
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
