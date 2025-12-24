import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, DollarSign, FileText, Upload, AlertCircle, Clock } from "lucide-react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { offerAPI } from "../../api/offer";
import { scholarshipAPI } from "../../api/scholarship";
import toast from "react-hot-toast";

const OfferPage = () => {
  const { offerId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [scholarshipData, setScholarshipData] = useState({
    requestedAmount: "",
    reason: "",
    documents: [],
  });

  useEffect(() => {
    if (offerId) {
      fetchOffer();
    }
  }, [offerId]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getOfferById(offerId);
      if (response.success && response.data.offer) {
        setOffer(response.data.offer);
      } else {
        toast.error("Offer not found");
      }
    } catch (error) {
      console.error("Error fetching offer:", error);
      toast.error("Failed to load offer");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!window.confirm("Are you sure you want to accept this offer?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await offerAPI.acceptOffer(offerId);
      if (response.success) {
        toast.success("Offer accepted successfully!");
        fetchOffer(); // Refresh offer data
      } else {
        toast.error(response.error || "Failed to accept offer");
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error(error.message || "Failed to accept offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async () => {
    if (!window.confirm("Are you sure you want to reject this offer?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await offerAPI.rejectOffer(offerId);
      if (response.success) {
        toast.success("Offer rejected");
        fetchOffer(); // Refresh offer data
      } else {
        toast.error(response.error || "Failed to reject offer");
      }
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast.error(error.message || "Failed to reject offer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestScholarship = async () => {
    if (!scholarshipData.requestedAmount || parseFloat(scholarshipData.requestedAmount) <= 0) {
      toast.error("Please enter a valid requested amount");
      return;
    }

    if (!scholarshipData.reason) {
      toast.error("Please provide a reason for the scholarship request");
      return;
    }

    try {
      setActionLoading(true);
      const response = await scholarshipAPI.requestScholarship({
        offerId: offerId,
        requestedAmount: parseFloat(scholarshipData.requestedAmount),
        reason: scholarshipData.reason,
        documents: scholarshipData.documents,
      });

      if (response.success) {
        toast.success("Scholarship request submitted successfully!");
        setShowScholarshipModal(false);
        setScholarshipData({ requestedAmount: "", reason: "", documents: [] });
        fetchOffer(); // Refresh offer data
      } else {
        toast.error(response.error || "Failed to submit scholarship request");
      }
    } catch (error) {
      console.error("Error requesting scholarship:", error);
      toast.error(error.message || "Failed to submit scholarship request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // In production, upload files to storage and get URLs
    // For now, just store file names
    const fileNames = files.map((file) => file.name);
    setScholarshipData({
      ...scholarshipData,
      documents: [...scholarshipData.documents, ...fileNames],
    });
    toast.success(`${files.length} file(s) selected`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-textMuted">Loading offer...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-text mb-2">Offer Not Found</h2>
          <p className="text-textMuted">The offer you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const discount = offer.basePrice > offer.offeredPrice
    ? ((offer.basePrice - offer.offeredPrice) / offer.basePrice * 100).toFixed(1)
    : 0;

  const canTakeAction = offer.status === "OFFER_SENT";
  const hasScholarship = offer.scholarshipApplied;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Course Offer</h1>
            <p className="text-textMuted">Review your personalized course offer</p>
          </div>

          {/* Offer Status */}
          <div className="mb-6">
            {offer.status === "OFFER_SENT" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Offer Pending</p>
                  <p className="text-xs text-yellow-700">Please review and respond to this offer</p>
                </div>
              </div>
            )}
            {offer.status === "ACCEPTED" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Offer Accepted</p>
                  <p className="text-xs text-green-700">You have accepted this offer</p>
                </div>
              </div>
            )}
            {offer.status === "REJECTED" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Offer Rejected</p>
                  <p className="text-xs text-red-700">You have rejected this offer</p>
                </div>
              </div>
            )}
          </div>

          {/* Offer Details */}
          <div className="space-y-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text mb-4">Offer Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Level:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    offer.level === 'BEGINNER' ? 'bg-red-100 text-red-700' :
                    offer.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {offer.level}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-textMuted">Base Price:</span>
                  <span className="text-lg font-semibold text-text">₹{offer.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Offered Price:</span>
                  <span className="text-2xl font-bold text-brand-600">₹{offer.offeredPrice.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-textMuted">Discount:</span>
                    <span className="text-lg font-semibold text-green-600">
                      -₹{(offer.basePrice - offer.offeredPrice).toLocaleString()} ({discount}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {canTakeAction && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  onClick={handleAcceptOffer}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Accept Offer"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleRejectOffer}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Offer
                </Button>
              </div>

              {!hasScholarship && (
                <Button
                  variant="outline"
                  onClick={() => setShowScholarshipModal(true)}
                  disabled={actionLoading}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Apply for Scholarship
                </Button>
              )}

              {hasScholarship && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <FileText className="inline h-4 w-4 mr-2" />
                    You have already applied for a scholarship. Your request is under review.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scholarship Application Modal */}
      {showScholarshipModal && (
        <Modal
          isOpen={showScholarshipModal}
          onClose={() => {
            setShowScholarshipModal(false);
            setScholarshipData({ requestedAmount: "", reason: "", documents: [] });
          }}
          title="Apply for Scholarship"
        >
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-textMuted mb-2">Current Offer:</p>
              <p className="text-lg font-semibold text-text">₹{offer.offeredPrice.toLocaleString()}</p>
              <p className="text-xs text-textMuted mt-1">Base Price: ₹{offer.basePrice.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Requested Amount (₹)
              </label>
              <input
                type="number"
                value={scholarshipData.requestedAmount}
                onChange={(e) => setScholarshipData({ ...scholarshipData, requestedAmount: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Enter requested scholarship amount"
                required
                min="0"
                max={offer.offeredPrice}
                step="0.01"
              />
              <p className="mt-1 text-xs text-textMuted">
                Maximum: ₹{offer.offeredPrice.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Reason for Scholarship
              </label>
              <textarea
                value={scholarshipData.reason}
                onChange={(e) => setScholarshipData({ ...scholarshipData, reason: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:border-brand-500 focus:outline-none"
                placeholder="Please explain why you need financial assistance..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Supporting Documents (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm text-center hover:bg-gray-50 transition">
                    <Upload className="h-4 w-4 inline mr-2" />
                    Upload Documents
                  </div>
                </label>
              </div>
              {scholarshipData.documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {scholarshipData.documents.map((doc, index) => (
                    <p key={index} className="text-xs text-textMuted">{doc}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={handleRequestScholarship}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowScholarshipModal(false);
                  setScholarshipData({ requestedAmount: "", reason: "", documents: [] });
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OfferPage;

