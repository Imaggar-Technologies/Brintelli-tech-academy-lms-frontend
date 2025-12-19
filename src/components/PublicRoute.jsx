import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentUser } from "../store/slices/authSlice";
import { getRoleDashboard } from "../utils/roleRoutes";

const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (isAuthenticated && user) {
    // Redirect to user's role-specific dashboard if already authenticated
    const dashboardRoute = getRoleDashboard(user.role);
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default PublicRoute;

