import {
  LayoutDashboard,
  CreditCard,
  Settings,
  HelpCircle,
} from "lucide-react";

/**
 * Student Portal - Fees layout sidebar
 * Link to pay fees (prerequisite courses must be checked before access)
 */
export const studentFeesNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/student/dashboard",
    pageId: "student-dashboard",
    permissions: ["student:read"],
  },
  {
    id: "pay-fees",
    label: "Pay Fees",
    icon: CreditCard,
    path: "/student/fees",
    pageId: "student-fees",
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
