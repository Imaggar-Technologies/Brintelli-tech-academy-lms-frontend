import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "./layout/Navigation";
import Topbar from "./layout/Topbar";
import SecureContextBanner from "./SecureContextBanner";

const getRoleFromPath = (pathname) => {
  // Redirect admin routes to admin portal
  if (pathname.startsWith("/admin-portal") || pathname.startsWith("/admin/")) {
    return null; // Will trigger redirect
  }
  
  const [, firstSegment] = pathname.split("/");
  const validRoles = [
    "student",
    "learner",
    "tutor",
    "lsm",
    "placement",
    "mentor",
    "program-manager",
    "finance",
    "sales",
    "marketing",
    "external-hr",
  ];
  if (validRoles.includes(firstSegment)) {
    return firstSegment;
  }
  return "student";
};

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const role = getRoleFromPath(location.pathname);
  const isLiveMeetingPage = /\/sessions\/[^/]+\/live$/.test(location.pathname);

  // Redirect admin routes to admin portal
  if (!role && (location.pathname.startsWith("/admin-portal") || location.pathname.startsWith("/admin/"))) {
    return <Navigate to="/admin-portal/dashboard" replace />;
  }

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-brintelli-baseAlt text-text">
      {isLiveMeetingPage ? (
        <div className="min-h-screen">
          <SecureContextBanner />
          <Outlet />
        </div>
      ) : (
        <div className="flex min-h-screen">
          <Navigation
            role={role}
            collapsed={isSidebarCollapsed}
            mobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar
              onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
              role={role}
            />
            <SecureContextBanner />
            <main className="relative flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
              <div className="pointer-events-none absolute inset-0 bg-grid-brintelli/40" />
              <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;

