import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PageHeader from "../../components/PageHeader";
import CourseCard from "../../components/CourseCard";
import studentAPI from '../../api/student';
import { BookOpen, Users, Calendar, FileText, AlertCircle } from 'lucide-react';

const StudentMyCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      } else {
        toast.error(response.message || 'Failed to load programs');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error(error.message || 'Failed to load programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (program) => {
    if (!program.modules || program.modules.length === 0) return 0;
    // Simple progress calculation - can be enhanced with actual completion tracking
    return Math.floor(Math.random() * 40) + 50; // Placeholder: 50-90%
  };

  const getNextSession = (program) => {
    if (!program.sessions || program.sessions.length === 0) return null;
    const upcoming = program.sessions
      .filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledDate) > new Date())
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    return upcoming[0] || null;
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Your Learning Tracks"
          description="Access all enrolled programs, track your progress, and jump back into classes instantly."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading your programs...</p>
        </div>
      </>
    );
  }

  if (programs.length === 0) {
    return (
      <>
        <PageHeader
          title="Your Learning Tracks"
          description="Access all enrolled programs, track your progress, and jump back into classes instantly."
        />
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-2">No programs enrolled yet.</p>
          <p className="text-sm text-textMuted">Please complete onboarding to get access to your programs.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Your Learning Tracks"
        description="Access all enrolled programs, track your progress, and jump back into classes instantly."
        actions={
          <button 
            className="rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80"
            onClick={fetchPrograms}
          >
            Refresh
          </button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((programData) => {
          const program = programData.program;
          const progress = calculateProgress(programData);
          const nextSession = getNextSession(programData);
          const nextLesson = nextSession 
            ? `${nextSession.name} - ${new Date(nextSession.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            : 'No upcoming sessions';

          return (
            <div
              key={programData.enrollmentId}
              className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/student/course/${program.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text mb-1">{program.name}</h3>
                  {programData.mentor && (
                    <p className="text-sm text-textMuted">Mentor: {programData.mentor.name}</p>
                  )}
                  {programData.batch && (
                    <p className="text-xs text-textMuted mt-1">Batch: {programData.batch.name}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-textMuted">Progress</span>
                  <span className="font-medium text-text">{progress}%</span>
                </div>
                <div className="w-full bg-brintelli-baseAlt rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-textMuted">
                  <BookOpen className="h-4 w-4" />
                  <span>{programData.modules?.length || 0} Modules</span>
                </div>
                <div className="flex items-center gap-2 text-textMuted">
                  <FileText className="h-4 w-4" />
                  <span>
                    {programData.modules?.reduce((sum, m) => sum + (m.assignments?.length || 0), 0) || 0} Assignments
                  </span>
                </div>
                <div className="flex items-center gap-2 text-textMuted">
                  <Calendar className="h-4 w-4" />
                  <span>{programData.sessions?.length || 0} Sessions</span>
                </div>
                {nextSession && (
                  <div className="pt-2 border-t border-brintelli-border">
                    <p className="text-xs text-textMuted">Next: {nextLesson}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default StudentMyCourses;

