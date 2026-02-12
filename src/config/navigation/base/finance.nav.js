import {
  LayoutDashboard,
  Wallet,
  FileSearch,
  ClipboardCheck,
  User,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

/**
 * FINANCE OFFICER NAVIGATION
 * 
 * Simplified navigation for Finance Officer role
 * Focus: Dashboard, Transactions, Financial Processing (Offers), Refunds, Overdues, Scholarships, Profile
 */
export const financeNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/finance/dashboard",
    pageId: "finance-dashboard",
    permissions: ["finance:read"],
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: FileSearch,
    path: "/finance/transactions",
    pageId: "finance-transactions",
    permissions: ["finance:read"],
  },
  {
    id: "financial-processing",
    label: "Financial Processing",
    icon: Wallet,
    path: "/finance/processing",
    pageId: "finance-processing",
    permissions: ["finance:read", "finance:update"],
    description: "Manage payment links and offers sent to students",
  },
  {
    id: "refunds",
    label: "Refunds",
    icon: RotateCcw,
    path: "/finance/refunds",
    pageId: "finance-refunds",
    permissions: ["finance:read", "finance:update"],
    description: "Process and manage refund requests",
  },
  {
    id: "overdues",
    label: "Overdues & Outstandings",
    icon: AlertCircle,
    path: "/finance/dues",
    pageId: "finance-dues",
    permissions: ["finance:read", "finance:update"],
  },
  {
    id: "scholarships",
    label: "Scholarships",
    icon: ClipboardCheck,
    path: "/finance/scholarships",
    pageId: "finance-scholarships",
    permissions: ["finance:read", "finance:update"],
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    path: "/finance/profile",
    pageId: "finance-profile",
    permissions: ["finance:read"],
  },
];

export default financeNav;
