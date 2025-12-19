import {
  LayoutDashboard,
  FileCheck,
  UsersRound,
  UserCog,
  BookOpen,
  Settings,
  CalendarClock,
  ClipboardCheck,
} from "lucide-react";

/**
 * Base Academic Navigation - Domain Level
 * Used by: Program Manager, LSM, Mentor, Tutor
 */
export const academicNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/academic/dashboard",
    pageId: "academic-dashboard",
    permissions: ["courses:read", "batches:read"],
  },
  {
    id: "assessments-review",
    label: "Assessments Review",
    icon: FileCheck,
    path: "/academic/assessments",
    pageId: "academic-assessments",
    permissions: ["assessments.review"],
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: CalendarClock,
    path: "/academic/interviews",
    pageId: "academic-interviews",
    permissions: ["interviews.conduct"],
  },
  {
    id: "lsm-allocation",
    label: "LSM Allocation",
    icon: UserCog,
    path: "/academic/lsm",
    pageId: "academic-lsm",
    permissions: ["students.allocate"],
  },
  {
    id: "classes",
    label: "Classes",
    icon: BookOpen,
    path: "/academic/classes",
    pageId: "academic-classes",
    permissions: ["classes.view"],
    attributes: ["assignedClasses"], // ABAC - only show if user has assigned classes
  },
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/academic/profile",
    pageId: "academic-profile",
    permissions: ["courses:read"],
  },
];

