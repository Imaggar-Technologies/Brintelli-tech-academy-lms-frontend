import {
  LayoutDashboard,
  GraduationCap,
  Code2,
  BookOpen,
  MessageCircleQuestion,
  FileBarChart,
  BriefcaseBusiness,
  Settings,
  Sparkles,
  Terminal,
  Layers3,
  ChartSpline,
  Award,
  FileText,
  FileSpreadsheet,
  MessageSquare,
  UsersRound,
  BarChart3,
  Target,
  ClipboardCheck,
} from "lucide-react";

const learnerNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "learner-dashboard",
  },
  {
    id: "learning",
    label: "Learning Hub",
    icon: GraduationCap,
    children: [
      { label: "My Courses", icon: GraduationCap, path: "/student/my-courses", pageId: "learner-courses" },
      { label: "Learning Paths", icon: Layers3, path: "/student/learning-paths", pageId: "learner-paths" },
      { label: "Course Progress", icon: ChartSpline, path: "/student/progress", pageId: "learner-progress" },
      { label: "Certificates", icon: Award, path: "/student/certifications", pageId: "learner-certificates" },
    ],
  },
  {
    id: "practice",
    label: "Practice & Coding",
    icon: Code2,
    children: [
      { label: "Code Playground", icon: Terminal, path: "/student/code-playground", pageId: "learner-playground" },
      { label: "Coding Challenges", icon: Code2, path: "/student/challenges", pageId: "learner-challenges" },
      { label: "MCQ Practice", icon: FileText, path: "/student/mcq-practice", pageId: "learner-mcq" },
      { label: "Practice Sheets", icon: FileSpreadsheet, path: "/student/practice-sheets", pageId: "learner-practice" },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: BookOpen,
    children: [
      { label: "My Projects", icon: BookOpen, path: "/student/projects", pageId: "learner-projects" },
      { label: "Project Templates", icon: FileText, path: "/student/project-templates", pageId: "learner-templates" },
      { label: "Portfolio Builder", icon: Sparkles, path: "/student/portfolio", pageId: "learner-portfolio" },
    ],
  },
  {
    id: "doubts",
    label: "Doubts & Support",
    icon: MessageCircleQuestion,
    children: [
      { label: "Ask Doubts", icon: MessageCircleQuestion, path: "/student/doubts", pageId: "learner-doubts" },
      { label: "Doubt History", icon: MessageSquare, path: "/student/doubt-history", pageId: "learner-doubt-history" },
      { label: "Mentor Sessions", icon: UsersRound, path: "/student/mentor-sessions", pageId: "learner-mentor" },
    ],
  },
  {
    id: "progress",
    label: "Progress & Analytics",
    icon: FileBarChart,
    children: [
      { label: "Performance Dashboard", icon: BarChart3, path: "/student/performance", pageId: "learner-performance" },
      { label: "Learning Analytics", icon: ChartSpline, path: "/student/analytics", pageId: "learner-analytics" },
      { label: "Achievements", icon: Award, path: "/student/achievements", pageId: "learner-achievements" },
    ],
  },
  {
    id: "placement",
    label: "Placement Assistance",
    icon: BriefcaseBusiness,
    children: [
      { label: "Placement Hub", icon: BriefcaseBusiness, path: "/student/placement-assistance", pageId: "learner-placement" },
      { label: "Job Opportunities", icon: Target, path: "/student/jobs", pageId: "learner-jobs" },
      { label: "Interview Prep", icon: ClipboardCheck, path: "/student/interview-prep", pageId: "learner-interview" },
      { label: "Resume Builder", icon: FileText, path: "/student/resume", pageId: "learner-resume" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/student/profile", pageId: "learner-profile" },
];

export default learnerNav;

