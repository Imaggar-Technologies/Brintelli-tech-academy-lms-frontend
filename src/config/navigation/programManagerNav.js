import {
  LayoutDashboard,
  Layers3,
  BookOpen,
  Users,
  GraduationCap,
  CalendarClock,
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
  UserCheck,
  MonitorPlay,
  Video,
  FileText,
  ListChecks,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

/**
 * Program Manager Navigation
 * 
 * Organized structure for Program Manager to manage:
 * - Programs & Courses
 * - Batches
 * - Tutors
 * - Academic Operations
 * - Content & Assessments
 * - Analytics & Reports
 */
const programManagerNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/program-manager/dashboard",
    pageId: "pm-dashboard",
    permissions: ["programs:read"],
  },
  
  // ============================================
  // PROGRAMS & COURSES
  // ============================================
  {
    id: "programs-courses",
    label: "Programs & Courses",
    icon: Layers3,
    permissions: ["programs:read", "courses:read"],
    children: [
      {
        label: "All Programs",
        icon: Layers3,
        path: "/program-manager/programs",
        pageId: "pm-programs",
        permissions: ["programs:read"],
      },
      {
        label: "Create Program",
        icon: Layers3,
        path: "/program-manager/programs/create",
        pageId: "pm-programs-create",
        permissions: ["programs:create"],
      },
      {
        label: "Curriculum Builder",
        icon: BookOpen,
        path: "/program-manager/curriculum",
        pageId: "pm-curriculum",
        permissions: ["modules:read"],
      },
    ],
  },

  // ============================================
  // BATCHES
  // ============================================
  {
    id: "batches",
    label: "Batches",
    icon: Users,
    permissions: ["batches:read"],
    children: [
      {
        label: "All Batches",
        icon: Users,
        path: "/program-manager/batches",
        pageId: "pm-batches",
        permissions: ["batches:read"],
      },
      {
        label: "Create Batch",
        icon: Users,
        path: "/program-manager/batches/create",
        pageId: "pm-batches-create",
        permissions: ["batches:create"],
      },
      {
        label: "Batch Health",
        icon: ChartSpline,
        path: "/program-manager/batch-health",
        pageId: "pm-batch-health",
        permissions: ["batches:read"],
      },
      {
        label: "Batch Schedule",
        icon: CalendarDays,
        path: "/program-manager/batch-schedule",
        pageId: "pm-batch-schedule",
        permissions: ["batches:read"],
      },
      {
        label: "Student Alerts",
        icon: Target,
        path: "/program-manager/alerts",
        pageId: "pm-alerts",
        permissions: ["batches:read"],
      },
    ],
  },

  // ============================================
  // TUTORS
  // ============================================
  {
    id: "tutors",
    label: "Tutors",
    icon: GraduationCap,
    permissions: ["tutor:read"],
    children: [
      {
        label: "All Tutors",
        icon: GraduationCap,
        path: "/program-manager/tutors",
        pageId: "pm-tutors",
        permissions: ["tutor:read"],
      },
      {
        label: "Tutor Assignment",
        icon: UserCheck,
        path: "/program-manager/tutors/assign",
        pageId: "pm-tutors-assign",
        permissions: ["tutor:update"],
      },
      {
        label: "Tutor Performance",
        icon: TrendingUp,
        path: "/program-manager/tutor-performance",
        pageId: "pm-tutor-performance",
        permissions: ["tutor:read"],
      },
      {
        label: "Tutor Schedule",
        icon: CalendarClock,
        path: "/program-manager/tutor-schedule",
        pageId: "pm-tutor-schedule",
        permissions: ["tutor:read"],
      },
    ],
  },

  // ============================================
  // ACADEMIC OPERATIONS
  // ============================================
  {
    id: "academics",
    label: "Academic Operations",
    icon: CalendarClock,
    permissions: ["sessions:read", "modules:read"],
    children: [
      {
        label: "Schedule Management",
        icon: CalendarDays,
        path: "/program-manager/schedule",
        pageId: "pm-schedule",
        permissions: ["sessions:read"],
      },
      {
        label: "Live Sessions",
        icon: MonitorPlay,
        path: "/program-manager/live-sessions",
        pageId: "pm-live-sessions",
        permissions: ["sessions:read"],
      },
      {
        label: "Session Recordings",
        icon: Video,
        path: "/program-manager/recordings",
        pageId: "pm-recordings",
        permissions: ["sessions:read"],
      },
      {
        label: "Weekly Class Plans",
        icon: CalendarClock,
        path: "/program-manager/weekly-plans",
        pageId: "pm-weekly",
        permissions: ["sessions:read"],
      },
      {
        label: "Academic Calendar",
        icon: CalendarDays,
        path: "/program-manager/calendar",
        pageId: "pm-calendar",
        permissions: ["sessions:read"],
      },
      {
        label: "Syllabus Planner",
        icon: FileText,
        path: "/program-manager/syllabus",
        pageId: "pm-syllabus",
        permissions: ["modules:read"],
      },
    ],
  },

  // ============================================
  // CONTENT & ASSESSMENTS
  // ============================================
  {
    id: "content-assessments",
    label: "Content & Assessments",
    icon: FileSpreadsheet,
    permissions: ["assignments:read", "modules:read"],
    children: [
      {
        label: "Assignments",
        icon: FileSpreadsheet,
        path: "/program-manager/assignments",
        pageId: "pm-assignments",
        permissions: ["assignments:read"],
      },
      {
        label: "Assessment Builder",
        icon: FileSpreadsheet,
        path: "/program-manager/assessment-builder",
        pageId: "pm-assessment",
        permissions: ["assignments:create"],
      },
      {
        label: "Assessment Schedule",
        icon: CalendarClock,
        path: "/program-manager/assessment-schedule",
        pageId: "pm-assessment-schedule",
        permissions: ["assignments:read"],
      },
      {
        label: "Assessment Results",
        icon: FileBarChart,
        path: "/program-manager/results",
        pageId: "pm-results",
        permissions: ["assignments:read"],
      },
      {
        label: "Content Review",
        icon: ClipboardCheck,
        path: "/program-manager/content-review",
        pageId: "pm-content-review",
        permissions: ["modules:read"],
      },
      {
        label: "Content Approvals",
        icon: ShieldCheck,
        path: "/program-manager/approvals",
        pageId: "pm-approvals",
        permissions: ["modules:update"],
      },
      {
        label: "Content Library",
        icon: BookOpen,
        path: "/program-manager/library",
        pageId: "pm-library",
        permissions: ["modules:read"],
      },
    ],
  },

  // ============================================
  // ANALYTICS & REPORTS
  // ============================================
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: BarChart3,
    permissions: ["programs:read"],
    children: [
      {
        label: "Academic Analytics",
        icon: ChartSpline,
        path: "/program-manager/analytics",
        pageId: "pm-analytics",
        permissions: ["programs:read"],
      },
      {
        label: "Performance Reports",
        icon: FileSpreadsheet,
        path: "/program-manager/reports",
        pageId: "pm-reports",
        permissions: ["programs:read"],
      },
      {
        label: "Batch Analytics",
        icon: BarChart3,
        path: "/program-manager/batch-analytics",
        pageId: "pm-batch-analytics",
        permissions: ["batches:read"],
      },
      {
        label: "Quality Metrics",
        icon: BadgeCheck,
        path: "/program-manager/quality",
        pageId: "pm-quality",
        permissions: ["programs:read"],
      },
    ],
  },

  // ============================================
  // SETTINGS
  // ============================================
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/program-manager/profile",
    pageId: "pm-profile",
    permissions: ["programs:read"],
  },
];

export default programManagerNav;

