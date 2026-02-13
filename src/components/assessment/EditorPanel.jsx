import { useState, useRef, useEffect } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';
import { Code2, Play, Send, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../Button';

const EditorPanel = ({ question, questionState, onRunCode, onSubmitCode }) => {
  const { updateCode, updateLanguage, updateCustomInput, updateRunResult } = useAssessment();
  const [activeTab, setActiveTab] = useState('testResults');
  const [isResultPanelCollapsed, setIsResultPanelCollapsed] = useState(false);
  const [resultPanelHeight, setResultPanelHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize code from starterCode if not set
  const code = questionState.code !== undefined 
    ? questionState.code 
    : (question.starterCode || '');
  const language = questionState.language || question.language || 'javascript';
  const customInput = questionState.customInput || '';
  const runResult = questionState.runResult;

  // Update code in context if it's not set yet
  useEffect(() => {
    if (questionState.code === undefined && question.starterCode) {
      updateCode(question.id, question.starterCode);
    }
  }, [question.id, question.starterCode, questionState.code, updateCode]);

  // Handle code change
  const handleCodeChange = (e) => {
    updateCode(question.id, e.target.value);
  };

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    updateLanguage(question.id, newLanguage);
  };

  // Handle custom input change
  const handleCustomInputChange = (e) => {
    updateCustomInput(question.id, e.target.value);
  };

  // Handle run code
  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setRunning(true);
    try {
      // Call the provided onRunCode handler or use default
      const result = onRunCode 
        ? await onRunCode(question.id, code, language, customInput)
        : {
            status: 'success',
            stdout: 'Code executed successfully',
            stderr: '',
            executionTime: '0ms',
            memory: '0MB',
          };
      
      updateRunResult(question.id, result);
      setActiveTab('testResults');
      setIsResultPanelCollapsed(false);
    } catch (error) {
      updateRunResult(question.id, {
        status: 'error',
        error: error.message || 'Failed to run code',
      });
      setActiveTab('testResults');
      setIsResultPanelCollapsed(false);
    } finally {
      setRunning(false);
    }
  };

  // Handle submit code
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      if (onSubmitCode) {
        await onSubmitCode(question.id, code, language);
      } else {
        // Default: just mark as answered
        updateCode(question.id, code);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Failed to submit code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle result panel resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      
      // Constrain between 100px and 400px
      const constrainedHeight = Math.max(100, Math.min(400, newHeight));
      setResultPanelHeight(constrainedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Language</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleRunCode}
              disabled={running || !code.trim()}
              className="px-4 py-1.5 text-sm"
            >
              {running ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Run Code
                </>
              )}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitCode}
              disabled={submitting || !code.trim()}
              className="px-4 py-1.5 text-sm"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 bg-[#0f172a] overflow-hidden">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          className="w-full h-full resize-none bg-transparent p-6 font-mono text-sm leading-6 text-white outline-none"
          spellCheck={false}
          placeholder="// Write your code here..."
        />
      </div>

      {/* Result Panel */}
      {!isResultPanelCollapsed && (
        <>
          {/* Resize Handle */}
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            className={`h-1 bg-gray-300 hover:bg-blue-500 cursor-row-resize transition-colors ${
              isResizing ? 'bg-blue-500' : ''
            }`}
          />

          {/* Result Panel Content */}
          <div
            className="bg-white border-t border-gray-200 overflow-hidden flex flex-col"
            style={{ height: `${resultPanelHeight}px` }}
          >
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-200">
              <button
                onClick={() => setActiveTab('testResults')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'testResults'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Test Results
              </button>
              <button
                onClick={() => setActiveTab('customInput')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'customInput'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Custom Input
              </button>
              <button
                onClick={() => setIsResultPanelCollapsed(true)}
                className="ml-auto px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'testResults' && (
                <TestResultsTab result={runResult} />
              )}
              {activeTab === 'customInput' && (
                <CustomInputTab
                  value={customInput}
                  onChange={handleCustomInputChange}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Collapsed State - Show button to expand */}
      {isResultPanelCollapsed && (
        <div className="bg-white border-t border-gray-200 p-2">
          <button
            onClick={() => setIsResultPanelCollapsed(false)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-2"
          >
            <ChevronUp className="h-4 w-4" />
            Show Results
          </button>
        </div>
      )}
    </div>
  );
};

// Test Results Tab Component
const TestResultsTab = ({ result }) => {
  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Run your code to see test results here</p>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <span className="text-lg">❌</span>
            <span>Error</span>
          </div>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">
            {result.error || result.stderr || 'Unknown error occurred'}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2">
        {result.status === 'success' || result.status === 'accepted' ? (
          <span className="text-green-600 font-medium">✔ Compiled successfully</span>
        ) : (
          <span className="text-red-600 font-medium">❌ Compilation failed</span>
        )}
      </div>

      {/* Test Cases */}
      {result.testCases && result.testCases.length > 0 ? (
        <div className="space-y-3">
          {result.testCases.map((testCase, index) => (
            <div
              key={index}
              className={`border rounded p-3 ${
                testCase.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">
                  Test Case {index + 1}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  {testCase.passed ? (
                    <span className="text-green-600">✔ Passed</span>
                  ) : (
                    <span className="text-red-600">❌ Failed</span>
                  )}
                  {testCase.executionTime && (
                    <span className="text-gray-500">⏱ {testCase.executionTime}</span>
                  )}
                </div>
              </div>
              {!testCase.passed && (
                <div className="mt-2 space-y-1 text-xs">
                  {testCase.expected && (
                    <div>
                      <span className="font-medium">Expected:</span>
                      <pre className="mt-1 bg-white p-2 rounded">{testCase.expected}</pre>
                    </div>
                  )}
                  {testCase.actual && (
                    <div>
                      <span className="font-medium">Your Output:</span>
                      <pre className="mt-1 bg-white p-2 rounded">{testCase.actual}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Simple output display
        <div className="space-y-3">
          {result.stdout && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Your Output (stdout):</div>
              <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-sm whitespace-pre-wrap">
                {result.stdout}
              </pre>
            </div>
          )}
          {result.stderr && (
            <div>
              <div className="text-sm font-medium text-red-700 mb-1">Error (stderr):</div>
              <pre className="bg-red-50 border border-red-200 rounded p-3 text-sm whitespace-pre-wrap text-red-700">
                {result.stderr}
              </pre>
            </div>
          )}
          {(result.executionTime || result.memory) && (
            <div className="flex gap-4 text-xs text-gray-600">
              {result.executionTime && <span>⏱ Execution Time: {result.executionTime}</span>}
              {result.memory && <span>💾 Memory: {result.memory}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom Input Tab Component
const CustomInputTab = ({ value, onChange }) => {
  return (
    <div>
      <div className="mb-2">
        <label className="text-sm font-medium text-gray-700">
          Custom Input
        </label>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Enter custom input here..."
        className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>
  );
};

export default EditorPanel;

