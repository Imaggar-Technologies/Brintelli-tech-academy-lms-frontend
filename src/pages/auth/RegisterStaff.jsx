import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Briefcase } from "lucide-react";
import Button from "../../components/Button";

const RegisterStaff = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    expertise: "",
    linkedin: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.role) {
      alert("Please select a role");
      return;
    }

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
    // await authService.registerStaff(formData);
    
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
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                Staff Registration
              </p>
              <h1 className="text-2xl font-semibold">Join Our Team</h1>
            </div>
          </div>
          <p className="mt-2 text-sm text-white/80">Apply to become a tutor, mentor, or LSM</p>
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
            <label htmlFor="role" className="text-sm font-medium text-text">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white"
            >
              <option value="">Select your role</option>
              <option value="tutor">Tutor</option>
              <option value="mentor">Mentor</option>
              <option value="lsm">Learning Success Manager (LSM)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="experience" className="text-sm font-medium text-text">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <select
              id="experience"
              name="experience"
              required
              value={formData.experience}
              onChange={handleChange}
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white"
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="2-3">2-3 years</option>
              <option value="4-5">4-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="expertise" className="text-sm font-medium text-text">
              Area of Expertise <span className="text-red-500">*</span>
            </label>
            <input
              id="expertise"
              name="expertise"
              type="text"
              required
              value={formData.expertise}
              onChange={handleChange}
              placeholder="e.g., Backend Engineering, Data Science, System Design"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="linkedin" className="text-sm font-medium text-text">
              LinkedIn Profile
            </label>
            <input
              id="linkedin"
              name="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="text-xs text-textMuted">Optional but recommended</p>
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
            {isLoading ? "Submitting application..." : "Submit Application"}
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

export default RegisterStaff;

