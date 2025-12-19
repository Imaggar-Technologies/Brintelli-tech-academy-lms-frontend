import { useEffect, useMemo, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import NotificationsDropdown from "../NotificationsDropdown";
import UserMenu from "../UserMenu";

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
  sales: "Sales Operations",
  sales_agent: "Sales Operations",
  sales_lead: "Sales Operations",
  sales_head: "Sales Operations",
  sales_admin: "Sales Operations",
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

  if (segments[0] === "switch-user") {
    return "Switch User";
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
  const [notifications, setNotifications] = useState(notificationSeed);
  const [panelOpen, setPanelOpen] = useState(false);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);
  
  // Use actual user role from Redux if available, otherwise use role prop
  const actualRole = useMemo(() => {
    return user?.role || role;
  }, [user, role]);
  
  const roleLabel = useMemo(() => {
    if (roleLabelOverride) return roleLabelOverride;
    return roleLabelMap[actualRole] ?? toTitleCase(actualRole ?? "student");
  }, [actualRole, roleLabelOverride]);
  
  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  useEffect(() => {
    setPanelOpen(false);
  }, [location.pathname]);

  const handleMarkAll = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-brintelli-border bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6">
        <div className="grid w-full items-center gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border bg-brintelli-card text-textSoft shadow-sm transition duration-160 hover:border-brand hover:text-brand lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-textMuted/80">
                {roleLabel}
              </span>
              <h1 className="text-lg font-semibold text-text">{pageTitle}</h1>
            </div>
          </div>

          <div className="hidden w-full justify-self-center lg:flex">
            <div className="relative flex w-full max-w-xl items-center">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-textMuted" />
              <input
                type="text"
                placeholder="Search courses, sessions, mentors..."
                className="w-full rounded-full border border-brintelli-border bg-brintelli-card px-12 py-3 text-sm text-textSoft placeholder:text-textMuted shadow-sm outline-none transition duration-160 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {roleOptions && onRoleChange && (
              <div className="hidden items-center gap-2 rounded-full border border-brintelli-border bg-white/80 px-3 py-1 text-xs font-medium text-textSoft shadow-card backdrop-blur sm:inline-flex">
                <span className="text-textMuted">Role</span>
                <select
                  value={currentRole}
                  onChange={(event) => onRoleChange(event.target.value)}
                  className="rounded-full bg-transparent text-sm font-semibold text-text outline-none"
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
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-brintelli-border bg-brintelli-card text-textSoft shadow-sm transition duration-160 hover:border-brand hover:text-brand"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationsDropdown
                open={panelOpen}
                notifications={notifications}
                onClose={() => setPanelOpen(false)}
                onMarkAll={handleMarkAll}
              />
            </div>
            <UserMenu role={actualRole} roleLabel={roleLabel} userId={userId} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

