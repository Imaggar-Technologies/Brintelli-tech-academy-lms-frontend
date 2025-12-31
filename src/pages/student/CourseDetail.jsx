import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  PlayCircle,
  Video,
  FileCheck,
  Download,
  BookOpen,
  FileText,
  Presentation,
  Gift,
  HelpCircle,
  CheckCircle2,
  X,
  Clock,
  Calendar,
  User,
  Info,
  AlertCircle
} from 'lucide-react';
import studentAPI from '../../api/student';
import Button from '../../components/Button';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programData, setProgramData] = useState(null);
  const [activeTab, setActiveTab] = useState('live-classes'); // 'self-learning', 'live-classes', 'assessments'
  const [sessionTab, setSessionTab] = useState('my-class'); // 'my-class', 'past-classes'
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProgramDetails();
    }
  }, [id]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyPrograms();
      if (response.success) {
        const program = response.data.programs?.find(
          p => p.program?.id === id || p.program?._id === id
        );
        if (program) {
          setProgramData(program);
          if (program.batch) {
            setSelectedBatch(program.batch);
          }
        } else {
          toast.error('Program not found');
          navigate('/student/my-courses');
        }
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
      toast.error(error.message || 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!programData?.modules || programData.modules.length === 0) return 0;
    const completed = programData.modules.filter(m => m.status === 'COMPLETED').length;
    return Math.round((completed / programData.modules.length) * 100);
  };

  const getSelfLearningProgress = () => {
    // Placeholder - would come from actual tracking
    return 41;
  };

  const getSessionsAttended = () => {
    if (!programData?.sessions || programData.sessions.length === 0) return 0;
    const attended = programData.sessions.filter(s => 
      s.attendance && Array.isArray(s.attendance) && s.attendance.length > 0
    ).length;
    return attended;
  };

  const getTotalSessions = () => {
    return programData?.sessions?.length || 0;
  };

  const getSessionsByStatus = (status) => {
    if (!programData?.sessions) return [];
    const now = new Date();
    return programData.sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      if (status === 'upcoming') {
        return sessionDate > now && session.status === 'SCHEDULED';
      }
      if (status === 'past') {
        return sessionDate < now || session.status === 'COMPLETED';
      }
      return true;
    });
  };

  const getAttendanceStatus = (session) => {
    // Attendance data would come from backend - for now using placeholder logic
    // In real implementation, this would check if current user ID is in attendance array
    if (session.attendancePercentage !== undefined) {
      return session.attendancePercentage >= 50 ? 'present' : 'missed';
    }
    return 'not-marked';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-textMuted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text mb-2">Program not found</h3>
        <Button onClick={() => navigate('/student/my-courses')}>Back to My Courses</Button>
      </div>
    );
  }

  const program = programData.program;
  const progress = calculateProgress();
  const selfLearningProgress = getSelfLearningProgress();
  const sessionsAttended = getSessionsAttended();
  const totalSessions = getTotalSessions();
  const upcomingSessions = getSessionsByStatus('upcoming');
  const pastSessions = getSessionsByStatus('past');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/my-courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-text" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text">{program.name}</h1>
            <p className="text-sm text-textMuted mt-1">
              Self learning watched: {selfLearningProgress}% | Sessions attended: {sessionsAttended}/{totalSessions} ({totalSessions > 0 ? Math.round((sessionsAttended / totalSessions) * 100) : 0}%)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text hover:bg-gray-100 rounded-lg transition">
            <FileText className="h-4 w-4" />
            Notes
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text hover:bg-gray-100 rounded-lg transition">
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
          <Link
            to="/student/class-registration-policy"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Class Registration Policy
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar - Learning Track */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text mb-4">Learning Track</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('self-learning')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activeTab === 'self-learning'
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'hover:bg-gray-50 text-text'
                }`}
              >
                <PlayCircle className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Self learning</div>
                  <div className="text-xs text-textMuted">{selfLearningProgress}% Completed</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('live-classes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activeTab === 'live-classes'
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'hover:bg-gray-50 text-text'
                }`}
              >
                <Video className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Live Classes</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('assessments')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  activeTab === 'assessments'
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'hover:bg-gray-50 text-text'
                }`}
              >
                <FileCheck className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Assessments</div>
                </div>
              </button>
            </div>
          </div>

          {/* Reference Materials */}
          <div className="rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text mb-4">Reference Materials</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 text-text transition">
                <BookOpen className="h-4 w-4 text-textMuted" />
                <span className="text-sm">Ebooks</span>
                <Download className="h-4 w-4 text-textMuted ml-auto" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 text-text transition">
                <Presentation className="h-4 w-4 text-textMuted" />
                <span className="text-sm">Demos</span>
                <Download className="h-4 w-4 text-textMuted ml-auto" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 text-text transition">
                <FileText className="h-4 w-4 text-textMuted" />
                <span className="text-sm">Lab Handouts</span>
                <Download className="h-4 w-4 text-textMuted ml-auto" />
              </button>
            </div>
          </div>

          {/* Gift Icon */}
          <div className="flex justify-center">
            <button className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition">
              <Gift className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'live-classes' && (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-brintelli-border">
                <button
                  onClick={() => setSessionTab('my-class')}
                  className={`px-6 py-3 font-semibold text-sm transition ${
                    sessionTab === 'my-class'
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-textMuted hover:text-text'
                  }`}
                >
                  My Class
                </button>
                <button
                  onClick={() => setSessionTab('past-classes')}
                  className={`px-6 py-3 font-semibold text-sm transition ${
                    sessionTab === 'past-classes'
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-textMuted hover:text-text'
                  }`}
                >
                  Past Classes
                </button>
              </div>

              {/* Sessions List */}
              {sessionTab === 'my-class' && (
                <div className="space-y-6">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <SessionCard key={session.id || session._id} session={session} />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4" />
                      <p className="text-textMuted">No upcoming sessions scheduled</p>
                    </div>
                  )}
                </div>
              )}

              {sessionTab === 'past-classes' && (
                <div className="space-y-6">
                  {pastSessions.length > 0 ? (
                    pastSessions.map((session) => (
                      <PastSessionCard key={session.id || session._id} session={session} />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Clock className="h-12 w-12 text-textMuted mx-auto mb-4" />
                      <p className="text-textMuted">No past sessions</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'self-learning' && (
            <div className="rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-text mb-4">Self Learning Content</h2>
              <p className="text-textMuted">Self learning content will be displayed here.</p>
            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-text mb-4">Assessments</h2>
              <p className="text-textMuted">Assessments will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Session Card Component for Upcoming Sessions
const SessionCard = ({ session }) => {
  const navigate = useNavigate();
  
  return (
    <div className="rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text mb-1">{session.name}</h3>
          <p className="text-sm text-textMuted">{session.description}</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          Scheduled
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-textMuted">
          <Calendar className="h-4 w-4" />
          <span>{new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2 text-textMuted">
          <Clock className="h-4 w-4" />
          <span>{new Date(session.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {session.duration || 240} mins</span>
        </div>
      </div>

      {session.meetingLink && (
        <Button
          onClick={() => window.open(session.meetingLink, '_blank')}
          className="w-full"
        >
          Join Live Class
        </Button>
      )}
    </div>
  );
};

// Past Session Card Component with Attendance
const PastSessionCard = ({ session }) => {
  // Calculate attendance - in real implementation this would come from backend
  const attendancePercentage = session.attendancePercentage || (Math.random() > 0.5 ? 88 : 0);
  const isPresent = attendancePercentage >= 50;
  const sessionsAttended = isPresent ? 1 : 0;
  const totalSessions = 1;

  return (
    <div className="rounded-2xl border border-brintelli-border bg-white p-6 shadow-sm">
      {/* Class Details */}
      <div className="mb-4 pb-4 border-b border-brintelli-border">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-text mb-1">{session.name}</h3>
            <p className="text-sm text-textMuted">{session.description}</p>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            Class Over
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-textMuted">
          <div>
            <span className="font-medium text-text">Starts:</span> {new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div>
            <span className="font-medium text-text">Ends:</span> {session.endDate ? new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
          </div>
          <div>
            <span className="font-medium text-text">Sessions:</span> {session.totalSessions || 1} Sessions
          </div>
          <div>
            <span className="font-medium text-text">Time:</span> {new Date(session.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} (IST) - {Math.floor((session.duration || 240) / 60)} Hrs
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="mb-4 pb-4 border-b border-brintelli-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text">Attendance Summary</span>
          <div className="flex items-center gap-2">
            <div className="relative w-16 h-16">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={isPresent ? "#10b981" : "#ef4444"}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(attendancePercentage / 100) * 175.9} 175.9`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold">{attendancePercentage}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-text">
                {sessionsAttended}/{totalSessions} session(s) attended
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-800">
              You need to attend minimum 50% of a session to be marked as Present.
            </p>
          </div>
        </div>

        <div className="text-xs text-textMuted space-y-1">
          <p>• Attend at least 1 session(s) of this class</p>
          <p>• Attend minimum 50% of a session to be marked as Present</p>
        </div>
      </div>

      {/* Sessions List */}
      <div>
        <h4 className="text-sm font-semibold text-text mb-3">Sessions</h4>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <div
              key={num}
              className="flex-shrink-0 w-32 rounded-lg border border-brintelli-border bg-white p-3 text-center"
            >
              <div className="text-xs font-medium text-text mb-2">
                {new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className={`flex items-center justify-center gap-1 mb-2 ${
                isPresent ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPresent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Present</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    <span className="text-xs font-medium">Missed</span>
                  </>
                )}
              </div>
              <button className="text-textMuted hover:text-brand-600 transition">
                <Download className="h-4 w-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
