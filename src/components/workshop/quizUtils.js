export const QUESTION_TYPES = [
  { value: "quiz", label: "Single choice (one correct answer)" },
  { value: "quiz-multi", label: "Multiple choice (multiple correct answers)" },
  { value: "poll", label: "Poll (multiple choice, no correct answer)" },
  { value: "review", label: "Review (rating 1–5 or free text)" },
];

export const emptyOption = () => ({ text: "", image: "" });

export const emptyQuestion = () => ({
  type: "quiz",
  question: "",
  questionImage: "",
  options: [{ ...emptyOption() }, { ...emptyOption() }],
  correctIndex: 0,
  correctIndices: [],
  reviewType: "scale",
  published: false,
  closed: false,
});

export function normalizeOptions(q) {
  const opts = q.options || [];
  return opts.map((o) =>
    typeof o === "object" && o != null ? { text: o.text || "", image: o.image || "" } : { text: String(o), image: "" }
  );
}

export function normalizeQuestion(q) {
  const type = q.type || "quiz";
  let options = normalizeOptions(q);
  if (type === "review" && options.length === 0)
    options = [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }];
  if (options.length < 2 && type !== "review") options = [emptyOption(), emptyOption()];
  const isMulti = type === "quiz-multi";
  const correctIndices =
    isMulti && Array.isArray(q.correctIndices)
      ? q.correctIndices.filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < options.length)
      : isMulti && q.correctIndex != null
        ? [Math.max(0, Math.min(q.correctIndex, options.length - 1))]
        : [];
  const correctIndex =
    !isMulti && q.correctIndex != null ? Math.max(0, Math.min(q.correctIndex, options.length - 1)) : 0;
  return {
    type,
    question: q.question || q.text || "",
    questionImage: q.questionImage || "",
    options,
    correctIndex,
    correctIndices,
    reviewType: q.reviewType || "scale",
    published: q && Object.prototype.hasOwnProperty.call(q, "published") ? q.published === true : true,
    closed: q && Object.prototype.hasOwnProperty.call(q, "closed") ? q.closed === true : false,
  };
}
