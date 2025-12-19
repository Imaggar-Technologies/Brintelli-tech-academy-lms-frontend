import {
  LayoutDashboard,
  UsersRound,
  Handshake,
  Building2,
  BriefcaseBusiness,
  CalendarClock,
  MessageSquare,
  FileText,
  Award,
  BarChart3,
  Settings,
  Target,
  FileBarChart,
} from "lucide-react";

/**
 * BASE HR NAVIGATION - Single Source of Truth
 * 
 * RBAC: Uses role-specific permissions (hr:agent:view, hr:lead:view, hr:head:view)
 * ABAC: Filters data within pages based on user attributes
 * 
 * HR HIERARCHY:
 * - HR Agent: Works on assigned partnerships/candidates
 * - HR Lead: Manages team, assigns partnerships
 * - HR Head: Department-level oversight, analytics
 */
export const hrNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/hr/dashboard",
    pageId: "hr-dashboard",
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    // RBAC: All HR roles
    // ABAC: Data filtered by ownerId (Agent), teamId (Lead), departmentId (Head)
  },
  {
    id: "partners",
    label: "Partner Companies",
    icon: Building2,
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    children: [
      {
        id: "partner-directory",
        label: "Partner Directory",
        icon: Building2,
        path: "/hr/partners",
        pageId: "hr-partners",
        permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
        // RBAC: All HR roles
        // ABAC: Filtered by assigned partnerships
      },
      {
        id: "hr-contacts",
        label: "HR Contacts",
        icon: UsersRound,
        path: "/hr/contacts",
        pageId: "hr-contacts",
        permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
        // RBAC: All HR roles
      },
      {
        id: "mous-agreements",
        label: "MoUs / Agreements",
        icon: FileText,
        path: "/hr/mous",
        pageId: "hr-mous",
        permissions: ["hr:lead:view", "hr:head:view"],
        // RBAC: Lead and Head only
      },
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    icon: BriefcaseBusiness,
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    children: [
      {
        id: "internship-opportunities",
        label: "Internship Opportunities",
        icon: BriefcaseBusiness,
        path: "/hr/internships",
        pageId: "hr-internships",
        permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
      },
      {
        id: "job-opportunities",
        label: "Job Opportunities",
        icon: Target,
        path: "/hr/jobs",
        pageId: "hr-jobs",
        permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
      },
    ],
  },
  {
    id: "candidates",
    label: "Candidates",
    icon: UsersRound,
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    children: [
      {
        id: "candidate-shortlists",
        label: "Candidate Shortlists",
        icon: UsersRound,
        path: "/hr/shortlists",
        pageId: "hr-shortlists",
        permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
        // ABAC: Filtered by assigned candidates (Agent), team (Lead), all (Head)
      },
      {
        id: "candidate-profiles",
        label: "Candidate Profiles",
        icon: UsersRound,
        path: "/hr/candidates",
        pageId: "hr-candidates",
        permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
      },
    ],
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: CalendarClock,
    path: "/hr/interviews",
    pageId: "hr-interviews",
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    // ABAC: Filtered by assigned interviews
  },
  {
    id: "communication",
    label: "Communication Logs",
    icon: MessageSquare,
    path: "/hr/communications",
    pageId: "hr-communications",
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    // ABAC: Filtered by communication owner/team
  },
  {
    id: "team-management",
    label: "Team Management",
    icon: UsersRound,
    path: "/hr/team",
    pageId: "hr-team",
    permissions: ["hr:lead:view"],
    // RBAC: HR Lead only
    // ABAC: Shows agents in user's team
  },
  {
    id: "analytics",
    label: "Company Analytics",
    icon: BarChart3,
    path: "/hr/analytics",
    pageId: "hr-analytics",
    permissions: ["hr:lead:view", "hr:head:view"],
    // RBAC: Lead and Head only
    // ABAC: Team analytics (Lead), department analytics (Head)
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileBarChart,
    path: "/hr/reports",
    pageId: "hr-reports",
    permissions: ["hr:head:view"],
    // RBAC: HR Head only
    // ABAC: Department-wide reports
  },
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/hr/profile",
    pageId: "hr-profile",
    permissions: ["hr:agent:view", "hr:lead:view", "hr:head:view"],
    // RBAC: All HR roles
  },
];

