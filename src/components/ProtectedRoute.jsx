import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "../store/slices/authSlice";

// Selector to check if auth is still loading (rehydrating)
const selectAuthLoading = (state) => state.auth.isLoading;

const ProtectedRoute = ({ children, requiredPermission, requiredRole, requiredAnyPermission, requiredAllPermissions }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  // Wait for rehydration to complete before checking auth
  if (isLoading) {
    // Show loading state while rehydrating
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="text-textMuted">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/switch-user" replace state={{ from: location }} />;
  }

  // Check role-based access
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to user's dashboard if they don't have required role
      const dashboardRoute = getRoleDashboard(user?.role);
      return <Navigate to={dashboardRoute} replace />;
    }
  }

  // Check permission-based access (if permissions are implemented in frontend)
  // Note: Full permission checking should be done on backend
  // This is a basic frontend check for UI purposes
  if (requiredPermission || requiredAnyPermission || requiredAllPermissions) {
    // For now, we'll rely on backend permission checks
    // Frontend permission gates can be added using PermissionGate component
  }

  return children;
};

export default ProtectedRoute;

