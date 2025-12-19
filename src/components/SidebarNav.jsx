import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  Video,
  ClipboardList,
  ListChecks,
  MessageCircleQuestion,
  UserCircle2,
  GraduationCap,
  Upload,
  UsersRound,
  Presentation,
  FolderKanban,
  ChartSpline,
  ShieldCheck,
  CalendarDays,
  UserSquare2,
  BriefcaseBusiness,
  Settings,
  Rocket,
  FileText,
  Terminal,
  Star,
  StarOff,
} from "lucide-react";
import { Fragment } from "react";

const navConfig = {
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/student/my-courses", icon: GraduationCap },
    { label: "Live Classes", href: "/student/live-classes", icon: CalendarClock },
    { label: "Recordings", href: "/student/recordings", icon: Video },
    { label: "Assignments", href: "/student/assignments", icon: ClipboardList },
    { label: "Tests", href: "/student/tests", icon: ListChecks },
    { label: "Mock Interviews", href: "/student/mock-interviews", icon: Presentation },
    { label: "Doubts", href: "/student/doubts", icon: MessageCircleQuestion },
    { label: "MCQ Practice", href: "/student/mcq-practice", icon: FileText },
    { label: "Certifications", href: "/student/certifications", icon: ShieldCheck },
    { label: "Code Playground", href: "/student/code-playground", icon: Terminal },
    { label: "Placement Assistance", href: "/student/placement-assistance", icon: BriefcaseBusiness },
    { label: "Profile", href: "/student/profile", icon: UserCircle2 },
  ],
  tutor: [
    { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
    { label: "Manage Courses", href: "/tutor/manage-courses", icon: FolderKanban },
    { label: "Lessons", href: "/tutor/lessons", icon: BookOpen },
    { label: "Upload Materials", href: "/tutor/upload-materials", icon: Upload },
    { label: "Live Controller", href: "/tutor/live-class-controller", icon: CalendarClock },
    { label: "Students", href: "/tutor/students", icon: UsersRound },
    { label: "Performance", href: "/tutor/student-performance", icon: ChartSpline },
  ],
  lsm: [
    { label: "Dashboard", href: "/lsm/dashboard", icon: LayoutDashboard },
    { label: "Mentees", href: "/lsm/mentees", icon: UsersRound },
    { label: "Mentee Profile", href: "/lsm/mentee/1", icon: UserSquare2 },
    { label: "Session Schedule", href: "/lsm/session-schedule", icon: CalendarDays },
    { label: "Progress Reports", href: "/lsm/progress-reports", icon: ChartSpline },
    { label: "Placement Tracker", href: "/lsm/placement-tracker", icon: BriefcaseBusiness },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Batches", href: "/admin/batches", icon: CalendarClock },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Tutors", href: "/admin/tutors", icon: UsersRound },
    { label: "LSMs", href: "/admin/lsms", icon: ShieldCheck },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Placement", href: "/admin/placement", icon: BriefcaseBusiness },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  placement: [
    { label: "Dashboard", href: "/placement/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/placement/dashboard#pipeline", icon: UsersRound },
    { label: "Interviews", href: "/placement/dashboard#interviews", icon: CalendarClock },
    { label: "Companies", href: "/placement/dashboard#companies", icon: BriefcaseBusiness },
  ],
};

const pinnedConfig = {
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, pinned: true },
    { label: "MCQ Practice", href: "/student/mcq-practice", icon: FileText, pinned: true },
    { label: "Code Playground", href: "/student/code-playground", icon: Terminal, pinned: true },
    { label: "Placement Assistance", href: "/student/placement-assistance", icon: BriefcaseBusiness, pinned: true },
  ],
  tutor: [
    { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard, pinned: true },
    { label: "Lessons", href: "/tutor/lessons", icon: BookOpen, pinned: true },
  ],
  lsm: [
    { label: "Dashboard", href: "/lsm/dashboard", icon: LayoutDashboard, pinned: true },
    { label: "Mentees", href: "/lsm/mentees", icon: UsersRound, pinned: true },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, pinned: true },
    { label: "Placement", href: "/admin/placement", icon: BriefcaseBusiness, pinned: true },
  ],
  placement: [
    { label: "Dashboard", href: "/placement/dashboard", icon: LayoutDashboard, pinned: true },
    { label: "Company Pipeline", href: "/placement/dashboard#companies", icon: Rocket, pinned: true },
  ],
};

