import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AssessmentContext = createContext(null);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};

export const AssessmentProvider = ({ children, questions = [], activeSection = 'mcq' }) => {
  // Separate questions by type
  const mcqQuestions = questions.filter(q => q.type !== 'coding');
  const codingQuestions = questions.filter(q => q.type === 'coding');
  
  // Filter questions by active section
  const filteredQuestions = activeSection === 'mcq' ? mcqQuestions : codingQuestions;
  
  // Track current question index per section
  const [mcqCurrentIndex, setMcqCurrentIndex] = useState(0);
  const [codingCurrentIndex, setCodingCurrentIndex] = useState(0);
  
  // Get current index based on active section
  const currentQuestionIndex = activeSection === 'mcq' ? mcqCurrentIndex : codingCurrentIndex;
  
  const setCurrentQuestionIndex = useCallback((index) => {
    if (activeSection === 'mcq') {
      setMcqCurrentIndex(index);
    } else {
      setCodingCurrentIndex(index);
    }
  }, [activeSection]);

  // Initialize question states - merge with existing to preserve state
  const [questionStates, setQuestionStates] = useState(() => {
    const initialState = {};
    questions.forEach((q) => {
      initialState[q.id] = {
        questionId: q.id,
        selectedAnswers: [],
        isMarkedForReview: false,
        isVisited: false,
        isAnswered: false,
        // Coding question specific state
        code: q.type === 'coding' ? (q.starterCode || '') : undefined,
        language: q.type === 'coding' ? (q.language || 'javascript') : undefined,
        runResult: undefined,
        customInput: '',
      };
    });
    return initialState;
  });

  // Update states when new questions are added (preserve existing)
  useEffect(() => {
    setQuestionStates((prev) => {
      const updated = { ...prev };
      questions.forEach((q) => {
        if (!updated[q.id]) {
          updated[q.id] = {
            questionId: q.id,
            selectedAnswers: [],
            isMarkedForReview: false,
            isVisited: false,
            isAnswered: false,
            // Coding question specific state
            code: q.type === 'coding' ? (q.starterCode || '') : undefined,
            language: q.type === 'coding' ? (q.language || 'javascript') : undefined,
            runResult: undefined,
            customInput: '',
          };
        }
      });
      return updated;
    });
  }, [questions.length]);

  // Get question status for palette
  const getQuestionStatus = useCallback((questionId) => {
    const state = questionStates[questionId];
    if (!state) return 'not-visited';

    if (state.isAnswered) return 'answered';
    if (state.isMarkedForReview) return 'marked';
    if (state.isVisited && !state.isAnswered) return 'visited';
    return 'not-visited';
  }, [questionStates]);

  // Handle option select (single choice)
  const handleOptionSelect = useCallback((questionId, answerValue) => {
    setQuestionStates((prev) => {
      const current = prev[questionId] || {
        questionId,
        selectedAnswers: [],
        isMarkedForReview: false,
        isVisited: false,
        isAnswered: false,
      };

      return {
        ...prev,
        [questionId]: {
          ...current,
          selectedAnswers: [answerValue], // Single choice - replace
          isVisited: true,
          isAnswered: true,
        },
      };
    });
  }, []);

  // Handle multi-select (checkbox)
  const handleMultiSelect = useCallback((questionId, answerValue) => {
    setQuestionStates((prev) => {
      const current = prev[questionId] || {
        questionId,
        selectedAnswers: [],
        isMarkedForReview: false,
        isVisited: false,
        isAnswered: false,
      };

      const isSelected = current.selectedAnswers.includes(answerValue);
      const newAnswers = isSelected
        ? current.selectedAnswers.filter((a) => a !== answerValue)
        : [...current.selectedAnswers, answerValue];

      return {
        ...prev,
        [questionId]: {
          ...current,
          selectedAnswers: newAnswers,
          isVisited: true,
          isAnswered: newAnswers.length > 0,
        },
      };
    });
  }, []);

  // Save and move to next
  const handleSaveAndNext = useCallback(() => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const state = questionStates[currentQuestion.id];
    if (state && state.selectedAnswers && state.selectedAnswers.length > 0) {
      setQuestionStates((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          isAnswered: true,
        },
      }));
    }

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Mark next question as visited
      const nextQuestion = filteredQuestions[currentQuestionIndex + 1];
      if (nextQuestion) {
        setQuestionStates((prev) => ({
          ...prev,
          [nextQuestion.id]: {
            ...prev[nextQuestion.id] || {
              questionId: nextQuestion.id,
              selectedAnswers: [],
              isMarkedForReview: false,
              isVisited: false,
              isAnswered: false,
            },
            isVisited: true,
          },
        }));
      }
    }
  }, [currentQuestionIndex, filteredQuestions, questionStates, setCurrentQuestionIndex]);

  // Mark for review
  const handleMarkForReview = useCallback(() => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    setQuestionStates((prev) => {
      const current = prev[currentQuestion.id] || {
        questionId: currentQuestion.id,
        selectedAnswers: [],
        isMarkedForReview: false,
        isVisited: false,
        isAnswered: false,
      };

      return {
        ...prev,
        [currentQuestion.id]: {
          ...current,
          isMarkedForReview: !current.isMarkedForReview,
          isVisited: true,
        },
      };
    });
  }, [currentQuestionIndex, questions]);

  // Skip question
  const handleSkip = useCallback(() => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Mark as visited but not answered
    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id] || {
          questionId: currentQuestion.id,
          selectedAnswers: [],
          isMarkedForReview: false,
          isVisited: false,
          isAnswered: false,
        },
        isVisited: true,
      },
    }));

    // Move to next
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, filteredQuestions, setCurrentQuestionIndex]);

  // Clear response
  const handleClearResponse = useCallback(() => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id] || {
          questionId: currentQuestion.id,
          selectedAnswers: [],
          isMarkedForReview: false,
          isVisited: false,
          isAnswered: false,
        },
        selectedAnswers: [],
        isAnswered: false,
        isVisited: true,
      },
    }));
  }, [currentQuestionIndex, filteredQuestions]);

  // Navigate to specific question
  const navigateToQuestion = useCallback((index) => {
    if (index >= 0 && index < filteredQuestions.length) {
      // Auto-save current question before navigating
      const currentQuestion = filteredQuestions[currentQuestionIndex];
      if (currentQuestion) {
        const state = questionStates[currentQuestion.id];
        if (state && state.selectedAnswers.length > 0) {
          setQuestionStates((prev) => ({
            ...prev,
            [currentQuestion.id]: {
              ...prev[currentQuestion.id],
              isAnswered: true,
            },
          }));
        }
      }

      setCurrentQuestionIndex(index);
      
      // Mark target question as visited
      const targetQuestion = filteredQuestions[index];
      if (targetQuestion) {
        setQuestionStates((prev) => ({
          ...prev,
          [targetQuestion.id]: {
            ...prev[targetQuestion.id] || {
              questionId: targetQuestion.id,
              selectedAnswers: [],
              isMarkedForReview: false,
              isVisited: false,
              isAnswered: false,
            },
            isVisited: true,
          },
        }));
      }
    }
  }, [currentQuestionIndex, filteredQuestions, questionStates]);

  // Update code for coding question
  const updateCode = useCallback((questionId, code) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        code,
        isVisited: true,
        isAnswered: code && code.trim().length > 0,
      },
    }));
  }, []);

  // Update language for coding question
  const updateLanguage = useCallback((questionId, language) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        language,
      },
    }));
  }, []);

  // Update custom input for coding question
  const updateCustomInput = useCallback((questionId, input) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        customInput: input,
      },
    }));
  }, []);

  // Update run result for coding question
  const updateRunResult = useCallback((questionId, result) => {
    setQuestionStates((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        runResult: result,
      },
    }));
  }, []);

  // Get all answers for submission
  const getAllAnswers = useCallback(() => {
    const allAnswers = {};
    Object.keys(questionStates).forEach((questionId) => {
      const state = questionStates[questionId];
      const question = questions.find(q => q.id === questionId);
      
      if (question?.type === 'coding') {
        // For coding questions, include code and language
        if (state.code && state.code.trim().length > 0) {
          allAnswers[questionId] = {
            code: state.code,
            language: state.language || 'javascript',
          };
        }
      } else {
        // For MCQ questions, include selected answers
        if (state.selectedAnswers.length > 0) {
          allAnswers[questionId] = state.selectedAnswers;
        }
      }
    });
    return allAnswers;
  }, [questionStates, questions]);

  const value = {
    // Questions
    questions: filteredQuestions, // Current section questions
    allQuestions: questions, // All questions
    mcqQuestions,
    codingQuestions,
    activeSection,
    
    // State
    questionStates,
    currentQuestionIndex,
    currentQuestion: filteredQuestions[currentQuestionIndex],
    
    // Handlers
    getQuestionStatus,
    handleOptionSelect,
    handleMultiSelect,
    handleSaveAndNext,
    handleMarkForReview,
    handleSkip,
    handleClearResponse,
    navigateToQuestion,
    setCurrentQuestionIndex,
    getAllAnswers, // Export for submission
    
    // Coding question handlers
    updateCode,
    updateLanguage,
    updateCustomInput,
    updateRunResult,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};

