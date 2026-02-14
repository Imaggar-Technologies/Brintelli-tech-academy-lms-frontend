import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Link as LinkIcon, Video, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import { apiRequest } from "../../api/apiClient";

const statusStyles = {
  SCHEDULED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  ONGOING: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  COMPLETED: "bg-gray-50 text-gray-700 ring-1 ring-gray-200/60",
  CANCELLED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
};

const typeStyles = {
  LIVE: "bg-purple-50 text-purple-700 ring-1 ring-purple-200/60",
  RECORDED: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 rounded-xl border border-brintelli-border/60 bg-white p-4">
    <div className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-700 ring-1 ring-brand-100">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-textMuted">{label}</div>
      <div className="mt-1 text-sm text-text">{children}</div>
    </div>
  </div>
);

const SessionDetails = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();
  const sessionFromState = location.state?.session || null;

  const [loading, setLoading] = useState(!sessionFromState);
  const [session, setSession] = useState(sessionFromState);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      if (sessionFromState) return;
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest(`/api/tutors/sessions/${sessionId}/details`);
        if (!cancelled) setSession(res?.data?.session || null);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [sessionFromState, sessionId]);

  const status = session?.status || "UNKNOWN";
  const type = session?.type || "UNKNOWN";

  const statusClass = useMemo(
    () => statusStyles[status] || "bg-gray-50 text-gray-700 ring-1 ring-gray-200/60",
    [status]
  );
  const typeClass = useMemo(
    () => typeStyles[type] || "bg-slate-50 text-slate-700 ring-1 ring-slate-200/60",
    [type]
  );

  return (
    <>
      <PageHeader
        title="Session Details"
        description="View full session information, links, and related batch/module context."
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-brand-500" />
            <p className="mt-3 text-sm text-textMuted">Loading session...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-rose-800">Failed to load session</p>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
          </div>
        ) : !session ? (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-textMuted">Session not found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-text">{session.name || "Unnamed Session"}</h2>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                      {status}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${typeClass}`}>
                      {type}
                    </span>
                  </div>
                  {session.description ? (
                    <p className="mt-2 text-sm text-textMuted">{session.description}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <InfoRow icon={Calendar} label="Scheduled Date">
                {formatDateTime(session.scheduledDate)}
              </InfoRow>
              <InfoRow icon={Clock} label="Duration">
                {session.duration ? `${session.duration} min` : "—"}
              </InfoRow>
              <InfoRow icon={Users} label="Tutor">
                {session.tutor?.fullName || session.tutorName || session.tutorEmail || "—"}
              </InfoRow>
              <InfoRow icon={Users} label="Batch">
                {session.batch?.name || session.batchName || "—"}
              </InfoRow>
              <InfoRow icon={Users} label="Module">
                {session.module?.name || "—"}
              </InfoRow>
              <InfoRow icon={Users} label="Program">
                {session.program?.name || "—"}
              </InfoRow>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <InfoRow icon={LinkIcon} label="Meeting Link">
                {session.meetingLink ? (
                  <a className="text-brand-700 underline" href={session.meetingLink} target="_blank" rel="noreferrer">
                    Open meeting link
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>
              <InfoRow icon={Video} label="Recording URL">
                {session.recordingUrl ? (
                  <a className="text-brand-700 underline" href={session.recordingUrl} target="_blank" rel="noreferrer">
                    Open recording
                  </a>
                ) : (
                  "—"
                )}
              </InfoRow>
            </div>

            <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <div className="text-sm font-bold text-text">Materials</div>
              {Array.isArray(session.materials) && session.materials.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {session.materials.map((m, idx) => (
                    <div key={`${m.url || "mat"}-${idx}`} className="flex items-center justify-between gap-3 rounded-xl border border-brintelli-border/60 p-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text">{m.title || `Material ${idx + 1}`}</div>
                        <div className="text-xs text-textMuted">{m.type || "LINK"}</div>
                      </div>
                      {m.url ? (
                        <a className="text-sm text-brand-700 underline" href={m.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        <span className="text-xs text-textMuted">—</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-textMuted">No materials attached.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SessionDetails;








































