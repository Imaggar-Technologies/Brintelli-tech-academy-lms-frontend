import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import studentAPI from "../../api/student";
import SessionRoom from "../../components/live/SessionRoom";

const StudentLiveSessionRoom = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await studentAPI.getMySessions();
        if (resp?.success) {
          const found = (resp.data?.sessions || []).find((s) => s.id === sessionId);
          setSession(found || null);
        }
      } catch (e) {
        toast.error(e?.message || "Failed to load session");
      }
    };
    load();
  }, [sessionId]);

  return <SessionRoom sessionId={sessionId} session={session} uiVariant="meeting" />;
};

export default StudentLiveSessionRoom;



