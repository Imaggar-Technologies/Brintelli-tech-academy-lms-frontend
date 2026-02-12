import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import salesCallApi from "../../api/salesCall";

/**
 * Redirect page for /meetings/join/:meetingId
 * Resolves the meeting ID to the actual sales call and redirects.
 */
export default function MeetingRedirect() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!meetingId) {
      setError("Invalid meeting link");
      return;
    }

    const resolve = async () => {
      try {
        const response = await salesCallApi.resolveByMeetingId(meetingId);
        if (response.success && response.data?.redirectUrl) {
          // Replace current history entry so back button doesn't loop
          navigate(response.data.redirectUrl, { replace: true });
        } else {
          setError("Meeting not found. It may have been deleted or the link is invalid.");
        }
      } catch (err) {
        console.error("Error resolving meeting:", err);
        setError(
          err?.response?.data?.message ||
          "Could not find the meeting. The link may be invalid or expired."
        );
      }
    };

    resolve();
  }, [meetingId, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-xl font-semibold text-white">Meeting Not Found</h2>
          <p className="mb-6 text-sm text-white/50">{error}</p>
          <button
            onClick={() => navigate("/sales/meetings-counselling")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-400" />
        <p className="text-sm text-white/60">Joining meeting…</p>
      </div>
    </div>
  );
}

