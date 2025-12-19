import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import Button from "../../components/Button";

const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brintelli-baseAlt px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-textMuted text-xs font-semibold uppercase tracking-[0.35em]">
            Brintelli Tech Academy
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Create Your Account</h1>
          <p className="mt-2 text-sm text-textMuted">Choose how you want to join us</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Registration Card */}
          <Link
            to="/auth/register/student"
            className="group flex flex-col rounded-2xl border-2 border-brintelli-border bg-brintelli-card p-6 shadow-card transition-all hover:border-brand-500 hover:shadow-soft"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-soft">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text">Student Registration</h2>
            <p className="mb-4 text-sm text-textMuted">
              Join as a learner to start your tech career journey. Access courses, live classes, and placement assistance.
            </p>
            <div className="mt-auto flex items-center gap-2 text-brand-500 group-hover:gap-3 transition-all">
              <span className="text-sm font-semibold">Register as Student</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Staff Registration Card */}
          <Link
            to="/auth/register/staff"
            className="group flex flex-col rounded-2xl border-2 border-brintelli-border bg-brintelli-card p-6 shadow-card transition-all hover:border-brand-500 hover:shadow-soft"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-soft">
              <Briefcase className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text">Staff Registration</h2>
            <p className="mb-4 text-sm text-textMuted">
              Apply to become a Tutor, Mentor, or Learning Success Manager. Help shape the future of tech education.
            </p>
            <div className="mt-auto flex items-center gap-2 text-brand-500 group-hover:gap-3 transition-all">
              <span className="text-sm font-semibold">Register as Staff</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
        <div className="mt-6 text-center text-sm text-textMuted">
          <span>Already have an account? </span>
          <Link
            to="/auth/signin"
            className="font-semibold text-brand-500 hover:text-brand-600 transition"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

