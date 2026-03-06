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
  CalendarDays,
  GraduationCap,
  Calendar,
  BookOpen,
  UserPlus,
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
    id: "workshops",
    label: "Workshops",
    icon: CalendarDays,
    path: "/student/workshops",
    pageId: "student-workshops",
    permissions: ["student:read"],
  },
  {
    id: "programs-catalog",
    label: "All Programs",
    icon: BookOpen,
    path: "/student/programs",
    pageId: "student-program-catalog",
    permissions: ["student:read"],
  },
  {
    id: "invite-friend",
    label: "Invite your friend",
    icon: UserPlus,
    path: "/student/invite-friend",
    pageId: "student-invite-friend",
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

