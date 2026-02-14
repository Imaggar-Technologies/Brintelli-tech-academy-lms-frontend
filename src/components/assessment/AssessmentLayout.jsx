import { useAssessment } from '../../contexts/AssessmentContext';
import QuestionPanel from './QuestionPanel';
import QuestionPalette from './QuestionPalette';
import NavigationControls from './NavigationControls';
import ProblemPanel from './ProblemPanel';
import EditorPanel from './EditorPanel';
import Button from '../Button';
import { FileText, Code, ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

// Coding Navigation Controls Component
const CodingNavigationControls = () => {
  const { 
    currentQuestionIndex, 
    questions, 
    navigateToQuestion 
  } = useAssessment();

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        onClick={handlePrevious}
        disabled={isFirstQuestion}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="text-sm text-gray-600">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <Button
        onClick={handleNext}
        disabled={isLastQuestion}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Next
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const AssessmentLayout = ({ 
  questions = [],
  activeSection = 'mcq',
  onSectionChange,
  onSubmit,
  onRunCode,
  onSubmitCode,
  cameraPreview,
}) => {
  const { 
    mcqQuestions, 
    codingQuestions,
    currentQuestion,
    questionStates,
    setCurrentQuestionIndex,
  } = useAssessment();

  // Reset to first question when section changes (but preserve index per section)
  useEffect(() => {
    // Don't reset - let context handle per-section indices
  }, [activeSection]);

  const currentQuestionState = currentQuestion 
    ? (questionStates[currentQuestion.id] || {})
    : null;

  // For coding questions, we need to split problem and editor
  const isCoding = activeSection === 'coding' && currentQuestion?.type === 'coding';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - Question List (15%) */}
        <div className="w-[15%] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Section Switcher */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <Button
                variant={activeSection === 'mcq' ? 'primary' : 'ghost'}
                onClick={() => onSectionChange && onSectionChange('mcq')}
                className="w-full mb-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                MCQ ({mcqQuestions.length})
              </Button>
              <Button
                variant={activeSection === 'coding' ? 'primary' : 'ghost'}
                onClick={() => onSectionChange && onSectionChange('coding')}
                className="w-full"
              >
                <Code className="h-4 w-4 mr-2" />
                Coding ({codingQuestions.length})
              </Button>
            </div>

            {/* Question Palette */}
            <QuestionPalette section={activeSection} />

            {/* Submit Button */}
            <Button
              onClick={onSubmit}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Submit Assessment
            </Button>

            {/* Camera Preview (PIP) - Below Submit Button */}
            {cameraPreview && (
              <div className="mt-4">
                {cameraPreview}
              </div>
            )}
          </div>
        </div>

        {/* CENTER - Question Display (35% for coding, flex-1 for MCQ) */}
        <div className={isCoding ? "w-[35%] flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200" : "flex-1 overflow-y-auto bg-white border-r border-gray-200"}>
          {isCoding ? (
            // For coding: Show problem panel in center with navigation
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {currentQuestion && <ProblemPanel question={currentQuestion} />}
              </div>
              {/* Coding Navigation */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <CodingNavigationControls />
              </div>
            </div>
          ) : (
            // For MCQ: Show question panel with navigation
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              <QuestionPanel />
              <NavigationControls onSubmit={onSubmit} />
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Editor (50% for coding, hidden for MCQ) */}
        {isCoding && currentQuestionState && (
          <div className="w-[50%] flex-shrink-0 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
            <EditorPanel 
              question={currentQuestion}
              questionState={currentQuestionState}
              onRunCode={onRunCode}
              onSubmitCode={onSubmitCode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentLayout;
