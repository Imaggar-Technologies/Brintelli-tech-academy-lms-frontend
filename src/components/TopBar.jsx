import {
  Bell,
  Search,
  Menu,
  PanelLeft,
  PanelRight,
  LogOut,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLogout } from "../utils/auth";

const roleLabels = {
  student: "Student",
  tutor: "Tutor",
  lsm: "Learning Success",
  admin: "Admin",
  placement: "Placement",
};

const TopBar = ({
  role = "student",
  isSidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileSidebar,
}) => {
  const roleLabel = useMemo(() => roleLabels[role] ?? "Student", [role]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onLogout = async () => {
    await handleLogout(dispatch, navigate);
  };

  const handleSidebarToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const handleMobileToggle = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-brintelli-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleMobileToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border bg-brintelli-card text-textSoft shadow-sm transition hover:border-brand-500 hover:text-brand-500 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={handleSidebarToggle}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border bg-brintelli-card text-textSoft shadow-sm transition hover:border-brand-500 hover:text-brand-500 lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-textMuted">
              Brintelli Tech Academy
            </span>
            <span className="text-lg font-semibold text-text">LMS Experience Hub</span>
            <span className="text-xs text-textSoft lg:hidden">{roleLabel} View</span>
          </div>
        </div>

        <div className="hidden flex-1 items-center lg:flex">
          <div className="ml-auto flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-textMuted" />
              <input
                type="text"
                placeholder="Search courses, sessions, mentors..."
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-card px-10 py-2.5 text-sm text-textSoft placeholder:text-textMuted shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brintelli-border bg-brintelli-card text-textSoft shadow-sm transition hover:border-brand-500 hover:text-brand-500">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
              3
            </span>
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-card px-3 py-2 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 text-sm font-semibold text-white shadow-soft">
              <div className="flex h-full items-center justify-center">AK</div>
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-semibold text-text">Aishwarya K</span>
              <span className="text-xs text-textSoft">{roleLabel} Portal</span>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-brintelli-border px-2.5 py-1 text-xs font-semibold text-textSoft transition hover:border-brand-500 hover:text-brand-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

