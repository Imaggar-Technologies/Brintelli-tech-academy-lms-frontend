import { useState, useRef, useEffect } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';
import ProblemPanel from './ProblemPanel';
import EditorPanel from './EditorPanel';

const CodingQuestionPanel = ({ onRunCode, onSubmitCode }) => {
  const { currentQuestion, questionStates } = useAssessment();
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const resizeRef = useRef(null);

  if (!currentQuestion || currentQuestion.type !== 'coding') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-500">No coding question available</p>
      </div>
    );
  }

  const questionState = questionStates[currentQuestion.id] || {
    code: currentQuestion.starterCode || '',
    language: currentQuestion.language || 'javascript',
    customInput: '',
    runResult: undefined,
  };

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain between 30% and 70%
      const constrainedWidth = Math.max(30, Math.min(70, newWidth));
      setLeftPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  return (
    <div 
      ref={containerRef}
      className="flex h-full bg-gray-50 overflow-hidden"
    >
      {/* Left Panel - Problem */}
      <div 
        className="bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0"
        style={{ width: `${leftPanelWidth}%`, minWidth: '300px', maxWidth: '70%' }}
      >
        <ProblemPanel question={currentQuestion} />
      </div>

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleResizeStart}
        className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors ${
          isResizing ? 'bg-blue-500' : ''
        }`}
      />

      {/* Right Panel - Editor */}
      <div 
        className="bg-white overflow-hidden flex flex-col flex-1"
        style={{ minWidth: '400px' }}
      >
        <EditorPanel 
          question={currentQuestion}
          questionState={questionState}
          onRunCode={onRunCode}
          onSubmitCode={onSubmitCode}
        />
      </div>
    </div>
  );
};

export default CodingQuestionPanel;

