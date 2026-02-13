import { useAssessment } from '../../contexts/AssessmentContext';
import QuestionPanel from './QuestionPanel';
import QuestionPalette from './QuestionPalette';
import NavigationControls from './NavigationControls';
import Button from '../Button';
import { FileText, Code } from 'lucide-react';
import { useEffect } from 'react';

const AssessmentLayout = ({ 
  questions = [], 
  currentSection = 'mcq',
  onSectionChange,
  onSubmit,
  onNextSection,
  onPreviousSection 
}) => {
  const { setCurrentQuestionIndex } = useAssessment();

  // Reset to first question when section changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [currentSection, setCurrentQuestionIndex]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Question Palette */}
        <div className="col-span-3 space-y-4">
          {/* Section Switcher */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Button
              variant={currentSection === 'mcq' ? 'primary' : 'ghost'}
              onClick={() => onSectionChange && onSectionChange('mcq')}
              className="w-full mb-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              MCQ ({questions.filter(q => q.type !== 'coding').length || questions.length})
            </Button>
            <Button
              variant={currentSection === 'coding' ? 'primary' : 'ghost'}
              onClick={() => onSectionChange && onSectionChange('coding')}
              className="w-full"
            >
              <Code className="h-4 w-4 mr-2" />
              Coding ({questions.filter(q => q.type === 'coding').length || 0})
            </Button>
          </div>

          {/* Question Palette */}
          <QuestionPalette section={currentSection} />

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Submit Assessment
          </Button>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-6">
          <QuestionPanel />
          <NavigationControls 
            onNext={onNextSection}
            onPrevious={onPreviousSection}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default AssessmentLayout;

