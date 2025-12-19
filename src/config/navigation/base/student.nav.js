import {
  LayoutDashboard,
  GraduationCap,
  FileCheck,
  CalendarClock,
  Settings,
} from "lucide-react";

/**
 * Base Student Navigation - Domain Level
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
    id: "my-courses",
    label: "My Courses",
    icon: GraduationCap,
    path: "/student/courses",
    pageId: "student-courses",
    permissions: ["courses.view"],
    attributes: ["enrolledCourses"], // ABAC - only show if student has enrolled courses
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FileCheck,
    path: "/student/assessments",
    pageId: "student-assessments",
    permissions: ["assessments.take"],
  },
  {
    id: "meetings",
    label: "Meetings",
    icon: CalendarClock,
    path: "/student/meetings",
    pageId: "student-meetings",
    permissions: ["meetings.join"],
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

