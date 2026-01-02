import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight,
  Video,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Users,
  FileText,
  Bell,
  X,
  Edit,
  Calendar,
  Sparkles
} from "lucide-react";
import Button from '../../components/Button';
import studentAPI from '../../api/student';
import { useSelector } from 'react-redux';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [enrollment, setEnrollment] = useState(null);
  const [showChallengesBanner, setShowChallengesBanner] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchEnrollment();
  }, []);

  const fetchEnrollment = async () => {
    try {
      const response = await studentAPI.getMyEnrollment();
      if (response.success && response.data.enrollment) {
        setEnrollment(response.data.enrollment);
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [programsRes, sessionsRes, assignmentsRes] = await Promise.all([
        studentAPI.getMyPrograms(),
        studentAPI.getMySessions(),
        studentAPI.getMyAssignments(),
      ]);

      if (programsRes.success) {
        setPrograms(programsRes.data.programs || []);
      }
      if (sessionsRes.success) {
        setSessions(sessionsRes.data.sessions || []);
        
        // If we have sessions but no programs, it means the enrollment has a batch but no programId
        // In this case, we should still show at least 1 program enrolled
        if (sessionsRes.data.sessions && sessionsRes.data.sessions.length > 0 && (!programsRes.data.programs || programsRes.data.programs.length === 0)) {
          // Create a placeholder program entry based on sessions
          // This ensures consistency: if there are sessions, there should be at least 1 program
          const uniqueBatches = new Set();
          sessionsRes.data.sessions.forEach(session => {
            if (session.batchId) {
              uniqueBatches.add(session.batchId);
            }
          });
          
          // Set programs to show at least 1 if there are sessions
          if (uniqueBatches.size > 0) {
            setPrograms([{
              enrollmentId: 'placeholder',
              program: {
                id: 'placeholder',
                name: 'Enrolled Program',
                code: null,
                description: 'You are enrolled in a program with active sessions.',
                duration: null,
                price: null,
                outcomes: [],
                status: 'ACTIVE',
              },
              batch: null,
              modules: [],
              sessions: sessionsRes.data.sessions,
              mentor: null,
            }]);
          }
        }
      }
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter ongoing and upcoming sessions
  const ongoingSessions = sessions.filter(s => s.status === 'ONGOING');
  const upcomingSessions = sessions.filter(s => {
    if (!s.scheduledDate) return false;
    return new Date(s.scheduledDate) > new Date() && s.status === 'SCHEDULED';
  }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const allSessions = [...ongoingSessions, ...upcomingSessions].slice(0, 6);
  const nextSession = upcomingSessions[0] || ongoingSessions[0];

  // Get pending assignments
  const pendingAssignments = assignments.filter(a => 
    a.status === 'PENDING' || a.status === 'ASSIGNED'
  ).slice(0, 5);

  // Calculate days until session
  const getDaysUntil = (date) => {
    if (!date) return null;
    const now = new Date();
    const sessionDate = new Date(date);
    const diffTime = sessionDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatSessionDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const navigateSessions = (direction) => {
    if (allSessions.length === 0) return;
    const maxIndex = Math.max(0, allSessions.length - 3);
    if (direction === 'prev') {
      setSessionIndex(prev => prev > 0 ? prev - 1 : maxIndex);
    } else {
      setSessionIndex(prev => prev < maxIndex ? prev + 1 : maxIndex);
    }
  };


  const userName = user?.fullName || user?.name || 'Student';
  const currentProgram = programs[0]; // Get first program for mentor/batch info
  const currentMentor = currentProgram?.mentor || enrollment?.mentor;
  const currentBatch = currentProgram?.batch || enrollment?.batch;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isOnboardingComplete = enrollment?.isOnboardingComplete === true;

  return (
    <div className="space-y-6 pb-12">
      {/* New Challenges Banner */}
      {showChallengesBanner && (
        <div className="rounded-2xl border-2 border-purple-500 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
            <div>
                <h3 className="text-lg font-bold text-text mb-1">New Challenges Have Been Activated!</h3>
                <p className="text-sm text-textMuted">Test your skills with exciting new coding challenges and competitions.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/student/challenges')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                View Challenges
            </Button>
              <button
                onClick={() => setShowChallengesBanner(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition"
              >
                <X className="h-5 w-5 text-textMuted" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Banner */}
      {enrollment && !isOnboardingComplete && (
        <div className="rounded-2xl border-2 border-yellow-500 bg-yellow-50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Complete Your Onboarding</h3>
              <p className="text-yellow-800 mb-4">
                Please confirm your batch and select your mentor to access sessions and assignments.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-2 ${enrollment.batchConfirmed ? 'text-green-700' : 'text-yellow-700'}`}>
                  {enrollment.batchConfirmed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>Batch {enrollment.batchConfirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
                <div className={`flex items-center gap-2 ${enrollment.mentorId ? 'text-green-700' : 'text-yellow-700'}`}>
                  {enrollment.mentorId ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>Mentor {enrollment.mentorId ? 'Selected' : 'Pending'}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/student/onboarding')}>
              Complete Onboarding
            </Button>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="relative rounded-2xl border border-brintelli-border bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-8 shadow-soft overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text mb-2">Welcome Back, {userName.split(' ')[0]}</h1>
            <p className="text-textMuted text-lg max-w-2xl">
              Manage all the things from single Dashboard. See latest sessions, recent conversations and track your progress.
            </p>
          </div>
          <div className="hidden lg:block ml-8">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full flex items-center justify-center">
              <GraduationCap className="h-24 w-24 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* This Session Section */}
          {nextSession && (
            <div className="rounded-2xl border border-brintelli-border bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                  <Video className="h-5 w-5 text-brand-600" />
                  This Session
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/student/sessions')}>
              View All
            </Button>
          </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {nextSession.status === 'ONGOING' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          LIVE NOW
                  </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {getDaysUntil(nextSession.scheduledDate) === 0 ? 'Today' : `${getDaysUntil(nextSession.scheduledDate)} Day${getDaysUntil(nextSession.scheduledDate) !== 1 ? 's' : ''} Left`}
                  </span>
                  )}
                </div>
                    <h3 className="text-lg font-semibold text-text mb-2">{nextSession.name}</h3>
                    {nextSession.description && (
                      <p className="text-sm text-textMuted mb-3">{nextSession.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-textMuted">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatSessionDate(nextSession.scheduledDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{nextSession.duration || 240} mins</span>
                      </div>
                    </div>
                  </div>
                </div>
                  <Button
                  className="w-full"
                  onClick={() => {
                    if (nextSession.status === 'ONGOING' || nextSession.meetingLink) {
                      navigate(`/student/sessions/${nextSession.id}/live`);
                    } else {
                      navigate('/student/sessions');
                    }
                  }}
                >
                  {nextSession.status === 'ONGOING' ? 'Join Now' : 'View Details'}
                  </Button>
          </div>
        </div>
      )}

          {/* Assignment Notifications */}
          {pendingAssignments.length > 0 && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  Assignment Notifications
                </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')}>
              View All
            </Button>
          </div>
              
              <div className="space-y-3">
                {pendingAssignments.map((assignment) => {
                  const daysUntilDue = assignment.dueDate 
                    ? Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

              return (
                <div
                  key={assignment.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-brintelli-border bg-white hover:shadow-sm transition cursor-pointer"
                      onClick={() => navigate('/student/assignments')}
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-text">{assignment.name}</h3>
                          {daysUntilDue !== null && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              daysUntilDue < 0 
                                ? 'bg-red-100 text-red-700' 
                                : daysUntilDue <= 3 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {daysUntilDue < 0 
                                ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                                : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left`
                              }
                      </span>
                    )}
                  </div>
                        {assignment.description && (
                          <p className="text-sm text-textMuted line-clamp-2 mb-2">{assignment.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-textMuted">
                          <span>Type: {assignment.type || 'Assignment'}</span>
                          {assignment.maxMarks && (
                            <span>Max Marks: {assignment.maxMarks}</span>
                          )}
                        </div>
                      </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

          {/* Ongoing/Upcoming Sessions Section */}
          {allSessions.length > 0 && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">Ongoing & Upcoming Sessions</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/student/sessions')}>
                  View All
                </Button>
              </div>
              
              <div className="relative">
                <div className="flex gap-4 overflow-hidden">
                  {allSessions.slice(sessionIndex, sessionIndex + 3).map((session) => {
                    const daysUntil = getDaysUntil(session.scheduledDate);
                    const isOngoing = session.status === 'ONGOING';
                    
                    return (
                      <div
                        key={session.id}
                        className="flex-shrink-0 w-full md:w-1/3 rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            {daysUntil !== null && !isOngoing && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium mb-2">
                                {daysUntil === 0 ? 'Today' : `${daysUntil} Day${daysUntil !== 1 ? 's' : ''} Left`}
                    </span>
                            )}
                            {isOngoing && (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium mb-2">
                                LIVE NOW
                      </span>
                    )}
                            <p className="text-xs text-textMuted mb-1">
                              {session.scheduledDate ? formatSessionDate(session.scheduledDate) : 'TBD'}
                            </p>
                          </div>
                  </div>
                        <h3 className="font-semibold text-text mb-2 line-clamp-2">{session.name}</h3>
                        <p className="text-xs text-textMuted mb-4 flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          {session.type || 'Online Session'}
                        </p>
                  <Button
                    size="sm"
                          className="w-full"
                          onClick={() => {
                            if (isOngoing || session.meetingLink) {
                              navigate(`/student/sessions/${session.id}/live`);
                            } else {
                              navigate('/student/sessions');
                            }
                          }}
                        >
                          {isOngoing ? 'Join Now' : 'Attend'}
                  </Button>
                </div>
              );
            })}
                </div>
                
                {allSessions.length > 3 && (
                  <>
                    <button
                      onClick={() => navigateSessions('prev')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white border border-brintelli-border shadow-md hover:bg-brintelli-baseAlt transition"
                      aria-label="Previous sessions"
                    >
                      <ChevronLeft className="h-5 w-5 text-textMuted" />
                    </button>
                    <button
                      onClick={() => navigateSessions('next')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white border border-brintelli-border shadow-md hover:bg-brintelli-baseAlt transition"
                      aria-label="Next sessions"
                    >
                      <ChevronRight className="h-5 w-5 text-textMuted" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Change Mentor Section */}
          {currentMentor && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-600" />
                  Your Mentor
                </h2>
                <button
                  onClick={() => navigate('/student/mentors')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Change Mentor"
                >
                  <Edit className="h-4 w-4 text-textMuted" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                    {currentMentor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text mb-1">{currentMentor.name}</h3>
                    <p className="text-sm text-textMuted">Mentor</p>
                    {currentMentor.email && (
                      <p className="text-xs text-textMuted mt-1">{currentMentor.email}</p>
                    )}
                  </div>
                </div>
                {currentMentor.bio && (
                  <p className="text-sm text-textMuted">{currentMentor.bio}</p>
                )}
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/student/mentors')}
                >
                  Change Mentor
                </Button>
              </div>
            </div>
          )}

          {/* Batch Details Section */}
          {currentBatch && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-600" />
                  Batch Details
                </h2>
                <button
                  onClick={() => navigate('/student/onboarding')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Change Batch"
                >
                  <Edit className="h-4 w-4 text-textMuted" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-text mb-2">{currentBatch.name}</h3>
                  <div className="space-y-2 text-sm text-textMuted">
                    {currentBatch.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Starts: {new Date(currentBatch.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {currentBatch.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Ends: {new Date(currentBatch.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/student/onboarding')}
                >
                  View/Change Batch
                </Button>
          </div>
        </div>
      )}

          {/* Quick Stats */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Programs Enrolled</span>
                <span className="text-lg font-semibold text-text">{programs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Upcoming Sessions</span>
                <span className="text-lg font-semibold text-text">{upcomingSessions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Pending Assignments</span>
                <span className="text-lg font-semibold text-text">{pendingAssignments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && allSessions.length === 0 && pendingAssignments.length === 0 && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">No Upcoming Activities</h3>
          <p className="text-textMuted mb-4">
            {programs.length === 0
              ? "Complete onboarding to get access to sessions and assignments."
              : "You're all caught up! Check back later for new sessions and assignments."}
          </p>
          {programs.length === 0 && (
            <Button onClick={() => navigate('/student/my-courses')}>
              View My Courses
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
