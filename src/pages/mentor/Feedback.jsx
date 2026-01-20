import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, User, Star, MessageSquare, Calendar, AlertCircle, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const Feedback = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    category: 'PERFORMANCE',
    feedback: '',
    recommendations: '',
  });
  const [feedbacks, setFeedbacks] = useState({}); // menteeId -> feedbacks array

  useEffect(() => {
    fetchMentees();
    loadFeedbacks();
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

  const loadFeedbacks = () => {
    const saved = localStorage.getItem('mentorFeedbacks');
    if (saved) {
      try {
        setFeedbacks(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading feedbacks:', e);
      }
    }
  };

  const handleSaveFeedback = () => {
    if (!selectedMentee || !feedbackData.feedback.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const feedback = {
      id: Date.now().toString(),
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };

    const menteeId = selectedMentee.id || selectedMentee.enrollmentId;
    const newFeedbacks = {
      ...feedbacks,
      [menteeId]: [...(feedbacks[menteeId] || []), feedback],
    };

    setFeedbacks(newFeedbacks);
    localStorage.setItem('mentorFeedbacks', JSON.stringify(newFeedbacks));
    toast.success('Feedback saved successfully');
    setShowFeedbackModal(false);
    setSelectedMentee(null);
    setFeedbackData({
      rating: 5,
      category: 'PERFORMANCE',
      feedback: '',
      recommendations: '',
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

  const getCategoryLabel = (category) => {
    const labels = {
      PERFORMANCE: 'Performance',
      ATTENDANCE: 'Attendance',
      ENGAGEMENT: 'Engagement',
      ASSIGNMENTS: 'Assignments',
      COMMUNICATION: 'Communication',
      GENERAL: 'General',
    };
    return labels[category] || category;
  };

  return (
    <>
      <PageHeader
        title="Feedback & Reviews"
        description="Provide and manage feedback for your mentees"
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
              <p className="text-sm text-textMuted mb-1">Feedbacks Given</p>
              <p className="text-3xl font-bold text-accent-600">
                {Object.values(feedbacks).reduce((sum, feedbackList) => sum + feedbackList.length, 0)}
              </p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Add Feedback */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Provide Feedback</h3>
            <p className="text-sm text-textMuted mt-1">Give feedback and reviews to your mentees</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowFeedbackModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feedback
          </Button>
        </div>
      </div>

      {/* Feedbacks by Mentee */}
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
              const menteeFeedbacks = feedbacks[menteeId] || [];
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
                      {menteeFeedbacks.length} feedback{menteeFeedbacks.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {menteeFeedbacks.length === 0 ? (
                    <p className="text-sm text-textMuted text-center py-4">
                      No feedback provided yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {menteeFeedbacks.map((feedback) => (
                        <div
                          key={feedback.id}
                          className="p-4 bg-brintelli-baseAlt rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getRatingStars(feedback.rating)}
                              <span className="text-sm font-semibold text-text ml-2">
                                {feedback.rating}/5
                              </span>
                              <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 ml-2">
                                {getCategoryLabel(feedback.category)}
                              </span>
                            </div>
                            <span className="text-xs text-textMuted">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-xs text-textMuted font-semibold mb-1">Feedback:</p>
                            <p className="text-sm text-text whitespace-pre-wrap">{feedback.feedback}</p>
                          </div>

                          {feedback.recommendations && (
                            <div className="p-2 bg-green-50 rounded">
                              <p className="text-xs text-green-700 font-semibold mb-1">Recommendations:</p>
                              <p className="text-sm text-text whitespace-pre-wrap">{feedback.recommendations}</p>
                            </div>
                          )}
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

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedMentee(null);
          setFeedbackData({
            rating: 5,
            category: 'PERFORMANCE',
            feedback: '',
            recommendations: '',
          });
        }}
        title="Provide Feedback"
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
              Category
            </label>
            <select
              value={feedbackData.category}
              onChange={(e) => setFeedbackData({ ...feedbackData, category: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="PERFORMANCE">Performance</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="ASSIGNMENTS">Assignments</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="GENERAL">General</option>
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
                  onClick={() => setFeedbackData({ ...feedbackData, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= feedbackData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-textMuted">
                {feedbackData.rating}/5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedbackData.feedback}
              onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px]"
              placeholder="Provide detailed feedback..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Recommendations</label>
            <textarea
              value={feedbackData.recommendations}
              onChange={(e) => setFeedbackData({ ...feedbackData, recommendations: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
              placeholder="Provide recommendations for improvement..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSaveFeedback}
              disabled={!selectedMentee || !feedbackData.feedback.trim()}
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Save Feedback
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowFeedbackModal(false);
                setSelectedMentee(null);
                setFeedbackData({
                  rating: 5,
                  category: 'PERFORMANCE',
                  feedback: '',
                  recommendations: '',
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

export default Feedback;
