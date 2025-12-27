import { useState, useEffect } from "react";
import { ArrowRight, ClipboardList, FilePlus2, MessageCircle, PlayCircle, CalendarClock, ChevronRight, LayoutGrid, UsersRound, Clock, TrendingUp, AlertCircle, BookOpen, GraduationCap } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import Table from "../../components/Table";
import Button from "../../components/Button";
import tutorAPI from "../../api/tutor";

const doubtColumns = [
  { key: "student", title: "Student" },
  { key: "topic", title: "Topic" },
  { key: "age", title: "Waiting" },
];

const doubts = [
  { id: 1, student: "Arjun M", topic: "Cache invalidation strategy", age: "12 mins" },
  { id: 2, student: "Niharika D", topic: "DP memoization vs tabulation", age: "24 mins" },
  { id: 3, student: "Ritik S", topic: "API pagination best practices", age: "32 mins" },
];

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [batchesRes, sessionsRes] = await Promise.all([
        tutorAPI.getMyBatches(),
        tutorAPI.getMySessions({ status: 'SCHEDULED' }),
      ]);

      if (batchesRes.success) {
        setBatches(batchesRes.data.batches || []);
      }

      if (sessionsRes.success) {
        const allSessions = sessionsRes.data.sessions || [];
        setSessions(allSessions);
        
        const now = new Date();
        const upcoming = allSessions.filter(s => {
          if (!s.scheduledDate) return false;
          return new Date(s.scheduledDate) > now;
        }).slice(0, 2);
        setUpcomingSessions(upcoming);

        const today = allSessions.filter(s => {
          if (!s.scheduledDate) return false;
          const sessionDate = new Date(s.scheduledDate);
          return sessionDate.toDateString() === now.toDateString();
        });
        setTodaySessions(today);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatSessionTime = (scheduledDate) => {
    if (!scheduledDate) return 'Not scheduled';
    const date = new Date(scheduledDate);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <PageHeader
        title="Mentor Command Center"
        description="Monitor today's sessions, attend to student doubts, and keep your courses running smoothly."
        actions={
          <>
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={() => navigate('/tutor/schedule')}
            >
              <CalendarClock className="h-4 w-4" />
              View Teaching Calendar
            </Button>
            <Button 
              variant="primary" 
              className="gap-2"
              onClick={() => navigate('/tutor/live')}
            >
              <PlayCircle className="h-4 w-4" />
              Start Live Session
            </Button>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard 
          icon={PlayCircle} 
          value={todaySessions.length.toString()} 
          label="Sessions Today" 
          trend={todaySessions.length > 0 ? `Next: ${formatSessionTime(todaySessions[0]?.scheduledDate)}` : "No sessions"} 
        />
        <StatsCard 
          icon={BookOpen} 
          value={batches.length.toString()} 
          label="Assigned Batches" 
          trend={`${batches.filter(b => b.status === 'ACTIVE').length} active`} 
        />
        <StatsCard 
          icon={MessageCircle} 
          value="7" 
          label="Doubts Pending" 
          trend="3 new" 
          trendType="negative" 
        />
        <StatsCard 
          icon={ClipboardList} 
          value="12" 
          label="Assignments to Review" 
          trend="Due today" 
          trendType="negative" 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text">Today's Sessions</h3>
                <p className="mt-1 text-sm text-textMuted">
                  Join live classes and prep rooms. Ensure decks and recordings are ready.
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                onClick={() => navigate('/tutor/schedule')}
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="group relative overflow-hidden rounded-2xl border border-brintelli-border/60 bg-gradient-to-br from-white to-brand-50/30 p-5 shadow-sm transition-all duration-300 hover:border-brand-300/60 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/0 transition-all duration-300 group-hover:from-brand-500/5 group-hover:via-brand-500/3 group-hover:to-transparent" />
                    <div className="relative">
                      <div className="mb-3 flex items-start justify-between">
                        <p className="text-base font-bold text-text">{session.name}</p>
                        <Clock className="h-4 w-4 text-textMuted" />
                      </div>
                      <p className="mb-2 text-sm font-medium text-textMuted">
                        {formatSessionTime(session.scheduledDate)}
                        {session.duration && ` • ${session.duration} min`}
                      </p>
                      {session.batch && (
                        <span className="inline-flex rounded-full bg-gradient-to-r from-brand-500/15 to-brand-600/15 px-3 py-1.5 text-xs font-bold text-brand-700 ring-1 ring-brand-200/50 mb-3">
                          {session.batch.name}
                        </span>
                      )}
                      <Button 
                        variant="primary" 
                        className="mt-4 w-full justify-center gap-2 shadow-sm"
                        onClick={() => navigate('/tutor/live')}
                      >
                        <PlayCircle className="h-4 w-4" />
                        Enter Studio
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-2xl border border-dashed border-brintelli-border/60 bg-brintelli-baseAlt/30 p-8 text-center">
                  <CalendarClock className="h-12 w-12 text-textMuted mx-auto mb-3" />
                  <p className="text-sm font-semibold text-textMuted">No upcoming sessions</p>
                  <p className="text-xs text-textMuted mt-1">Sessions will appear here once scheduled</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text">Doubt Queue</h3>
                <p className="mt-1 text-sm text-textMuted">Address student questions and concerns promptly.</p>
              </div>
              <Button className="gap-2 shadow-sm">
                <MessageCircle className="h-4 w-4" />
                Resolve Doubts
              </Button>
            </div>
            <div className="mt-6">
              <div className="overflow-hidden rounded-xl border border-brintelli-border/60">
                <Table columns={doubtColumns} data={doubts} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-600" />
                <h3 className="text-xl font-bold text-text">Student Performance Preview</h3>
              </div>
              <Button
                variant="ghost"
                className="gap-2 text-xs"
                onClick={() => navigate('/tutor/curriculum')}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Modules
              </Button>
            </div>
            <p className="mb-5 text-sm text-textMuted">Monitor cohort health and intervene early.</p>
            <div className="grid gap-3">
              {[
                { label: "Average attendance", value: "86%", tone: "positive", icon: TrendingUp },
                { label: "Assignments on time", value: "68%", tone: "warning", icon: AlertCircle },
                { label: "Mock interview completion", value: "42%", tone: "negative", icon: AlertCircle },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className={[
                      "flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                      metric.tone === "positive"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50"
                        : metric.tone === "warning"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{metric.label}</span>
                    </div>
                    <span className="font-bold">{metric.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 h-40 rounded-xl border-2 border-dashed border-brintelli-border/60 bg-gradient-to-br from-brand-50/30 to-brand-50/10 text-center text-sm text-textMuted">
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <TrendingUp className="h-8 w-8 text-brand-300" />
                <p className="font-semibold text-textMuted">Cohort Progress Chart</p>
                <p className="text-xs">Placeholder for performance visualization</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-text">Quick Actions</h3>
            <p className="mt-1 mb-4 text-sm text-textMuted">Common tasks to keep your courses running smoothly.</p>
            <div className="grid gap-2.5">
              {[
                { label: "Upload today's session deck", icon: FilePlus2 },
                { label: "Share class recording", icon: PlayCircle },
                { label: "Schedule mentor AMA", icon: CalendarClock },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="group flex items-center justify-between rounded-xl border border-brintelli-border/60 bg-white px-4 py-3.5 text-left text-sm font-medium text-textSoft transition-all duration-200 hover:border-brand-300/60 hover:bg-brand-50/50 hover:text-brand-700 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-brand-100/50 p-1.5 text-brand-600 transition-all duration-200 group-hover:bg-brand-200/70">
                        <ActionIcon className="h-4 w-4" />
                      </div>
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-textMuted transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand-600" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorDashboard;

