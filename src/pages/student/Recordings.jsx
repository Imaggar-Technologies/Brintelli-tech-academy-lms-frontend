import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Download, Video, ExternalLink } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import LectureCard from "../../components/LectureCard";
import studentAPI from "../../api/student";

const StudentRecordings = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await studentAPI.getMySessions();
        if (resp?.success) {
          setSessions(resp.data?.sessions || []);
        } else {
          setSessions([]);
        }
      } catch (e) {
        toast.error(e?.message || "Failed to load recordings");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recordings = useMemo(() => {
    return (sessions || [])
      .filter((s) => s?.recordingUrl)
      .sort((a, b) => new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0));
  }, [sessions]);

  return (
    <>
      <PageHeader
        title="Class Recordings Library"
        description="Catch up on recorded sessions, bookmark key moments, and stay aligned with your cohort."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <div className="text-center py-12 text-textMuted md:col-span-2">Loading recordings...</div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-12 text-textMuted md:col-span-2">No recordings yet.</div>
        ) : recordings.map((item) => (
          <div key={item.id} className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <LectureCard
              title={item.name || "Session Recording"}
              description={item.description || "Recording available"}
              duration={item.duration ? `${item.duration} mins` : "Recording"}
              status="recording"
              type="recording"
            />
            <div className="mt-4 flex items-center justify-between text-sm text-textMuted">
              <span>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : ""}</span>
              <div className="flex w-full gap-2">
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2"
                  onClick={() => window.open(item.recordingUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Watch
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center gap-2"
                  onClick={() => window.open(item.recordingUrl, "_blank", "noopener,noreferrer")}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentRecordings;

