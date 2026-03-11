import { useEffect, useMemo, useState } from "react";
import { Bell, Menu, Search, Sparkles, Flame, Coins, Award, Bug } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import NotificationsDropdown from "../NotificationsDropdown";
import UserMenu from "../UserMenu";
import ReportBugModal from "../ReportBugModal";
import PointsEarnedModal from "../PointsEarnedModal";
import Tooltip from "../Tooltip";
import notificationApi from "../../api/notification";
import referralAPI from "../../api/referral";
import toast from "react-hot-toast";

const notificationSeed = [
  {
    id: 1,
    title: "Live class starts in 30 minutes",
    timestamp: "Just now",
    type: "live",
    read: false,
  },
  {
    id: 2,
    title: "Assignment feedback available",
    timestamp: "1h ago",
    type: "assignment",
    read: false,
  },
  {
    id: 3,
    title: "New resume tips posted",
    timestamp: "Yesterday",
    type: "placement",
    read: true,
  },
];

const roleLabelMap = {
  admin: "Admin",
  learner: "Learner Workspace",
  student: "Learner Workspace",
  placement: "Placement Officer",
  lsm: "Learning Success Manager",
  tutor: "Tutor Console",
  mentor: "Mentor Portal",
  "program-manager": "Program Manager",
  programManager: "Program Manager",
  finance: "Finance Management",
  sales: "Dashboard",
  sales_agent: "Dashboard",
  sales_lead: "Dashboard",
  sales_head: "Dashboard",
  sales_admin: "Dashboard",
  marketing: "Marketing Operations",
  "external-hr": "External HR Partner",
  externalHR: "External HR Partner",
};

const titleOverrides = {
  dashboard: "Dashboard",
  "my-courses": "My Courses",
  course: "Course Details",
  "live-classes": "Live Classes",
  recordings: "Session Recordings",
  assignments: "Assignments",
  tests: "Tests & Assessments",
  "mock-interviews": "Mock Interviews",
  doubts: "Doubts & Discussions",
  "mcq-practice": "MCQ Practice",
  certifications: "Certifications",
  "code-playground": "Code Playground",
  "placement-assistance": "Placement Assistance",
  profile: "Profile",
  "manage-courses": "Manage Courses",
  lessons: "Lessons",
  "upload-materials": "Upload Materials",
  "live-class-controller": "Live Class Controller",
  students: "Students",
  "student-performance": "Student Performance",
  mentees: "Mentees",
  mentee: "Mentee Profile",
  "session-schedule": "Session Schedule",
  "progress-reports": "Progress Reports",
  "placement-tracker": "Placement Tracker",
  batches: "Batches",
  tutors: "Tutors",
  lsms: "Learning Success Managers",
  courses: "Courses",
  placement: "Placement Hub",
  settings: "Settings",
};

const toTitleCase = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getPageTitle = (pathname) => {
  if (!pathname) return "Dashboard";
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return "Dashboard";
  }


  const viewSegments = segments.slice(1);
  if (!viewSegments.length) {
    return "Dashboard";
  }

  let key = viewSegments[viewSegments.length - 1];

  if (!key || /^\d+$/.test(key)) {
    key = viewSegments[viewSegments.length - 2] ?? key;
  }

  return titleOverrides[key] ?? toTitleCase(key);
};

