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
          "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
          isActive
            ? "bg-white/20 text-white shadow-md before:absolute before:-left-2 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-white before:shadow-sm"
            : "text-white/75 hover:bg-white/12 hover:text-white hover:shadow-sm",
          collapsed ? "justify-center px-3" : "pl-4",
        ].join(" ")
      }
      onClick={onClick}
    >
      {Icon && (
        <Icon 
          className={`h-5 w-5 transition-colors ${
            item.isActive ? "text-white" : "text-white/70 group-hover:text-white"
          }`} 
        />
      )}
      {!collapsed && (
        <span className="text-sm font-medium text-white/90 group-hover:text-white">
          {item.label}
        </span>
      )}
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
      <div className="relative">
        <aside
          className={`fixed inset-y-0 left-0 z-40 transform bg-gradient-to-b from-brand-dark via-brand to-accent-purple text-white shadow-glow transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            sidebarWidth
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-screen flex-col border-r border-white/15 px-4 py-6 backdrop-blur-sm">
            <div className={`flex items-center flex-shrink-0 gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className={`flex items-center gap-3 flex-1 min-w-0 ${collapsed ? "justify-center" : ""}`}>
                <div className={`flex-shrink-0 ${collapsed ? "" : "relative"}`}>
                  <img 
                    src="/mobile%20logo.png" 
                    alt="Brintelli Logo" 
                    className={collapsed ? "h-10 w-10 object-contain rounded-lg shadow-lg" : "h-11 w-auto max-w-[160px] object-contain"}
                    onError={(e) => {
                      // Fallback if mobile logo doesn't load
                      e.target.src = "/logo.png";
                    }}
                  />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/50 truncate">
                      {title}
                    </p>
                    <p className="text-base font-bold text-white truncate leading-tight">{subtitle}</p>
                  </div>
                )}
              </div>
              {collapsed && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden shrink-0 h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white transition-all duration-200 hover:bg-white/25 hover:border-white/30 hover:scale-105 active:scale-95 shadow-sm lg:flex"
                  aria-label="Toggle sidebar width"
                  type="button"
                >
                  <ChevronsRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              )}
            </div>

          <nav className="mt-8 flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
            <div className="sidebar-content">
              <div className="flex flex-col gap-2">
              {!collapsed && pinned.length > 0 && (
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                  Pinned Tools
                </p>
              )}
              <div className="flex flex-col gap-1">
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

            <div className="mt-6 flex flex-col gap-2">
              {!collapsed && navigation.length > 0 && (
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
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
                          className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-out ${
                            collapsed 
                              ? "justify-center" 
                              : "text-white/75 hover:bg-white/12 hover:text-white hover:shadow-sm"
                          }`}
                        >
                          {Icon && (
                            <Icon className={`h-5 w-5 transition-colors ${
                              collapsed ? "text-white/70" : "text-white/70 group-hover:text-white"
                            }`} />
                          )}
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left text-sm font-medium text-white/90 group-hover:text-white">
                                {item.label}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-white/60 transition-all duration-200 ${
                                  isOpen ? "rotate-180 text-white/80" : ""
                                }`}
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
                                      className="group flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out text-white/70 hover:bg-white/10 hover:text-white/90 hover:shadow-sm"
                                    >
                                      {ChildIcon && (
                                        <ChildIcon className="h-4 w-4 text-white/60 group-hover:text-white/80 transition-colors" />
                                      )}
                                      <span className="flex-1 text-left text-sm font-medium text-white/75 group-hover:text-white/95">
                                        {child.label}
                                      </span>
                                      <ChevronDown
                                        className={`h-3.5 w-3.5 text-white/60 transition-all duration-200 ${
                                          childIsOpen ? "rotate-180 text-white/80" : ""
                                        }`}
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
            </div>
          </nav>

          <div className="mt-auto pt-4">
            <div className={`rounded-xl border border-white/20 bg-white/8 p-4 text-white shadow-sm backdrop-blur-sm ${collapsed ? "p-3" : ""}`}>
              {!collapsed ? (
                <>
                  <h4 className="text-sm font-bold text-white">Need support?</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/65">
                    Chat with your success manager whenever you need help.
                  </p>
                  <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-white/25 hover:shadow-md active:scale-[0.98]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Open Help Center
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white/80" />
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                onCloseMobile();
                await handleLogout(dispatch, navigate);
              }}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/15 hover:border-white/30 hover:shadow-md active:scale-[0.98] ${
                collapsed ? "px-3" : ""
              }`}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
      {!collapsed && (
        <button
          onClick={onToggleCollapse}
          className="hidden absolute top-6 left-full z-50 h-8 w-8 -translate-x-1/2 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white transition-all duration-200 hover:bg-white/25 hover:border-white/30 hover:scale-105 active:scale-95 shadow-sm lg:flex"
          aria-label="Toggle sidebar width"
          type="button"
        >
          <ChevronsLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      )}
      </div>
    </>
  );
};

export default Navigation;
export { Navigation };
