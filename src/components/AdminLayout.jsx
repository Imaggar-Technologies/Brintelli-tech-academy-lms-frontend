import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminNavigation from "./AdminNavigation";
import Topbar from "./layout/Topbar";
import { AdminAccessProvider, useAdminAccess } from "../context/AdminAccessContext";
import LaunchStatusPopup from "./LaunchStatusPopup";

const AdminLayoutShell = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { role, roleLabel, setRole, roleOptions } = useAdminAccess();

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-brintelli-base text-text">
      <LaunchStatusPopup />
      <div className="flex min-h-screen">
        <AdminNavigation
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar
            onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
            role={role}
            roleLabelOverride={roleLabel}
            currentRole={role}
            roleOptions={roleOptions}
            onRoleChange={setRole}
          />
          <main className="relative flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
            <div className="pointer-events-none absolute inset-0 bg-grid-brintelli/40" />
            <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <AdminAccessProvider>
    <AdminLayoutShell />
  </AdminAccessProvider>
);

export default AdminLayout;
