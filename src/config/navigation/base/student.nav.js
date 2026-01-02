import {
  LayoutDashboard,
  GraduationCap,
  ChartSpline,
  Award,
  CalendarDays,
  UsersRound,
  Calendar,
  Code2,
  Terminal,
  FileText,
  Sparkles,
  BriefcaseBusiness,
  Target,
  Settings,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

/**
 * Education-First Student Navigation Structure
 * FINAL STRUCTURE - Ready for Implementation
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
    id: "my-learning",
    label: "My Learning",
    icon: GraduationCap,
    path: "/student/my-courses",
    pageId: "student-programs",
    permissions: ["student:read"],
  },
  {
    id: "mentor-connector",
    label: "Mentor Connector",
    icon: UsersRound,
    permissions: ["student:read"],
    children: [
      {
        id: "choose-mentor",
        label: "Choose Mentor",
        icon: UsersRound,
        path: "/student/mentor-connector/choose",
        pageId: "student-choose-mentor",
        permissions: ["student:read"],
      },
      {
        id: "my-mentor",
        label: "My Mentor",
        icon: Calendar,
        path: "/student/mentor-connector/my-mentor",
        pageId: "student-my-mentor",
        permissions: ["student:read"],
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    icon: Code2,
    permissions: ["student:read"],
    children: [
      { id: "code-playground", label: "Code Playground", icon: Terminal, path: "/student/code-playground", pageId: "student-code-playground", permissions: ["student:read"] },
      { id: "coding-challenges", label: "Coding Challenges", icon: Code2, path: "/student/challenges", pageId: "student-challenges", permissions: ["student:read"] },
      { id: "mcq-practice", label: "MCQ Practice", icon: FileText, path: "/student/mcq-practice", pageId: "student-mcq", permissions: ["student:read"] },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: Sparkles,
    permissions: ["student:read"],
    children: [
      { id: "resume-builder", label: "Resume Builder", icon: FileText, path: "/student/resume", pageId: "student-resume", permissions: ["student:read"] },
      { id: "portfolio-builder", label: "Portfolio Builder", icon: Sparkles, path: "/student/portfolio", pageId: "student-portfolio", permissions: ["student:read"] },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: MessageSquare,
    permissions: ["student:read"],
    children: [
      { id: "forum", label: "Forum", icon: MessageSquare, path: "/student/forum", pageId: "student-forum", permissions: ["student:read"] },
    ],
  },
  {
    id: "placement",
    label: "Placement",
    icon: BriefcaseBusiness,
    permissions: ["student:read"],
    children: [
      { id: "job-openings", label: "Job Openings", icon: Target, path: "/student/jobs", pageId: "student-jobs", permissions: ["student:read"] },
      { id: "application-status", label: "Application Status", icon: BriefcaseBusiness, path: "/student/placement-assistance", pageId: "student-placement", permissions: ["student:read"] },
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
  {
    id: "support",
    label: "Need Support?",
    icon: HelpCircle,
    path: "/student/support",
    pageId: "student-support",
    permissions: ["student:read"],
  },
];

