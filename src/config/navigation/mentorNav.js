import {
  LayoutDashboard,
  UsersRound,
  CalendarClock,
  MessageSquare,
  FileText,
  Lightbulb,
  ClipboardCheck,
  ChartSpline,
  BookOpen,
  Target,
  FileBarChart,
  Settings,
  CalendarDays,
  BarChart3,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";

const mentorNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/mentor/dashboard",
    pageId: "mentor-dashboard",
  },
  {
    id: "mentees",
    label: "My Mentees",
    icon: UsersRound,
    children: [
      { label: "Mentee List", icon: UsersRound, path: "/mentor/mentees", pageId: "mentor-mentees" },
      { label: "Mentee Profiles", icon: FileText, path: "/mentor/profiles", pageId: "mentor-profiles" },
      { label: "Assignments", icon: ClipboardCheck, path: "/mentor/assignments", pageId: "mentor-assignments" },
      { label: "Risk Students", icon: Target, path: "/mentor/risk-students", pageId: "mentor-risk" },
    ],
  },
  {
    id: "sessions",
    label: "Sessions & Meetings",
    icon: CalendarClock,
    children: [
      { label: "Session Schedule", icon: CalendarDays, path: "/mentor/schedule", pageId: "mentor-schedule" },
      { label: "1:1 Sessions", icon: MessageSquare, path: "/mentor/sessions", pageId: "mentor-sessions" },
      { label: "Session Logs", icon: FileText, path: "/mentor/session-logs", pageId: "mentor-logs" },
      { label: "Prep Notes", icon: BookOpen, path: "/mentor/prep-notes", pageId: "mentor-prep" },
      { label: "Upcoming Sessions", icon: CalendarClock, path: "/mentor/upcoming", pageId: "mentor-upcoming" },
    ],
  },
  {
    id: "resources",
    label: "Resources & Notes",
    icon: Lightbulb,
    children: [
      { label: "Resource Library", icon: BookOpen, path: "/mentor/resources", pageId: "mentor-resources" },
      { label: "Share Resources", icon: Sparkles, path: "/mentor/share-resources", pageId: "mentor-share" },
      { label: "Session Notes", icon: FileText, path: "/mentor/notes", pageId: "mentor-notes" },
      { label: "Quick Nudges", icon: Lightbulb, path: "/mentor/nudges", pageId: "mentor-nudges" },
    ],
  },
  {
    id: "progress",
    label: "Progress & Engagement",
    icon: ChartSpline,
    children: [
      { label: "Mentee Progress", icon: ChartSpline, path: "/mentor/progress", pageId: "mentor-progress" },
      { label: "Engagement Tracking", icon: BarChart3, path: "/mentor/engagement", pageId: "mentor-engagement" },
      { label: "Feedback & Reviews", icon: ClipboardCheck, path: "/mentor/feedback", pageId: "mentor-feedback" },
      { label: "Performance Reports", icon: FileBarChart, path: "/mentor/reports", pageId: "mentor-reports" },
    ],
  },
  {
    id: "placement",
    label: "Placement Support",
    icon: Target,
    children: [
      { label: "Placement Readiness", icon: Target, path: "/mentor/placement-readiness", pageId: "mentor-placement-readiness" },
      { label: "Interview Prep", icon: ClipboardCheck, path: "/mentor/interview-prep", pageId: "mentor-interview-prep" },
      { label: "Resume Reviews", icon: FileText, path: "/mentor/resume-reviews", pageId: "mentor-resume-reviews" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/mentor/profile", pageId: "mentor-profile" },
];

export default mentorNav;

