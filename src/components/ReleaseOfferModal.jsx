import { useState, useEffect } from "react";
import { DollarSign, BookOpen, TrendingUp } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { offerAPI } from "../api/offer";
import { programAPI } from "../api/program";
import toast from "react-hot-toast";

const ReleaseOfferModal = ({ isOpen, onClose, lead, assessmentResult, scholarshipRequest, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [programs, setPrograms] = useState([]);

  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await programAPI.getAllPrograms({ status: 'ACTIVE' });
        if (response.success && response.data.programs) {
          // Map programs to the expected format
          const formattedPrograms = response.data.programs.map(program => ({
            id: program.id || program._id,
            name: program.name || program.title,
            basePrice: program.price || program.basePrice || program.fee || 0,
            levels: ["BEGINNER", "INTERMEDIATE", "EXPERT"]
          }));
          setPrograms(formattedPrograms);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        toast.error('Failed to load programs');
      }
    };
    
    if (isOpen) {
      fetchPrograms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (programs.length > 0 && !courseId) {
      // If scholarship is approved, calculate final price from scholarship amount
      if (scholarshipRequest && scholarshipRequest.status === 'APPROVED') {
        // Use the program from the offer if available, otherwise use first program
        const offerProgramId = scholarshipRequest.offer?.courseId || scholarshipRequest.programId;
        const selectedProgram = offerProgramId 
          ? programs.find(p => p.id === offerProgramId || p._id === offerProgramId)
          : programs[0];
        
        if (selectedProgram) {
          setCourseId(selectedProgram.id);
          const base = scholarshipRequest.offer?.basePrice || selectedProgram.basePrice || selectedProgram.price || selectedProgram.fee || 0;
          setBasePrice(base.toString());
          // Calculate final price: basePrice - requestedAmount (approved amount)
          const requestedAmount = scholarshipRequest.requestedAmount || 0;
          const finalPrice = Math.max(0, base - requestedAmount);
          setOfferedPrice(finalPrice.toString());
        } else {
          // Fallback to first program
          setCourseId(programs[0].id);
          const base = scholarshipRequest.offer?.basePrice || programs[0].basePrice || programs[0].price || programs[0].fee || 0;
          setBasePrice(base.toString());
          const requestedAmount = scholarshipRequest.requestedAmount || 0;
          const finalPrice = Math.max(0, base - requestedAmount);
          setOfferedPrice(finalPrice.toString());
        }
      } else {
        // No approved scholarship - use first program
        setCourseId(programs[0].id);
        setBasePrice((programs[0].basePrice || programs[0].price || programs[0].fee || 0).toString());
        setOfferedPrice((programs[0].basePrice || programs[0].price || programs[0].fee || 0).toString());
      }
    }
  }, [programs, courseId, scholarshipRequest]);

  const handleCourseChange = (e) => {
    const selectedProgramId = e.target.value;
    setCourseId(selectedProgramId);
    const selectedProgram = programs.find(p => p.id === selectedProgramId);
    if (selectedProgram) {
      const base = selectedProgram.basePrice || selectedProgram.price || selectedProgram.fee || 0;
      setBasePrice(base.toString());
      // If scholarship is approved, calculate final price from scholarship amount
      if (scholarshipRequest && scholarshipRequest.status === 'APPROVED') {
        const requestedAmount = scholarshipRequest.requestedAmount || 0;
        const finalPrice = Math.max(0, base - requestedAmount);
        setOfferedPrice(finalPrice.toString());
      } else {
        setOfferedPrice(base.toString());
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseId || !basePrice || !offeredPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    if (parseFloat(offeredPrice) < 0) {
      toast.error("Offered price cannot be negative");
      return;
    }

    if (parseFloat(offeredPrice) > parseFloat(basePrice)) {
      toast.error("Offered price cannot exceed base price");
      return;
    }

    try {
      setLoading(true);
      const response = await offerAPI.releaseOffer({
        leadId: lead.id,
        courseId,
        basePrice: parseFloat(basePrice),
        offeredPrice: parseFloat(offeredPrice),
      });

      if (response.success) {
        toast.success("Offer released successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.error || "Failed to release offer");
      }
    } catch (error) {
      console.error("Error releasing offer:", error);
      toast.error(error.message || "Failed to release offer");
    } finally {
      setLoading(false);
    }
  };

  const selectedProgram = programs.find(p => p.id === courseId);
  const discount = selectedProgram && basePrice && offeredPrice
    ? ((parseFloat(basePrice) - parseFloat(offeredPrice)) / parseFloat(basePrice) * 100).toFixed(1)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Release Offer"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lead Info */}
        <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
          <p className="text-sm font-semibold text-text">{lead?.name}</p>
          <p className="text-xs text-textMuted">{lead?.email}</p>
          {assessmentResult && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-textMuted">Level:</span>
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                assessmentResult.level === 'BEGINNER' ? 'bg-red-100 text-red-700' :
                assessmentResult.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {assessmentResult.level}
              </span>
            </div>
          )}
          {scholarshipRequest && scholarshipRequest.status === 'APPROVED' && (
            <div className="mt-2 rounded-lg bg-green-50 p-2">
              <p className="text-xs text-green-700">
                ✓ Scholarship approved by Finance team
              </p>
            </div>
          )}
          {scholarshipRequest && scholarshipRequest.status === 'REJECTED' && (
            <div className="mt-2 rounded-lg bg-yellow-50 p-2">
              <p className="text-xs text-yellow-700">
                ⚠ Scholarship request rejected - Proceeding with base price
              </p>
            </div>
          )}
        </div>

        {/* Program Selection */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <BookOpen className="inline h-4 w-4 mr-1" />
            Select Program
          </label>
          <select
            value={courseId}
            onChange={handleCourseChange}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            required
          >
            <option value="">Select a program...</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name} - ₹{program.basePrice.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Base Price (₹)
          </label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            placeholder="Enter base price"
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Offered Price */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <TrendingUp className="inline h-4 w-4 mr-1" />
            Offered Price (₹)
          </label>
          <input
            type="number"
            value={offeredPrice}
            onChange={(e) => {
              // Only allow changes if scholarship is NOT approved
              if (!(scholarshipRequest && scholarshipRequest.status === 'APPROVED' && scholarshipRequest.offer)) {
                setOfferedPrice(e.target.value);
              }
            }}
            className={`w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none ${
              scholarshipRequest && scholarshipRequest.status === 'APPROVED' && scholarshipRequest.offer
                ? 'bg-gray-50 cursor-not-allowed'
                : ''
            }`}
            placeholder="Enter offered price"
            required
            min="0"
            step="0.01"
            max={basePrice}
            readOnly={scholarshipRequest && scholarshipRequest.status === 'APPROVED' && scholarshipRequest.offer}
            disabled={scholarshipRequest && scholarshipRequest.status === 'APPROVED' && scholarshipRequest.offer}
          />
          {scholarshipRequest && scholarshipRequest.status === 'APPROVED' && (
            <p className="mt-1 text-xs text-green-600">
              ✓ Scholarship approved - Final price set by Finance team
            </p>
          )}
          {scholarshipRequest && scholarshipRequest.status === 'REJECTED' && (
            <p className="mt-1 text-xs text-yellow-600">
              ⚠ Scholarship rejected - Using base price
            </p>
          )}
          {!scholarshipRequest && discount > 0 && (
            <p className="mt-1 text-xs text-green-600">
              {discount}% discount applied
            </p>
          )}
        </div>

        {/* Price Summary */}
        {basePrice && offeredPrice && (
          <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-textMuted">Base Price:</span>
              <span className="text-sm font-semibold text-text">₹{parseFloat(basePrice).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-textMuted">Offered Price:</span>
              <span className="text-sm font-semibold text-brand-600">₹{parseFloat(offeredPrice).toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-brintelli-border">
                <span className="text-sm text-textMuted">Discount:</span>
                <span className="text-sm font-semibold text-green-600">-₹{(parseFloat(basePrice) - parseFloat(offeredPrice)).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-brintelli-border">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? "Releasing..." : "Release Offer"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReleaseOfferModal;

