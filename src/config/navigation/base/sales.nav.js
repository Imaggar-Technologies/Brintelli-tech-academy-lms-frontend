import {
  LayoutDashboard,
  Target,
  ArrowRightLeft,
  Sparkles,
  UserCheck,
  Phone,
  FileCheck,
  Handshake,
  MessageSquare,
  Award,
  Wallet,
  Settings,
  UsersRound,
  BarChart3,
  TrendingUp,
  CalendarClock,
  GraduationCap,
  FileBarChart,
  ClipboardCheck,
  XCircle,
  CheckCircle,
  Gift,
  ArchiveX,
} from "lucide-react";

/**
 * BASE SALES NAVIGATION - Single Source of Truth
 * 
 * This file defines ALL possible sales navigation items.
 * RBAC (Role-Based Access Control) filters which items are visible.
 * ABAC (Attribute-Based Access Control) filters data within pages.
 * 
 * PERMISSION STRUCTURE:
 * - Uses role-specific permissions: sales:agent:view, sales:lead:view, sales:head:view
 * - Combined with action permissions: sales:read, sales:update, sales:manage_team, etc.
 * 
 * WORKFLOW ALIGNMENT:
 * - Follows the Lead → Deal → Student lifecycle
 * - Respects role hierarchy: Agent < Lead < Head
 * - Pipeline behavior changes per role (same route, different modes)
 */

