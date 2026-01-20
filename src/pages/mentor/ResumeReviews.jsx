import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, User, CheckCircle2, Clock, AlertCircle, Plus, Star } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const ResumeReviews = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    strengths: '',
    improvements: '',
    overallFeedback: '',
    status: 'PENDING',
  });
  const [reviews, setReviews] = useState({}); // menteeId -> reviews

  useEffect(() => {
    fetchMentees();
    loadReviews();
  }, []);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMentees();
      
      if (response.success) {
        setMentees(response.data.mentees || []);
      } else {
        toast.error(response.message || 'Failed to load mentees');
        setMentees([]);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error(error.message || 'Failed to load mentees');
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = () => {
    const saved = localStorage.getItem('mentorResumeReviews');
    if (saved) {
      try {
        setReviews(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading reviews:', e);
      }
    }
  };

  const handleSaveReview = () => {
    if (!selectedMentee || !reviewData.overallFeedback.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const review = {
      id: Date.now().toString(),
      ...reviewData,
      reviewedAt: new Date().toISOString(),
    };

    const menteeId = selectedMentee.id || selectedMentee.enrollmentId;
    const newReviews = {
      ...reviews,
      [menteeId]: [...(reviews[menteeId] || []), review],
    };

    setReviews(newReviews);
    localStorage.setItem('mentorResumeReviews', JSON.stringify(newReviews));
    toast.success('Resume review saved');
    setShowReviewModal(false);
    setSelectedMentee(null);
    setReviewData({
      rating: 5,
      strengths: '',
      improvements: '',
      overallFeedback: '',
      status: 'PENDING',
    });
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <>
      <PageHeader
        title="Resume Reviews"
        description="Review and provide feedback on mentee resumes"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Mentees</p>
              <p className="text-3xl font-bold text-brand-600">{mentees.length}</p>
            </div>
            <User className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Reviews Completed</p>
              <p className="text-3xl font-bold text-accent-600">
                {Object.values(reviews).reduce((sum, reviewList) => sum + reviewList.length, 0)}
              </p>
            </div>
            <FileText className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Add Review */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Resume Reviews</h3>
            <p className="text-sm text-textMuted mt-1">Review and provide feedback on mentee resumes</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowReviewModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>

      {/* Reviews by Mentee */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading mentees...</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No mentees assigned yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {mentees.map((mentee) => {
              const menteeId = mentee.id || mentee.enrollmentId;
              const menteeReviews = reviews[menteeId] || [];
              return (
                <div
                  key={menteeId}
                  className="rounded-xl border border-brintelli-border bg-white/70 p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="font-semibold text-text">{mentee.studentName}</p>
                      <p className="text-xs text-textMuted">{mentee.studentEmail}</p>
                    </div>
                    <span className="ml-auto text-xs text-textMuted">
                      {menteeReviews.length} review{menteeReviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {menteeReviews.length === 0 ? (
                    <p className="text-sm text-textMuted text-center py-4">
                      No resume reviews yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {menteeReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 bg-brintelli-baseAlt rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getRatingStars(review.rating)}
                              <span className="text-sm font-semibold text-text ml-2">
                                {review.rating}/5
                              </span>
                            </div>
                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              review.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              review.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {review.status}
                            </span>
                          </div>
                          
                          {review.overallFeedback && (
                            <div className="mb-2">
                              <p className="text-xs text-textMuted font-semibold mb-1">Overall Feedback:</p>
                              <p className="text-sm text-text">{review.overallFeedback}</p>
                            </div>
                          )}

                          {review.strengths && (
                            <div className="mb-2 p-2 bg-green-50 rounded">
                              <p className="text-xs text-green-700 font-semibold mb-1">Strengths:</p>
                              <p className="text-sm text-text">{review.strengths}</p>
                            </div>
                          )}

                          {review.improvements && (
                            <div className="p-2 bg-amber-50 rounded">
                              <p className="text-xs text-amber-700 font-semibold mb-1">Areas for Improvement:</p>
                              <p className="text-sm text-text">{review.improvements}</p>
                            </div>
                          )}

                          <p className="text-xs text-textMuted mt-2">
                            Reviewed: {new Date(review.reviewedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedMentee(null);
          setReviewData({
            rating: 5,
            strengths: '',
            improvements: '',
            overallFeedback: '',
            status: 'PENDING',
          });
        }}
        title="Resume Review"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Mentee <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMentee?.id || selectedMentee?.enrollmentId || ''}
              onChange={(e) => {
                const mentee = mentees.find(m => (m.id || m.enrollmentId) === e.target.value);
                setSelectedMentee(mentee);
              }}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select a mentee...</option>
              {mentees.map((mentee) => (
                <option key={mentee.id || mentee.enrollmentId} value={mentee.id || mentee.enrollmentId}>
                  {mentee.studentName} ({mentee.studentEmail})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewData({ ...reviewData, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= reviewData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-textMuted">
                {reviewData.rating}/5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Overall Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewData.overallFeedback}
              onChange={(e) => setReviewData({ ...reviewData, overallFeedback: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
              placeholder="Overall feedback on the resume..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Strengths</label>
            <textarea
              value={reviewData.strengths}
              onChange={(e) => setReviewData({ ...reviewData, strengths: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              placeholder="What are the strengths of this resume?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Areas for Improvement</label>
            <textarea
              value={reviewData.improvements}
              onChange={(e) => setReviewData({ ...reviewData, improvements: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              placeholder="What can be improved in this resume?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Status</label>
            <select
              value={reviewData.status}
              onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSaveReview}
              disabled={!selectedMentee || !reviewData.overallFeedback.trim()}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Save Review
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowReviewModal(false);
                setSelectedMentee(null);
                setReviewData({
                  rating: 5,
                  strengths: '',
                  improvements: '',
                  overallFeedback: '',
                  status: 'PENDING',
                });
              }}
            >
              Cancel
            </Button>
      </div>
    </div>
      </Modal>
    </>
  );
};

export default ResumeReviews;

