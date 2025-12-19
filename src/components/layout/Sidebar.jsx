import { NavLink } from "react-router-dom";
import { Sparkles, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { getRoleNavigation } from "../../config/navigation";

const Sidebar = ({ collapsed, mobileOpen, onCloseMobile, role }) => {
  const sidebarWidth = collapsed ? "w-20" : "w-72";
  const [openGroups, setOpenGroups] = useState(new Set());
  const defaultIcon = Sparkles;

  const navConfig = useMemo(() => {
    const config = getRoleNavigation(role);
    return config || {
      title: "Brintelli LMS",
      subtitle: "Dashboard",
      pinned: [],
      navigation: [],
    };
  }, [role]);

  const { title, subtitle, pinned = [], navigation = [] } = navConfig;

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const renderLink = (item) => {
    const Icon = item.icon ?? defaultIcon;
    if (!item.to) return null;
    
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.exact ?? item.to.endsWith("/dashboard")}
        className={({ isActive }) =>
          [
            "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
            isActive
              ? "bg-white/20 text-brand"
              : "text-textSoft hover:bg-white/10 hover:text-brand",
            collapsed ? "justify-center px-3" : "",
          ].join(" ")
        }
        onClick={onCloseMobile}
      >
        {Icon && <Icon className="h-5 w-5 text-textMuted group-hover:text-brand" />}
        {!collapsed && <span className="text-sm text-textSoft font-medium">{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={[
          "fixed inset-0 z-30 bg-brintelli-baseAlt/70 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 transform bg-brintelli-baseAlt shadow-card transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarWidth,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-screen flex-col border-r border-brintelli-border/70 px-4 py-6">
          <div className={[
            "flex items-center",
            collapsed ? "justify-center" : "gap-3",
          ].join(" ")}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brintelli text-white shadow-glow">
              BT
            </div>
            {!collapsed && (
              <div>
                <p className="text-text font-semibold text-lg leading-tight">{title}</p>
                <p className="text-textMuted text-xs">{subtitle}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex-1 overflow-y-auto">
            {pinned && pinned.length > 0 && (
              <div className="flex flex-col gap-2">
                {!collapsed && (
                  <p className="px-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Pinned tools</p>
                )}
                <div className="flex flex-col gap-1.5">{pinned.map((tool) => renderLink(tool))}</div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2">
              {!collapsed && (
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-textMuted">Navigation</p>
              )}
              <div className="flex flex-col gap-1.5">
                {navigation.map((item) => {
                  if (item.children && item.children.length > 0) {
                    const isOpen = collapsed ? true : openGroups.has(item.id);
                    const Icon = item.icon ?? defaultIcon;
                    
                    return (
                      <div key={item.id || item.label}>
                        <button
                          type="button"
                          onClick={() => toggleGroup(item.id)}
                          className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                            collapsed ? "justify-center" : "text-textSoft hover:bg-white/10 hover:text-brand"
                          }`}
                        >
                          {Icon && <Icon className="h-5 w-5 text-textMuted group-hover:text-brand" />}
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left text-sm text-textSoft font-medium">{item.label}</span>
                              <ChevronDown
                                className={`h-4 w-4 text-textMuted transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            </>
                          )}
                        </button>
                        {isOpen && !collapsed && (
                          <div className="mt-1.5 flex flex-col gap-1.5 pl-8">
                            {item.children.map((child) => renderLink(child))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return renderLink(item);
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/60 p-4 shadow-card">
            {!collapsed ? (
              <>
                <h4 className="text-text font-semibold text-base">Need support?</h4>
                <p className="mt-1 text-xs text-textMuted">
                  Chat with your success manager whenever you need help unblocking your prep.
                </p>
                <button className="mt-4 w-full rounded-xl bg-gradient-brintelli-alt px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:opacity-90">
                  Open Help Center
                </button>
              </>
            ) : (
              <Sparkles className="mx-auto h-5 w-5 text-brand" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

