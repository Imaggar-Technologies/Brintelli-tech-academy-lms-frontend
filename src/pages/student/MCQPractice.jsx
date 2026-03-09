import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import QuizCardsModal from '../../components/workshop/QuizCardsModal';

const DEFAULT_QUIZZES = [
    {
      id: 'aws-cloud-practitioner',
      title: 'AWS Cloud Practitioner',
      description: 'Practice questions for AWS Cloud Practitioner certification exam',
      questions: 30,
      duration: 60, // minutes
      difficulty: 'Easy',
      certification: 'AWS',
      completed: false,
      bestScore: null,
      attempts: 0,
      tags: ['AWS', 'Cloud', 'Fundamentals']
    },
    {
      id: 'aws-solutions-architect',
      title: 'AWS Solutions Architect',
      description: 'Comprehensive practice set for AWS Solutions Architect Associate exam',
      questions: 65,
      duration: 130,
      difficulty: 'Medium',
      certification: 'AWS',
      completed: true,
      bestScore: 85,
      attempts: 3,
      tags: ['AWS', 'Architecture', 'Design']
    },
    {
      id: 'azure-fundamentals',
      title: 'Azure Fundamentals',
      description: 'Master the basics of Microsoft Azure cloud platform',
      questions: 40,
      duration: 90,
      difficulty: 'Easy',
      certification: 'Azure',
      completed: false,
      bestScore: null,
      attempts: 0,
      tags: ['Azure', 'Cloud', 'Fundamentals']
    },
    {
      id: 'gcp-associate',
      title: 'GCP Associate Cloud Engineer',
      description: 'Practice for Google Cloud Platform Associate certification',
      questions: 50,
      duration: 120,
      difficulty: 'Medium',
      certification: 'GCP',
      completed: false,
      bestScore: 72,
      attempts: 1,
      tags: ['GCP', 'Cloud', 'Engineering']
    },
    {
      id: 'aws-advanced',
      title: 'AWS Advanced Networking',
      description: 'Advanced networking concepts and scenarios for AWS',
      questions: 75,
      duration: 150,
      difficulty: 'Hard',
      certification: 'AWS',
      completed: false,
      bestScore: null,
      attempts: 0,
      tags: ['AWS', 'Networking', 'Advanced']
    },
    {
      id: 'azure-admin',
      title: 'Azure Administrator',
      description: 'Azure administration and management practice questions',
      questions: 55,
      duration: 110,
      difficulty: 'Medium',
      certification: 'Azure',
      completed: true,
      bestScore: 90,
      attempts: 5,
      tags: ['Azure', 'Administration', 'Management']
    }
];

const MCQPractice = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  const [testSets] = useState(DEFAULT_QUIZZES);

  const handleStartTest = (testId) => {
    navigate(`/student/mcq-practice/${testId}`);
  };

  return (
    <>
      <PageHeader
        title="MCQ Practice Hub"
        description="Sharpen certification fundamentals across AWS, Azure, and GCP with timed MCQ drills."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)} className="bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0">
            Browse All Tests
          </Button>
        }
      />

      {!modalOpen && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt/20 p-8 text-center">
          <FileText className="h-12 w-12 text-brand-500 mx-auto mb-4 opacity-60" />
          <p className="text-textMuted mb-4">Open the quiz list to see all tests and start one.</p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open Quiz List
          </Button>
        </div>
      )}

      <QuizCardsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="MCQ Practice Hub"
        description="Sharpen certification fundamentals across AWS, Azure, and GCP with timed MCQ drills."
        quizzes={testSets}
        onStartTest={handleStartTest}
        showStats
        showSearch
        filterOptions={['All', 'AWS', 'Azure', 'GCP']}
      />
    </>
  );
};

export default MCQPractice;
