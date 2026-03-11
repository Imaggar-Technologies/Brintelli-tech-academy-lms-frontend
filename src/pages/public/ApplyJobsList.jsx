import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  ArrowRight,
  Star,
  Quote,
  Sparkles,
} from "lucide-react";
import { getPublicJobs } from "../../api/jobs";
import { toast } from "react-hot-toast";

const EmploymentTypeLabel = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

const FEATURED_JOBS_COUNT = 6;
const PLACEHOLDER_COMPANIES = [
  {
    id: "1",
    name: "Brintelli Tech Academy",
    tagline: "Learn, build, and grow your career with industry-aligned programs.",
    tags: ["EdTech", "Mentorship", "Placements"],
  },
  {
    id: "2",
    name: "Partner Companies",
    tagline: "Our hiring partners look for skilled graduates from Brintelli programs.",
    tags: ["Technology", "Hybrid", "Growth"],
  },
  {
    id: "3",
    name: "Startups & Enterprises",
    tagline: "Roles across product, engineering, and operations.",
    tags: ["Full-time", "Remote", "Internships"],
  },
];

const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "The ability to apply to roles and track my application through Brintelli made my job search smooth. I landed a role that fits my skills.",
    name: "Paula S. Ellis",
    role: "Product Marketer",
    company: "Brintelli Alumni",
  },
  {
    id: "2",
    quote:
      "Applying was straightforward — no complicated forms. The team got back quickly and the process was transparent.",
    name: "Alex Kumar",
    role: "Software Developer",
    company: "Brintelli Alumni",
  },
  {
    id: "3",
    quote:
      "I found my current role through Brintelli's job portal. The listings were relevant and the apply flow was simple.",
    name: "Riya Nair",
    role: "UI/UX Designer",
    company: "Brintelli Alumni",
  },
];

const ApplyJobsList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await getPublicJobs({ limit: 50 });
      if (res.success && res.data?.jobs) {
        setJobs(res.data.jobs);
      } else {
        setJobs([]);
      }
    } catch (e) {
      toast.error(e.message || "Failed to load jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const featuredJobs = jobs.slice(0, FEATURED_JOBS_COUNT);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-pink-500/5 to-accent-purple/10 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-200/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-3">
            Realize your career dreams
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brintelli-text mb-4 leading-tight">
            Search and discover your job match
          </h1>
          <p className="text-brintelli-textMuted text-lg max-w-2xl mx-auto mb-8">
            Stop searching, start discovering. Browse open positions and apply with your resume — no login required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brintelli-textMuted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/applyjobs/joblisting?q=${encodeURIComponent(searchQuery)}`)}
                placeholder="Job title, keyword or company"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-pink-200/80 bg-white text-brintelli-text placeholder:text-brintelli-textMuted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 shadow-sm"
              />
            </div>
            <Link
              to={`/applyjobs/joblisting${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brintelli-text text-white px-6 py-3.5 font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Job listings preview */}
      <section className="px-4 sm:px-6 py-14 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-brintelli-text mb-2">
            Search and discover your job match
          </h2>
          <p className="text-brintelli-textMuted mb-8">
            Browse open positions and apply in a few clicks.
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="rounded-2xl border border-pink-100 bg-white p-12 text-center shadow-soft">
              <Briefcase className="h-14 w-14 text-brand-500/60 mx-auto mb-4" />
              <p className="text-brintelli-textMuted text-lg">No open positions at the moment.</p>
              <p className="text-brintelli-textMuted text-sm mt-1">Check back later or contact us.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft hover:shadow-card hover:border-brand-500/30 transition-all flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-brand-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-brintelli-text truncate">{job.title}</h3>
                          {job.department && (
                            <p className="text-sm text-brintelli-textMuted truncate">{job.department}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-brintelli-textMuted mb-4">
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          {job.location}
                        </span>
                      )}
                      <span className="block">
                        {EmploymentTypeLabel[job.employmentType] || job.employmentType}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/applyjobs/${job.id}`)}
                      className="mt-auto w-full rounded-xl bg-brintelli-text text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      Apply now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  to="/applyjobs/joblisting"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-brand-500 text-brand-600 px-6 py-3 font-medium hover:bg-brand-500/5 transition-colors"
                >
                  View all jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Companies */}
      <section className="px-4 sm:px-6 py-14 bg-gradient-to-br from-pink-50/50 to-purple-50/40">
        <div className="max-w-6xl mx-auto">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-2">
            Careers
          </p>
          <h2 className="text-2xl font-bold text-brintelli-text mb-2">
            Best companies for employees
          </h2>
          <p className="text-brintelli-textMuted mb-8 max-w-2xl">
            Brintelli partners with top employers. Complete our programs and get access to these opportunities.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLACEHOLDER_COMPANIES.map((company) => (
              <div
                key={company.id}
                className="rounded-2xl border border-pink-100 bg-white p-6 shadow-soft hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-brand-500" />
                  </div>
                  <h3 className="font-semibold text-brintelli-text">{company.name}</h3>
                </div>
                <p className="text-sm text-brintelli-textMuted mb-4">{company.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-pink-100/80 text-brand-600 px-2.5 py-1 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 py-14 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-2">
            Success experience
          </p>
          <h2 className="text-2xl font-bold text-brintelli-text mb-2">
            Insights from current users
          </h2>
          <p className="text-brintelli-textMuted mb-8">
            See what candidates say about applying through Brintelli.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-pink-100 bg-white p-6 shadow-soft flex flex-col"
              >
                <Quote className="h-8 w-8 text-brand-500/30 mb-3" />
                <p className="text-brintelli-textSoft text-sm leading-relaxed flex-1 mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-brintelli-text text-sm">{t.name}</p>
                    <p className="text-xs text-brintelli-textMuted">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-14">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-brand-500 to-accent-purple p-8 sm:p-10 text-center text-white shadow-soft">
          <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-xl font-bold mb-2">Transforming how you find jobs</h2>
          <p className="text-white/90 text-sm mb-6">
            One application, multiple opportunities. Apply once and get in front of hiring teams.
          </p>
          <Link
            to="/applyjobs/joblisting"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-600 px-6 py-3 font-medium hover:bg-white/95 transition-colors"
          >
            Browse all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default ApplyJobsList;
