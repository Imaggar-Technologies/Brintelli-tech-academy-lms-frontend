import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Mail } from "lucide-react";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import AuthImageCarousel from "../../components/AuthImageCarousel";
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
    const { authAPI } = await import("../../api/auth");

    console.log("📤 Sending login request:", {
      email: formData.email,
      password: "******",
    });

    const response = await authAPI.login(
      formData.email,
      formData.password
    );

    // FULL RESPONSE LOG
    console.log("✅ LOGIN API FULL RESPONSE:", response);

    // IMPORTANT: depending on your authAPI
    const loginData = response.data?.data || response.data || response;

    console.log("🟢 LOGIN DATA:", loginData);
    console.log("🟡 TOKEN:", loginData?.token);
    console.log("🟣 REFRESH TOKEN:", loginData?.refreshToken);
    console.log("🔵 USER:", loginData?.user);

    if (!loginData?.token) {
      throw new Error("JWT token missing from login response");
    }

    // SAVE TO REDUX
    dispatch(
      setCredentials({
        user: loginData.user,
        token: loginData.token,
        refreshToken: loginData.refreshToken,
      })
    );

    console.log("✅ TOKEN SAVED TO REDUX");

    // ROLE BASED NAVIGATION
    const dashboardRoute = getRoleDashboard(loginData.user.role);
    navigate(dashboardRoute);

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    alert(error.message || "Login failed");
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 relative overflow-hidden">
      <div className="flex w-full">
        {/* Left Side - Form */}
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-12">
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="mb-8 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Brintelli Logo" 
                  className="h-20 w-auto object-contain"
                />
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

                <div className="mt-6 text-center">
                  <p className="text-sm text-textMuted">
                    Don't have an account?{" "}
                    <Link
                      to="/auth/signup"
                      className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center text-textMuted text-xs">
                <span>© {new Date().getFullYear()} Brintelli Academy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Carousel */}
        <div className="hidden lg:flex lg:w-1/2 h-screen" style={{ margin: 0, padding: 0 }}>
          <AuthImageCarousel />
        </div>
      </div>
    </div>
  );
};

export default SignIn;


