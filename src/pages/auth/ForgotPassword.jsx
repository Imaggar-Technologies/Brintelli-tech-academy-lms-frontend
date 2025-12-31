import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Mail, CheckCircle, ExternalLink } from "lucide-react";
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
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-green-50/50 to-emerald-50/50">
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

                {/* Success Card */}
                <div className="rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl">
                  <div className="px-6 py-10 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-text">Password reset link sent!</h2>
                    <p className="mb-2 text-sm text-textMuted">
                      We've sent a password reset link to
                    </p>
                    <p className="mb-6 text-sm font-semibold text-brand-600">{email}</p>
                    <p className="mb-8 text-xs text-textMuted leading-relaxed">
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
                        className="block text-center text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 p-12">
            <a
              href="https://brintellitechacademy.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-200/80 via-emerald-200/80 to-teal-200/80 transition-all hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-teal-400/20" />
              <div className="relative z-10 text-center p-8">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/90 shadow-xl backdrop-blur-sm">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-4 text-3xl font-bold text-slate-800">Check Your Email</h3>
                <p className="mb-6 text-lg text-slate-700">We've sent you a reset link</p>
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
  }

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
                  <h2 className="text-2xl font-bold text-text">Reset your password</h2>
                  <p className="mt-2 text-sm text-textMuted">Enter your email to receive a reset link</p>
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@brintelli.com"
                        className="w-full rounded-xl border border-brintelli-border px-4 py-3 pl-11 text-sm text-textSoft outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400"
                      />
                    </div>
                    <p className="text-xs text-textMuted">
                      We'll send you a link to reset your password
                    </p>
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center text-sm text-textMuted pt-2">
                    <Link
                      to="/auth/signin"
                      className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </form>
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
                  <Mail className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h3 className="mb-4 text-3xl font-bold text-slate-800">Reset Password</h3>
              <p className="mb-6 text-lg text-slate-700">We'll help you get back in</p>
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

export default ForgotPassword;

