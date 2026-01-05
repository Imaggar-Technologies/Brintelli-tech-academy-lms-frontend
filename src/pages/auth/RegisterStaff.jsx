import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Briefcase } from "lucide-react";
import AuthImageCarousel from "../../components/AuthImageCarousel";

const RegisterStaff = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to signin after a brief moment
    const timer = setTimeout(() => {
      navigate("/auth/signin", { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/50 to-pink-50/50">
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

              {/* Message Card */}
              <div className="rounded-2xl border border-brintelli-border bg-white p-8 shadow-xl text-center">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <Lock className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                <div className="mb-4 flex justify-center">
                  <Briefcase className="h-12 w-12 text-purple-600" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-text">Staff Registration Closed</h2>
                <p className="mb-6 text-sm text-textMuted">
                  New staff registrations are currently not available. Please contact support if you need assistance.
                </p>
                <Link
                  to="/auth/signin"
                  className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Go to Sign In
                </Link>
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

export default RegisterStaff;

