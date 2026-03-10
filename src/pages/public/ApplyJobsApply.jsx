import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Briefcase, ArrowLeft } from "lucide-react";
import { getPublicJobById, submitJobApplication } from "../../api/jobs";
import { getPublicColleges } from "../../api/partners";
import { toast } from "react-hot-toast";

const EmploymentTypeLabel = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

const ApplyJobsApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsappNumber: "",
    collegeName: "",
    resumeUrl: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [otherCollege, setOtherCollege] = useState("");

  useEffect(() => {
    if (jobId) loadJob();
  }, [jobId]);

  useEffect(() => {
    getPublicColleges({ limit: 500 })
      .then((r) => r.success && r.data?.colleges && setColleges(r.data.colleges))
      .catch(() => {});
  }, []);

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await getPublicJobById(jobId);
      if (res.success && res.data?.job) setJob(res.data.job);
      else setJob(null);
    } catch (e) {
      toast.error(e.message || "Job not found");
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.email?.trim()) {
      toast.error("Email is required");
      return;
    }
    setSubmitting(true);
    try {
      const collegeVal =
        form.collegeName === "_other_" ? otherCollege?.trim() : form.collegeName?.trim();
      if (resumeFile) {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("email", form.email.trim().toLowerCase());
        if (form.whatsappNumber?.trim()) fd.append("whatsappNumber", form.whatsappNumber.trim());
        if (collegeVal) fd.append("collegeName", collegeVal);
        fd.append("resume", resumeFile);
        await submitJobApplication(jobId, fd);
      } else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          whatsappNumber: form.whatsappNumber?.trim() || undefined,
          collegeName: collegeVal || undefined,
          resumeUrl: form.resumeUrl?.trim() || undefined,
        };
        await submitJobApplication(jobId, payload);
      }
      toast.success("Application submitted successfully!");
      navigate("/applyjobs");
    } catch (err) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-6">Job not found or no longer open.</p>
        <button
          type="button"
          onClick={() => navigate("/applyjobs")}
          className="text-cyan-400 hover:text-cyan-300 font-medium"
        >
          ← Back to openings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        type="button"
        onClick={() => navigate("/applyjobs")}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All openings
      </button>

      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8 mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
        {job.department && (
          <p className="text-sm text-slate-400 mb-1">{job.department}</p>
        )}
        {job.location && (
          <p className="text-sm text-slate-400 mb-2">{job.location}</p>
        )}
        <p className="text-sm text-cyan-400">
          {EmploymentTypeLabel[job.employmentType] || job.employmentType}
        </p>
        {job.description && (
          <div className="mt-4 text-sm text-slate-400 whitespace-pre-wrap">
            {job.description}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-6">
          Apply for this position
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              WhatsApp number
            </label>
            <input
              type="text"
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              College name
            </label>
            <select
              name="collegeName"
              value={form.collegeName}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            >
              <option value="">Select your college</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="_other_">Other (type below)</option>
            </select>
            {form.collegeName === "_other_" && (
              <input
                type="text"
                value={otherCollege}
                onChange={(e) => setOtherCollege(e.target.value)}
                placeholder="Enter your college name"
                className="w-full mt-2 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Resume (PDF or Word)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-300 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-cyan-600 file:text-white file:cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional: or paste a resume link below
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Resume URL (optional)
            </label>
            <input
              type="url"
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              placeholder="https://..."
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJobsApply;
