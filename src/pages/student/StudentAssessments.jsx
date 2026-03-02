import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ExternalLink, Loader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import studentAPI from "../../api/student";

/**
 * Student portal - Assessment layout page.
 * Lists assessments allocated to the student (from lead/sales flow).
 */
export default function StudentAssessments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await studentAPI.getMyAssessments();
        if (cancelled) return;
        if (res.success && res.data?.assessments) {
          setAssessments(res.data.assessments);
        } else {
          setAssessments(res.data?.assessments ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load assessments");
          setAssessments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleStartAssessment = (assessment) => {
    const link = assessment.assessmentLink || assessment.link;
    if (link) {
      if (link.startsWith("http")) window.location.href = link;
      else navigate(link);
    } else if (assessment.leadId && assessment.token) {
      navigate(`/assessment?leadId=${assessment.leadId}&token=${assessment.token}`);
    } else {
      navigate(`/assessment?leadId=${assessment.leadId}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assessments"
        subtitle="Assessments allocated to you. Complete them to proceed."
        icon={ClipboardCheck}
      />

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-border bg-muted/20 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : assessments.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-textMuted" />
          <p className="mt-3 font-medium text-text">No assessments allocated</p>
          <p className="mt-1 text-sm text-textMuted">
            When an assessment is assigned to you, it will appear here. Check your email for assessment links.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {assessments.map((a) => (
            <li
              key={a.id || a._id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-text">
                  {a.title || a.assessmentType || "Assessment"}
                </p>
                {a.status && (
                  <p className="text-sm text-textMuted capitalize">{a.status}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {(a.assessmentLink || a.link || a.leadId) && (
                  <Button
                    variant="primary"
                    onClick={() => handleStartAssessment(a)}
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {a.status === "completed" || a.submitted ? "View" : "Take assessment"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
