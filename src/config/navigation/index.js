// Legacy imports - keeping for backward compatibility
import learnerNav from "./learnerNav";
import lsmNav from "./lsmNav";
import tutorNav from "./tutorNav";
import financeNav from "./financeNav";
import salesNav, { salesAdminLeadNav, salesAgentNav, salesLeadNav, salesHeadNav } from "./salesNav";
import programManagerNav from "./programManagerNav";
import marketingNav from "./marketingNav";
import placementNav from "./placementNav";
import externalHrNav from "./externalHrNav";
import mentorNav from "./mentorNav";
import { adminNav } from "../adminNav";

// New enterprise navigation system
import { getRoleNavigation as getNewRoleNavigation } from "./getNavigation";
import { ROLE_PERMISSIONS } from "../../utils/permissions";
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

// Helper to transform nav items from { path } to { to }
const transformNavItems = (navItems) => {
  return navItems.map((item) => {
    if (item.children) {
      return {
        ...item,
        to: item.path || item.to || "#",
        children: item.children.map((child) => {
          // Handle nested children (children within children)
          if (child.children) {
            return {
          ...child,
          to: child.path || child.to || "#",
              children: child.children.map((grandchild) => ({
                ...grandchild,
                to: grandchild.path || grandchild.to || "#",
              })),
            };
          }
          return {
            ...child,
            to: child.path || child.to || "#",
          };
        }),
      };
    }
    return {
      ...item,
      to: item.path || item.to || "#",
    };
  });
};

