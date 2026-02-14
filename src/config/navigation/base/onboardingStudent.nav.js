import {
  LayoutDashboard,
  ClipboardCheck,
  UsersRound,
  Calendar,
  BookOpen,
  Code2,
  Terminal,
  Settings,
  HelpCircle,
  Sparkles,
  GraduationCap,
} from "lucide-react";

/**
 * Navigation for Students in Onboarding Phase
 * Shows onboarding steps: choose batch, mentor, meet LMS, explore courses and workspaces
 */
export const onboardingStudentNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "student-dashboard",
    permissions: ["student:read"],
  },
  {
    id: "onboarding",
    label: "Complete Onboarding",
    icon: ClipboardCheck,
    path: "/student/onboarding",
    pageId: "student-onboarding",
    permissions: ["student:read"],
  },
  {
    id: "choose-batch",
    label: "Choose Batch",
    icon: Calendar,
    path: "/student/onboarding#batch",
    pageId: "student-onboarding-batch",
    permissions: ["student:read"],
  },
  {
    id: "choose-mentor",
    label: "Choose Mentor",
    icon: UsersRound,
    path: "/student/onboarding#mentor",
    pageId: "student-onboarding-mentor",
    permissions: ["student:read"],
  },
  {
    id: "meet-lsm",
    label: "Meet Your LSM",
    icon: Sparkles,
    path: "/student/onboarding#lsm",
    pageId: "student-onboarding-lsm",
    permissions: ["student:read"],
  },
  {
    id: "explore-courses",
    label: "Explore Courses",
    icon: BookOpen,
    path: "/student/my-courses",
    pageId: "student-programs-preview",
    permissions: ["student:read"],
  },
  {
    id: "explore-workspaces",
    label: "Explore Workspaces",
    icon: Code2,
    permissions: ["student:read"],
    children: [
      {
        id: "code-playground",
        label: "Code Playground",
        icon: Terminal,
        path: "/student/code-playground",
        pageId: "student-code-playground",
        permissions: ["student:read"],
      },
      {
        id: "coding-challenges",
        label: "Coding Challenges",
        icon: Code2,
        path: "/student/challenges",
        pageId: "student-challenges",
        permissions: ["student:read"],
      },
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

