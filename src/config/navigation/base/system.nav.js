import {
  LayoutDashboard,
  UsersRound,
  ShieldCheck,
  Settings,
} from "lucide-react";

/**
 * Base System Navigation - Domain Level
 * Used by: Admin / Super Admin
 */
export const systemNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin-portal/dashboard",
    pageId: "admin-dashboard",
    permissions: ["admin:all"],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: UsersRound,
    path: "/admin-portal/users",
    pageId: "admin-users",
    permissions: ["users.manage"],
  },
  {
    id: "roles-permissions",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    path: "/admin-portal/roles",
    pageId: "admin-roles",
    permissions: ["roles.assign"],
  },
  {
    id: "system-settings",
    label: "System Settings",
    icon: Settings,
    path: "/admin-portal/settings",
    pageId: "admin-settings",
    permissions: ["system.view"],
  },
];