const Topbar = ({ onToggleMobileSidebar, role, roleLabelOverride, roleOptions, currentRole, onRoleChange, userId }) => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [referralPoints, setReferralPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [brintelliPoints, setBrintelliPoints] = useState(null);
  const [superCoins, setSuperCoins] = useState(null);
  const [reportBugOpen, setReportBugOpen] = useState(false);
  const [pointsEarnedOpen, setPointsEarnedOpen] = useState(false);
  const [pointsEarnedData, setPointsEarnedData] = useState({ pointsEarned: 20, totalPoints: null });

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  const isLearner = useMemo(() => {
    const r = (user?.role || '').toLowerCase();
    return r === 'student' || r === 'learner';
  }, [user?.role]);

  const isStaffForCoins = useMemo(() => {
    const r = (user?.role || '').toLowerCase();
    return ['sales', 'sales_agent', 'sales_lead', 'sales_admin', 'sales_head', 'marketing', 'tutor', 'mentor', 'lsm', 'program-manager', 'programmanager', 'representative'].includes(r);
  }, [user?.role]);
  
  // Use actual user role from Redux if available, otherwise use role prop
  const actualRole = useMemo(() => {
    return user?.role || role;
  }, [user, role]);
  
  const roleLabel = useMemo(() => {
    if (roleLabelOverride) return roleLabelOverride;
    return roleLabelMap[actualRole] ?? toTitleCase(actualRole ?? "student");
  }, [actualRole, roleLabelOverride]);
  
  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id && !user?.userId) return; // Don't fetch if user not logged in
      
      try {
        setLoadingNotifications(true);
        const response = await notificationApi.getNotifications({ limit: 20 });
        if (response.success && response.data?.notifications) {
          // Transform API response to match component format
          const transformed = response.data.notifications.map((notif) => ({
            id: notif.id || notif._id?.toString(),
            title: notif.title || notif.message,
            message: notif.message || '',
            timestamp: formatTimestamp(notif.createdAt || notif.timestamp),
            type: notif.type?.toLowerCase() || 'default',
            read: notif.read || false,
            link: notif.link || null,
            metadata: notif.metadata || {},
          }));
          setNotifications(transformed);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to seed data on error
        setNotifications(notificationSeed);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Referral points for learner/student (show in topbar)
  useEffect(() => {
    const roleKey = (user?.role || '').toLowerCase();
    const learner = roleKey === 'student' || roleKey === 'learner';
    if (!learner || !user?.id) return;
    const fetchPoints = async () => {
      try {
        const res = await referralAPI.getMyReferral();
        if (res?.success && (res.totalReferralPoints ?? 0) > 0) {
          setReferralPoints(res.totalReferralPoints);
        }
      } catch (_) {}
    };
    fetchPoints();
  }, [user?.id, user?.role]);

  // Streak and points/coins from profile for all users
  useEffect(() => {
    if (!user?.id) return;
    const fetchMe = async () => {
      try {
        const apiRequest = (await import('../../api/apiClient')).default;
        const res = await apiRequest('/api/users/me');
        const u = res?.data?.user;
        if (!u) return;
        if (u.streak != null) setStreak(Number(u.streak));
        if (u.brintelliPoints != null) setBrintelliPoints(Number(u.brintelliPoints));
        if (u.superCoins != null) setSuperCoins(Number(u.superCoins));
      } catch (_) {}
    };
    fetchMe();
  }, [user?.id]);

  useEffect(() => {
    setPanelOpen(false);
  }, [location.pathname]);

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
      // Still update UI optimistically
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    }
  };

  // Format timestamp helper
  const handleBugReportSuccess = (data) => {
    const earned = data?.pointsEarned ?? 20;
    setPointsEarnedData({ pointsEarned: earned, totalPoints: data?.totalPoints ?? null });
    setPointsEarnedOpen(true);
    if (brintelliPoints !== null && data?.totalPoints != null) setBrintelliPoints(data.totalPoints);
    toast.success(`You've earned ${earned} points! Thank you for reporting the bug.`, { duration: 5000 });
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-brintelli-border/60 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-3.5 sm:px-6">
        <div className="grid w-full items-center gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border/60 bg-white text-textSoft shadow-sm transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-600/80">
                {roleLabel}
              </span>
              <h1 className="text-xl font-bold text-text">{pageTitle}</h1>
            </div>
          </div>

          <div className="hidden w-full justify-self-center lg:flex">
            <div className="relative flex w-full max-w-2xl items-center">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search courses, sessions, mentors..."
                className="w-full rounded-xl border border-brintelli-border/60 bg-white px-12 py-3 text-sm text-textSoft placeholder:text-textMuted/70 shadow-sm outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:shadow-md focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 sm:gap-3">
            {isLearner && streak > 0 && (
              <Tooltip
                placement="bottom"
                content={
                  <>
                    <p className="font-semibold text-text mb-1">Login streak</p>
                    <p className="text-textMuted text-xs mb-1">
                      Consecutive days you’ve logged in. Log in every day to keep your streak going.
                    </p>
                    <p className="text-textSoft text-xs font-medium">Benefits: Stay on track, build a learning habit, and get recognized for consistency.</p>
                  </>
                }
              >
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/60 bg-sky-50/90 px-3 py-2 text-sm font-semibold text-sky-700 cursor-help">
                  <Flame className="h-4 w-4 text-sky-500" />
                  {streak} day{streak !== 1 ? 's' : ''}
                </span>
              </Tooltip>
            )}
            {isLearner && brintelliPoints !== null && (
              <Tooltip
                placement="bottom"
                content={
                  <>
                    <p className="font-semibold text-text mb-1">Brintelli points</p>
                    <p className="text-textMuted text-xs mb-1">
                      Earned from profile completion, quizzes, workshops, reporting bugs, and engagement.
                    </p>
                    <p className="text-textSoft text-xs font-medium">Benefits: Unlock rewards, climb leaderboards, and get recognized for your progress.</p>
                  </>
                }
              >
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/60 bg-amber-50/90 px-3 py-2 text-sm font-semibold text-amber-800 cursor-help">
                  <Award className="h-4 w-4 text-amber-600" />
                  {brintelliPoints} pts
                </span>
              </Tooltip>
            )}
            {isLearner && (
              <button
                type="button"
                onClick={() => setReportBugOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brintelli-border/60 bg-white px-3 py-2 text-sm font-medium text-textSoft shadow-sm transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
                title="Report a bug and earn 20 points"
              >
                <Bug className="h-4 w-4" />
                Report a bug
              </button>
            )}
            {isStaffForCoins && superCoins !== null && (
              <Tooltip
                placement="bottom"
                content={
                  <>
                    <p className="font-semibold text-text mb-1">Super coins</p>
                    <p className="text-textMuted text-xs mb-1">
                      Earned from enrollments, referrals, workshops, and conversions.
                    </p>
                    <p className="text-textSoft text-xs font-medium">Benefits: Redeem for incentives and get recognized for your impact.</p>
                  </>
                }
              >
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200/60 bg-violet-50/90 px-3 py-2 text-sm font-semibold text-violet-800 cursor-help">
                  <Coins className="h-4 w-4 text-violet-600" />
                  {superCoins} coins
                </span>
              </Tooltip>
            )}
            {referralPoints > 0 && (
              <Tooltip
                placement="bottom"
                content={
                  <>
                    <p className="font-semibold text-text mb-1">Referral points</p>
                    <p className="text-textMuted text-xs mb-1">Earn 100 points for each friend who joins using your invite.</p>
                    <p className="text-textSoft text-xs font-medium">Benefits: Grow your points and help others discover Brintelli.</p>
                  </>
                }
              >
                <a
                  href="/student/invite-friend"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200/60 bg-brand-50/80 px-3 py-2 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-100/80"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{referralPoints} pts</span>
                </a>
              </Tooltip>
            )}
            {roleOptions && onRoleChange && (
              <div className="hidden items-center gap-2 rounded-xl border border-brintelli-border/60 bg-white/90 px-3 py-1.5 text-xs font-medium text-textSoft shadow-sm backdrop-blur sm:inline-flex">
                <span className="text-textMuted">Role</span>
                <select
                  value={currentRole}
                  onChange={(event) => onRoleChange(event.target.value)}
                  className="rounded-lg bg-transparent text-sm font-semibold text-text outline-none"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative">
              <button
                onClick={() => setPanelOpen((prev) => !prev)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brintelli-border/60 bg-white text-textSoft shadow-sm transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-1.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsDropdown
                open={panelOpen}
                notifications={notifications}
                onClose={() => setPanelOpen(false)}
                onMarkAll={handleMarkAll}
                onNotificationClick={async (notification) => {
                  // Mark notification as read when clicked
                  if (!notification.read && notification.id) {
                    try {
                      await notificationApi.markAsRead(notification.id);
                      setNotifications((items) =>
                        items.map((item) =>
                          item.id === notification.id ? { ...item, read: true } : item
                        )
                      );
                    } catch (error) {
                      console.error('Error marking notification as read:', error);
                    }
                  }
                  
                  // Navigation is handled in NotificationsDropdown component
                }}
              />
            </div>
            <UserMenu role={actualRole} roleLabel={roleLabel} userId={userId} />
          </div>
        </div>
      </div>
      <ReportBugModal
        isOpen={reportBugOpen}
        onClose={() => setReportBugOpen(false)}
        onSuccess={handleBugReportSuccess}
      />
      <PointsEarnedModal
        isOpen={pointsEarnedOpen}
        onClose={() => setPointsEarnedOpen(false)}
        pointsEarned={pointsEarnedData.pointsEarned}
        totalPoints={pointsEarnedData.totalPoints}
        reason="reporting a bug"
      />
    </header>
  );
};

export default Topbar;

