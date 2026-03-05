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
  FolderKanban,
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
    id: "batches-catalog",
    label: "All Batches",
    icon: FolderKanban,
    path: "/student/batches",
    pageId: "student-batches",
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