export const roleNavigationConfig = {
  learner: {
    title: "Brintelli LMS",
    subtitle: "Learner Workspace",
    nav: learnerNav,
    pinned: [
      { label: "Continue Learning", to: "/student/dashboard#continue", icon: Sparkles },
      { label: "Code Playground", to: "/student/code-playground", icon: Terminal },
      { label: "Placement Hub", to: "/student/placement-assistance", icon: BriefcaseBusiness },
    ],
  },
  student: {
    title: "Brintelli LMS",
    subtitle: "Learner Workspace",
    nav: learnerNav,
    pinned: [
      { label: "Continue Learning", to: "/student/dashboard#continue", icon: Sparkles },
      { label: "Code Playground", to: "/student/code-playground", icon: Terminal },
      { label: "Placement Hub", to: "/student/placement-assistance", icon: BriefcaseBusiness },
    ],
  },
  lsm: {
    title: "Brintelli LMS",
    subtitle: "Learning Success Manager",
    nav: lsmNav,
    pinned: [
      { label: "My Mentees", to: "/lsm/mentees", icon: UsersRound },
      { label: "Session Schedule", to: "/lsm/sessions", icon: CalendarDays },
      { label: "Escalations", to: "/lsm/escalations", icon: ShieldCheck },
    ],
  },
  tutor: {
    title: "Brintelli LMS",
    subtitle: "Tutor Console",
    nav: tutorNav,
    pinned: [
      { label: "Manage Courses", to: "/tutor/courses", icon: BookOpen },
      { label: "Lesson Planner", to: "/tutor/planner", icon: CalendarDays },
      { label: "Live Classes", to: "/tutor/live", icon: MonitorPlay },
    ],
  },
  mentor: {
    title: "Brintelli LMS",
    subtitle: "Mentor Portal",
    nav: mentorNav,
    pinned: [
      { label: "My Mentees", to: "/mentor/mentees", icon: UsersRound },
      { label: "Session Schedule", to: "/mentor/schedule", icon: CalendarDays },
      { label: "Share Resources", to: "/mentor/share-resources", icon: Sparkles },
    ],
  },
  finance: {
    title: "Brintelli Finance",
    subtitle: "Revenue Operations",
    nav: financeNav,
    pinned: [
      { label: "Collections", to: "/finance/dues", icon: Wallet },
      { label: "Revenue Analytics", to: "/finance/revenue", icon: BarChart3 },
      { label: "Outstanding Dues", to: "/finance/dues", icon: Target },
    ],
  },
  sales: {
    title: "Brintelli Sales",
    subtitle: "Sales Operations",
    nav: salesNav,
    pinned: [
      { label: "Pipeline Overview", to: "/sales/pipeline", icon: BarChart3 },
      { label: "Demo Schedule", to: "/sales/demos", icon: CalendarClock },
      { label: "Active Deals", to: "/sales/deals", icon: Handshake },
    ],
  },
  // Sales sub-roles will override the base sales config
  sales_agent: {
    title: "Brintelli Sales",
    subtitle: "Sales Operations",
    nav: salesAgentNav,
    pinned: [
      { label: "Pipeline", to: "/sales/pipeline", icon: ArrowRightLeft },
      { label: "Dashboard", to: "/sales/dashboard", icon: LayoutDashboard },
      { label: "Notification", to: "/sales/notifications", icon: Bell },
    ],
  },
  sales_lead: {
    title: "Brintelli Sales",
    subtitle: "Sales Operations",
    nav: salesLeadNav,
    pinned: [
      { label: "Pipeline Overview", to: "/sales/pipeline", icon: BarChart3 },
      { label: "Team Management", to: "/sales/team", icon: UsersRound },
      { label: "Active Leads", to: "/sales/active-leads", icon: Target },
    ],
  },
  sales_head: {
    title: "Brintelli Sales",
    subtitle: "Sales Operations",
    nav: salesHeadNav,
    pinned: [
      { label: "Pipeline Overview", to: "/sales/pipeline", icon: BarChart3 },
      { label: "Team Management", to: "/sales/team", icon: UsersRound },
      { label: "Sales Analytics", to: "/sales/analytics", icon: TrendingUp },
    ],
  },
  marketing: {
    title: "Brintelli Marketing",
    subtitle: "Marketing Operations",
    nav: marketingNav,
    pinned: [
      { label: "Campaigns", to: "/marketing/campaigns", icon: Megaphone },
      { label: "Social Media", to: "/marketing/social", icon: MessageSquare },
      { label: "Marketing Analytics", to: "/marketing/analytics", icon: BarChart3 },
    ],
  },
  programManager: {
    title: "Brintelli LMS",
    subtitle: "Program Manager",
    nav: programManagerNav,
    pinned: [
      { label: "Academic Ops", to: "/program-manager/syllabus", icon: CalendarClock },
      { label: "Batch Health", to: "/program-manager/batch-health", icon: ChartSpline },
      { label: "Content Review", to: "/program-manager/content-review", icon: ClipboardCheck },
    ],
  },
  placement: {
    title: "Brintelli LMS",
    subtitle: "Placement Officer",
    nav: placementNav,
    pinned: [
      { label: "Pipeline", to: "/placement/dashboard", icon: Target },
      { label: "Interviews", to: "/placement/interviews", icon: CalendarClock },
      { label: "Offers", to: "/placement/offers", icon: Award },
    ],
  },
  externalHR: {
    title: "Brintelli Hiring Portal",
    subtitle: "External HR Partner",
    nav: externalHrNav,
    pinned: [
      { label: "Pipeline Overview", to: "/external-hr/pipeline", icon: BriefcaseBusiness },
      { label: "Shortlisted Candidates", to: "/external-hr/shortlisted", icon: UserCheck },
      { label: "Interview Schedule", to: "/external-hr/schedule", icon: CalendarClock },
    ],
  },
  admin: {
    title: "Brintelli Control",
    subtitle: "Admin Control Panel",
    nav: adminNav,
    pinned: [
      { label: "Dashboard", to: "/admin-portal/dashboard", icon: Sparkles },
      { label: "LMS Management", to: "/admin-portal/lms/programs", icon: BriefcaseBusiness },
      { label: "Analytics", to: "/admin-portal/analytics", icon: BarChart3 },
    ],
  },
};

/**
 * Legacy getRoleNavigation - now uses new enterprise system
 * Maintains backward compatibility while using RBAC/ABAC filtering
 */
