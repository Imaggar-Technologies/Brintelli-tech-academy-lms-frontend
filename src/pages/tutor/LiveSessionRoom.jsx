import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import tutorAPI from "../../api/tutor";
import SessionRoom from "../../components/live/SessionRoom";
import { selectCurrentUser } from "../../store/slices/authSlice";

const TutorLiveSessionRoom = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const user = useSelector(selectCurrentUser);
  
  // Studio mode for tutors, LSM, PM, admin
  const isStudio = ["tutor", "lsm", "programmanager", "program-manager", "admin"].includes(
    user?.role?.toLowerCase()
  );

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

  return <SessionRoom sessionId={sessionId} session={session} uiVariant="meeting" mode={isStudio ? "studio" : "room"} />;
};

export default TutorLiveSessionRoom;



