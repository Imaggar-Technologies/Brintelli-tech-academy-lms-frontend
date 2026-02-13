import {
  LayoutDashboard,
  ClipboardCheck,
  Award,
  CreditCard,
  UserCheck,
  Settings,
  HelpCircle,
  FileText,
  Sparkles,
} from "lucide-react";

/**
 * Navigation for Unenrolled Students
 * Shows assessment, scholarship, and payment flow
 */
export const unenrolledStudentNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "student-dashboard",
    permissions: ["student:read"],
  },
  {
    id: "enrollment-flow",
    label: "Enrollment",
    icon: Sparkles,
    path: "/student/enrollment",
    pageId: "student-enrollment",
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

