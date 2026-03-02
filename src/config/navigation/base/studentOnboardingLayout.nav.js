import {
  LayoutDashboard,
  Calendar,
  UsersRound,
  Settings,
  HelpCircle,
} from "lucide-react";

/**
 * Student Portal - Onboarding layout sidebar
 * No duplicate "Onboarding" — only: Dashboard, Choose Batch, Choose Mentor, Profile, Support.
 * (Portal switcher already has "Onboarding" for this layout.)
 */
export const studentOnboardingLayoutNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "student-dashboard",
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
