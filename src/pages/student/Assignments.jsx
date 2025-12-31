import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, Clock3, FileText, AlertCircle, ChevronLeft, ChevronRight, Bookmark, CheckCircle2, XCircle, Grid } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Table from "../../components/Table";
import studentAPI from '../../api/student';

const StudentAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sessionIndex, setSessionIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, sessionsRes] = await Promise.all([
        studentAPI.getMyAssignments(),
        studentAPI.getMySessions(),
      ]);

      if (assignmentsRes.success) {
        const allAssignments = assignmentsRes.data.assignments || [];
        setAssignments(allAssignments);
      } else {
        toast.error(assignmentsRes.message || 'Failed to load assignments');
        setAssignments([]);
      }

      if (sessionsRes.success) {
        const allSessions = sessionsRes.data.sessions || [];
        // Sort sessions by scheduled date (most recent first)
        const sortedSessions = allSessions.sort((a, b) => {
          const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
          const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
          return dateB - dateA;
        });
        setSessions(sortedSessions);
        
        // Set initial selected session (most recent or first one)
        if (sortedSessions.length > 0 && !selectedSessionId) {
          setSelectedSessionId(sortedSessions[0].id);
          setSessionIndex(0);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load data');
      setAssignments([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Get assignments for the selected session
  const getCurrentSessionAssignments = () => {
    if (!selectedSessionId) return [];
    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session || !session.moduleId) return [];
    
    // Filter assignments that belong to this session's module
    return assignments.filter(a => a.moduleId === session.moduleId);
  };

  const navigateSession = (direction) => {
    if (sessions.length === 0) return;
    let newIndex = sessionIndex;
    if (direction === 'prev') {
      newIndex = sessionIndex > 0 ? sessionIndex - 1 : sessions.length - 1;
    } else {
      newIndex = sessionIndex < sessions.length - 1 ? sessionIndex + 1 : 0;
    }
    setSessionIndex(newIndex);
    setSelectedSessionId(sessions[newIndex].id);
  };

  const getDifficulty = (assignment) => {
    // Determine difficulty based on maxMarks or type
    if (assignment.maxMarks <= 50) return 'Easy';
    if (assignment.maxMarks <= 100) return 'Medium';
    return 'Hard';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'Hard':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (assignment) => {
    const status = assignment.status || 'ASSIGNED';
    const isSubmitted = status === 'SUBMITTED' || status === 'COMPLETED';
    const marks = assignment.submission?.marks || 0;
    const maxMarks = assignment.maxMarks || 100;

    if (isSubmitted) {
      return (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">Solved</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <XCircle className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Not Solved</span>
      </div>
    );
  };

  const formatSessionDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const currentSession = sessions.find(s => s.id === selectedSessionId);
  const sessionAssignments = getCurrentSessionAssignments();
  const solvedCount = sessionAssignments.filter(a => 
    a.status === 'SUBMITTED' || a.status === 'COMPLETED'
  ).length;
  const totalCount = sessionAssignments.length;

  const columns = [
    {
      key: 'name',
      title: 'Name of the Problem',
      render: (row) => (
        <div className="font-medium text-text">{row.name}</div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (row) => (
        <div className="flex items-center">
          <Grid className="h-4 w-4 text-textMuted" />
        </div>
      ),
    },
    {
      key: 'difficulty',
      title: 'Difficulty',
      render: (row) => {
        const difficulty = getDifficulty(row);
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        );
      },
    },
    {
      key: 'score',
      title: 'Score',
      render: (row) => {
        const marks = row.submission?.marks || 0;
        const maxMarks = row.maxMarks || 100;
        const isSubmitted = row.status === 'SUBMITTED' || row.status === 'COMPLETED';
        return (
          <span className={`text-sm ${isSubmitted ? 'text-text font-medium' : 'text-textMuted'}`}>
            {isSubmitted ? `${marks.toFixed(1)}/${maxMarks}` : `0.0/${maxMarks}`}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => getStatusBadge(row),
    },
    {
      key: 'submissions',
      title: 'Submissions',
      render: (row) => {
        // Count submissions (for now, use status to infer attempts)
        const attempts = row.submission ? 1 : 0;
        return (
          <span className="text-sm text-textMuted">
            {attempts} {attempts === 1 ? 'submission' : 'submissions'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded hover:bg-brintelli-baseAlt transition-colors"
            aria-label="Bookmark"
          >
            <Bookmark className="h-4 w-4 text-textMuted" />
          </button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // TODO: Navigate to assignment solve page
              toast.info('Assignment solve page coming soon');
            }}
          >
            Solve
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <PageHeader
          title="Assignments"
          description="Complete assignments for each session"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading assignments...</p>
        </div>
      </>
    );
  }

  if (sessions.length === 0) {
    return (
      <>
        <PageHeader
          title="Assignments"
          description="Complete assignments for each session"
        />
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-2">No sessions found.</p>
          <p className="text-sm text-textMuted">Sessions will appear here once you're enrolled in a batch.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Complete assignments for each session"
        actions={
          <Button variant="secondary" onClick={fetchData}>Refresh</Button>
        }
      />

      {/* Session Header */}
      {currentSession && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateSession('prev')}
                className="p-2 rounded-lg hover:bg-brintelli-baseAlt transition-colors"
                aria-label="Previous session"
              >
                <ChevronLeft className="h-5 w-5 text-textMuted" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-text">{currentSession.name}</h2>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Mandatory
                  </span>
                </div>
                {currentSession.scheduledDate && (
                  <p className="text-sm text-textMuted mt-1">
                    {formatSessionDate(currentSession.scheduledDate)}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigateSession('next')}
                className="p-2 rounded-lg hover:bg-brintelli-baseAlt transition-colors"
                aria-label="Next session"
              >
                <ChevronRight className="h-5 w-5 text-textMuted" />
              </button>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-textMuted">Problems Solved:</span>
              <span className="font-semibold text-text">{solvedCount}/{totalCount}</span>
            </div>
            {currentSession.scheduledDate && (
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-textMuted" />
                <span className="text-textMuted">
                  {(() => {
                    const now = new Date();
                    const sessionDate = new Date(currentSession.scheduledDate);
                    const diffTime = sessionDate - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) return 'Session completed';
                    if (diffDays === 0) return 'Today';
                    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignments Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {sessionAssignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted mb-2">No assignments for this session.</p>
            <p className="text-sm text-textMuted">Assignments will appear here when they are assigned to this session.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-textMuted">
                All the problems are mandatory to solve and will count towards your PSP (Problem Solving Percentage).
              </p>
            </div>
            <Table columns={columns} data={sessionAssignments} />
          </>
        )}
      </div>
    </>
  );
};

export default StudentAssignments;