export const salesNav = [
  // ============================================
  // DASHBOARD (All Roles)
  // ============================================
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/sales/dashboard",
    pageId: "sales-dashboard",
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    // RBAC: All sales roles can view dashboard
    // ABAC: Data filtered by ownerId (Agent), teamId (Lead), departmentId (Head)
    // Shows: Leads count, pipeline stages, recent activity
  },

  // ============================================
  // EXECUTIVE DASHBOARD (Sales Head/Admin Only)
  // ============================================
  {
    id: "executive-dashboard",
    label: "Executive Dashboard",
    icon: BarChart3,
    path: "/sales/executive-dashboard",
    pageId: "sales-executive-dashboard",
    permissions: ["sales:head:view"],
    // RBAC: Only Sales Head/Admin can see this
    // ABAC: Shows department-wide metrics, revenue, conversions
  },

  // ============================================
  // PIPELINE (All Roles - Different Behaviors)
  // ============================================
  {
    id: "pipeline",
    label: "Pipeline",
    icon: ArrowRightLeft,
    path: "/sales/pipeline",
    pageId: "sales-pipeline",
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    // RBAC: All sales roles can access
    // ABAC: 
    // - Agent: Only own leads, single drag & drop
    // - Lead: Team leads, batch move allowed
    // - Head: Read-only, department analytics
    // WORKFLOW: Same route, different UI modes based on role
  },

  // ============================================
  // LEADS & PROSPECTS (Parent Menu)
  // ============================================
  {
    id: "leads",
    label: "Leads & Prospects",
    icon: Target,
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    children: [
      // New Leads (Screening) - Agent & Lead
      {
        id: "new-leads",
        label: "New Leads",
        icon: Sparkles,
        path: "/sales/new-leads",
        pageId: "sales-new-leads",
        permissions: ["sales:agent:view", "sales:lead:view"],
        // RBAC: Visible to Agent and Lead only
        // ABAC: 
        // - Agent: Only leads assigned to them in "primary_screening" stage
        // - Lead: Unassigned leads or leads assigned to their team
        // WORKFLOW: Screening stage - validate interest
      },
      // Active Leads (Engagement) - Agent & Lead
      {
        id: "active-leads",
        label: "Active Leads",
        icon: UserCheck,
        path: "/sales/active-leads",
        pageId: "sales-active-leads",
        permissions: ["sales:agent:view", "sales:lead:view"],
        // RBAC: Visible to Agent and Lead only
        // ABAC:
        // - Agent: Only leads assigned to them (stages: meet_and_call, demo_and_mentor_screening, assessments)
        // - Lead: Team's active leads
        // WORKFLOW: Engagement & doubt clearing, meetings scheduled
      },
      // Inactive Leads (Lead Dump) - Agent & Lead
      {
        id: "inactive-leads",
        label: "Inactive Leads",
        icon: ArchiveX,
        path: "/sales/inactive-leads",
        pageId: "sales-inactive-leads",
        permissions: ["sales:agent:view", "sales:lead:view"],
        // WORKFLOW: Lead Dump (not interested / not qualified)
      },
      // Leads Overview (Read-only) - Sales Head Only
      {
        id: "leads-overview",
        label: "Leads Overview",
        icon: Target,
        path: "/sales/leads-overview",
        pageId: "sales-leads-overview",
        permissions: ["sales:head:view"],
        // RBAC: Only Sales Head/Admin
        // ABAC: All department leads (read-only view)
        // WORKFLOW: Department-level monitoring
      },
    ],
  },

  // ============================================
  // MEETINGS & COUNSELLING (All Roles)
  // ============================================
  {
    id: "meetings-counselling",
    label: "Meetings & Counselling",
    icon: Phone,
    path: "/sales/meetings-counselling",
    pageId: "sales-meetings-counselling",
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    // RBAC: All sales roles
    // ABAC:
    // - Agent: Only their assigned leads' meetings
    // - Lead: Team's meetings
    // - Head: Department meetings
    // WORKFLOW: Schedule and track meetings, counselling sessions
  },

  // ============================================
  // ASSESSMENTS (All Roles)
  // ============================================
  {
    id: "assessments",
    label: "Assessments",
    icon: FileCheck,
    path: "/sales/assessments",
    pageId: "sales-assessments",
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    // RBAC: All sales roles
    // ABAC:
    // - Agent: Read-only status view for their leads
    // - Lead: Can manage assessments for team leads
    // - Head: Department-wide assessment tracking
    // WORKFLOW: Technical/aptitude test assignment, result determines level (Beginner/Intermediate/Advanced)
  },

  // ============================================
  // SCHOLARSHIP AND OFFERS (All Roles)
  // ============================================
  {
    id: "scholarship-offers",
    label: "Scholarship and Offers",
    icon: Gift,
    path: "/sales/scholarship-and-offers",
    pageId: "sales-scholarship-offers",
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    // RBAC: All sales roles
    // ABAC:
    // - Agent: Can apply scholarships and send offers for their completed assessments
    // - Lead: Can manage scholarships and offers for team leads
    // - Head: Department-wide scholarship and offer tracking
    // WORKFLOW: Completed assessments move here, where scholarships can be applied and offers sent
  },

  // ============================================
  // DEALS & CONVERSIONS (Parent Menu - Lead & Head)
  // ============================================
  {
    id: "deals-conversions",
    label: "Deals & Conversions",
    icon: Handshake,
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    children: [
      // Active Deals - Agent, Lead & Head
      {
        id: "active-deals",
        label: "Active Deals",
        icon: Handshake,
        path: "/sales/deals",
        pageId: "sales-deals",
        permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
        // RBAC: Agent, Lead, and Head
        // ABAC: Filtered by assignedTo (Agent), teamId (Lead), or departmentId (Head)
        // WORKFLOW: Leads with completed assessments and offers (pipelineStage: 'offer')
      },
      // Won Deals - Sales Head Only
      {
        id: "won-deals",
        label: "Won Deals",
        icon: CheckCircle,
        path: "/sales/won-deals",
        pageId: "sales-won-deals",
        permissions: ["sales:head:view"],
        // RBAC: Only Sales Head/Admin
        // ABAC: All department won deals
        // WORKFLOW: Successfully converted deals
      },
      // Lost Deals - Sales Head Only
      {
        id: "lost-deals",
        label: "Lost Deals",
        icon: XCircle,
        path: "/sales/lost-deals",
        pageId: "sales-lost-deals",
        permissions: ["sales:head:view"],
        // RBAC: Only Sales Head/Admin
        // ABAC: All department lost deals
        // WORKFLOW: Failed conversions for analysis
      },
    ],
  },

  // ============================================
  // TEAM MANAGEMENT (Sales Lead Only)
  // ============================================
  {
    id: "team-management",
    label: "Team Management",
    icon: UsersRound,
    path: "/sales/team",
    pageId: "sales-team",
    permissions: ["sales:lead:view"],
    // RBAC: Only Sales Lead
    // ABAC: Shows agents in user's team
    // WORKFLOW: Assign leads to agents, view team performance
  },

  // ============================================
  // TARGETS (Sales Lead & Head)
  // ============================================
  {
    id: "targets",
    label: "Targets",
    icon: TrendingUp,
    path: "/sales/targets",
    pageId: "sales-targets",
    permissions: ["sales:lead:view", "sales:head:view"],
    // RBAC: Sales Lead and Head
    // ABAC:
    // - Lead: Targets set by Head for their team
    // - Head: Set targets for Leads, view department targets
    // WORKFLOW: Target setting and tracking based on batches
  },

  // ============================================
  // TARGETS & PERFORMANCE (Sales Head Only)
  // ============================================
  {
    id: "targets-performance",
    label: "Targets & Performance",
    icon: BarChart3,
    path: "/sales/targets-performance",
    pageId: "sales-targets-performance",
    permissions: ["sales:head:view"],
    // RBAC: Only Sales Head/Admin
    // ABAC: Department-wide targets and performance metrics
    // WORKFLOW: Set targets for Sales Leads, review performance
  },

  // ============================================
  // FINANCIAL PROCESSING (Sales Head Only)
  // ============================================
  {
    id: "financial-processing",
    label: "Financial Processing",
    icon: Wallet,
    path: "/sales/financial-processing",
    pageId: "sales-financial-processing",
    permissions: ["sales:head:view"],
    // RBAC: Only Sales Head/Admin
    // ABAC: All department financial data
    // WORKFLOW: Finance approval, payment tracking
  },

  // ============================================
  // BATCH & COURSE MAPPING (Sales Head Only)
  // ============================================
  {
    id: "batch-course-mapping",
    label: "Batch & Course Mapping",
    icon: GraduationCap,
    path: "/sales/batch-course-mapping",
    pageId: "sales-batch-course-mapping",
    permissions: ["sales:head:view"],
    // RBAC: Only Sales Head/Admin
    // ABAC: All batches and courses (read-only, PM creates batches)
    // WORKFLOW: View batches created by PM, set targets based on batches
  },

  // ============================================
  // REPORTS & ANALYTICS (Sales Head Only)
  // ============================================
  {
    id: "reports-analytics",
    label: "Reports & Analytics",
    icon: FileBarChart,
    path: "/sales/reports-analytics",
    pageId: "sales-reports-analytics",
    permissions: ["sales:head:view"],
    // RBAC: Only Sales Head/Admin
    // ABAC: Department-wide analytics
    // WORKFLOW: Revenue tracking, conversion analysis, performance reports
  },

  // ============================================
  // PROFILE & SETTINGS (All Roles)
  // ============================================
  {
    id: "profile",
    label: "Profile & Settings",
    icon: Settings,
    path: "/sales/profile",
    pageId: "sales-profile",
    permissions: ["sales:agent:view", "sales:lead:view", "sales:head:view"],
    // RBAC: All sales roles
    // ABAC: User's own profile only
  },
];
