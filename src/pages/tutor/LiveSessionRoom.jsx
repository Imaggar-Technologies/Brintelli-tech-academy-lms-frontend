import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import tutorAPI from "../../api/tutor";
import SessionRoom from "../../components/live/SessionRoom";

const TutorLiveSessionRoom = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await tutorAPI.getSession(sessionId);
        if (resp?.success) {
          setSession(resp.data?.session || null);
        }
      } catch (e) {
        toast.error(e?.message || "Failed to load session");
      }
    };
    load();
  }, [sessionId]);

  return <SessionRoom sessionId={sessionId} session={session} uiVariant="meeting" />;
};

export default TutorLiveSessionRoom;



