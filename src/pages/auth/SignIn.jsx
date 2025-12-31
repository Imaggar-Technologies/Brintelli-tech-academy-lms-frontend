import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Mail, ExternalLink } from "lucide-react";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
      <div className="flex w-full">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-12">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="mb-8 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg">
                  <span className="text-2xl font-bold">BT</span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-text">Brintelli</h1>
                  <p className="text-sm text-textMuted">Tech Academy</p>
                </div>
              </div>

              {/* Form Card */}
              <div className="rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text">Welcome Back!</h2>
                  <p className="mt-2 text-sm text-textMuted">Sign in to continue your learning journey</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-text">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@brintelli.com"
                        className="w-full rounded-xl border border-brintelli-border px-4 py-3 pl-11 text-sm text-textSoft outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-semibold text-text">
                        Password
                      </label>
                      <Link
                        to="/auth/forgot-password"
                        className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </div>
              <div className="mt-6 text-center text-textMuted text-xs">
                <span>© {new Date().getFullYear()} Brintelli Academy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-12">
          <a
            href="https://brintellitechacademy.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-200/80 via-indigo-200/80 to-purple-200/80 transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20" />
            <div className="relative z-10 text-center p-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/90 shadow-xl backdrop-blur-sm">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BT</span>
                </div>
              </div>
              <h3 className="mb-4 text-3xl font-bold text-slate-800">Brintelli Tech Academy</h3>
              <p className="mb-6 text-lg text-slate-700">Transforming Careers Through Technology</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-slate-800 shadow-lg transition-all group-hover:gap-3">
                <span>Visit Our Website</span>
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;


