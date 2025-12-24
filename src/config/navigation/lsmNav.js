import {
  LayoutDashboard,
  UsersRound,
  CalendarDays,
  FileBarChart,
  BriefcaseBusiness,
  Settings,
  UserCog,
  Target,
  ShieldCheck,
  MessageSquare,
  FileText,
  ChartSpline,
  ClipboardCheck,
  FileSpreadsheet,
} from "lucide-react";

const lsmNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/lsm/dashboard",
    pageId: "lsm-dashboard",
    permissions: ["lsm:read"],
  },
  {
    id: "onboarding",
    label: "Onboarding",
    icon: UserCog,
    path: "/lsm/onboarding",
    pageId: "lsm-onboarding",
    permissions: ["lsm:read"],
  },
  {
    id: "batches",
    label: "Batches",
    icon: CalendarDays,
    path: "/lsm/batches",
    pageId: "lsm-batches",
    permissions: ["lsm:read"],
  },
  {
    id: "mentors",
    label: "Mentors",
    icon: UsersRound,
    path: "/lsm/mentors",
    pageId: "lsm-mentors",
    permissions: ["lsm:read"],
  },
  {
    id: "mentees",
    label: "Mentee Management",
    icon: UsersRound,
    children: [
      { label: "My Mentees", icon: UsersRound, path: "/lsm/mentees", pageId: "lsm-mentees", permissions: ["lsm:read"] },
      { label: "Mentee Profiles", icon: UserCog, path: "/lsm/profiles", pageId: "lsm-profiles", permissions: ["lsm:read"] },
      { label: "Risk Students", icon: Target, path: "/lsm/risk-students", pageId: "lsm-risk", permissions: ["lsm:read"] },
      { label: "Escalations", icon: ShieldCheck, path: "/lsm/escalations", pageId: "lsm-escalations", permissions: ["lsm:read"] },
    ],
    permissions: ["lsm:read"],
  },
  {
    id: "sessions",
    label: "Sessions & Engagement",
    icon: CalendarDays,
    children: [
      { label: "Session Schedule", icon: CalendarDays, path: "/lsm/sessions", pageId: "lsm-sessions" },
      { label: "1:1 Sessions", icon: MessageSquare, path: "/lsm/one-on-one", pageId: "lsm-one-on-one" },
      { label: "Session Logs", icon: FileText, path: "/lsm/session-logs", pageId: "lsm-logs" },
      { label: "Engagement Tracking", icon: ChartSpline, path: "/lsm/engagement", pageId: "lsm-engagement" },
    ],
  },
  {
    id: "progress",
    label: "Progress & Reports",
    icon: FileBarChart,
    children: [
      { label: "Progress Reports", icon: FileBarChart, path: "/lsm/progress", pageId: "lsm-progress" },
      { label: "Attendance Tracking", icon: ClipboardCheck, path: "/lsm/attendance", pageId: "lsm-attendance" },
      { label: "Performance Analytics", icon: ChartSpline, path: "/lsm/performance", pageId: "lsm-performance" },
      { label: "Weekly Reports", icon: FileSpreadsheet, path: "/lsm/weekly-reports", pageId: "lsm-weekly" },
    ],
  },
  {
    id: "placement",
    label: "Placement Support",
    icon: BriefcaseBusiness,
    children: [
      { label: "Placement Tracker", icon: BriefcaseBusiness, path: "/lsm/placement-tracker", pageId: "lsm-placement" },
      { label: "Placement Readiness", icon: Target, path: "/lsm/readiness", pageId: "lsm-readiness" },
      { label: "Interview Prep", icon: ClipboardCheck, path: "/lsm/interview-prep", pageId: "lsm-interview-prep" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/lsm/profile", pageId: "lsm-profile" },
];

export default lsmNav;

