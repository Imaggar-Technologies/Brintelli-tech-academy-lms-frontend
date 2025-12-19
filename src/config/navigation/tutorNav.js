import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  MonitorPlay,
  Users,
  FileSpreadsheet,
  Settings,
  FileText,
  Sparkles,
  CalendarDays,
  ClipboardCheck,
  CalendarClock,
  BarChart3,
  FileBarChart,
  MessageCircleQuestion,
  Layers3,
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
    id: "courses",
    label: "Course Management",
    icon: GraduationCap,
    children: [
      { label: "My Courses", icon: GraduationCap, path: "/tutor/courses", pageId: "tutor-courses" },
      { label: "Course Content", icon: BookOpen, path: "/tutor/content", pageId: "tutor-content" },
      { label: "Curriculum Overview", icon: Layers3, path: "/tutor/curriculum", pageId: "tutor-curriculum" },
    ],
  },
  {
    id: "lessons",
    label: "Lesson Management",
    icon: BookOpen,
    children: [
      { label: "Lesson Library", icon: FileText, path: "/tutor/lessons", pageId: "tutor-lessons" },
      { label: "Create Lesson", icon: Sparkles, path: "/tutor/create-lesson", pageId: "tutor-create" },
      { label: "Lesson Planner", icon: CalendarDays, path: "/tutor/planner", pageId: "tutor-planner" },
      { label: "Content Approvals", icon: ClipboardCheck, path: "/tutor/approvals", pageId: "tutor-approvals" },
    ],
  },
  {
    id: "live-classes",
    label: "Live Classes",
    icon: MonitorPlay,
    children: [
      { label: "Live Class Controller", icon: MonitorPlay, path: "/tutor/live-controller", pageId: "tutor-live" },
      { label: "Class Schedule", icon: CalendarClock, path: "/tutor/schedule", pageId: "tutor-schedule" },
      { label: "Attendance Tracker", icon: Users, path: "/tutor/attendance", pageId: "tutor-attendance" },
      { label: "Class Analytics", icon: BarChart3, path: "/tutor/class-analytics", pageId: "tutor-class-analytics" },
    ],
  },
  {
    id: "students",
    label: "Student Management",
    icon: Users,
    children: [
      { label: "My Students", icon: Users, path: "/tutor/students", pageId: "tutor-students" },
      { label: "Student Performance", icon: FileBarChart, path: "/tutor/performance", pageId: "tutor-performance" },
      { label: "Assignment Reviews", icon: ClipboardCheck, path: "/tutor/reviews", pageId: "tutor-reviews" },
      { label: "Doubt Resolution", icon: MessageCircleQuestion, path: "/tutor/doubts", pageId: "tutor-doubts" },
    ],
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FileSpreadsheet,
    children: [
      { label: "Create Assessment", icon: FileSpreadsheet, path: "/tutor/create-assessment", pageId: "tutor-create-assessment" },
      { label: "Grade Submissions", icon: ClipboardCheck, path: "/tutor/grading", pageId: "tutor-grading" },
      { label: "Test Results", icon: FileBarChart, path: "/tutor/test-results", pageId: "tutor-test-results" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/tutor/profile", pageId: "tutor-profile" },
];

export default tutorNav;

