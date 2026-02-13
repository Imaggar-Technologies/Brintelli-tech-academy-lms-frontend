import { useAssessment } from '../../contexts/AssessmentContext';
import Button from '../Button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  SkipForward, 
  RotateCcw,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const NavigationControls = ({ onNext, onPrevious, onSubmit }) => {
  const {
    currentQuestionIndex,
    questions,
    currentQuestion,
    questionStates,
    handleSaveAndNext,
    handleMarkForReview,
    handleSkip,
    handleClearResponse,
    navigateToQuestion,
  } = useAssessment();

  const questionState = currentQuestion 
    ? (questionStates[currentQuestion.id] || {
        selectedAnswers: [],
        isMarkedForReview: false,
        isVisited: false,
        isAnswered: false,
      })
    : null;

  const hasSelection = questionState?.selectedAnswers?.length > 0;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    } else if (onNext) {
      onNext();
    }
  };

  const handleSaveNext = () => {
    if (hasSelection) {
      handleSaveAndNext();
      toast.success('Answer saved');
    } else {
      toast.error('Please select an answer before saving');
    }
  };

  const handleMarkReview = () => {
    handleMarkForReview();
    const isMarked = !questionState?.isMarkedForReview;
    toast.success(isMarked ? 'Question marked for review' : 'Review mark removed');
  };

  const handleSkipQuestion = () => {
    handleSkip();
    toast.info('Question skipped');
  };

  const handleClear = () => {
    handleClearResponse();
    toast.success('Response cleared');
  };

  return (
    <div className="flex flex-col gap-3 pt-6 border-t border-gray-200">
      {/* Primary Actions */}
      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={isLastQuestion}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleSaveNext}
          disabled={!hasSelection}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4" />
          Save & Next
        </Button>

        <Button
          onClick={handleMarkReview}
          variant={questionState?.isMarkedForReview ? 'primary' : 'ghost'}
          className={`flex items-center justify-center gap-2 ${
            questionState?.isMarkedForReview 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : ''
          }`}
        >
          <Bookmark className="h-4 w-4" />
          {questionState?.isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
        </Button>

        <Button
          onClick={handleSkipQuestion}
          variant="ghost"
          className="flex items-center justify-center gap-2"
        >
          <SkipForward className="h-4 w-4" />
          Skip
        </Button>

        <Button
          onClick={handleClear}
          variant="ghost"
          disabled={!hasSelection}
          className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Response
        </Button>
      </div>

      {/* Submit Button (only on last question) */}
      {isLastQuestion && onSubmit && (
        <Button
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
        >
          Submit Assessment
        </Button>
      )}
    </div>
  );
};

export default NavigationControls;

