import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/Button";
import PasswordInput from "../../components/PasswordInput";
import AuthImageCarousel from "../../components/AuthImageCarousel";
import { authAPI } from "../../api/auth";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("Invalid reset link. Please request a new link from the forgot password page.");
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      toast.success("Password reset successfully. You can sign in now.");
      setTimeout(() => navigate("/auth/signin"), 2000);
    } catch (err) {
      const message = err?.message || "Failed to reset password.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
        <div className="flex w-full flex-col lg:w-1/2 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-text mb-2">Invalid or missing link</h2>
            <p className="text-sm text-textMuted mb-4">
              This reset link is invalid or has expired. Please request a new password reset link.
            </p>
            <Link to="/auth/forgot-password" className="text-brand-500 font-medium hover:underline">
              Request new reset link
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 h-screen">
          <AuthImageCarousel />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
        <div className="flex w-full flex-col lg:w-1/2 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">Password reset successfully</h2>
            <p className="text-sm text-textMuted mb-4">Redirecting you to sign in...</p>
            <Link to="/auth/signin" className="text-brand-500 font-medium hover:underline">
              Go to Sign In
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 h-screen">
          <AuthImageCarousel />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50">
      <div className="flex w-full">
        <div className="flex w-full flex-col lg:w-1/2">
          <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 lg:px-12">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card backdrop-blur-glass">
              <div className="bg-gradient-brintelli-alt px-6 py-5 text-white">
                <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                  Brintelli Tech Academy
                </p>
                <h1 className="text-2xl font-semibold">Set new password</h1>
                <p className="mt-1 text-sm text-white/80">Enter your new password below</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-text">
                    New password
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-text">
                    Confirm password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
                <div className="text-center text-sm text-textMuted">
                  <Link
                    to="/auth/signin"
                    className="font-semibold text-brand-500 hover:text-brand-600 transition"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 h-screen" style={{ margin: 0, padding: 0 }}>
          <AuthImageCarousel />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
