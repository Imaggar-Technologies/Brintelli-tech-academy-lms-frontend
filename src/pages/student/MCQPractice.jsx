import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Target,
  TrendingUp,
  Award,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const MCQPractice = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, certification, difficulty

  // Mock MCQ test sets
  const [testSets] = useState([
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
  ]);

  const certifications = ['All', 'AWS', 'Azure', 'GCP'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredTests = testSets.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCertification = filter === 'all' || filter === test.certification;
    
    return matchesSearch && matchesCertification;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <PageHeader
        title="MCQ Practice Hub"
        description="Sharpen certification fundamentals across AWS, Azure, and GCP with timed MCQ drills."
        actions={
          <Button variant="secondary" onClick={() => navigate('/student/mcq-practice')}>
            Browse All Tests
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-brintelli-border bg-white px-12 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-textMuted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-brintelli-border bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
            >
              {certifications.map(cert => (
                <option key={cert} value={cert === 'All' ? 'all' : cert}>{cert}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-textMuted uppercase tracking-wide">Total Tests</p>
                <p className="mt-1 text-2xl font-bold text-text">{testSets.length}</p>
              </div>
              <FileText className="h-8 w-8 text-brand-500 opacity-20" />
            </div>
          </div>
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-textMuted uppercase tracking-wide">Completed</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {testSets.filter(t => t.completed).length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </div>
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-textMuted uppercase tracking-wide">Best Score</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {Math.max(...testSets.map(t => t.bestScore || 0), 0)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </div>
          <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-textMuted uppercase tracking-wide">Total Attempts</p>
                <p className="mt-1 text-2xl font-bold text-text">
                  {testSets.reduce((sum, t) => sum + t.attempts, 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </div>
            </div>

        {/* Test Sets List */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-brintelli-border bg-brintelli-card">
              <FileText className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">No tests found matching your criteria.</p>
            </div>
          ) : (
            filteredTests.map((test) => (
              <div
                key={test.id}
                className="group cursor-pointer rounded-xl border border-brintelli-border bg-brintelli-card p-6 transition hover:border-brand-500 hover:shadow-md"
                onClick={() => navigate(`/student/mcq-practice/${test.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-text group-hover:text-brand-600 transition">
                        {test.title}
                      </h3>
                      {test.completed && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-textMuted mb-4">{test.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{test.questions} Questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{test.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{test.certification}</span>
                      </div>
                      {test.bestScore && (
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>Best: {test.bestScore}%</span>
                        </div>
                      )}
                      {test.attempts > 0 && (
                        <span>Attempts: {test.attempts}</span>
                      )}
            </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {test.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-brintelli-baseAlt text-xs text-textMuted"
                        >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/mcq-practice/${test.id}`);
                    }}
                    className="flex items-center gap-2"
                  >
                    Start Test
                    <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              </div>
            ))
          )}
          </div>
      </div>
    </>
  );
};

export default MCQPractice;
