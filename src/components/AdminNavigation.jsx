import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, LogOut, ChevronDown } from "lucide-react";
import { useDispatch } from "react-redux";
import { adminNav } from "../config/adminNav";
import { useAdminAccess } from "../context/AdminAccessContext";
import { handleLogout } from "../utils/auth";

const isSectionAllowed = (item, allowedSections) => {
  if (!allowedSections || allowedSections.length === 0) return true;
  if (allowedSections.includes("*")) return true;
  const id = item.id ?? item.pageId;
  if (!id) return true;
  return allowedSections.includes(id);
};

const filterNavItems = (navItems, canAccess, allowedSections) =>
  navItems
    .filter((item) => isSectionAllowed(item, allowedSections))
    .map((item) => {
      if (item.children) {
        const visibleChildren = item.children.filter((child) => !child.pageId || canAccess(child.pageId));
        if (visibleChildren.length === 0) {
          return null;
        }
        return { ...item, children: visibleChildren };
      }
      if (!item.pageId || canAccess(item.pageId)) {
        return item;
      }
      return null;
    })
    .filter(Boolean);

const AdminNavigation = ({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }) => {
  const sidebarWidth = collapsed ? "w-20" : "w-72";
  const { canAccess, navSections } = useAdminAccess();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filteredNav = useMemo(() => filterNavItems(adminNav, canAccess, navSections), [canAccess, navSections]);

  const determineInitialOpen = () => {
    const activePath = location.pathname;
    const openSet = new Set();
    filteredNav.forEach((item) => {
      if (item.children) {
        if (item.children.some((child) => activePath.startsWith(child.path))) {
          if (item.id) openSet.add(item.id);
        }
      }
    });
    return openSet;
  };

  const [openGroups, setOpenGroups] = useState(determineInitialOpen);

  useEffect(() => {
    setOpenGroups(determineInitialOpen());
  }, [location.pathname, filteredNav]);

  const toggleGroup = (id) => {
    if (!id) return;
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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
                  Brintelli LMS
                </p>
                <p className="text-lg font-semibold text-white">Admin Portal</p>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`ml-auto hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition duration-160 hover:bg-white/20 lg:flex ${
                collapsed ? "lg:ml-0" : ""
              }`}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="mt-6 flex-1 overflow-y-auto pr-1">
            <ul className="flex flex-col gap-4">
              {filteredNav.map((item) => {
                if (item.children) {
                  const isOpen = collapsed ? true : openGroups.has(item.id);

                  const toggle = () => {
                    if (collapsed) return;
                    toggleGroup(item.id);
                  };

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={toggle}
                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition duration-160 ${
                          collapsed ? "justify-center" : "text-white/80 hover:bg-white/15 hover:text-white"
                        }`}
                      >
                        {item.icon && <item.icon className="h-5 w-5 text-white/70" />}
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left text-sm font-semibold text-white/85">{item.label}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </>
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                [
                                  "flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-160 ease-out text-white/80",
                                  isActive
                                    ? "bg-white/20 text-white shadow-glass"
                                    : "hover:bg-white/15 hover:text-white",
                                  collapsed ? "justify-center px-3" : "pl-8",
                                ].join(" ")
                              }
                              onClick={onCloseMobile}
                            >
                              {child.icon && <child.icon className="h-5 w-5 text-white/70" />}
                              {!collapsed && <span className="text-sm font-medium text-white/85">{child.label}</span>}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition duration-160 ease-out text-white/80",
                          isActive ? "bg-white/20 text-white shadow-glass" : "hover:bg-white/15 hover:text-white",
                          collapsed ? "justify-center px-3" : "pl-5",
                        ].join(" ")
                      }
                      onClick={onCloseMobile}
                    >
                      {item.icon && <item.icon className="h-5 w-5 text-white/70" />}
                      {!collapsed && <span className="text-sm font-medium text-white/85">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            onClick={async () => {
              onCloseMobile();
              await handleLogout(dispatch, navigate);
            }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-160 hover:bg-white/20"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminNavigation;
