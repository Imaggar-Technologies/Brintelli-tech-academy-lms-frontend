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
import { unenrolledStudentNav } from "./base/unenrolledStudent.nav";
import { onboardingStudentNav } from "./base/onboardingStudent.nav";
import { studentAssessmentNav } from "./base/studentAssessment.nav";
import { studentFeesNav } from "./base/studentFees.nav";
import { studentOnboardingLayoutNav } from "./base/studentOnboardingLayout.nav";
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
  CreditCard,
  Calendar,
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
 * Get navigation for student layout by pathname (3 layout types)
 * When student is on /student/assessment, /student/fees, or /student/onboarding, show the matching sidebar.
 */
function getStudentLayoutNavByPath(pathname = "") {
  if (pathname.startsWith("/student/assessment")) return studentAssessmentNav;
  if (pathname.startsWith("/student/fees")) return studentFeesNav;
  if (pathname.startsWith("/student/onboarding")) return studentOnboardingLayoutNav;
  return null;
}

/**
 * Get navigation based on enrollment and onboarding status
 * Returns appropriate navigation based on student state:
 * - Not enrolled: unenrolledStudentNav (assessment flow)
 * - Enrolled but onboarding incomplete: onboardingStudentNav (onboarding flow)
 * - Enrolled and onboarding complete: studentNav (regular student flow)
 */
function getStudentNavigation(userAttributes = {}, pathname = "") {
  // If pathname matches one of the 3 layout routes, use that layout's sidebar
  const layoutNav = getStudentLayoutNavByPath(pathname);
  if (layoutNav) return layoutNav;

  const hasEnrollment = userAttributes.hasEnrollment || userAttributes.enrolledCourses?.length > 0;
  const onboardingStatus = userAttributes.onboardingStatus || userAttributes.enrollment?.onboardingStatus;
  const isOnboardingComplete = onboardingStatus === 'COMPLETED' || userAttributes.isOnboardingComplete === true;
  
  // Not enrolled - show assessment/enrollment flow
  if (!hasEnrollment) {
    return unenrolledStudentNav;
  }
  
  // Enrolled but onboarding not complete - show onboarding flow
  if (hasEnrollment && !isOnboardingComplete) {
    return onboardingStudentNav;
  }
  
  // Enrolled and onboarding complete - show regular student navigation
  return studentNav;
}

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
  super_admin: "system",
  it_admin: "system",
  it_support: "system",
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
export function getNavigation({ domain, role, permissions = [], attributes = {}, pathname = "" }) {
  // Determine domain from role if not provided
  if (!domain && role) {
    domain = roleDomainMap[role] || "student";
  }

  // Get base navigation for the domain
  // Special handling for students: check pathname for 3 layout types, else enrollment status
  let nav;
  if (domain === "student" || role === "student" || role === "learner") {
    nav = getStudentNavigation(attributes, pathname);
  } else {
    nav = domainNavMap[domain] || [];
  }

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
export function getRoleNavigation(role, userPermissions = [], userAttributes = {}, pathname = "") {
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
  
  // Get filtered navigation (pathname used for student's 3 layout sidebars)
  const navigation = getNavigation({
    domain,
    role,
    permissions: normalizedPermissions,
    attributes: userAttributes,
    pathname,
  });

  // Return in the format expected by existing components (pinned tools removed from all navigation)
  return {
    navigation,
    title: getDomainTitle(domain),
    subtitle: getDomainSubtitle(domain, role),
    pinned: [],
  };
}

/**
 * Get domain title
 */
function getDomainTitle(domain) {
  const titles = {
    sales: "Brintelli LMS",
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
    sales: "Dashboard",
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
