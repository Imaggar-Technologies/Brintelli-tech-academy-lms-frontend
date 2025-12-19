import { NavLink, Link } from "react-router-dom";
import { Sparkles, LogOut, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRoleNavigation } from "../../config/navigation";
import { handleLogout } from "../../utils/auth";
import { selectCurrentUser } from "../../store/slices/authSlice";

const LinkItem = ({ item, collapsed, onClick }) => {
  const Icon = item.icon;
  if (!item.to) return null;
  
  return (
    <NavLink
      to={item.to}
      end={item.exact ?? item.to.endsWith("/dashboard")}
      className={({ isActive }) =>
        [
          "relative flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-160 ease-out text-white/80",
          isActive
            ? "bg-white/20 text-white before:absolute before:-left-2 before:top-1/2 before:h-8 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-white/60 shadow-glass"
            : "hover:bg-white/15 hover:text-white",
          collapsed ? "justify-center px-3" : "pl-5",
        ].join(" ")
      }
      onClick={onClick}
    >
      {Icon && <Icon className="h-5 w-5 text-white/70" />}
      {!collapsed && <span className="text-sm font-medium text-white/85">{item.label}</span>}
    </NavLink>
  );
};

const Navigation = ({ role = "student", collapsed, mobileOpen, onCloseMobile, onToggleCollapse }) => {
  const sidebarWidth = collapsed ? "w-20" : "w-72";
  const [openGroups, setOpenGroups] = useState(new Set());
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  const navConfig = useMemo(() => {
    // Use user.role if available, otherwise fall back to role prop from URL
    // This ensures RBAC filtering uses the actual user role (e.g., sales_agent, sales_lead, sales_head)
    // instead of just the domain (e.g., sales)
    const actualRole = user?.role || role;
    
    // Pass user object to getRoleNavigation for RBAC/ABAC filtering
    const config = getRoleNavigation(actualRole, user);
    return config || {
      title: "Brintelli LMS",
      subtitle: "Dashboard",
      pinned: [],
      navigation: [],
    };
  }, [role, user]);
  
  const { title, subtitle, pinned = [], navigation = [] } = navConfig;
  const defaultIcon = Sparkles;
  
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

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-30 bg-overlay transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 transform bg-gradient-to-b from-brand-dark via-brand to-accent-purple text-white shadow-glow transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarWidth
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-screen flex-col border-r border-white/15 px-4 py-6 backdrop-blur-sm">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 text-brand-dark shadow-glow">
              BT
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">
                  {title}
                </p>
                <p className="text-lg font-semibold text-white">{subtitle}</p>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`ml-auto hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition duration-160 hover:bg-white/20 lg:flex ${
                collapsed ? "lg:ml-0" : ""
              }`}
              aria-label="Toggle sidebar width"
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="mt-6 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/60">
                  Pinned Tools
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {pinned.map((item) => (
                  <LinkItem
                    key={item.label}
                    item={{ ...item, icon: item.icon ?? defaultIcon }}
                    collapsed={collapsed}
                    onClick={onCloseMobile}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/60">
                  Navigation
                </p>
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
                          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-160 ease-out text-white/80 ${
                            collapsed ? "justify-center" : "hover:bg-white/15 hover:text-white"
                          }`}
                        >
                          {Icon && <Icon className="h-5 w-5 text-white/70" />}
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left text-sm font-medium text-white/85">{item.label}</span>
                              <ChevronDown
                                className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            </>
                          )}
                        </button>
                        {isOpen && !collapsed && (
                          <div className="mt-1.5 flex flex-col gap-1.5 pl-8">
                            {item.children.map((child) => {
                              // Handle nested children (children within children)
                              if (child.children && child.children.length > 0) {
                                const childIsOpen = openGroups.has(child.id);
                                const ChildIcon = child.icon ?? defaultIcon;
                                
                                return (
                                  <div key={child.id || child.label}>
                                    <button
                                      type="button"
                                      onClick={() => toggleGroup(child.id)}
                                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-160 ease-out text-white/70 hover:bg-white/10 hover:text-white/90"
                                    >
                                      {ChildIcon && <ChildIcon className="h-4 w-4 text-white/60" />}
                                      <span className="flex-1 text-left text-sm font-medium text-white/75">{child.label}</span>
                                      <ChevronDown
                                        className={`h-3.5 w-3.5 text-white/60 transition-transform ${childIsOpen ? "rotate-180" : ""}`}
                                      />
                                    </button>
                                    {childIsOpen && (
                                      <div className="mt-1 flex flex-col gap-1 pl-8">
                                        {child.children.map((grandchild) => (
                                          <LinkItem
                                            key={grandchild.label || grandchild.id}
                                            item={{ ...grandchild, icon: grandchild.icon ?? defaultIcon }}
                                            collapsed={collapsed}
                                            onClick={onCloseMobile}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              
                              // Regular child item (no nested children)
                              return (
                                <LinkItem
                                  key={child.label || child.id}
                                  item={{ ...child, icon: child.icon ?? defaultIcon }}
                                  collapsed={collapsed}
                                  onClick={onCloseMobile}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <LinkItem
                      key={item.label || item.id}
                      item={{ ...item, icon: item.icon ?? defaultIcon }}
                      collapsed={collapsed}
                      onClick={onCloseMobile}
                    />
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="mt-6 rounded-2xl border border-white/25 bg-white/10 p-4 text-white shadow-glass backdrop-blur">
            {!collapsed ? (
              <>
                <h4 className="text-base font-semibold">Need support?</h4>
                <p className="mt-1 text-xs text-white/70">
                  Chat with your success manager whenever you need help unblocking your prep.
                </p>
                <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white transition duration-160 hover:bg-white/30">
                  <Sparkles className="h-4 w-4" />
                  Open Help Center
                </button>
              </>
            ) : (
              <Sparkles className="mx-auto h-5 w-5 text-white" />
            )}
          </div>

          <button
            onClick={async () => {
              onCloseMobile();
              await handleLogout(dispatch, navigate);
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-160 hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
export { Navigation };
