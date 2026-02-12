import {
  LayoutDashboard,
  Wallet,
  FileSearch,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";

/**
 * FINANCE NAVIGATION - Simplified Structure
 * 
 * 1. Dashboard - Overview and stats
 * 2. Transactions - Complete transaction history
 * 3. Financial Processing - Offers/Payment links sent to students
 * 4. Refunds - Process and manage refund requests
 */
const financeNav = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/finance/dashboard",
    pageId: "finance-dashboard",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: FileSearch,
    path: "/finance/transactions",
    pageId: "finance-transactions",
  },
  {
    id: "financial-processing",
    label: "Financial Processing",
    icon: ClipboardCheck,
    path: "/finance/processing",
    pageId: "finance-processing",
  },
  {
    id: "refunds",
    label: "Refunds",
    icon: RotateCcw,
    path: "/finance/refunds",
    pageId: "finance-refunds",
  },
];

export default financeNav;
