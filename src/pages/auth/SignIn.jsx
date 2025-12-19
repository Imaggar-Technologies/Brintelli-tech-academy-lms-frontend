import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Button from "../../components/Button";
import { setCredentials } from "../../store/slices/authSlice";
import { getRoleDashboard } from "../../utils/roleRoutes";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const { authAPI } = await import('../../api/auth');
      const data = await authAPI.login(formData.email, formData.password);

      // Store user data in Redux (will be persisted)
      dispatch(setCredentials({
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken,
      }));
      
      // Navigate to user's role-specific dashboard
      const userRole = data.data.user.role;
      const dashboardRoute = getRoleDashboard(userRole);
      navigate(dashboardRoute);
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brintelli-baseAlt px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card backdrop-blur-glass">
        <div className="bg-gradient-brintelli-alt px-6 py-5 text-white">
          <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Brintelli Tech Academy
          </p>
          <h1 className="text-2xl font-semibold">Sign in to your portal</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-text">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@brintelli.com"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-text">
                Password
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-brand-500 hover:text-brand-600 transition"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="space-y-2 text-center text-sm text-textMuted">
            <div>
              <span>New student? </span>
              <Link
                to="/auth/register/student"
                className="font-semibold text-brand-500 hover:text-brand-600 transition"
              >
                Register as Student
              </Link>
            </div>
            <div>
              <span>Staff member? </span>
              <Link
                to="/auth/register/staff"
                className="font-semibold text-brand-500 hover:text-brand-600 transition"
              >
                Register as Staff
              </Link>
            </div>
          </div>
          <div className="text-center text-textMuted text-xs pt-2">
            <span>© {new Date().getFullYear()} Brintelli Academy</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;


