import { useState, useEffect } from "react";
import { DollarSign, BookOpen, TrendingUp } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { offerAPI } from "../api/offer";
import toast from "react-hot-toast";

const ReleaseOfferModal = ({ isOpen, onClose, lead, assessmentResult, scholarshipRequest, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [courses, setCourses] = useState([]);

  // Mock courses - in production, fetch from API
  useEffect(() => {
    // TODO: Replace with actual course API call
    const mockCourses = [
      { id: "1", name: "Full Stack Web Development", basePrice: 50000, levels: ["BEGINNER", "INTERMEDIATE", "EXPERT"] },
      { id: "2", name: "Data Science & Machine Learning", basePrice: 60000, levels: ["INTERMEDIATE", "EXPERT"] },
      { id: "3", name: "Cloud Computing & DevOps", basePrice: 55000, levels: ["BEGINNER", "INTERMEDIATE", "EXPERT"] },
      { id: "4", name: "Mobile App Development", basePrice: 52000, levels: ["BEGINNER", "INTERMEDIATE"] },
      { id: "5", name: "Cybersecurity", basePrice: 65000, levels: ["INTERMEDIATE", "EXPERT"] },
    ];
    setCourses(mockCourses);
  }, []);

  useEffect(() => {
    if (assessmentResult?.level && courses.length > 0) {
      // Filter courses by level
      const filteredCourses = courses.filter(course => 
        course.levels.includes(assessmentResult.level)
      );
      if (filteredCourses.length > 0 && !courseId) {
        setCourseId(filteredCourses[0].id);
        setBasePrice(filteredCourses[0].basePrice.toString());
        
        // If scholarship is approved, use the final price from scholarship
        // Otherwise, use base price
        if (scholarshipRequest && scholarshipRequest.status === 'APPROVED' && scholarshipRequest.offer) {
          setOfferedPrice(scholarshipRequest.offer.offeredPrice?.toString() || filteredCourses[0].basePrice.toString());
        } else {
          setOfferedPrice(filteredCourses[0].basePrice.toString());
        }
      }
    }
  }, [assessmentResult, courses, courseId, scholarshipRequest]);

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    setCourseId(selectedCourseId);
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (selectedCourse) {
      setBasePrice(selectedCourse.basePrice.toString());
      setOfferedPrice(selectedCourse.basePrice.toString());
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

  const selectedCourse = courses.find(c => c.id === courseId);
  const discount = selectedCourse && basePrice && offeredPrice
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

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            <BookOpen className="inline h-4 w-4 mr-1" />
            Select Course
          </label>
          <select
            value={courseId}
            onChange={handleCourseChange}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            required
          >
            <option value="">Select a course...</option>
            {courses
              .filter(course => !assessmentResult?.level || course.levels.includes(assessmentResult.level))
              .map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} - ₹{course.basePrice.toLocaleString()}
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
            onChange={(e) => setOfferedPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            placeholder="Enter offered price"
            required
            min="0"
            step="0.01"
            max={basePrice}
            readOnly={scholarshipRequest && scholarshipRequest.status === 'APPROVED' && scholarshipRequest.offer}
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

