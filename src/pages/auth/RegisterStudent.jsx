import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import Button from "../../components/Button";

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    education: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    
    // TODO: Replace with actual API call
    // await authService.registerStudent(formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/auth/signin");
    }, 1000);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brintelli-baseAlt px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card backdrop-blur-glass">
        <div className="bg-gradient-brintelli-alt px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                Student Registration
              </p>
              <h1 className="text-2xl font-semibold">Start Your Learning Journey</h1>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/80">Join thousands of students building their tech careers</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-text">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-text">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-text">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium text-text">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="education" className="text-sm font-medium text-text">
              Education Background <span className="text-red-500">*</span>
            </label>
            <select
              id="education"
              name="education"
              required
              value={formData.education}
              onChange={handleChange}
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white"
            >
              <option value="">Select your education level</option>
              <option value="high-school">High School</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-text">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="text-xs text-textMuted">Must be at least 8 characters</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-text">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex items-start gap-2">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              required
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-brintelli-border text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="agreeToTerms" className="text-xs text-textMuted">
              I agree to the{" "}
              <Link to="/terms" className="text-brand-500 hover:text-brand-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-brand-500 hover:text-brand-600">
                Privacy Policy
              </Link>
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Student Account"}
          </Button>
          <div className="text-center text-sm text-textMuted">
            <span>Already have an account? </span>
            <Link
              to="/auth/signin"
              className="font-semibold text-brand-500 hover:text-brand-600 transition"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;

