import {
  LayoutDashboard,
  Wallet,
  Target,
  CalendarClock,
  ClipboardCheck,
  Sparkles,
  BarChart3,
  Settings,
  FileSearch,
  ShieldCheck,
  CalendarDays,
  FileSpreadsheet,
  Award,
  GraduationCap,
  Users,
  Bell,
} from "lucide-react";

const financeNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/finance/dashboard",
    pageId: "finance-dashboard",
  },
  {
    id: "payments",
    label: "Payments & Transactions",
    icon: Wallet,
    children: [
      { label: "All Payments", icon: Wallet, path: "/finance/payments", pageId: "finance-payments" },
      { label: "Transaction History", icon: FileSearch, path: "/finance/transactions", pageId: "finance-transactions" },
      { label: "Payment Gateway", icon: ShieldCheck, path: "/finance/gateway", pageId: "finance-gateway" },
    ],
  },
  {
    id: "dues",
    label: "Dues & Collections",
    icon: Target,
    children: [
      { label: "Outstanding Dues", icon: Target, path: "/finance/dues", pageId: "finance-dues" },
      { label: "Collection Tracker", icon: ClipboardCheck, path: "/finance/collections", pageId: "finance-collections" },
      { label: "Payment Reminders", icon: Bell, path: "/finance/reminders", pageId: "finance-reminders" },
    ],
  },
  {
    id: "emi",
    label: "EMI & Installments",
    icon: CalendarClock,
    children: [
      { label: "EMI Tracker", icon: CalendarClock, path: "/finance/emi", pageId: "finance-emi" },
      { label: "Installment Schedule", icon: CalendarDays, path: "/finance/installments", pageId: "finance-installments" },
      { label: "EMI Management", icon: Wallet, path: "/finance/emi-management", pageId: "finance-emi-mgmt" },
    ],
  },
  {
    id: "refunds",
    label: "Refunds & Adjustments",
    icon: ClipboardCheck,
    children: [
      { label: "Refund Queue", icon: ClipboardCheck, path: "/finance/refunds", pageId: "finance-refunds" },
      { label: "Refund History", icon: FileSearch, path: "/finance/refund-history", pageId: "finance-refund-history" },
      { label: "Adjustments", icon: FileSpreadsheet, path: "/finance/adjustments", pageId: "finance-adjustments" },
    ],
  },
  {
    id: "discounts",
    label: "Scholarships & Discounts",
    icon: Sparkles,
    children: [
      { label: "Scholarship Management", icon: Award, path: "/finance/scholarships", pageId: "finance-scholarships" },
      { label: "Discount Policies", icon: Sparkles, path: "/finance/discounts", pageId: "finance-discounts" },
      { label: "Approval Workflow", icon: ClipboardCheck, path: "/finance/approvals", pageId: "finance-approvals" },
    ],
  },
  {
    id: "revenue",
    label: "Revenue Analytics",
    icon: BarChart3,
    children: [
      { label: "Revenue Dashboard", icon: BarChart3, path: "/finance/revenue", pageId: "finance-revenue" },
      { label: "Course Revenue", icon: GraduationCap, path: "/finance/course-revenue", pageId: "finance-course-revenue" },
      { label: "Batch Revenue", icon: Users, path: "/finance/batch-revenue", pageId: "finance-batch-revenue" },
      { label: "Revenue Reports", icon: FileSpreadsheet, path: "/finance/revenue-reports", pageId: "finance-revenue-reports" },
    ],
  },
  { id: "profile", label: "Profile & Settings", icon: Settings, path: "/finance/profile", pageId: "finance-profile" },
];

export default financeNav;

