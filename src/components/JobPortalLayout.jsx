import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";

/**
 * Brintelli-themed layout for the Job Apply Portal (/applyjobs).
 * Light gradient (pink/purple), white cards, clean typography.
 */
const JobPortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isApplyPage = location.pathname !== "/applyjobs" && location.pathname.startsWith("/applyjobs");
  const isJobListing = location.pathname === "/applyjobs/joblisting";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/80 via-white to-purple-50/60">
      {/* Header */}
      <header className="border-b border-pink-100/60 bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/applyjobs"
            className="flex items-center gap-2 text-brintelli-text font-semibold text-lg tracking-tight hover:text-brand-500 transition-colors"
          >
            <span className="text-brand-500 font-bold">Brintelli</span>
            <span className="text-brintelli-textMuted text-sm font-medium hidden sm:inline">
              Careers
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/applyjobs"
              className={`text-sm font-medium transition-colors ${
                !isApplyPage || location.pathname === "/applyjobs"
                  ? "text-brand-600"
                  : "text-brintelli-textMuted hover:text-brintelli-text"
              }`}
            >
              Home
            </Link>
            <Link
              to="/applyjobs/joblisting"
              className={`text-sm font-medium transition-colors ${
                isJobListing ? "text-brand-600" : "text-brintelli-textMuted hover:text-brintelli-text"
              }`}
            >
              All Jobs
            </Link>
            {isApplyPage && !isJobListing ? (
              <button
                type="button"
                onClick={() => navigate("/applyjobs")}
                className="text-sm text-brintelli-textMuted hover:text-brintelli-text font-medium"
              >
                ← Back
              </button>
            ) : (
              <a
                href="/auth/signin"
                className="rounded-xl bg-brintelli-text text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign in
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-100/60 bg-white/70 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-brintelli-textMuted text-sm">
              © Brintelli Tech Academy. Apply to open positions — no login required.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/applyjobs" className="text-brintelli-textMuted hover:text-brand-500 transition-colors">
                Careers
              </Link>
              <Link to="/applyjobs/joblisting" className="text-brintelli-textMuted hover:text-brand-500 transition-colors">
                All Jobs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobPortalLayout;
