import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Users, 
  ChevronRight,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Bookmark,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import studentAPI from '../../api/student';

const StudentOnboarding = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentRes, batchesRes] = await Promise.all([
        studentAPI.getMyEnrollment(),
        studentAPI.getAvailableBatches(),
      ]);

      if (enrollmentRes.success && enrollmentRes.data.enrollment) {
        const enroll = enrollmentRes.data.enrollment;
        setEnrollment(enroll);
        setSelectedBatchId(enroll.batchId);
        setSelectedMentorId(enroll.mentorId);
      }

      if (batchesRes.success) {
        setAvailableBatches(batchesRes.data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load onboarding data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBatch = async (batchId) => {
    try {
      const response = await studentAPI.confirmBatch(batchId);
      if (response.success) {
        toast.success('Batch confirmed successfully!');
        fetchData();
        setShowBatchModal(false);
      }
    } catch (error) {
      console.error('Error confirming batch:', error);
      toast.error(error.message || 'Failed to confirm batch');
    }
  };

  const handleSelectMentor = async (mentorId) => {
    try {
      const response = await studentAPI.selectMentor(mentorId);
      if (response.success) {
        toast.success('Mentor selected successfully!');
        fetchData();
        setShowMentorModal(false);
      }
    } catch (error) {
      console.error('Error selecting mentor:', error);
      toast.error(error.message || 'Failed to select mentor');
    }
  };

  const handleBookCall = async (mentorId) => {
    try {
      const response = await studentAPI.bookMentorCall(mentorId);
      if (response.success) {
        toast.success('Call request sent! The mentor will schedule a time with you.');
        fetchData();
      }
    } catch (error) {
      console.error('Error booking call:', error);
      toast.error(error.message || 'Failed to book call');
    }
  };

  const hasBookedCall = (mentorId) => {
    if (!enrollment?.bookedCalls) return false;
    return enrollment.bookedCalls.some(call => 
      call.mentorId === mentorId && ['PENDING', 'SCHEDULED', 'COMPLETED'].includes(call.status)
    );
  };

  const hasCompletedCall = (mentorId) => {
    if (!enrollment?.bookedCalls) return false;
    return enrollment.bookedCalls.some(call => 
      call.mentorId === mentorId && call.status === 'COMPLETED'
    );
  };

  const isOnboardingComplete = enrollment?.isOnboardingComplete === true;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text mb-2">No Enrollment Found</h3>
        <p className="text-textMuted">Please contact support to complete your enrollment.</p>
      </div>
    );
  }

  if (isOnboardingComplete) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text mb-2">Onboarding Complete!</h2>
        <p className="text-textMuted mb-6">You have successfully confirmed your batch and selected your mentor.</p>
        <Button onClick={() => window.location.href = '/student/dashboard'}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const currentBatch = availableBatches.find(b => b.id === enrollment.batchId);
  const selectedBatch = availableBatches.find(b => b.id === selectedBatchId);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Complete Your Onboarding"
        description="Confirm your batch and select your mentor to get started"
      />

      {/* Onboarding Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Batch Confirmation Step */}
        <div className={`rounded-2xl border-2 p-6 ${
          enrollment.batchConfirmed
            ? 'border-green-500 bg-green-50/30'
            : 'border-brintelli-border bg-brintelli-card'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {enrollment.batchConfirmed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Calendar className="h-6 w-6 text-brand-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-text">Step 1: Confirm Your Batch</h3>
                <p className="text-sm text-textMuted">Confirm or change your assigned batch</p>
              </div>
            </div>
            {enrollment.batchConfirmed && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Confirmed
              </span>
            )}
          </div>

          {enrollment.batchConfirmed && currentBatch ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-white border border-green-200">
                <h4 className="font-semibold text-text mb-2">{currentBatch.name}</h4>
                <div className="space-y-1 text-sm text-textMuted">
                  {currentBatch.startDate && (
                    <p>Start: {new Date(currentBatch.startDate).toLocaleDateString()}</p>
                  )}
                  {currentBatch.endDate && (
                    <p>End: {new Date(currentBatch.endDate).toLocaleDateString()}</p>
                  )}
                  <p>Capacity: {currentBatch.enrolled || 0} / {currentBatch.capacity || 'N/A'}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowBatchModal(true)}
              >
                Change Batch
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentBatch ? (
                <div className="p-4 rounded-lg bg-brintelli-baseAlt border border-brintelli-border">
                  <h4 className="font-semibold text-text mb-2">Assigned Batch: {currentBatch.name}</h4>
                  <p className="text-sm text-textMuted mb-4">
                    You have been assigned to this batch. Confirm to proceed or select a different batch.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConfirmBatch(enrollment.batchId)}
                      className="flex-1"
                    >
                      Confirm This Batch
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowBatchModal(true)}
                    >
                      Change Batch
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    No batch assigned yet. Please select a batch to continue.
                  </p>
                  <Button
                    onClick={() => setShowBatchModal(true)}
                    className="mt-3"
                  >
                    Select Batch
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mentor Selection Step */}
        <div className={`rounded-2xl border-2 p-6 ${
          enrollment.mentorId
            ? 'border-green-500 bg-green-50/30'
            : 'border-brintelli-border bg-brintelli-card'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {enrollment.mentorId ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <Users className="h-6 w-6 text-brand-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-text">Step 2: Select Your Mentor</h3>
                <p className="text-sm text-textMuted">Choose from suggested mentors or select a different one</p>
              </div>
            </div>
            {enrollment.mentorId && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Selected
              </span>
            )}
          </div>

          {enrollment.mentorId ? (
            <div className="space-y-3">
              {(() => {
                const selectedMentor = enrollment.suggestedMentors?.find(m => m.id === enrollment.mentorId);
                if (!selectedMentor) return null;
                return (
                  <div className="p-4 rounded-lg bg-white border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text">{selectedMentor.name}</h4>
                        <p className="text-xs text-textMuted">{selectedMentor.experience}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <Button
                variant="secondary"
                onClick={() => setShowMentorModal(true)}
              >
                Change Mentor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollment.suggestedMentors && enrollment.suggestedMentors.length > 0 ? (
                <div>
                  <p className="text-sm text-textMuted mb-3">
                    {enrollment.suggestedMentors.length} mentor(s) suggested for you:
                  </p>
                  <div className="space-y-2">
                    {enrollment.suggestedMentors.slice(0, 2).map((mentor) => {
                      const hasCall = hasBookedCall(mentor.id);
                      const hasCompleted = hasCompletedCall(mentor.id);
                      const callInfo = enrollment.bookedCalls?.find(c => c.mentorId === mentor.id);

                      return (
                        <div
                          key={mentor.id}
                          className="p-3 rounded-lg bg-brintelli-baseAlt border border-brintelli-border"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-brand-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-text text-sm">{mentor.name}</h4>
                              <p className="text-xs text-textMuted">{mentor.experience}</p>
                            </div>
                          </div>
                          {hasCall && (
                            <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                              {callInfo?.status === 'PENDING' && 'Call request sent'}
                              {callInfo?.status === 'SCHEDULED' && callInfo?.scheduledDate && (
                                <>Scheduled: {new Date(callInfo.scheduledDate).toLocaleString()}</>
                              )}
                              {callInfo?.status === 'COMPLETED' && 'Call completed ✓'}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {!hasCall ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleBookCall(mentor.id)}
                                className="flex-1 text-xs"
                              >
                                Request Call
                              </Button>
                            ) : hasCompleted ? (
                              <Button
                                size="sm"
                                onClick={() => handleSelectMentor(mentor.id)}
                                className="flex-1 text-xs"
                              >
                                Select Mentor
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled
                                className="flex-1 text-xs"
                              >
                                Call Pending
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedMentor(mentor);
                                setShowMentorModal(true);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {enrollment.suggestedMentors.length > 2 && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowMentorModal(true)}
                      className="w-full mt-2"
                    >
                      View All {enrollment.suggestedMentors.length} Mentors
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    No mentors suggested yet. Please wait for LSM to suggest mentors.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Batch Selection Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBatchModal(false)}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Select Batch</h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-textMuted hover:text-text"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {availableBatches.length === 0 ? (
                <p className="text-textMuted text-center py-8">No batches available for your program.</p>
              ) : (
                availableBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      selectedBatchId === batch.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-brintelli-border bg-brintelli-baseAlt hover:border-brand-300'
                    }`}
                    onClick={() => setSelectedBatchId(batch.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text mb-1">{batch.name}</h4>
                        <div className="space-y-1 text-sm text-textMuted">
                          {batch.startDate && (
                            <p>Start: {new Date(batch.startDate).toLocaleDateString()}</p>
                          )}
                          {batch.endDate && (
                            <p>End: {new Date(batch.endDate).toLocaleDateString()}</p>
                          )}
                          <p>Available: {batch.availableSlots} slots</p>
                        </div>
                      </div>
                      {selectedBatchId === batch.id && (
                        <CheckCircle2 className="h-5 w-5 text-brand-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowBatchModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedBatchId) {
                    handleConfirmBatch(selectedBatchId);
                  }
                }}
                disabled={!selectedBatchId}
                className="flex-1"
              >
                Confirm Batch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Selection Modal */}
      {showMentorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          setShowMentorModal(false);
          setSelectedMentor(null);
        }}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {selectedMentor ? 'Mentor Profile' : 'Select Mentor'}
              </h3>
              <button
                onClick={() => {
                  setShowMentorModal(false);
                  setSelectedMentor(null);
                }}
                className="text-textMuted hover:text-text"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {selectedMentor ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-text">{selectedMentor.name}</h4>
                    {selectedMentor.experience && (
                      <p className="text-sm text-textMuted">{selectedMentor.experience}</p>
                    )}
                  </div>
                </div>

                {selectedMentor.bio && (
                  <div>
                    <h5 className="font-semibold text-text mb-2">About</h5>
                    <p className="text-sm text-textSoft">{selectedMentor.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedMentor.email && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Email</span>
                      </div>
                      <p className="text-sm text-text">{selectedMentor.email}</p>
                    </div>
                  )}
                  {selectedMentor.phone && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">Phone</span>
                      </div>
                      <p className="text-sm text-text">{selectedMentor.phone}</p>
                    </div>
                  )}
                </div>

                {(() => {
                  const hasCall = hasBookedCall(selectedMentor.id);
                  const hasCompleted = hasCompletedCall(selectedMentor.id);
                  const callInfo = enrollment?.bookedCalls?.find(c => c.mentorId === selectedMentor.id);

                  return (
                    <div className="pt-4 border-t border-brintelli-border">
                      {hasCall && (
                        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-600">
                            {callInfo?.status === 'PENDING' && 'Call request sent. Waiting for mentor to schedule.'}
                            {callInfo?.status === 'SCHEDULED' && callInfo?.scheduledDate && (
                              <>Scheduled for: {new Date(callInfo.scheduledDate).toLocaleString()}</>
                            )}
                            {callInfo?.status === 'COMPLETED' && 'Call completed. You can now select this mentor.'}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {!hasCall ? (
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => {
                              handleBookCall(selectedMentor.id);
                              setShowMentorModal(false);
                            }}
                          >
                            Request Call
                          </Button>
                        ) : hasCompleted ? (
                          <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => {
                              handleSelectMentor(selectedMentor.id);
                              setShowMentorModal(false);
                            }}
                          >
                            Select as My Mentor
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            className="flex-1"
                            disabled
                          >
                            Call Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                {enrollment.suggestedMentors && enrollment.suggestedMentors.length > 0 ? (
                  enrollment.suggestedMentors.map((mentor) => {
                    const hasCall = hasBookedCall(mentor.id);
                    const hasCompleted = hasCompletedCall(mentor.id);
                    const callInfo = enrollment.bookedCalls?.find(c => c.mentorId === mentor.id);

                    return (
                      <div
                        key={mentor.id}
                        className="p-4 rounded-lg border border-brintelli-border bg-brintelli-baseAlt"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-brand-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-text">{mentor.name}</h4>
                            {mentor.experience && (
                              <p className="text-sm text-textMuted">{mentor.experience}</p>
                            )}
                            {mentor.bio && (
                              <p className="text-sm text-textSoft mt-2 line-clamp-2">{mentor.bio}</p>
                            )}
                          </div>
                        </div>

                        {hasCall && (
                          <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-700">
                              {callInfo?.status === 'PENDING' && 'Call request sent'}
                              {callInfo?.status === 'SCHEDULED' && callInfo?.scheduledDate && (
                                <>Scheduled: {new Date(callInfo.scheduledDate).toLocaleString()}</>
                              )}
                              {callInfo?.status === 'COMPLETED' && 'Call completed ✓'}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {!hasCall ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleBookCall(mentor.id)}
                              className="flex-1"
                            >
                              Request Call
                            </Button>
                          ) : hasCompleted ? (
                            <Button
                              size="sm"
                              onClick={() => handleSelectMentor(mentor.id)}
                              className="flex-1"
                            >
                              Select Mentor
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled
                              className="flex-1"
                            >
                              Call Pending
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedMentor(mentor);
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-textMuted text-center py-8">No mentors suggested yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Onboarding Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-brintelli-baseAlt">
            <div className="flex items-center gap-3">
              {enrollment.batchConfirmed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium text-text">Batch Confirmed</span>
            </div>
            <span className={`text-sm ${enrollment.batchConfirmed ? 'text-green-600' : 'text-gray-500'}`}>
              {enrollment.batchConfirmed ? 'Complete' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-brintelli-baseAlt">
            <div className="flex items-center gap-3">
              {enrollment.mentorId ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium text-text">Mentor Selected</span>
            </div>
            <span className={`text-sm ${enrollment.mentorId ? 'text-green-600' : 'text-gray-500'}`}>
              {enrollment.mentorId ? 'Complete' : 'Pending'}
            </span>
          </div>
        </div>
        {!isOnboardingComplete && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Please complete both steps to access sessions and assignments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentOnboarding;

