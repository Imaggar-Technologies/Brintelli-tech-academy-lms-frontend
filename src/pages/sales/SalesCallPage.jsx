import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import SalesCallRoom from "../../components/sales/SalesCallRoom";
import Button from "../../components/Button";
import salesCallApi from "../../api/salesCall";
import { parseCallSlug } from "../../utils/callSlug";

export default function SalesCallPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [call, setCall] = useState(null);
  const [callId, setCallId] = useState(null);

  useEffect(() => {
    const loadCall = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert slug/id to actual callId using the slug parser
        const actualCallId = parseCallSlug(id);
        
        if (!actualCallId) {
          setError("Invalid call ID format");
          setLoading(false);
          return;
        }

        const response = await salesCallApi.getCallById(actualCallId);
        
        if (response.success && response.data?.call) {
          setCall(response.data.call);
          setCallId(response.data.call._id || response.data.call.id || actualCallId);
        } else {
          setError("Call not found");
        }
      } catch (err) {
        console.error("Error loading call:", err);
        setError(err?.response?.data?.message || "Failed to load call. The call may not exist or you may not have access.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCall();
    } else {
      setError("Invalid call ID");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-textMuted">Loading call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">Call Not Found</h2>
          <p className="text-textMuted mb-6">{error}</p>
          <Button onClick={() => navigate("/sales/calls")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calls
          </Button>
        </div>
      </div>
    );
  }

  if (!call || !callId) {
    return null;
  }

  return <SalesCallRoom callId={callId} call={call} />;
}

