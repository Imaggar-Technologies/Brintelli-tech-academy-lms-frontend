import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import { handleLogout } from "../../utils/auth";

const cards = [
  {
    role: "admin",
    title: "Admin",
    description: "Configure teams, cohorts, and academy-wide controls.",
    icon: ShieldCheck,
    href: "/admin-portal/dashboard",
  },
  {
    role: "program-manager",
    title: "Program Manager",
    description: "Monitor cohorts, KPIs, and operational workflows.",
    icon: ClipboardList,
    href: "/program-manager/dashboard",
  },
  {
    role: "sales",
    title: "Sales Team",
    description: "Manage pipelines, counsellor goals, and revenue KPIs.",
    icon: Target,
    href: "/sales/dashboard",
  },
  {
    role: "marketing",
    title: "Marketing Team",
    description: "Oversee campaigns, channel ROI, and growth analytics.",
    icon: Megaphone,
    href: "/marketing/dashboard",
  },
  {
    role: "lsm",
    title: "Learning Success Manager",
    description: "Coach learners, review progress, and schedule sessions.",
    icon: HeartHandshake,
    href: "/lsm/dashboard",
  },
  {
    role: "tutor",
    title: "Tutor",
    description: "Plan lessons, update content, and monitor engagement.",
    icon: UsersRound,
    href: "/tutor/dashboard",
  },
  {
    role: "mentor",
    title: "Mentor",
    description: "Guide mentees with notes, resources, and session plans.",
    icon: Sparkles,
    href: "/mentor/dashboard",
  },
  {
    role: "placement",
    title: "Placement Officer",
    description: "Track hiring pipelines, company connects, and outcomes.",
    icon: BriefcaseBusiness,
    href: "/placement/dashboard",
  },
  {
    role: "student",
    title: "Learner (Student)",
    description: "Continue classes, assignments, and practice sprints.",
    icon: GraduationCap,
    href: "/student/dashboard",
  },
  {
    role: "hr-partner",
    title: "HR Partner (External)",
    description: "Collaborate on hiring, talent requests, and partnerships.",
    icon: Handshake,
    href: "/external-hr/dashboard",
  },
  {
    role: "finance",
    title: "Finance Management",
    description: "Monitor collections, dues, refunds, and revenue analytics.",
    icon: Wallet,
    href: "/finance/dashboard",
  },
];

const SwitchUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleRoleSelect = (card) => {
    // If not authenticated, redirect to auth pages
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
    
    // If authenticated, navigate to the selected role dashboard
    navigate(card.href);
  };

  const onLogout = async () => {
    await handleLogout(dispatch, navigate);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-brintelli-baseAlt to-white px-4 py-12">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-textMuted/80">
            {isAuthenticated ? "Switch Workspace" : "Welcome to Brintelli"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-text">
            {isAuthenticated ? "Choose the role to continue" : "Select Your Role"}
          </h1>
          <p className="mt-3 text-sm text-textMuted">
            {isAuthenticated
              ? "Pick a portal below to jump straight into that dashboard experience. You can return here anytime."
              : "Choose your role to get started. You'll be redirected to sign in."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.role}
                onClick={() => handleRoleSelect(card)}
                className="flex h-full flex-col gap-4 rounded-2xl border border-brintelli-border bg-white/75 p-6 text-left text-text shadow-card backdrop-blur transition duration-160 hover:-translate-y-1.5 hover:border-brand/60 hover:bg-white"
                type="button"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brintelli-alt text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-text">{card.title}</h2>
                  <p className="text-sm text-textSoft">{card.description}</p>
                </div>
                <span className="mt-auto text-sm font-semibold text-brand">
                  {isAuthenticated ? `Enter ${card.title} →` : "Continue →"}
                </span>
              </button>
            );
          })}
        </div>

        {isAuthenticated && (
          <div className="text-center">
            <button
              onClick={onLogout}
              className="text-sm font-semibold text-brand transition hover:text-brand-dark"
              type="button"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwitchUser;

