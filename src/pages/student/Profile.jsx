import { Award, Briefcase, FileText, MapPin, Target, Mail, Phone, Star } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";

const StudentProfile = () => {
  return (
    <>
      <PageHeader
        title="Aishwarya Kumar"
        description="Full Stack Cohort • Brintelli Tech Academy · Cohort 2025A"
        actions={
          <button className="rounded-xl bg-brintelli-card px-4 py-2 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brintelli-baseAlt/80">
            Edit Profile
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Professional Snapshot</h3>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-3 text-sm text-textSoft">
                <p>
                  <span className="font-semibold text-text">Current Role:</span> Software Engineer,
                  Zoho
                </p>
                <p>
                  <span className="font-semibold text-text">Experience:</span> 2.5 years
                </p>
                <p>
                  <span className="font-semibold text-text">Track:</span> Backend Engineering + System
                  Design
                </p>
                <p>
                  <span className="font-semibold text-text">Target Role:</span> Backend Engineer II
                </p>
              </div>
              <div className="space-y-3 text-sm text-textSoft">
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-500" />
                  aishwarya.k@learner.com
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-500" />
                  +91 98765 43210
                </p>
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  Bengaluru, India
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Learning Highlights</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <StatsCard icon={Star} value="Top 5%" label="DSA Leaderboard" trend="+3 positions" />
              <StatsCard icon={Star} value="4.8 / 5" label="Mentor Feedback" trend="Consistent" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-textSoft">
              <p>
                <span className="font-semibold text-text">Strengths:</span> System design
                trade-offs, architecture diagrams, cross-functional communication.
              </p>
              <p>
                <span className="font-semibold text-text">Areas of focus:</span> Optimize coding
                speed for medium-to-hard DSA problems, ramp up case study documentation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Interview Readiness</h3>
            <div className="mt-4 space-y-3 text-sm text-textSoft">
              <p>
                <span className="font-semibold text-text">Mock Interviews:</span> 5 completed
              </p>
              <p>
                <span className="font-semibold text-text">Placement Status:</span> Ready from Dec 10
              </p>
              <p>
                <span className="font-semibold text-text">Resume:</span> Reviewed · Needs minor edits
              </p>
            </div>
            <Button variant="primary" className="mt-5 w-full justify-center">
              Update Portfolio
            </Button>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Badges & Achievements</h3>
            <div className="mt-4 grid gap-3">
              {["System Design Pro", "DSA Challenger", "Capstone Champion"].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center justify-between rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm font-semibold text-textSoft"
                >
                  {badge}
                  <Star className="h-4 w-4 text-brand-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;

