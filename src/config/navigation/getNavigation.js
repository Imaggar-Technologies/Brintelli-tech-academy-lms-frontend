/**
 * Enterprise-Grade Navigation Builder
 * Combines domain-based navigation with RBAC and ABAC filtering
 */

import { salesNav } from "./base/sales.nav";
import { marketingNav } from "./base/marketing.nav";
import { financeNav } from "./base/finance.nav";
import { hrNav } from "./base/hr.nav";
import { academicNav } from "./base/academic.nav";
import { studentNav } from "./base/student.nav";
import { systemNav } from "./base/system.nav";

import { filterByPermissions } from "./filters/permissionFilter";
import { filterByAttributes } from "./filters/attributeFilter";

import {
  Sparkles,
  Terminal,
  BriefcaseBusiness,
  UsersRound,
  CalendarDays,
  ShieldCheck,
  BarChart3,
  CalendarClock,
  Handshake,
  Wallet,
  Target,
  BookOpen,
  MonitorPlay,
  ChartSpline,
  ClipboardCheck,
  Megaphone,
  MessageSquare,
  Award,
  UserCheck,
  ArrowRightLeft,
  LayoutDashboard,
  Bell,
  TrendingUp,
} from "lucide-react";

/**
 * Domain to navigation map
 */
const domainNavMap = {
  sales: salesNav,
  marketing: marketingNav,
  finance: financeNav,
  hr: hrNav,
  academic: academicNav,
  student: studentNav,
  learner: studentNav, // Alias for student
  system: systemNav,
  admin: systemNav, // Alias for system
};

/**
 * Role to domain mapping
 */
const roleDomainMap = {
  // Sales roles
  sales: "sales",
  sales_admin: "sales",
  sales_lead: "sales",
  sales_agent: "sales",
  sales_head: "sales",
  
  // Marketing roles
  marketing: "marketing",
  marketing_agent: "marketing",
  marketing_lead: "marketing",
  marketing_head: "marketing",
  marketing_manager: "marketing",
  
  // Finance roles
  finance: "finance",
  finance_agent: "finance",
  finance_lead: "finance",
  finance_head: "finance",
  finance_manager: "finance",
  finance_officer: "finance",
  
  // HR roles
  hr: "hr",
  hr_agent: "hr",
  hr_lead: "hr",
  hr_head: "hr",
  
  // Academic roles
  tutor: "academic",
  mentor: "academic",
  lsm: "academic",
  programManager: "academic",
  "program-manager": "academic",
  
  // Student roles
  student: "student",
  learner: "student",
  
  // System roles
  admin: "system",
};

/**
 * Get navigation for a user based on domain, permissions, and attributes
 * @param {Object} options
 * @param {string} options.domain - Domain name (sales, marketing, finance, academic, student, system)
 * @param {string} options.role - User role (used to determine domain if not provided)
 * @param {Array<string>} options.permissions - User's permissions array
 * @param {Object} options.attributes - User's attributes object (e.g., { assignedClasses: [...], enrolledCourses: [...] })
 * @returns {Array} Filtered navigation items
 */
export function getNavigation({ domain, role, permissions = [], attributes = {} }) {
  // Determine domain from role if not provided
  if (!domain && role) {
    domain = roleDomainMap[role] || "student";
  }

  // Get base navigation for the domain
  let nav = domainNavMap[domain] || [];

  // Apply RBAC filtering (permissions)
  nav = filterByPermissions(nav, permissions);

  // Apply ABAC filtering (attributes)
  nav = filterByAttributes(nav, attributes);

  return nav;
}

/**
 * Convert permission format from "SALES_READ" to "sales:read"
 * Also handles PERMISSIONS constants that are already in "resource:action" format
 */
function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) return [];
  
  return permissions.map((perm) => {
    // If already in "resource:action" format, return as is
    if (typeof perm === 'string' && perm.includes(":")) {
      return perm;
    }
    
    // If it's a PERMISSIONS constant value (already in correct format), return as is
    // PERMISSIONS.SALES_READ = 'sales:read' (already correct)
    if (typeof perm === 'string' && perm.includes(":")) {
      return perm;
    }
    
    // Convert "SALES_READ" to "sales:read" (for legacy format)
    if (typeof perm === 'string') {
      const parts = perm.toLowerCase().split("_");
      if (parts.length >= 2) {
        const resource = parts[0];
        const action = parts.slice(1).join("_");
        return `${resource}:${action}`;
      }
      return perm.toLowerCase();
    }
    
    return perm;
  });
}

/**
 * Legacy compatibility function
 * Maps old role-based navigation to new domain-based system
 */
export function getRoleNavigation(role, userPermissions = [], userAttributes = {}) {
  // Get domain from role
  const domain = roleDomainMap[role] || "student";
  
  // Normalize permissions to "resource:action" format
  const normalizedPermissions = normalizePermissions(userPermissions);
  
  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[getRoleNavigation] Role:', role);
    console.log('[getRoleNavigation] Domain:', domain);
    console.log('[getRoleNavigation] Raw permissions:', userPermissions);
    console.log('[getRoleNavigation] Normalized permissions:', normalizedPermissions);
  }
  
  // Get filtered navigation
  const navigation = getNavigation({
    domain,
    role,
    permissions: normalizedPermissions,
    attributes: userAttributes,
  });

  // Return in the format expected by existing components
  return {
    navigation,
    title: getDomainTitle(domain),
    subtitle: getDomainSubtitle(domain, role),
    pinned: getPinnedItems(domain, role, normalizedPermissions),
  };
}

