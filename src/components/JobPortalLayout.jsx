import { Outlet, useNavigate, useLocation } from "react-router-dom";

/**
 * Standalone layout for the Job Apply Portal (/applyjobs).
 * No sidebar, no app topbar — just a minimal header and full-width content.
 */
const JobPortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isApplyPage = location.pathname !== "/applyjobs" && location.pathname.startsWith("/applyjobs");

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/applyjobs")}
              className="text-slate-100 font-semibold text-lg tracking-tight hover:text-white transition-colors"
            >
              Brintelli Tech Academy
            </button>
            <span className="text-slate-500 text-sm font-medium hidden sm:inline">
              Job Apply Portal
            </span>
          </div>
          {isApplyPage ? (
            <button
              type="button"
              onClick={() => navigate("/applyjobs")}
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← All openings
            </button>
          ) : (
            <a
              href="/auth/signin"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign in
            </a>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-4 text-center text-slate-500 text-sm">
        <p>© Brintelli Tech Academy. Apply to open positions — no login required.</p>
      </footer>
    </div>
  );
};

export default JobPortalLayout;
