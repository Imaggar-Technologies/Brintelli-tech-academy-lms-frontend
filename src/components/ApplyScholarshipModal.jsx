import { useState, useEffect } from "react";
import { Gift, DollarSign, FileText, Upload, BookOpen } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { scholarshipAPI } from "../api/scholarship";
import { offerAPI } from "../api/offer";
import { programAPI } from "../api/program";
import toast from "react-hot-toast";

const ApplyScholarshipModal = ({ isOpen, onClose, lead, assessmentResult, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState([]);
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
            // Programs don't have levels, so we'll show all programs
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
      // Auto-select first program if available
      setCourseId(programs[0].id);
      setBasePrice(programs[0].basePrice.toString());
    }
  }, [programs, courseId]);

  const handleCourseChange = (e) => {
    const selectedProgramId = e.target.value;
    setCourseId(selectedProgramId);
    const selectedProgram = programs.find(p => p.id === selectedProgramId);
    if (selectedProgram) {
      setBasePrice(selectedProgram.basePrice.toString());
      // Reset requested amount if it exceeds new base price
      if (requestedAmount && parseFloat(requestedAmount) > selectedProgram.basePrice) {
        setRequestedAmount("");
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // In production, upload files to storage and get URLs
    // For now, just store file names
    const fileNames = files.map((file) => file.name);
    setDocuments([...documents, ...fileNames]);
    toast.success(`${files.length} file(s) selected`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseId || !basePrice) {
      toast.error("Please select a program");
      return;
    }

    if (!requestedAmount || parseFloat(requestedAmount) <= 0) {
      toast.error("Please enter a valid requested scholarship amount");
      return;
    }

    if (parseFloat(requestedAmount) > parseFloat(basePrice)) {
      toast.error("Requested scholarship amount cannot exceed base price");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the scholarship request");
      return;
    }

    try {
      setLoading(true);
      
      // Create scholarship request (backend will create offer if needed)
      const scholarshipResponse = await scholarshipAPI.requestScholarship({
        leadId: lead.id,
        courseId,
        basePrice: parseFloat(basePrice),
        requestedAmount: parseFloat(requestedAmount),
        reason: reason.trim(),
        documents: documents,
        level: assessmentResult?.level,
      });

      if (scholarshipResponse.success) {
        toast.success("Scholarship request submitted successfully! Finance team will review it.");
        onSuccess?.();
        onClose();
        // Reset form
        setCourseId("");
        setBasePrice("");
        setRequestedAmount("");
        setReason("");
        setDocuments([]);
      } else {
        throw new Error(scholarshipResponse.error || "Failed to submit scholarship request");
      }
    } catch (error) {
      console.error("Error requesting scholarship:", error);
      toast.error(error.message || "Failed to submit scholarship request");
    } finally {
      setLoading(false);
    }
  };

  const maxAmount = parseFloat(basePrice) || 0;
  const selectedProgram = programs.find(p => p.id === courseId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask for Scholarship"
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
            readOnly={!!courseId} // Read-only if course is selected
          />
        </div>

        {/* Requested Amount */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Requested Scholarship Amount (₹)
          </label>
          <input
            type="number"
            value={requestedAmount}
            onChange={(e) => setRequestedAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            placeholder="Enter requested amount"
            required
            min="0"
            max={maxAmount}
            step="0.01"
          />
          <p className="mt-1 text-xs text-textMuted">
            Maximum: ₹{maxAmount.toLocaleString()}
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Reason for Scholarship
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            placeholder="Please explain why you need financial assistance..."
            rows={4}
            required
          />
        </div>

        {/* Documents */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <Upload className="inline h-4 w-4 mr-1" />
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
              <div className="px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm text-center hover:bg-brintelli-border transition">
                <Upload className="h-4 w-4 inline mr-2" />
                Upload Documents
              </div>
            </label>
          </div>
          {documents.length > 0 && (
            <div className="mt-2 space-y-1">
              {documents.map((doc, index) => (
                <p key={index} className="text-xs text-textMuted">{doc}</p>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {requestedAmount && parseFloat(requestedAmount) > 0 && basePrice && (
          <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
            <h3 className="text-sm font-semibold text-textMuted mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-textMuted">Base Price:</span>
                <span className="text-sm font-semibold text-text">₹{parseFloat(basePrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-textMuted">Requested Scholarship:</span>
                <span className="text-sm font-semibold text-purple-600">-₹{parseFloat(requestedAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brintelli-border">
                <span className="text-sm font-semibold text-textMuted">Final Price (if approved):</span>
                <span className="text-sm font-bold text-green-600">
                  ₹{(parseFloat(basePrice) - parseFloat(requestedAmount)).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-textMuted mt-2">
                ⚠️ This request will be sent to the Finance team for approval. The offer will be sent after approval.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-brintelli-border">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            <Gift className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Submit to Finance"}
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

export default ApplyScholarshipModal;