export const getRoleNavigation = (role, user = null) => {
  // CRITICAL: For sales roles, ALWAYS use new RBAC system - no legacy fallback
  const isSalesRole = role && (role.startsWith('sales_') || role === 'sales');
  
  // For program-manager, lsm, and tutor, use legacy system directly (has comprehensive navigation)
  const isProgramManager = role === 'program-manager' || role === 'programManager';
  const isLSM = role === 'lsm';
  const isTutor = role === 'tutor';
  
  if (isProgramManager) {
    const roleMap = {
      "program-manager": "programManager",
      programManager: "programManager",
    };
    const mappedRole = roleMap[role] || "programManager";
    const config = roleNavigationConfig[mappedRole] || roleNavigationConfig.learner;
    
    return {
      ...config,
      navigation: transformNavItems(config.nav || []),
    };
  }
  
  if (isLSM) {
    const config = roleNavigationConfig.lsm || roleNavigationConfig.learner;
    
    return {
      ...config,
      navigation: transformNavItems(config.nav || []),
    };
  }
  
  if (isTutor) {
    const config = roleNavigationConfig.tutor || roleNavigationConfig.learner;
    
    return {
      ...config,
      navigation: transformNavItems(config.nav || []),
    };
  }
  
  // Try new enterprise navigation system first
  try {
    // Get user permissions from role
    // Priority: user.permissions > ROLE_PERMISSIONS[role] > []
    const userPermissions = user?.permissions || ROLE_PERMISSIONS[role] || [];
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Navigation] ========================================');
      console.log('[Navigation] Role:', role);
      console.log('[Navigation] User object:', user);
      console.log('[Navigation] ROLE_PERMISSIONS[role]:', ROLE_PERMISSIONS[role]);
      console.log('[Navigation] Final permissions:', userPermissions);
      console.log('[Navigation] Is Sales Role:', isSalesRole);
    }
    
    // Get user attributes (for ABAC)
    const userAttributes = {
      assignedClasses: user?.assignedClasses || [],
      enrolledCourses: user?.enrolledCourses || [],
      assignedLeads: user?.assignedLeads || [],
    };
    
    // Use new navigation system - pass parameters correctly
    const newConfig = getNewRoleNavigation(role, userPermissions, userAttributes);
    
    if (newConfig && newConfig.navigation && newConfig.navigation.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Navigation] ✅ SUCCESS: Using new RBAC system');
        console.log('[Navigation] Filtered navigation items:', newConfig.navigation.length);
        console.log('[Navigation] Navigation items:', newConfig.navigation.map(item => ({
          id: item.id,
          label: item.label,
          hasChildren: !!item.children,
          childrenCount: item.children?.length || 0
        })));
      }
      return {
        ...newConfig,
        navigation: transformNavItems(newConfig.navigation || []),
      };
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Navigation] ❌ FAILED: New system returned empty navigation');
        console.error('[Navigation] newConfig:', newConfig);
        console.error('[Navigation] Role:', role);
        console.error('[Navigation] Permissions:', userPermissions);
      }
      
      // FORCE: Don't fall back for sales roles - this is a critical error
      if (isSalesRole) {
        console.error('[Navigation] 🚫 CRITICAL: Blocking legacy fallback for sales role');
        console.error('[Navigation] RBAC filtering is REQUIRED for sales roles');
        // Return empty to force debugging
        return {
          title: "Brintelli Sales",
          subtitle: "Sales Operations",
          pinned: [],
          navigation: [],
        };
      }
    }
  } catch (error) {
    console.error("New navigation system ERROR:", error);
    console.error("Error stack:", error.stack);
    
    // FORCE: Don't fall back for sales roles
    if (isSalesRole) {
      console.error('[Navigation] 🚫 CRITICAL: Blocking legacy fallback after error for sales role');
      return {
        title: "Brintelli Sales",
        subtitle: "Sales Operations",
        pinned: [],
        navigation: [],
      };
    }
  }
  
  // Fallback to legacy system for backward compatibility (NON-SALES ROLES ONLY)
  
  const roleMap = {
    student: "learner",
    "program-manager": "programManager",
    "external-hr": "externalHR",
  };
  const mappedRole = roleMap[role] || role;
  
  // Handle sales sub-roles with specific configs (only for non-sales roles now)
  let config;
  if (role === "sales_head") {
    config = roleNavigationConfig.sales_head || roleNavigationConfig.sales;
  } else if (role === "sales_lead") {
    config = roleNavigationConfig.sales_lead || roleNavigationConfig.sales;
  } else if (role === "sales_agent") {
    config = roleNavigationConfig.sales_agent || roleNavigationConfig.sales;
  } else if (role === "sales_admin") {
    // Legacy: sales_admin uses sales_lead config
    config = {
      ...roleNavigationConfig.sales_lead || roleNavigationConfig.sales,
      nav: salesAdminLeadNav,
    };
  } else {
    config = roleNavigationConfig[mappedRole] || roleNavigationConfig.learner;
  }
  
  // Transform nav items to use 'to' instead of 'path' and rename 'nav' to 'navigation'
  return {
    ...config,
    navigation: transformNavItems(config.nav || []),
  };
};

