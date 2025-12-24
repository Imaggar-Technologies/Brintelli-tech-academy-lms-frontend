import { useState, useEffect } from 'react';
import { CalendarClock, ClipboardList, GraduationCap, Target, AlertCircle } from "lucide-react";
import StatsCard from "../../components/StatsCard";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import NextLiveClassCard from "../../components/dashboard/NextLiveClassCard";
import ContinueLearningCard from "../../components/dashboard/ContinueLearningCard";
import Calendar from "../../components/dashboard/Calendar";
import Announcements from "../../components/dashboard/Announcements";
import AnimationWrapper from "../../components/AnimationWrapper";
import studentAPI from '../../api/student';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  // Filter upcoming sessions (scheduled in the future)
  const upcomingSessions = sessions.filter(s => {
    if (!s.scheduledDate) return false;
    return new Date(s.scheduledDate) > new Date() && s.status === 'SCHEDULED';
  }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Filter upcoming assignments (due dates in the future)
  const upcomingAssignments = assignments.filter(a => {
    if (!a.dueDate) return false;
    return new Date(a.dueDate) > new Date();
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Get next session
  const nextSession = upcomingSessions[0] || null;

  // Calculate stats
  const activeCoursesCount = programs.length;
  const upcomingClassesCount = upcomingSessions.length;
  const assignmentsDueThisWeek = upcomingAssignments.filter(a => {
    if (!a.dueDate) return false;
    const dueDate = new Date(a.dueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dueDate <= weekFromNow;
  }).length;

  // Calculate overall progress (placeholder - can be enhanced)
  const overallProgress = programs.length > 0 ? Math.floor(Math.random() * 30) + 60 : 0;

  const statItems = [
    {
      icon: GraduationCap,
      value: activeCoursesCount.toString(),
      label: "Active Courses",
      sublabel: programs.length > 0 ? `Enrolled in ${programs.length} program${programs.length > 1 ? 's' : ''}` : "No enrollments yet",
      trend: programs.length > 0 ? "Active" : "Complete onboarding",
    },
    {
      icon: CalendarClock,
      value: upcomingClassesCount.toString(),
      label: "Upcoming Classes",
      sublabel: nextSession 
        ? `Next: ${new Date(nextSession.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
        : "No upcoming sessions",
      trend: upcomingClassesCount > 0 ? "On track" : "No sessions",
    },
    {
      icon: ClipboardList,
      value: assignmentsDueThisWeek.toString(),
      label: "Assignments Due",
      sublabel: assignmentsDueThisWeek > 0 ? "Due this week" : upcomingAssignments.length > 0 ? `${upcomingAssignments.length} upcoming` : "No assignments",
      trend: assignmentsDueThisWeek > 0 ? "Review now" : "All caught up",
      trendType: assignmentsDueThisWeek > 0 ? "negative" : "positive",
    },
    {
      icon: Target,
      value: `${overallProgress}%`,
      label: "Overall Progress",
      sublabel: overallProgress > 0 ? "Great momentum!" : "Start learning",
      trend: overallProgress > 0 ? "+5% vs last week" : "Get started",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <WelcomeBanner />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <AnimationWrapper key={item.label} className="h-full">
            <StatsCard {...item} />
          </AnimationWrapper>
        ))}
      </div>

      {/* Upcoming Sessions Section */}
      {upcomingSessions.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Upcoming Sessions</h3>
              <p className="text-sm text-textMuted">Your scheduled live classes and sessions</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/live-classes')}>
              View All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingSessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-text text-sm">{session.name}</h4>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {session.type}
                  </span>
                </div>
                {session.description && (
                  <p className="text-xs text-textMuted mb-2 line-clamp-2">{session.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-textSoft mb-3">
                  <CalendarClock className="h-3 w-3" />
                  <span>
                    {new Date(session.scheduledDate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {session.duration && (
                    <span>• {session.duration} min</span>
                  )}
                </div>
                {session.meetingLink && (
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => window.open(session.meetingLink, '_blank')}
                  >
                    Join Session
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Assignments Section */}
      {upcomingAssignments.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Upcoming Assignments</h3>
              <p className="text-sm text-textMuted">Assignments with upcoming due dates</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')}>
              View All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingAssignments.slice(0, 6).map((assignment) => {
              const dueDate = new Date(assignment.dueDate);
              const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntilDue <= 3;

              return (
                <div
                  key={assignment.id}
                  className={`rounded-xl border p-4 hover:shadow-md transition ${
                    isUrgent
                      ? 'border-red-300 bg-red-50/50'
                      : 'border-brintelli-border bg-brintelli-baseAlt'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-text text-sm">{assignment.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      assignment.type === 'PROJECT' ? 'bg-purple-100 text-purple-800' :
                      assignment.type === 'CODING_CHALLENGE' ? 'bg-blue-100 text-blue-800' :
                      assignment.type === 'MCQ' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.type}
                    </span>
                  </div>
                  {assignment.moduleName && (
                    <p className="text-xs text-textMuted mb-2">{assignment.moduleName}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs mb-3">
                    <ClipboardList className="h-3 w-3 text-textMuted" />
                    <span className={isUrgent ? 'text-red-600 font-medium' : 'text-textSoft'}>
                      Due: {dueDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isUrgent && (
                      <span className="text-red-600 font-medium">
                        ({daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} left)
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isUrgent ? 'primary' : 'secondary'}
                    className="w-full text-xs"
                    onClick={() => navigate('/student/assignments')}
                  >
                    View Assignment
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && upcomingSessions.length === 0 && upcomingAssignments.length === 0 && (
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

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="grid gap-6 lg:grid-cols-2">
          <NextLiveClassCard />
          <ContinueLearningCard />
        </div>
        <Calendar />
      </div>

      <Announcements />
    </div>
  );
};

export default StudentDashboard;

