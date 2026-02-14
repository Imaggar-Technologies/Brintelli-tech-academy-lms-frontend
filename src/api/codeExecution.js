import { API_BASE_URL } from './constant';

/**
 * Make a public API request (no auth required)
 * Used for code execution endpoints that are publicly accessible
 */
const publicApiRequest = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * Code Execution API
 * Handles real-time code execution for assessments
 */
export const codeExecutionAPI = {
  /**
   * Run code with custom input
   * @param {string} code - The code to execute
   * @param {string} language - Programming language (javascript, python, java, etc.)
   * @param {string} input - Custom input for the code
   * @param {Array} testCases - Optional test cases to run
   * @returns {Promise} Execution result
   */
  runCode: async (code, language, input = '', testCases = []) => {
    return publicApiRequest('/api/code/run', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language,
        input,
        testCases,
      }),
    });
  },

  /**
   * Submit code for assessment with test cases
   * @param {string} code - The code to execute
   * @param {string} language - Programming language
   * @param {string} questionId - Question ID
   * @param {Array} testCases - Test cases with input and expectedOutput
   * @returns {Promise} Submission result with score
   */
  submitCode: async (code, language, questionId, testCases) => {
    return publicApiRequest('/api/code/submit', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language,
        questionId,
        testCases,
      }),
    });
  },

  /**
   * Execute code for assessment question
   * @param {string} assessmentId - Assessment ID
   * @param {string} code - The code to execute
   * @param {string} language - Programming language
   * @param {string} questionId - Question ID
   * @param {string} input - Custom input
   * @param {Array} testCases - Optional test cases
   * @returns {Promise} Execution result
   */
  executeAssessmentCode: async (assessmentId, code, language, questionId, input = '', testCases = []) => {
    return publicApiRequest(`/api/assessments/${assessmentId}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        code,
        language,
        questionId,
        input,
        testCases,
      }),
    });
  },

  /**
   * Submit code solution for assessment question
   * @param {string} assessmentId - Assessment ID
   * @param {string} code - The code to submit
   * @param {string} language - Programming language
   * @param {string} questionId - Question ID
   * @param {Array} testCases - Test cases with input and expectedOutput
   * @returns {Promise} Submission result with score
   */
  submitAssessmentCode: async (assessmentId, code, language, questionId, testCases) => {
    return publicApiRequest(`/api/assessments/${assessmentId}/submit-code`, {
      method: 'POST',
      body: JSON.stringify({
        code,
        language,
        questionId,
        testCases,
      }),
    });
  },

  /**
   * Get supported programming languages
   * @returns {Promise} List of supported languages
   */
  getSupportedLanguages: async () => {
    return publicApiRequest('/api/code/languages');
  },

  /**
   * Health check for code execution service
   * @returns {Promise} Service health status
   */
  healthCheck: async () => {
    return publicApiRequest('/api/code/health');
  },
};

export default codeExecutionAPI;

