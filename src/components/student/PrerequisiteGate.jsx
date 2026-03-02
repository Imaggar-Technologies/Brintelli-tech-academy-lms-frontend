import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import Button from "../Button";
import studentAPI from "../../api/student";

/**
 * Gates Fees and Onboarding content until prerequisite courses are completed.
 * Renders children only when prerequisites are met; otherwise shows a message
 * asking the user to complete prerequisite courses first.
 */
export default function PrerequisiteGate({ children, fallbackMessage = "Complete prerequisite courses to continue." }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: true, met: false, requiredCourses: [], message: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await studentAPI.getPrerequisitesStatus();
        if (cancelled) return;
        if (res.success && res.data) {
          setStatus({
            loading: false,
            met: res.data.met ?? true,
            requiredCourses: res.data.requiredCourses || [],
            message: res.data.message || null,
          });
        } else {
          setStatus({ loading: false, met: true, requiredCourses: [], message: null });
        }
      } catch (err) {
        if (cancelled) return;
        setStatus({ loading: false, met: true, requiredCourses: [], message: null });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (status.loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="mt-3 text-sm text-textMuted">Checking prerequisites...</p>
      </div>
    );
  }

  if (!status.met) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-left dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex gap-3">
          <AlertCircle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Prerequisites required</h3>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              {status.message || fallbackMessage}
            </p>
            {status.requiredCourses?.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
                {status.requiredCourses.map((c) => (
                  <li key={c.id || c.name}>{c.name || c}</li>
                ))}
              </ul>
            )}
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate("/student/my-courses")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
