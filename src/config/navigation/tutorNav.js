import {
  LayoutDashboard,
  Users,
  Settings,
  CalendarClock,
  MessageCircleQuestion,
  ClipboardCheck,
  BookOpen,
  MonitorPlay,
  FileSpreadsheet,
  LineChart,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const tutorNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/tutor/dashboard",
    pageId: "tutor-dashboard",
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: CalendarClock,
    children: [
      { label: "Calendar", icon: CalendarClock, path: "/tutor/schedule", pageId: "tutor-schedule" },
      { label: "Live Class", icon: MonitorPlay, path: "/tutor/live", pageId: "tutor-live" },
    ],
  },
  {
    id: "doubts",
    label: "Doubts Forum",
    icon: MessageCircleQuestion,
    path: "/tutor/doubts",
    pageId: "tutor-doubts",
  },
  {
    id: "assessments",
    label: "Assessments & Assignments",
    icon: FileSpreadsheet,
    children: [
      { label: "Create Assessment", icon: Sparkles, path: "/tutor/create-assessment", pageId: "tutor-create-assessment" },
      { label: "Grade Submissions", icon: ClipboardCheck, path: "/tutor/grading", pageId: "tutor-grading" },
      { label: "Test Results", icon: LineChart, path: "/tutor/test-results", pageId: "tutor-test-results" },
      { label: "Assignment Reviews", icon: ClipboardCheck, path: "/tutor/reviews", pageId: "tutor-reviews" },
    ],
  },
  {
    id: "preparations",
    label: "Preparations",
    icon: BookOpen,
    children: [
      { label: "Lesson Planner", icon: CalendarClock, path: "/tutor/planner", pageId: "tutor-planner" },
      { label: "Lessons", icon: BookOpen, path: "/tutor/lessons", pageId: "tutor-lessons" },
      { label: "Create Lesson", icon: Sparkles, path: "/tutor/create-lesson", pageId: "tutor-create" },
      { label: "Approvals", icon: ClipboardCheck, path: "/tutor/approvals", pageId: "tutor-approvals" },
    ],
  },
  {
    id: "students",
    label: "Students",
    icon: Users,
    children: [
      { label: "My Students", icon: Users, path: "/tutor/students", pageId: "tutor-students" },
      { label: "Attendance", icon: ClipboardCheck, path: "/tutor/attendance", pageId: "tutor-attendance" },
      { label: "Performance", icon: LineChart, path: "/tutor/performance", pageId: "tutor-performance" },
    ],
  },
  {
    id: "mentees",
    label: "Mentees",
    icon: GraduationCap,
    children: [
      { label: "Mentees", icon: Users, path: "/tutor/mentees", pageId: "tutor-mentees" },
      { label: "Booked Sessions", icon: CalendarClock, path: "/tutor/mentees/sessions", pageId: "tutor-mentee-sessions" },
      { label: "Call History", icon: MessageCircleQuestion, path: "/tutor/mentees/call-history", pageId: "tutor-mentee-calls" },
    ],
  },
  {
    id: "upskilling",
    label: "Upskilling",
    icon: Sparkles,
    path: "/tutor/upskilling",
    pageId: "tutor-upskilling",
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/tutor/profile", pageId: "tutor-profile" },
];

export default tutorNav;

