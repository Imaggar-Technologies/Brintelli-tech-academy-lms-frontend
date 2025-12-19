import {
  LayoutDashboard,
  Wallet,
  Target,
  Settings,
  BarChart3,
  FileBarChart,
  TrendingUp,
  UsersRound,
} from "lucide-react";

/**
 * BASE FINANCE NAVIGATION - Single Source of Truth
 * 
 * RBAC: Uses role-specific permissions (finance:agent:view, finance:lead:view, finance:head:view)
 * ABAC: Filters data within pages based on user attributes
 */
export const financeNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/finance/dashboard",
    pageId: "finance-dashboard",
    permissions: ["finance:agent:view", "finance:lead:view", "finance:head:view"],
    // RBAC: All finance roles
    // ABAC: Data filtered by ownerId (Agent), teamId (Lead), departmentId (Head)
  },
  {
    id: "financial-processing",
    label: "Financial Processing",
    icon: Wallet,
    path: "/finance/processing",
    pageId: "finance-processing",
    permissions: ["finance:agent:view", "finance:lead:view", "finance:head:view"],
    // RBAC: All finance roles
    // ABAC: 
    // - Agent: Only assigned transactions
    // - Lead: Team's transactions
    // - Head: All department transactions
  },
  {
    id: "deals-review",
    label: "Deals Review",
    icon: Target,
    path: "/finance/deals",
    pageId: "finance-deals",
    permissions: ["finance:agent:view", "finance:lead:view", "finance:head:view"],
    // RBAC: All finance roles
    // ABAC: Filtered by deal owner/team/department
  },
  {
    id: "revenue-analytics",
    label: "Revenue Analytics",
    icon: BarChart3,
    path: "/finance/revenue-analytics",
    pageId: "finance-revenue-analytics",
    permissions: ["finance:lead:view", "finance:head:view"],
    // RBAC: Lead and Head only
    // ABAC: Team revenue (Lead), department revenue (Head)
  },
  {
    id: "team-management",
    label: "Team Management",
    icon: UsersRound,
    path: "/finance/team",
    pageId: "finance-team",
    permissions: ["finance:lead:view"],
    // RBAC: Finance Lead only
    // ABAC: Shows agents in user's team
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: FileBarChart,
    path: "/finance/reports",
    pageId: "finance-reports",
    permissions: ["finance:head:view"],
    // RBAC: Finance Head only
    // ABAC: Department-wide reports
  },
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/finance/profile",
    pageId: "finance-profile",
    permissions: ["finance:agent:view", "finance:lead:view", "finance:head:view"],
    // RBAC: All finance roles
  },
];
