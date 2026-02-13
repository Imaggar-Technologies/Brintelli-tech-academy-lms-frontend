import { useAssessment } from '../../contexts/AssessmentContext';
import { CheckCircle2, Circle, Bookmark, AlertCircle } from 'lucide-react';

const QuestionPalette = ({ section = 'mcq' }) => {
  const { 
    questions, 
    mcqQuestions, 
    codingQuestions,
    activeSection,
    currentQuestionIndex, 
    navigateToQuestion, 
    getQuestionStatus 
  } = useAssessment();
  
  // Get questions for the active section
  const sectionQuestions = activeSection === 'mcq' ? mcqQuestions : codingQuestions;

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 border-green-600 text-white';
      case 'marked':
        return 'bg-purple-500 border-purple-600 text-white';
      case 'visited':
        return 'bg-yellow-500 border-yellow-600 text-white';
      case 'not-visited':
        return 'bg-gray-300 border-gray-400 text-gray-700';
      default:
        return 'bg-gray-300 border-gray-400 text-gray-700';
    }
  };

  const getStatusIcon = (status, isCurrent) => {
    if (isCurrent) {
      return <Circle className="h-3 w-3" />;
    }
    switch (status) {
      case 'answered':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'marked':
        return <Bookmark className="h-3 w-3" />;
      case 'visited':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Question Navigation
        </h3>
        <div className="text-xs text-gray-500 mb-3">
          {sectionQuestions.length} Questions
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {sectionQuestions.map((question, index) => {
          const status = getQuestionStatus(question.id);
          const isCurrent = index === currentQuestionIndex;
          
          return (
            <button
              key={question.id}
              onClick={() => navigateToQuestion(index)}
              className={`
                h-10 rounded-lg border-2 text-xs font-medium transition-all duration-200
                flex items-center justify-center gap-1
                ${isCurrent 
                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 z-10' 
                  : 'hover:scale-105'
                }
                ${getStatusColor(status)}
              `}
              title={`Question ${index + 1}: ${status}`}
            >
              {getStatusIcon(status, isCurrent)}
              <span>{index + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Legend:</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border border-green-600"></div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500 border border-purple-600"></div>
            <span className="text-gray-600">Marked for Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500 border border-yellow-600"></div>
            <span className="text-gray-600">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300 border border-gray-400"></div>
            <span className="text-gray-600">Not Visited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;

