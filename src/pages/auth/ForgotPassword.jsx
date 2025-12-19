import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import Button from "../../components/Button";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    // TODO: Replace with actual API call
    // await authService.forgotPassword(email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brintelli-baseAlt px-4 py-10">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card backdrop-blur-glass">
          <div className="bg-gradient-brintelli-alt px-6 py-5 text-white">
            <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              Brintelli Tech Academy
            </p>
            <h1 className="text-2xl font-semibold">Check your email</h1>
          </div>
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text">Password reset link sent</h2>
            <p className="mb-6 text-sm text-textMuted">
              We've sent a password reset link to <span className="font-semibold text-text">{email}</span>
            </p>
            <p className="mb-6 text-xs text-textMuted">
              Please check your email and click on the link to reset your password. The link will expire in 1 hour.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                variant="secondary"
                className="w-full"
              >
                Resend Email
              </Button>
              <Link
                to="/auth/signin"
                className="block text-center text-sm font-medium text-brand-500 hover:text-brand-600 transition"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brintelli-baseAlt px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card backdrop-blur-glass">
        <div className="bg-gradient-brintelli-alt px-6 py-5 text-white">
          <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Brintelli Tech Academy
          </p>
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="mt-1 text-sm text-white/80">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-text">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brintelli.com"
                className="w-full rounded-xl border border-brintelli-border px-4 py-2.5 pl-10 text-sm text-textSoft outline-none transition duration-160 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <p className="text-xs text-textMuted">
              We'll send you a link to reset your password
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
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
  );
};

export default ForgotPassword;

