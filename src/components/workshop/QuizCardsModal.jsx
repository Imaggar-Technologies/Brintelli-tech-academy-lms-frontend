import { useState } from 'react';
import {
  FileText,
  Clock,
  Target,
  Award,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import Modal from '../Modal';
import Button from '../Button';

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-700';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'Hard':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Quiz card shape: { id, title, description, questions, duration, difficulty, certification, completed, bestScore, attempts, tags }
 */
export default function QuizCardsModal({
  isOpen,
  onClose,
  title = 'MCQ Practice Hub',
  description = 'Sharpen certification fundamentals across AWS, Azure, and GCP with timed MCQ drills.',
  quizzes = [],
  onStartTest,
  showStats = true,
  showSearch = true,
  filterOptions = ['All', 'AWS', 'Azure', 'GCP'],
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredQuizzes = quizzes.filter((test) => {
    const matchesSearch =
      (test.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const cert = test.certification || test.platform || '';
    const matchesFilter = filter === 'all' || cert === filter;
    return matchesSearch && matchesFilter;
  });

  const handleStart = (test) => {
    if (onStartTest) onStartTest(test.id || test._id, test);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} size="xl">
      <div className="flex flex-col h-full -m-6">
        {/* Gradient header with close */}
        <div className="rounded-t-2xl bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-white/90 text-sm mt-1">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 max-h-[70vh]">
          {showSearch && (
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-brintelli-border bg-white pl-10 pr-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-textMuted" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-xl border border-brintelli-border bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                >
                  {filterOptions.map((opt) => (
                    <option key={opt} value={opt === 'All' ? 'all' : opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {showStats && quizzes.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/30 p-3">
                <p className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Total Tests</p>
                <p className="mt-0.5 text-lg font-bold text-text">{quizzes.length}</p>
                <FileText className="h-6 w-6 text-brand-500 opacity-20 mt-1" />
              </div>
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/30 p-3">
                <p className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Completed</p>
                <p className="mt-0.5 text-lg font-bold text-text">{quizzes.filter((t) => t.completed).length}</p>
                <CheckCircle2 className="h-6 w-6 text-green-500 opacity-20 mt-1" />
              </div>
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/30 p-3">
                <p className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Best Score</p>
                <p className="mt-0.5 text-lg font-bold text-text">
                  {Math.max(...quizzes.map((t) => t.bestScore || 0), 0)}%
                </p>
                <Award className="h-6 w-6 text-amber-500 opacity-20 mt-1" />
              </div>
              <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/30 p-3">
                <p className="text-[10px] font-medium text-textMuted uppercase tracking-wide">Total Attempts</p>
                <p className="mt-0.5 text-lg font-bold text-text">{quizzes.reduce((sum, t) => sum + (t.attempts || 0), 0)}</p>
                <Target className="h-6 w-6 text-blue-500 opacity-20 mt-1" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredQuizzes.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20">
                <FileText className="h-12 w-12 text-textMuted mx-auto mb-3" />
                <p className="text-textMuted text-sm">No tests found.</p>
              </div>
            ) : (
              filteredQuizzes.map((test) => (
                <div
                  key={test.id || test._id}
                  className="group rounded-xl border border-brintelli-border bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text group-hover:text-brand-600 transition">
                          {test.title}
                        </h3>
                        {test.completed && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                        {(test.difficulty || test.difficultyLevel) && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                              test.difficulty || test.difficultyLevel
                            )}`}
                          >
                            {test.difficulty || test.difficultyLevel}
                          </span>
                        )}
                      </div>
                      {test.description && (
                        <p className="text-sm text-textMuted mb-3">{test.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-textMuted">
                        {(test.questions != null || test.questionsCount != null) && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {test.questions ?? test.questionsCount} Questions
                          </span>
                        )}
                        {(test.duration != null || test.durationMins != null) && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {test.duration ?? test.durationMins} mins
                          </span>
                        )}
                        {(test.certification || test.platform) && (
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {test.certification || test.platform}
                          </span>
                        )}
                        {test.bestScore != null && (
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            Best: {test.bestScore}%
                          </span>
                        )}
                        {test.attempts > 0 && <span>Attempts: {test.attempts}</span>}
                      </div>
                      {Array.isArray(test.tags) && test.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {test.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-brintelli-baseAlt text-xs text-textMuted"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleStart(test)}
                      className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0"
                    >
                      Start Test
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
