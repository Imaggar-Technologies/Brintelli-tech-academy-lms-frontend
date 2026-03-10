import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Building2, ArrowRight } from "lucide-react";
import { getPublicJobs } from "../../api/jobs";
import { toast } from "react-hot-toast";

const EmploymentTypeLabel = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

const ApplyJobsList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Open Positions
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Apply with your resume. No login required — we’ll get back to you soon.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <Briefcase className="h-14 w-14 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No open positions at the moment.</p>
          <p className="text-slate-500 text-sm mt-1">Check back later or contact us.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <button
              type="button"
              key={job.id}
              onClick={() => navigate(`/applyjobs/${job.id}`)}
              className="w-full text-left rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500/40 transition-all p-5 sm:p-6 group"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                    {job.title}
                  </h3>
                  {job.department && (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-400 mb-2">
                      <Building2 className="h-4 w-4" />
                      {job.department}
                    </span>
                  )}
                  {job.description && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                    )}
                    <span>
                      {EmploymentTypeLabel[job.employmentType] || job.employmentType}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-cyan-400 text-sm font-medium flex-shrink-0">
                  Apply
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplyJobsList;