const roleMeta = {
  student: { title: "Brintelli Learn", subtitle: "Student Portal" },
  tutor: { title: "Brintelli Teach", subtitle: "Tutor Console" },
  lsm: { title: "Brintelli Assist", subtitle: "LSM Suite" },
  admin: { title: "Brintelli Control", subtitle: "Admin Hub" },
  placement: { title: "Brintelli Placement", subtitle: "Company Pipeline" },
};

const SidebarNav = ({
  role = "student",
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { pathname } = useLocation();
  const items = navConfig[role] ?? navConfig.student;
  const pinnedItems = pinnedConfig[role] ?? [];
  const meta = roleMeta[role] ?? roleMeta.student;

  const sidebarWidth = collapsed ? "w-20" : "w-64 lg:w-72";
  const showLabels = !collapsed;

  const navItemClass = (isActive) =>
    [
      "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
      isActive
        ? "bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 text-white shadow-soft"
        : "text-textSoft hover:bg-brintelli-baseAlt hover:text-text",
      collapsed ? "justify-center px-2 py-2" : "",
    ]
      .filter(Boolean)
      .join(" ");

  const renderNavItemContent = (Icon, label, isActive, pinned) => (
    <Fragment>
      <Icon
        className={[
          "h-5 w-5 shrink-0 transition-transform",
          isActive ? "scale-110 text-white" : "text-textMuted group-hover:text-text",
        ].join(" ")}
      />
      {showLabels && (
        <div className="flex flex-1 items-center justify-between">
          <span>{label}</span>
          {pinned ? (
            <Star className="h-4 w-4 text-brand-500" fill="currentColor" />
          ) : (
            <StarOff className="h-4 w-4 text-textMuted" />
          )}
        </div>
      )}
    </Fragment>
  );

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={[
          "fixed inset-0 z-30 bg-brintelli-baseAlt/60 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex transform transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div
          className={[
            sidebarWidth,
            "flex h-screen shrink-0 flex-col border-r border-brintelli-border bg-brintelli-card px-4 py-5 backdrop-blur",
          ].join(" ")}
        >
          <div className={["flex flex-col gap-2 border-b border-brintelli-border pb-4", showLabels ? "" : "items-center"].join(" ")}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white shadow-soft">
              BT
            </div>
            {showLabels && (
              <>
                <h1 className="text-base font-semibold text-text">{meta.title}</h1>
                <p className="text-xs text-textMuted">{meta.subtitle}</p>
              </>
            )}
          </div>

          {pinnedItems.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              {showLabels && (
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-textMuted">
                  Pinned tools
                </p>
              )}
              <ul className="flex flex-col gap-1.5">
                {pinnedItems.map((item) => {
                  const Icon = item.icon;
                  const targetPath = item.href.split("#")[0];
                  const isActive = pathname.startsWith(targetPath);
                  return (
                    <li key={item.href}>
                      <NavLink
                        to={item.href}
                        title={!showLabels ? item.label : undefined}
                        className={navItemClass(isActive)}
                        onClick={onCloseMobile}
                      >
                        {renderNavItemContent(Icon, item.label, isActive, true)}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <nav className="mt-5 flex-1 overflow-y-auto">
            {showLabels && (
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-textMuted">
                Navigation
              </p>
            )}
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const targetPath = item.href.split("#")[0];
                const isActive = pathname.startsWith(targetPath);
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      title={!showLabels ? item.label : undefined}
                      className={navItemClass(isActive)}
                      onClick={onCloseMobile}
                    >
                      {renderNavItemContent(Icon, item.label, isActive, false)}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={[showLabels ? "mt-4" : "mt-auto", "rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 p-4 text-white shadow-soft"].join(" ")}>
            {showLabels ? (
              <>
                <p className="text-sm font-medium">Need help?</p>
                <p className="mt-1 text-xs text-white/80">Contact your success manager anytime.</p>
                <button className="mt-3 w-full rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/30">
                  Support Center
                </button>
              </>
            ) : (
              <Star className="mx-auto h-5 w-5 text-white" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;

