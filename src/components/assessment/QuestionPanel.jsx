import { useAssessment } from '../../contexts/AssessmentContext';
import { Radio, CheckSquare, Bookmark } from 'lucide-react';
import CodingQuestionPanel from './CodingQuestionPanel';

const QuestionPanel = ({ onRunCode, onSubmitCode }) => {
  const { 
    currentQuestion, 
    questionStates, 
    handleOptionSelect, 
    handleMultiSelect 
  } = useAssessment();

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">No question available</p>
      </div>
    );
  }

  // For coding questions, we don't render the full panel here
  // The layout handles splitting problem and editor
  if (currentQuestion.type === 'coding') {
    return null; // ProblemPanel is rendered separately in AssessmentLayout
  }

  const questionState = questionStates[currentQuestion.id] || {
    selectedAnswers: [],
    isMarkedForReview: false,
    isVisited: false,
    isAnswered: false,
  };

  const isMultipleChoice = currentQuestion.type === 'multiple' || currentQuestion.allowMultiple;
  const selectedAnswers = questionState.selectedAnswers || [];

  const handleSelect = (optionValue) => {
    if (isMultipleChoice) {
      handleMultiSelect(currentQuestion.id, optionValue);
    } else {
      handleOptionSelect(currentQuestion.id, optionValue);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Question {currentQuestion.questionNumber || currentQuestion.id}
            </span>
            {isMultipleChoice && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                Multiple Choice
              </span>
            )}
            {questionState.isMarkedForReview && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                Marked for Review
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {isMultipleChoice ? 'Select all that apply' : 'Select one option'}
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options?.map((option, index) => {
          const isSelected = selectedAnswers.includes(option.value);
          const OptionIcon = isMultipleChoice ? CheckSquare : Radio;

          return (
            <label
              key={option.value || index}
              className={`
                flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="mt-0.5">
                <input
                  type={isMultipleChoice ? 'checkbox' : 'radio'}
                  name={`question-${currentQuestion.id}`}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleSelect(option.value)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 rounded flex items-center justify-center transition-colors
                  ${isSelected
                    ? isMultipleChoice 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-blue-600 border-blue-600'
                    : 'border-2 border-gray-300 bg-white'
                  }
                `}>
                  {isSelected && (
                    <OptionIcon className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-gray-900 font-medium">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionPanel;

