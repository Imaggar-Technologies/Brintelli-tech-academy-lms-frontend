import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Briefcase,
  MapPin,
  ArrowRight,
  Bookmark,
  FileText,
  Filter,
  X,
  User,
} from 'lucide-react';
import Tooltip from './Tooltip';

const EmploymentTypeLabel = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  PROJECT_WORK: 'Project Work',
  VOLUNTEER: 'Volunteer',
};

const SENIORITY_OPTIONS = [
  { value: 'student', label: 'Student level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior level' },
  { value: 'director', label: 'Directors' },
];

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Project Work' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
];

const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
];

/**
 * Shared job listing layout: left sidebar (profile + metrics), top search + filter button,
 * main job cards, right filter panel. Apply disabled for logged-in learners who are not job ready.
 *
 * @param {Object} props
 * @param {Array} props.jobs - All jobs from API
 * @param {boolean} props.loading
 * @param {string} props.searchQuery
 * @param {function} props.setSearchQuery
 * @param {Object|null} props.currentUser - { fullName, profileImageUrl, jobReady, ... } from GET /api/users/me (or null)
 * @param {boolean} props.isLoggedIn
 * @param {string} props.applyPathPrefix - e.g. '/applyjobs/' for job detail/apply URL
 * @param {string} [props.profileResumeLink] - e.g. '/student/profile' for View Resume
 * @param {string} [props.signInLink] - e.g. '/auth/signin' when not logged in
 */