/**
 * Get domain title
 */
function getDomainTitle(domain) {
  const titles = {
    sales: "Brintelli Sales",
    marketing: "Brintelli Marketing",
    finance: "Brintelli Finance",
    academic: "Brintelli LMS",
    student: "Brintelli LMS",
    system: "Brintelli Control",
  };
  return titles[domain] || "Brintelli LMS";
}

/**
 * Get domain subtitle
 */
function getDomainSubtitle(domain, role) {
  const subtitles = {
    sales: "Sales Operations",
    marketing: "Marketing Operations",
    finance: "Revenue Operations",
    academic: getAcademicSubtitle(role),
    student: "Learner Workspace",
    system: "Admin Control Panel",
  };
  return subtitles[domain] || "Dashboard";
}

/**
 * Get academic subtitle based on role
 */
function getAcademicSubtitle(role) {
  const academicSubtitles = {
    tutor: "Tutor Console",
    mentor: "Mentor Portal",
    lsm: "Learning Success Manager",
    programManager: "Program Manager",
    "program-manager": "Program Manager",
  };
  return academicSubtitles[role] || "Academic Operations";
}

/**
 * Get pinned items for domain/role
 */
function getPinnedItems(domain, role, permissions) {

  // Pinned items configuration per domain/role
  const pinnedConfig = {
    sales: {
      sales_agent: [
        { label: "Pipeline", to: "/sales/pipeline", icon: ArrowRightLeft },
        { label: "Dashboard", to: "/sales/dashboard", icon: LayoutDashboard },
        { label: "Notification", to: "/sales/notifications", icon: Bell },
      ],
      sales_lead: [
        { label: "Pipeline Overview", to: "/sales/pipeline", icon: BarChart3 },
        { label: "Team Management", to: "/sales/team", icon: UsersRound },
        { label: "Active Leads", to: "/sales/active-leads", icon: Target },
      ],
      sales_head: [
        { label: "Pipeline Overview", to: "/sales/pipeline", icon: BarChart3 },
        { label: "Team Management", to: "/sales/team", icon: UsersRound },
        { label: "Sales Analytics", to: "/sales/analytics", icon: TrendingUp },
      ],
      default: [
        { label: "Pipeline Overview", to: "/sales/pipeline", icon: BarChart3 },
        { label: "Demo Schedule", to: "/sales/demos", icon: CalendarClock },
        { label: "Active Deals", to: "/sales/deals", icon: Handshake },
      ],
    },
    student: {
      default: [
        { label: "Continue Learning", to: "/student/dashboard#continue", icon: Sparkles },
        { label: "Code Playground", to: "/student/code-playground", icon: Terminal },
        { label: "Placement Hub", to: "/student/placement-assistance", icon: BriefcaseBusiness },
      ],
    },
    academic: {
      lsm: [
        { label: "My Mentees", to: "/lsm/mentees", icon: UsersRound },
        { label: "Session Schedule", to: "/lsm/sessions", icon: CalendarDays },
        { label: "Escalations", to: "/lsm/escalations", icon: ShieldCheck },
      ],
      tutor: [
        { label: "Manage Courses", to: "/tutor/courses", icon: BookOpen },
        { label: "Lesson Planner", to: "/tutor/planner", icon: CalendarDays },
        { label: "Live Classes", to: "/tutor/live", icon: MonitorPlay },
      ],
      mentor: [
        { label: "My Mentees", to: "/mentor/mentees", icon: UsersRound },
        { label: "Session Schedule", to: "/mentor/schedule", icon: CalendarDays },
        { label: "Share Resources", to: "/mentor/share-resources", icon: Sparkles },
      ],
      programManager: [
        { label: "Academic Ops", to: "/program-manager/syllabus", icon: CalendarClock },
        { label: "Batch Health", to: "/program-manager/batch-health", icon: ChartSpline },
        { label: "Content Review", to: "/program-manager/content-review", icon: ClipboardCheck },
      ],
    },
    marketing: {
      default: [
        { label: "Campaigns", to: "/marketing/campaigns", icon: Megaphone },
        { label: "Social Media", to: "/marketing/social", icon: MessageSquare },
        { label: "Marketing Analytics", to: "/marketing/analytics", icon: BarChart3 },
      ],
    },
    finance: {
      default: [
        { label: "Collections", to: "/finance/dues", icon: Wallet },
        { label: "Revenue Analytics", to: "/finance/revenue", icon: BarChart3 },
        { label: "Outstanding Dues", to: "/finance/dues", icon: Target },
      ],
    },
    system: {
      default: [
        { label: "Dashboard", to: "/admin-portal/dashboard", icon: Sparkles },
        { label: "LMS Management", to: "/admin-portal/lms/programs", icon: BriefcaseBusiness },
        { label: "Analytics", to: "/admin-portal/analytics", icon: BarChart3 },
      ],
    },
  };

  const domainPinned = pinnedConfig[domain];
  if (!domainPinned) return [];

  return domainPinned[role] || domainPinned.default || [];
}

