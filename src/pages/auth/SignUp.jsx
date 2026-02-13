import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Mail, User, Phone, Lock, UserPlus } from "lucide-react";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import AuthImageCarousel from "../../components/AuthImageCarousel";
import { setCredentials } from "../../store/slices/authSlice";
import { getRoleDashboard } from "../../utils/roleRoutes";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { authAPI } = await import("../../api/auth");

      const response = await authAPI.register({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });

      if (response.success) {
        toast.success("Registration successful! Please verify your email.");

        // If token is provided, auto-login
        if (response.data?.token) {
          const loginData = response.data;

          dispatch(
            setCredentials({
              user: loginData.user,
              token: loginData.token,
              refreshToken: loginData.refreshToken,
            })
          );

          // Navigate to dashboard
          const dashboardRoute = getRoleDashboard(loginData.user.role);
          navigate(dashboardRoute);
        } else {
          // Redirect to signin with success message
          navigate("/auth/signin", {
            state: { message: "Registration successful! Please sign in." },
          });
        }
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ REGISTRATION ERROR:", error);
      const errorMessage =
        error.message || error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
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
                  <h2 className="text-2xl font-bold text-text">Create Account</h2>
                  <p className="mt-2 text-sm text-textMuted">
                    Sign up to start your learning journey with Brintelli
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-semibold text-text">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm text-textSoft outline-none transition duration-200 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400 ${
                          errors.fullName
                            ? "border-red-500 focus:border-red-500"
                            : "border-brintelli-border focus:border-brand-500"
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-text">
                      Email address <span className="text-red-500">*</span>
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
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm text-textSoft outline-none transition duration-200 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-brintelli-border focus:border-brand-500"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-text">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        className={`w-full rounded-xl border px-4 py-3 pl-11 text-sm text-textSoft outline-none transition duration-200 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400 ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500"
                            : "border-brintelli-border focus:border-brand-500"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-text">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className={
                        errors.password
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-text">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Creating Account..."
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-textMuted">
                    Already have an account?{" "}
                    <Link
                      to="/auth/signin"
                      className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Sign in
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

export default SignUp;

