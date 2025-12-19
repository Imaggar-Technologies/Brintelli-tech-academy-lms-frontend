import {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Layers3,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
  CalendarDays,
  ChartSpline,
  Target,
  FileSearch,
  ShieldCheck,
  FileBarChart,
} from "lucide-react";

/**
 * BASE MARKETING NAVIGATION - Single Source of Truth
 * 
 * RBAC: Uses role-specific permissions (marketing:agent:view, marketing:lead:view, marketing:head:view)
 * ABAC: Filters data within pages based on user attributes
 */
export const marketingNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/marketing/dashboard",
    pageId: "marketing-dashboard",
    permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
    // RBAC: All marketing roles
    // ABAC: Data filtered by ownerId (Agent), teamId (Lead), departmentId (Head)
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Megaphone,
    permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
    children: [
      {
        id: "all-campaigns",
        label: "All Campaigns",
        icon: Megaphone,
        path: "/marketing/campaigns",
        pageId: "marketing-campaigns",
        permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
        // RBAC: All marketing roles
      },
      {
        id: "campaign-builder",
        label: "Campaign Builder",
        icon: Sparkles,
        path: "/marketing/campaign-builder",
        pageId: "marketing-builder",
        permissions: ["marketing:lead:view", "marketing:head:view"],
        // RBAC: Lead and Head only (requires create permission)
      },
      {
        id: "campaign-performance",
        label: "Campaign Performance",
        icon: BarChart3,
        path: "/marketing/campaign-performance",
        pageId: "marketing-performance",
        permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
        // RBAC: All marketing roles
      },
    ],
  },
  {
    id: "leads-generated",
    label: "Leads Generated",
    icon: Target,
    path: "/marketing/leads",
    pageId: "marketing-leads",
    permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
    // RBAC: All marketing roles
    // ABAC: Filtered by campaign owner (Agent), team (Lead), department (Head)
  },
  {
    id: "social",
    label: "Social Media",
    icon: MessageSquare,
    permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
    children: [
      {
        id: "social-posts",
        label: "Social Posts",
        icon: MessageSquare,
        path: "/marketing/social",
        pageId: "marketing-social",
        permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
      },
      {
        id: "content-calendar",
        label: "Content Calendar",
        icon: CalendarDays,
        path: "/marketing/calendar",
        pageId: "marketing-calendar",
        permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
      },
      {
        id: "engagement-analytics",
        label: "Engagement Analytics",
        icon: ChartSpline,
        path: "/marketing/engagement",
        pageId: "marketing-engagement",
        permissions: ["marketing:lead:view", "marketing:head:view"],
        // RBAC: Lead and Head only (analytics access)
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/marketing/analytics",
    pageId: "marketing-analytics",
    permissions: ["marketing:lead:view", "marketing:head:view"],
    // RBAC: Lead and Head only
    // ABAC: Team analytics (Lead), department analytics (Head)
  },
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/marketing/profile",
    pageId: "marketing-profile",
    permissions: ["marketing:agent:view", "marketing:lead:view", "marketing:head:view"],
    // RBAC: All marketing roles
  },
];