const JobListingLayout = ({
  jobs,
  loading,
  searchQuery,
  setSearchQuery,
  currentUser,
  isLoggedIn,
  applyPathPrefix,
  profileResumeLink,
  signInLink = '/auth/signin',
}) => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationType, setLocationType] = useState(new Set(['remote', 'onsite']));
  const [locationCity, setLocationCity] = useState('');
  const [jobTypes, setJobTypes] = useState(new Set(['FULL_TIME', 'PART_TIME', 'INTERNSHIP']));
  const [seniority, setSeniority] = useState(new Set(['student']));
  const [salaryCustom, setSalaryCustom] = useState(1200);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (locationType.size < 2) n += 1;
    if (locationCity) n += 1;
    if (jobTypes.size < JOB_TYPE_OPTIONS.length) n += 1;
    if (seniority.size < SENIORITY_OPTIONS.length) n += 1;
    return n;
  }, [locationType, locationCity, jobTypes, seniority]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchType = jobTypes.size === 0 || (job.employmentType && jobTypes.has(job.employmentType));
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (job.title || '').toLowerCase().includes(q) ||
        (job.department || '').toLowerCase().includes(q) ||
        (job.location || '').toLowerCase().includes(q) ||
        (job.description || '').toLowerCase().includes(q);
      const loc = (job.location || '').toLowerCase();
      const matchLocationType =
        locationType.size === 2
          ? true
          : (locationType.has('remote') && loc.includes('remote')) ||
            (locationType.has('onsite') && !loc.includes('remote'));
      const matchCity = !locationCity.trim() || loc.includes(locationCity.trim().toLowerCase());
      return matchType && matchSearch && matchLocationType && matchCity;
    });
  }, [jobs, searchQuery, jobTypes, locationType, locationCity]);

  const canApply = !isLoggedIn || currentUser?.jobReady === true;

  const toggleSet = (setter, key) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleJobClick = (jobId) => {
    navigate(`${applyPathPrefix.replace(/\/$/, '')}/${jobId}`);
  };

  const formatPosted = (createdAt) => {
    if (!createdAt) return '';
    const d = new Date(createdAt);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top bar: search + filter button */}
      <div className="sticky top-0 z-10 border-b border-brintelli-border bg-white/95 backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brintelli-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.target.preventDefault(), setFilterOpen(false))}
            placeholder="Job title or keyword"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200/80 bg-brintelli-baseAlt/50 text-brintelli-text placeholder:text-brintelli-textMuted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className="rounded-xl bg-brand-500 text-white px-4 py-2.5 font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Filter className="h-4 w-4" />
          Filter {activeFilterCount > 0 ? activeFilterCount : ''}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: profile + metrics + application status */}
        <aside className="w-72 flex-shrink-0 border-r border-brintelli-border bg-slate-50/50 p-4 hidden lg:block">
          {isLoggedIn && currentUser ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center overflow-hidden">
                  {currentUser.profileImageUrl ? (
                    <img src={currentUser.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-7 w-7 text-brand-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-brintelli-text truncate">
                    {currentUser.fullName || currentUser.name || 'Learner'}
                  </p>
                  <p className="text-sm text-brintelli-textMuted">Learner</p>
                </div>
              </div>
              {profileResumeLink && (
                <Link
                  to={profileResumeLink}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 mb-4"
                >
                  <FileText className="h-4 w-4" />
                  View Resume / Profile
                </Link>
              )}
              <div className="rounded-xl bg-amber-500/15 border border-amber-200/80 p-3 mb-3">
                <p className="text-sm font-semibold text-amber-900">Job ready</p>
                <p className="text-xs text-amber-800">
                  {currentUser.jobReady ? 'Yes — you can apply to jobs.' : 'No — turn on in Profile to apply.'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="rounded-xl bg-amber-500/20 p-3">
                  <p className="text-2xl font-bold text-amber-900">{jobs.length}</p>
                  <p className="text-xs text-amber-800">Open jobs</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-brintelli-text mb-2">Application status</p>
                <p className="text-xs text-brintelli-textMuted">Track your applications from your profile.</p>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <User className="h-12 w-12 text-brintelli-textMuted mx-auto mb-3" />
              <p className="text-sm text-brintelli-text font-medium">Sign in to see your profile</p>
              <p className="text-xs text-brintelli-textMuted mt-1">and job ready status</p>
              <Link
                to={signInLink}
                className="mt-3 inline-block rounded-xl bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                Sign in
              </Link>
            </div>
          )}
        </aside>

        {/* Main: results header + job cards */}
        <main className="flex-1 min-w-0 p-4 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <>
              <p className="text-sm text-brintelli-textMuted mb-4">
                Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                {searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ''}.
              </p>
              {filteredJobs.length === 0 ? (
                <div className="rounded-2xl border border-pink-100 bg-white p-12 text-center shadow-soft">
                  <Briefcase className="h-14 w-14 text-brand-500/60 mx-auto mb-4" />
                  <p className="text-brintelli-textMuted text-lg">No jobs match your filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterOpen(true);
                    }}
                    className="mt-4 text-brand-600 font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-2xl border border-pink-100 bg-white p-5 shadow-soft hover:shadow-card hover:border-brand-500/30 transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-brand-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-brintelli-text">{job.title}</h3>
                            <p className="text-sm text-brintelli-textMuted">
                              {job.department || 'Company'} · Posted {formatPosted(job.createdAt)}
                            </p>
                          </div>
                        </div>
                        <button type="button" className="p-2 text-brintelli-textMuted hover:text-brand-500 rounded-lg" aria-label="Save job">
                          <Bookmark className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-brintelli-textMuted mt-2 line-clamp-2">
                        {job.description || 'No description.'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-brintelli-textMuted">
                        {job.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {job.location}
                          </span>
                        )}
                        <span>{EmploymentTypeLabel[job.employmentType] || job.employmentType}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm text-brintelli-textMuted">—</span>
                        {canApply ? (
                          <button
                            type="button"
                            onClick={() => handleJobClick(job.id)}
                            className="rounded-xl bg-brintelli-text text-white py-2.5 px-4 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                          >
                            Apply now
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <Tooltip
                            content="Mark yourself as Job ready in your profile to apply. Go to Profile & Settings and set your status to Job ready."
                            placement="top"
                          >
                            <span className="inline-block">
                              <button
                                type="button"
                                disabled
                                className="rounded-xl bg-brintelli-text/50 text-white py-2.5 px-4 text-sm font-medium cursor-not-allowed flex items-center gap-2"
                              >
                                Apply now
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Right sidebar: filter panel */}
        {filterOpen && (
          <aside className="w-72 flex-shrink-0 border-l border-brintelli-border bg-white shadow-lg p-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-brintelli-text">Filter</span>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-brintelli-textMuted"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-brintelli-text mb-2">Job location</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {LOCATION_TYPES.map(({ value, label }) => (
                    <label key={value} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locationType.has(value)}
                        onChange={() => toggleSet(setLocationType, value)}
                        className="rounded border-pink-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-brintelli-text">{label}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="City (e.g. London)"
                  className="w-full rounded-lg border border-pink-200/80 px-3 py-2 text-sm text-brintelli-text placeholder:text-brintelli-textMuted focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-brintelli-text mb-2">Job type</p>
                <div className="space-y-1.5">
                  {JOB_TYPE_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobTypes.has(value)}
                        onChange={() => toggleSet(setJobTypes, value)}
                        className="rounded border-pink-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-brintelli-text">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-brintelli-text mb-2">Seniority level</p>
                <div className="space-y-1.5">
                  {SENIORITY_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seniority.has(value)}
                        onChange={() => toggleSet(setSeniority, value)}
                        className="rounded border-pink-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm text-brintelli-text">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-brintelli-text mb-2">Salary (custom)</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brintelli-textMuted">$</span>
                  <input
                    type="number"
                    min={0}
                    value={salaryCustom}
                    onChange={(e) => setSalaryCustom(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-pink-200/80 px-3 py-2 text-sm text-brintelli-text focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default JobListingLayout;
export { EmploymentTypeLabel };
