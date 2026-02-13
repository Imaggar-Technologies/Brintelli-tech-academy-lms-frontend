import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

const ProblemPanel = ({ question }) => {
  const [expandedSections, setExpandedSections] = useState({
    inputFormat: true,
    outputFormat: true,
    constraints: true,
    sampleCases: true,
    customInput: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Parse question data - support both structured and simple formats
  const problemData = question.problemData || {
    title: question.question || 'Coding Problem',
    description: question.description || question.question || '',
    inputFormat: question.inputFormat || 'Standard input format',
    outputFormat: question.outputFormat || 'Standard output format',
    constraints: question.constraints || 'No specific constraints',
    sampleCases: question.sampleCases || [
      {
        input: 'Sample input',
        output: 'Sample output',
        explanation: 'Sample explanation',
      },
    ],
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <h2 className="text-xl font-semibold text-gray-900">
          {problemData.title}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Problem Description */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Problem Description</h3>
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
            {problemData.description}
          </div>
        </section>

        {/* Input Format */}
        <section>
          <button
            onClick={() => toggleSection('inputFormat')}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <h3 className="text-sm font-semibold text-gray-700">Input Format</h3>
            {expandedSections.inputFormat ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.inputFormat && (
            <div className="text-gray-600 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border border-gray-200">
              {problemData.inputFormat}
            </div>
          )}
        </section>

        {/* Output Format */}
        <section>
          <button
            onClick={() => toggleSection('outputFormat')}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <h3 className="text-sm font-semibold text-gray-700">Output Format</h3>
            {expandedSections.outputFormat ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.outputFormat && (
            <div className="text-gray-600 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border border-gray-200">
              {problemData.outputFormat}
            </div>
          )}
        </section>

        {/* Constraints */}
        <section>
          <button
            onClick={() => toggleSection('constraints')}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <h3 className="text-sm font-semibold text-gray-700">Constraints</h3>
            {expandedSections.constraints ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.constraints && (
            <div className="text-gray-600 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border border-gray-200">
              {typeof problemData.constraints === 'string' 
                ? problemData.constraints 
                : Array.isArray(problemData.constraints)
                  ? problemData.constraints.map((c, i) => <div key={i}>{c}</div>)
                  : 'No specific constraints'}
            </div>
          )}
        </section>

        {/* Sample Test Cases */}
        <section>
          <button
            onClick={() => toggleSection('sampleCases')}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <h3 className="text-sm font-semibold text-gray-700">Sample Cases</h3>
            {expandedSections.sampleCases ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.sampleCases && (
            <div className="space-y-4">
              {problemData.sampleCases?.map((sample, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500">Sample Case {index + 1}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Input:</span>
                      <pre className="mt-1 text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                        {sample.input || sample.stdin || 'N/A'}
                      </pre>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Output:</span>
                      <pre className="mt-1 text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                        {sample.output || sample.stdout || 'N/A'}
                      </pre>
                    </div>
                    {sample.explanation && (
                      <div>
                        <span className="font-medium text-gray-700">Explanation:</span>
                        <p className="mt-1 text-gray-600">{sample.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Custom Input Format (Collapsible) */}
        <section>
          <button
            onClick={() => toggleSection('customInput')}
            className="flex items-center justify-between w-full text-left mb-2"
          >
            <h3 className="text-sm font-semibold text-gray-700">Input Format for Custom Testing</h3>
            {expandedSections.customInput ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.customInput && (
            <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded border border-gray-200">
              {problemData.inputFormat || 'Use the same format as described above.'}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProblemPanel;

