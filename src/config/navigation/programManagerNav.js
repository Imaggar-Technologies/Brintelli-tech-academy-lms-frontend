import {
  LayoutDashboard,
  CalendarClock,
  Users,
  BookOpen,
  FileSpreadsheet,
  FileBarChart,
  BarChart3,
  Settings,
  CalendarDays,
  ChartSpline,
  Target,
  ClipboardCheck,
  ShieldCheck,
  BadgeCheck,
  Layers3,
} from "lucide-react";

const programManagerNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/program-manager/dashboard",
    pageId: "pm-dashboard",
  },
  {
    id: "academics",
    label: "Academic Operations",
    icon: CalendarClock,
    children: [
      { label: "Syllabus Planner", icon: CalendarDays, path: "/program-manager/syllabus", pageId: "pm-syllabus" },
      { label: "Weekly Class Plans", icon: CalendarClock, path: "/program-manager/weekly-plans", pageId: "pm-weekly" },
      { label: "Schedule Management", icon: CalendarDays, path: "/program-manager/schedule", pageId: "pm-schedule" },
      { label: "Academic Calendar", icon: CalendarClock, path: "/program-manager/calendar", pageId: "pm-calendar" },
    ],
  },
  {
    id: "batches",
    label: "Batch Management",
    icon: Users,
    children: [
      { label: "Active Batches", icon: Users, path: "/program-manager/batches", pageId: "pm-batches" },
      { label: "Batch Health", icon: ChartSpline, path: "/program-manager/batch-health", pageId: "pm-batch-health" },
      { label: "Student Alerts", icon: Target, path: "/program-manager/alerts", pageId: "pm-alerts" },
    ],
  },
  {
    id: "content",
    label: "Content Quality",
    icon: BookOpen,
    children: [
      { label: "Content Review", icon: ClipboardCheck, path: "/program-manager/content-review", pageId: "pm-content-review" },
      { label: "Content Approvals", icon: ShieldCheck, path: "/program-manager/approvals", pageId: "pm-approvals" },
      { label: "Content Library", icon: BookOpen, path: "/program-manager/library", pageId: "pm-library" },
      { label: "Quality Metrics", icon: BadgeCheck, path: "/program-manager/quality", pageId: "pm-quality" },
    ],
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FileSpreadsheet,
    children: [
      { label: "Assessment Builder", icon: FileSpreadsheet, path: "/program-manager/assessment-builder", pageId: "pm-assessment" },
      { label: "Assessment Schedule", icon: CalendarClock, path: "/program-manager/assessment-schedule", pageId: "pm-assessment-schedule" },
      { label: "Assessment Results", icon: FileBarChart, path: "/program-manager/results", pageId: "pm-results" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: BarChart3,
    children: [
      { label: "Academic Analytics", icon: ChartSpline, path: "/program-manager/analytics", pageId: "pm-analytics" },
      { label: "Performance Reports", icon: FileSpreadsheet, path: "/program-manager/reports", pageId: "pm-reports" },
      { label: "Tutor Performance", icon: Users, path: "/program-manager/tutor-performance", pageId: "pm-tutor-performance" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/program-manager/profile", pageId: "pm-profile" },
];

export default programManagerNav;

