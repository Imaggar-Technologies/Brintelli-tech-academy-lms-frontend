import {
  LayoutDashboard,
  GraduationCap,
  Layers3,
  ChartSpline,
  Award,
  CalendarDays,
  Video,
  Library,
  ClipboardCheck,
  FileCheck,
  MessageCircleQuestion,
  MessageSquare,
  UsersRound,
  Code2,
  Terminal,
  FileText,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
  BriefcaseBusiness,
  Target,
  Settings,
} from "lucide-react";

/**
 * Base Student Navigation - Domain Level (RBAC-ready)
 * IMPORTANT: permission strings here must match backend format: "resource:action"
 */
export const studentNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "student-dashboard",
    permissions: ["student:read"],
  },
  {
    id: "learning",
    label: "Learning Hub",
    icon: GraduationCap,
    permissions: ["student:read"],
    children: [
      { id: "my-programs", label: "My Programs", icon: GraduationCap, path: "/student/my-courses", pageId: "student-programs", permissions: ["student:read"] },
      { id: "sessions", label: "Sessions", icon: CalendarDays, path: "/student/sessions", pageId: "student-sessions", permissions: ["student:read"] },
      { id: "live-classes", label: "Live Classes", icon: Video, path: "/student/live-classes", pageId: "student-live-classes", permissions: ["student:read"] },
      { id: "recordings", label: "Recordings", icon: Library, path: "/student/recordings", pageId: "student-recordings", permissions: ["student:read"] },
      { id: "assignments", label: "Assignments", icon: ClipboardCheck, path: "/student/assignments", pageId: "student-assignments", permissions: ["student:read"] },
      { id: "assessments", label: "Assessments", icon: FileCheck, path: "/student/tests", pageId: "student-assessments", permissions: ["student:read"] },
      { id: "learning-paths", label: "Learning Paths", icon: Layers3, path: "/student/learning-paths", pageId: "student-learning-paths", permissions: ["student:read"] },
      { id: "course-progress", label: "Course Progress", icon: ChartSpline, path: "/student/progress", pageId: "student-progress", permissions: ["student:read"] },
      { id: "certificates", label: "Certificates", icon: Award, path: "/student/certifications", pageId: "student-certifications", permissions: ["student:read"] },
    ],
  },
  {
    id: "practice",
    label: "Practice & Coding",
    icon: Code2,
    permissions: ["student:read"],
    children: [
      { id: "code-playground", label: "Code Playground", icon: Terminal, path: "/student/code-playground", pageId: "student-code-playground", permissions: ["student:read"] },
      { id: "coding-challenges", label: "Coding Challenges", icon: Code2, path: "/student/challenges", pageId: "student-challenges", permissions: ["student:read"] },
      { id: "mcq-practice", label: "MCQ Practice", icon: FileText, path: "/student/mcq-practice", pageId: "student-mcq", permissions: ["student:read"] },
      { id: "practice-sheets", label: "Practice Sheets", icon: FileSpreadsheet, path: "/student/practice-sheets", pageId: "student-practice-sheets", permissions: ["student:read"] },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: BookOpen,
    permissions: ["student:read"],
    children: [
      { id: "my-projects", label: "My Projects", icon: BookOpen, path: "/student/projects", pageId: "student-projects", permissions: ["student:read"] },
      { id: "project-templates", label: "Project Templates", icon: FileText, path: "/student/project-templates", pageId: "student-project-templates", permissions: ["student:read"] },
      { id: "portfolio", label: "Portfolio Builder", icon: Sparkles, path: "/student/portfolio", pageId: "student-portfolio", permissions: ["student:read"] },
    ],
  },
  {
    id: "doubts",
    label: "Doubts & Support",
    icon: MessageCircleQuestion,
    permissions: ["student:read"],
    children: [
      { id: "ask-doubts", label: "Ask Doubts", icon: MessageCircleQuestion, path: "/student/doubts", pageId: "student-doubts", permissions: ["student:read"] },
      { id: "doubt-history", label: "Doubt History", icon: MessageSquare, path: "/student/doubt-history", pageId: "student-doubt-history", permissions: ["student:read"] },
      { id: "mentor-sessions", label: "Mentor Sessions", icon: UsersRound, path: "/student/mentor-sessions", pageId: "student-mentor-sessions", permissions: ["student:read"] },
    ],
  },
  {
    id: "placement",
    label: "Placement Assistance",
    icon: BriefcaseBusiness,
    permissions: ["student:read"],
    children: [
      { id: "placement-hub", label: "Placement Hub", icon: BriefcaseBusiness, path: "/student/placement-assistance", pageId: "student-placement", permissions: ["student:read"] },
      { id: "jobs", label: "Job Portal", icon: Target, path: "/student/jobs", pageId: "student-jobs", permissions: ["student:read"] },
      { id: "interview-prep", label: "Interview Prep", icon: ClipboardCheck, path: "/student/interview-prep", pageId: "student-interview-prep", permissions: ["student:read"] },
      { id: "resume", label: "Resume Builder", icon: FileText, path: "/student/resume", pageId: "student-resume", permissions: ["student:read"] },
    ],
  },
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/student/profile",
    pageId: "student-profile",
    permissions: ["student:read"],
  },
];

