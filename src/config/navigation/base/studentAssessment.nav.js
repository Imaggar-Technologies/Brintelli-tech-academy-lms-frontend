import {
  LayoutDashboard,
  ClipboardCheck,
  Settings,
  HelpCircle,
} from "lucide-react";

/**
 * Student Portal - Assessment layout sidebar
 * Shows allocated assessments when assessment is allocated to the student
 */
export const studentAssessmentNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "student-dashboard",
    permissions: ["student:read"],
  },
  {
    id: "assessments",
    label: "My Assessments",
    icon: ClipboardCheck,
    path: "/student/assessment",
    pageId: "student-assessment",
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
