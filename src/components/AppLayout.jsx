import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navigation from "./layout/Navigation";
import Topbar from "./layout/Topbar";
import SecureContextBanner from "./SecureContextBanner";
import { updateUser } from "../store/slices/authSlice";
import { selectCurrentUser } from "../store/slices/authSlice";

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
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const role = getRoleFromPath(location.pathname);
  const isLiveMeetingPage = /\/sessions\/[^/]+\/live$/.test(location.pathname);
  const enrollmentSyncedRef = useRef(false);

  // Redirect admin routes to admin portal
  if (!role && (location.pathname.startsWith("/admin-portal") || location.pathname.startsWith("/admin/"))) {
    return <Navigate to="/admin-portal/dashboard" replace />;
  }

  // Sync enrollment from API for students so sidebar shows full nav (Dashboard, Live Classes, Playground, etc.) when enrolled
  useEffect(() => {
    if (role !== "student" || !user) return;
    if (enrollmentSyncedRef.current) return;
    enrollmentSyncedRef.current = true;
    (async () => {
      try {
        const studentAPI = (await import("../api/student")).default;
        const res = await studentAPI.getMyEnrollment();
        if (res?.success && res?.data?.enrollment) {
          const enrollment = res.data.enrollment;
          const isOnboardingComplete = enrollment.onboardingStatus === "COMPLETED" || enrollment.isOnboardingComplete === true;
          dispatch(
            updateUser({
              hasEnrollment: true,
              enrollment,
              onboardingStatus: enrollment.onboardingStatus ?? null,
              isOnboardingComplete,
              enrolledCourses: enrollment.programId || enrollment.courseId ? [{ id: enrollment.programId || enrollment.courseId }] : [],
            })
          );
        }
      } catch (e) {
        enrollmentSyncedRef.current = false;
      }
    })();
  }, [role, user, dispatch]);

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
            <main className="relative flex-1 overflow-y-auto px-3 py-6 sm:px-4 lg:px-6">
              <div className="pointer-events-none absolute inset-0 bg-grid-brintelli/40" />
              <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-4">
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

