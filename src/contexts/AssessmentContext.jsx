import { createContext, useContext, useState, useCallback } from 'react';

const AssessmentContext = createContext(null);

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};

export const AssessmentProvider = ({ children, questions = [], currentSection = 'mcq' }) => {
  // Filter questions by section
  const filteredQuestions = questions.filter(q => {
    if (currentSection === 'mcq') {
      return q.type !== 'coding';
    } else {
      return q.type === 'coding';
    }
  });

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
          };
        }
      });
      return updated;
    });
  }, [questions.length]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

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

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      
      // Mark next question as visited
      const nextQuestion = questions[currentQuestionIndex + 1];
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
  }, [currentQuestionIndex, questions, questionStates]);

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
    const currentQuestion = questions[currentQuestionIndex];
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
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, filteredQuestions]);

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

  // Get all answers for submission
  const getAllAnswers = useCallback(() => {
    const allAnswers = {};
    Object.keys(questionStates).forEach((questionId) => {
      const state = questionStates[questionId];
      if (state.selectedAnswers.length > 0) {
        allAnswers[questionId] = state.selectedAnswers;
      }
    });
    return allAnswers;
  }, [questionStates]);

  const value = {
    questions: filteredQuestions, // Use filtered questions for current section
    allQuestions: questions, // Keep all questions for state management
    questionStates,
    currentQuestionIndex,
    currentQuestion: filteredQuestions[currentQuestionIndex],
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
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};

