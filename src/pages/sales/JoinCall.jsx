import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Video, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import salesCallApi from "../../api/salesCall";

export default function JoinCall() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callData, setCallData] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid access token");
      setLoading(false);
      return;
    }

    const joinCall = async () => {
      try {
        const response = await salesCallApi.joinByToken(token);
        if (response.success) {
          setCallData(response.data);
          // Redirect to the call room
          navigate(response.data.redirectUrl);
        }
      } catch (error) {
        setError(error?.message || "Failed to join call. You may not have access to this call.");
        setLoading(false);
      }
    };

    joinCall();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-textMuted">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text mb-2">Access Denied</h2>
          <p className="text-textMuted mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return null; // Will redirect if successful
}

