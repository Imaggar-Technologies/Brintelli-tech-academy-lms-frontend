import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import {
  ShieldCheck,
  ClipboardList,
  Target,
  Megaphone,
  BarChart3,
  HeartHandshake,
  UsersRound,
  Sparkles,
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  Wallet,
} from "lucide-react";
import { selectIsAuthenticated } from "../../store/slices/authSlice";

const cards = [
  {
    role: "admin",
    title: "Admin",
    description: "Configure programs, teams, monetization, and analytics.",
    icon: ShieldCheck,
    href: "/admin/dashboard",
  },
  {
    role: "program-manager",
    title: "Program Manager",
    description: "Monitor cohorts, KPIs, execution workflows, and teams.",
    icon: ClipboardList,
    href: "/program-manager/dashboard",
  },
  {
    role: "sales",
    title: "Sales Team",
    description: "Drive enrolment pipeline with counsellor and lead dashboards.",
    icon: Target,
    href: "/admin-portal/sales-crm/dashboard",
  },
  {
    role: "marketing",
    title: "Marketing Team",
    description: "Plan campaigns, monitor channel ROI, and optimize growth.",
    icon: Megaphone,
    href: "/admin-portal/analytics",
  },
  {
    role: "revenue",
    title: "Revenue Department",
    description: "Forecast, reconcile, and report collections in real time.",
    icon: BarChart3,
    href: "/admin-portal/finance/revenue-analytics",
  },
  {
    role: "lsm",
    title: "Learning Success Manager",
    description: "Support mentees, review outcomes, and manage interventions.",
    icon: HeartHandshake,
    href: "/lsm/dashboard",
  },
  {
    role: "tutor",
    title: "Tutor",
    description: "Manage courses, content, and learner progress.",
    icon: UsersRound,
    href: "/tutor/dashboard",
  },
  {
    role: "mentor",
    title: "Mentor",
    description: "Guide mentees, log sessions, and share resources.",
    icon: Sparkles,
    href: "/mentor/dashboard",
  },
  {
    role: "placement",
    title: "Placement Assistance",
    description: "Coordinate interviews, offers, and company connects.",
    icon: BriefcaseBusiness,
    href: "/placement/dashboard",
  },
  {
    role: "student",
    title: "Learner (Student)",
    description: "Track learning, live classes, and assignments.",
    icon: GraduationCap,
    href: "/student/dashboard",
  },
  {
    role: "hr-partner",
    title: "HR Partner (External)",
    description: "Collaborate with admissions on partner hiring & requests.",
    icon: Handshake,
    href: "/admin-portal/hr/partners",
  },
  {
    role: "finance",
    title: "Finance Management",
    description: "Manage revenue operations, dues, and refund approvals.",
    icon: Wallet,
    href: "/finance/dashboard",
  },
];

const ChooseRole = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brintelli-baseAlt px-4 py-10">
      <div className="w-full max-w-5xl rounded-2xl border border-brintelli-border bg-brintelli-card shadow-card backdrop-blur-glass">
        <div className="bg-gradient-brintelli-alt px-6 py-6 text-white">
          <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            Brintelli Tech Academy
          </p>
          <h1 className="text-2xl font-semibold">Select your workspace</h1>
          <p className="mt-2 text-sm text-white/80">
            Choose the portal area you need to access right now. You can switch roles anytime.
          </p>
        </div>
        <div className="grid gap-4 px-6 py-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.role}
                onClick={() => navigate(card.href)}
                className="flex h-full flex-col gap-3 rounded-2xl border border-brintelli-border bg-brintelli-card p-6 text-left text-textSoft shadow-card transition duration-160 hover:-translate-y-1 hover:border-brand/40 hover:bg-white/85"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brintelli-alt text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text">{card.title}</h2>
                  <p className="mt-1 text-sm text-textSoft">{card.description}</p>
                </div>
                <span className="mt-auto text-sm font-semibold text-brand">
                  Enter {card.title} Portal →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChooseRole;


