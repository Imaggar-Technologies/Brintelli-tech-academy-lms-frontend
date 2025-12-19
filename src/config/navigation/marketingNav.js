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

const marketingNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/marketing/dashboard",
    pageId: "marketing-dashboard",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Megaphone,
    children: [
      { label: "All Campaigns", icon: Megaphone, path: "/marketing/campaigns", pageId: "marketing-campaigns" },
      { label: "Campaign Builder", icon: Sparkles, path: "/marketing/campaign-builder", pageId: "marketing-builder" },
      { label: "Campaign Performance", icon: BarChart3, path: "/marketing/campaign-performance", pageId: "marketing-performance" },
    ],
  },
  {
    id: "social",
    label: "Social Media",
    icon: MessageSquare,
    children: [
      { label: "Social Posts", icon: MessageSquare, path: "/marketing/social", pageId: "marketing-social" },
      { label: "Content Calendar", icon: CalendarDays, path: "/marketing/calendar", pageId: "marketing-calendar" },
      { label: "Engagement Analytics", icon: ChartSpline, path: "/marketing/engagement", pageId: "marketing-engagement" },
    ],
  },
  {
    id: "funnels",
    label: "Marketing Funnels",
    icon: Layers3,
    children: [
      { label: "Funnel Overview", icon: Layers3, path: "/marketing/funnels", pageId: "marketing-funnels" },
      { label: "Conversion Tracking", icon: Target, path: "/marketing/conversions", pageId: "marketing-conversions" },
      { label: "A/B Testing", icon: FileSearch, path: "/marketing/ab-testing", pageId: "marketing-ab-testing" },
    ],
  },
  {
    id: "assets",
    label: "Marketing Assets",
    icon: FileText,
    children: [
      { label: "Asset Library", icon: FileText, path: "/marketing/assets", pageId: "marketing-assets" },
      { label: "Templates", icon: Sparkles, path: "/marketing/templates", pageId: "marketing-templates" },
      { label: "Brand Guidelines", icon: ShieldCheck, path: "/marketing/brand", pageId: "marketing-brand" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: BarChart3,
    children: [
      { label: "Marketing Dashboard", icon: BarChart3, path: "/marketing/analytics", pageId: "marketing-analytics" },
      { label: "ROI Reports", icon: FileBarChart, path: "/marketing/roi", pageId: "marketing-roi" },
      { label: "Lead Attribution", icon: Target, path: "/marketing/attribution", pageId: "marketing-attribution" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/marketing/profile", pageId: "marketing-profile" },
];

export default marketingNav;

