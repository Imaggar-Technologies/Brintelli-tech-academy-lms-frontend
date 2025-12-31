import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, ExternalLink } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to signin after a brief moment
    const timer = setTimeout(() => {
      navigate("/auth/signin", { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

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

              {/* Message Card */}
              <div className="rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl text-center">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <Lock className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                <h2 className="mb-3 text-2xl font-bold text-text">Registration Closed</h2>
                <p className="mb-6 text-sm text-textMuted">
                  New registrations are currently not available. Please contact support if you need assistance.
                </p>
                <Link
                  to="/auth/signin"
                  className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Go to Sign In
                </Link>
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

export default Register;

