import {
  LayoutDashboard,
  Target,
  CalendarClock,
  Handshake,
  UsersRound,
  FileBarChart,
  CalendarDays,
  MessageSquare,
  Award,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ClipboardCheck,
  UserCheck,
  ArrowRightLeft,
  Phone,
  FileCheck,
  Wallet,
  UserCog,
  Bell,
  TrendingUp,
  Gift,
  ArchiveX,
} from "lucide-react";

// Navigation for sales_head (highest level - full access)
const salesHeadNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/sales/dashboard",
    pageId: "sales-dashboard",
  },
  {
    id: "leads-prospects",
    label: "Leads & Prospects",
    icon: Target,
    children: [
      { label: "New Leads", icon: Sparkles, path: "/sales/leads", pageId: "sales-leads" },
      { label: "Active Leads", icon: UserCheck, path: "/sales/active-leads", pageId: "sales-active-leads" },
      { label: "Inactive Leads", icon: ArchiveX, path: "/sales/inactive-leads", pageId: "sales-inactive-leads" },
      { label: "Pipeline", icon: ArrowRightLeft, path: "/sales/pipeline", pageId: "sales-pipeline" },
      { label: "Qualification", icon: ClipboardCheck, path: "/sales/qualify", pageId: "sales-qualify" },
    ],
  },
  {
    id: "team",
    label: "Team Management",
    icon: UsersRound,
    path: "/sales/team",
    pageId: "sales-team",
  },
  {
    id: "demos",
    label: "Demos & Meetings",
    icon: CalendarClock,
    children: [
      { label: "Demo Schedule", icon: CalendarClock, path: "/sales/demos", pageId: "sales-demos" },
      { label: "Meeting Calendar", icon: CalendarDays, path: "/sales/calendar", pageId: "sales-calendar" },
      { label: "Follow-ups", icon: MessageSquare, path: "/sales/follow-ups", pageId: "sales-followups" },
    ],
  },
  {
    id: "deals",
    label: "Deals & Conversions",
    icon: Handshake,
    children: [
      { label: "Active Deals", icon: Handshake, path: "/sales/deals", pageId: "sales-deals" },
      { label: "Won Deals", icon: Award, path: "/sales/won", pageId: "sales-won" },
      { label: "Lost Deals", icon: Target, path: "/sales/lost", pageId: "sales-lost" },
    ],
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FileCheck,
    path: "/sales/assessments",
    pageId: "sales-assessments",
  },
  {
    id: "scholarship-offers",
    label: "Scholarship and Offers",
    icon: Gift,
    path: "/sales/scholarship-and-offers",
    pageId: "sales-scholarship-offers",
  },
  {
    id: "financial",
    label: "Financial Processing",
    icon: Wallet,
    path: "/sales/financial-processing",
    pageId: "sales-financial-processing",
  },
  {
    id: "lsm",
    label: "LSM Allocation",
    icon: UserCog,
    path: "/sales/lsm-allocation",
    pageId: "sales-lsm-allocation",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: FileBarChart,
    children: [
      { label: "Sales Dashboard", icon: BarChart3, path: "/sales/analytics", pageId: "sales-analytics" },
      { label: "Performance Reports", icon: FileSpreadsheet, path: "/sales/reports", pageId: "sales-reports" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/sales/profile", pageId: "sales-profile" },
];

// Navigation for sales_lead (team lead - manages team)
const salesLeadNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/sales/dashboard",
    pageId: "sales-dashboard",
  },
  {
    id: "leads-prospects",
    label: "Leads & Prospects",
    icon: Target,
    children: [
      { label: "New Leads", icon: Sparkles, path: "/sales/leads", pageId: "sales-leads" },
      { label: "Active Leads", icon: UserCheck, path: "/sales/active-leads", pageId: "sales-active-leads" },
      { label: "Inactive Leads", icon: ArchiveX, path: "/sales/inactive-leads", pageId: "sales-inactive-leads" },
      { label: "Pipeline", icon: ArrowRightLeft, path: "/sales/pipeline", pageId: "sales-pipeline" },
      { label: "Qualification", icon: ClipboardCheck, path: "/sales/qualify", pageId: "sales-qualify" },
    ],
  },
  {
    id: "team",
    label: "Team Management",
    icon: UsersRound,
    path: "/sales/team",
    pageId: "sales-team",
  },
  {
    id: "demos",
    label: "Demos & Meetings",
    icon: CalendarClock,
    children: [
      { label: "Demo Schedule", icon: CalendarClock, path: "/sales/demos", pageId: "sales-demos" },
      { label: "Meeting Calendar", icon: CalendarDays, path: "/sales/calendar", pageId: "sales-calendar" },
      { label: "Follow-ups", icon: MessageSquare, path: "/sales/follow-ups", pageId: "sales-followups" },
    ],
  },
  {
    id: "deals",
    label: "Deals & Conversions",
    icon: Handshake,
    children: [
      { label: "Active Deals", icon: Handshake, path: "/sales/deals", pageId: "sales-deals" },
      { label: "Won Deals", icon: Award, path: "/sales/won", pageId: "sales-won" },
      { label: "Lost Deals", icon: Target, path: "/sales/lost", pageId: "sales-lost" },
    ],
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FileCheck,
    path: "/sales/assessments",
    pageId: "sales-assessments",
  },
  {
    id: "scholarship-offers",
    label: "Scholarship and Offers",
    icon: Gift,
    path: "/sales/scholarship-and-offers",
    pageId: "sales-scholarship-offers",
  },
  {
    id: "financial",
    label: "Financial Processing",
    icon: Wallet,
    path: "/sales/financial-processing",
    pageId: "sales-financial-processing",
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: FileBarChart,
    children: [
      { label: "Sales Dashboard", icon: BarChart3, path: "/sales/analytics", pageId: "sales-analytics" },
      { label: "Performance Reports", icon: FileSpreadsheet, path: "/sales/reports", pageId: "sales-reports" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/sales/profile", pageId: "sales-profile" },
];

// Navigation for sales_admin (legacy - same as sales_lead)
const salesAdminLeadNav = salesLeadNav;

// Navigation for sales_agent
const salesAgentNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/sales/dashboard",
    pageId: "sales-dashboard",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: ArrowRightLeft,
    path: "/sales/pipeline",
    pageId: "sales-pipeline",
    description: "Stage Move",
  },
  {
    id: "leads-prospects",
    label: "Leads & Prospects",
    icon: Target,
    children: [
      { label: "New Leads", icon: Sparkles, path: "/sales/leads", pageId: "sales-leads", description: "Screening" },
      { label: "Active Leads", icon: UserCheck, path: "/sales/active-leads", pageId: "sales-active-leads", description: "Engagement" },
      { label: "Inactive Leads", icon: ArchiveX, path: "/sales/inactive-leads", pageId: "sales-inactive-leads", description: "Lead Dump" },
    ],
  },
  {
    id: "meetings",
    label: "Meetings and Counselling",
    icon: Phone,
    path: "/sales/meetings-counselling",
    pageId: "sales-meetings-counselling",
  },
  {
    id: "assessments",
    label: "Assessments and Technical Assessments",
    icon: FileCheck,
    path: "/sales/assessments",
    pageId: "sales-assessments",
  },
  {
    id: "scholarship-offers",
    label: "Scholarship and Offers",
    icon: Gift,
    path: "/sales/scholarship-and-offers",
    pageId: "sales-scholarship-offers",
  },
  {
    id: "deals",
    label: "Deals & Conversions",
    icon: Handshake,
    children: [
      { label: "Active Deals", icon: Handshake, path: "/sales/deals", pageId: "sales-deals" },
      { label: "Negotiations", icon: MessageSquare, path: "/sales/deals?filter=negotiations", pageId: "sales-deals-negotiations" },
      { label: "Won Deals", icon: Award, path: "/sales/won", pageId: "sales-won" },
      { label: "Lost Deals", icon: Target, path: "/sales/lost", pageId: "sales-lost" },
    ],
  },
  {
    id: "financial",
    label: "Financial Processing",
    icon: Wallet,
    path: "/sales/financial-processing",
    pageId: "sales-financial-processing",
  },
  {
    id: "lsm",
    label: "LSM Allocation",
    icon: UserCog,
    path: "/sales/lsm-allocation",
    pageId: "sales-lsm-allocation",
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/sales/profile", pageId: "sales-profile" },
];

// Default export for backward compatibility (sales_admin and sales_lead)
const salesNav = salesAdminLeadNav;

export default salesNav;
export { salesAdminLeadNav, salesAgentNav, salesLeadNav, salesHeadNav };
