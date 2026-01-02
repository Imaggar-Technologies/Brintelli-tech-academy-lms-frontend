import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Users, 
  CheckCircle2, 
  Star,
  Sparkles,
  Calendar,
  Clock,
  Video,
  X,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import studentAPI from '../../api/student';
import { apiRequest } from '../../api/apiClient';

const MentorConnectorChoose = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [selectingMentor, setSelectingMentor] = useState(null);
  const [revokingMentor, setRevokingMentor] = useState(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollment to get suggested mentors and current mentor
      let enrollmentData = null;
      const enrollmentResponse = await studentAPI.getMyEnrollment();
      if (enrollmentResponse?.success && enrollmentResponse.data?.enrollment) {
        enrollmentData = enrollmentResponse.data.enrollment;
        setEnrollment(enrollmentData);
        setSuggestedMentors(enrollmentData.suggestedMentors || []);
      }

      // Fetch all available mentors
      let allMentorsList = [];
      try {
        const mentorsResponse = await apiRequest('/api/students/mentors');
        if (mentorsResponse?.success) {
          allMentorsList = mentorsResponse.data.mentors || [];
          setAllMentors(allMentorsList);
        }
      } catch (err) {
        console.error('Error fetching all mentors:', err);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCall = async (mentorId) => {
    try {
      const response = await studentAPI.bookMentorCall(mentorId);
      if (response?.success) {
        toast.success('Call request sent! The mentor will schedule a time with you.');
        await fetchData();
      } else {
        throw new Error(response?.message || 'Failed to request call');
      }
    } catch (error) {
      console.error('Error requesting call:', error);
      toast.error(error.message || 'Failed to request call');
    }
  };

  const handleSelectMentor = async (mentorId) => {
    try {
      setSelectingMentor(mentorId);
      
      const response = await studentAPI.selectMentor(mentorId);
      
      if (response?.success) {
        toast.success('Mentor selected successfully!');
        await fetchData();
        // Redirect to my mentor page
        window.location.href = '/student/mentor-connector/my-mentor';
      } else {
        throw new Error(response?.message || 'Failed to select mentor');
      }
    } catch (error) {
      console.error('Error selecting mentor:', error);
      toast.error(error.message || 'Failed to select mentor');
    } finally {
      setSelectingMentor(null);
    }
  };

  const handleRevokeMentor = async () => {
    if (!enrollment?.mentorId) return;
    
    try {
      setRevokingMentor(true);
      const response = await studentAPI.revokeMentor(enrollment.mentorId);
      
      if (response?.success) {
        toast.success('Mentor revoked successfully. You can now choose a new mentor.');
        await fetchData();
      } else {
        throw new Error(response?.message || 'Failed to revoke mentor');
      }
    } catch (error) {
      console.error('Error revoking mentor:', error);
      toast.error(error.message || 'Failed to revoke mentor');
    } finally {
      setRevokingMentor(false);
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

  const getCallInfo = (mentorId) => {
    if (!enrollment?.bookedCalls) return null;
    return enrollment.bookedCalls.find(call => call.mentorId === mentorId);
  };

  // Combine and sort mentors: suggested first, then others
  const suggestedMentorIds = new Set(suggestedMentors.map(m => m.id));
  const otherMentors = allMentors.filter(m => !suggestedMentorIds.has(m.id));
  const allMentorsSorted = [...suggestedMentors, ...otherMentors];

  if (loading) {
    return (
      <>
        <PageHeader
          title="Choose Your Mentor"
          description="Request calls with mentors, join the calls, and select the one that fits you best"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading mentors...</p>
        </div>
      </>
    );
  }

  // If mentor is already selected, show option to revoke
  if (enrollment?.mentorId) {
    const currentMentor = allMentorsSorted.find(m => m.id === enrollment.mentorId) || 
                         suggestedMentors.find(m => m.id === enrollment.mentorId);
    
    return (
      <>
        <PageHeader
          title="Choose Your Mentor"
          description="You have already selected a mentor. You can revoke and choose a different one."
        />
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Current Mentor</h3>
              <p className="text-sm text-textMuted mt-1">
                {currentMentor ? currentMentor.name : 'Mentor ID: ' + enrollment.mentorId}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleRevokeMentor}
              disabled={revokingMentor}
            >
              {revokingMentor ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Revoking...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revoke & Choose Another
                </>
              )}
            </Button>
          </div>
          {currentMentor && (
            <div className="mt-4 p-4 bg-brintelli-baseAlt rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center text-brand-600 text-lg font-bold flex-shrink-0">
                  {currentMentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text">{currentMentor.name}</h4>
                  {currentMentor.experience && (
                    <p className="text-sm text-textMuted">{currentMentor.experience}</p>
                  )}
                  {currentMentor.bio && (
                    <p className="text-sm text-textSoft mt-2">{currentMentor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Choose Your Mentor"
        description="Request calls with mentors, join the calls, and select the one that fits you best"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading mentors...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Suggested Mentors Section */}
          {suggestedMentors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <h2 className="text-xl font-semibold text-text">Suggested Mentors</h2>
                <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-textMuted mb-6">
                These mentors have been suggested for you. We recommend starting with them.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {suggestedMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    isSuggested={true}
                    enrollment={enrollment}
                    hasBookedCall={hasBookedCall(mentor.id)}
                    hasCompletedCall={hasCompletedCall(mentor.id)}
                    callInfo={getCallInfo(mentor.id)}
                    onRequestCall={handleRequestCall}
                    onSelect={handleSelectMentor}
                    onViewProfile={() => {
                      setSelectedMentor(mentor);
                      setShowMentorModal(true);
                    }}
                    isSelecting={selectingMentor === mentor.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Other Mentors Section */}
          {otherMentors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-textMuted" />
                <h2 className="text-xl font-semibold text-text">
                  {suggestedMentors.length > 0 ? 'All Other Mentors' : 'Available Mentors'}
                </h2>
              </div>
              {suggestedMentors.length > 0 && (
                <p className="text-sm text-textMuted mb-6">
                  Browse all other available mentors for your program.
                </p>
              )}
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    isSuggested={false}
                    enrollment={enrollment}
                    hasBookedCall={hasBookedCall(mentor.id)}
                    hasCompletedCall={hasCompletedCall(mentor.id)}
                    callInfo={getCallInfo(mentor.id)}
                    onRequestCall={handleRequestCall}
                    onSelect={handleSelectMentor}
                    onViewProfile={() => {
                      setSelectedMentor(mentor);
                      setShowMentorModal(true);
                    }}
                    isSelecting={selectingMentor === mentor.id}
                  />
                ))}
              </div>
            </div>
          )}

          {allMentorsSorted.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">No mentors available at the moment.</p>
              <p className="text-sm text-textMuted mt-2">
                Please contact your Learning Success Manager for mentor assignment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mentor Profile Modal */}
      {showMentorModal && selectedMentor && (
        <MentorModal
          mentor={selectedMentor}
          isSuggested={suggestedMentors.some(m => m.id === selectedMentor.id)}
          enrollment={enrollment}
          hasBookedCall={hasBookedCall(selectedMentor.id)}
          hasCompletedCall={hasCompletedCall(selectedMentor.id)}
          callInfo={getCallInfo(selectedMentor.id)}
          onRequestCall={handleRequestCall}
          onSelect={handleSelectMentor}
          onClose={() => {
            setShowMentorModal(false);
            setSelectedMentor(null);
          }}
          isSelecting={selectingMentor === selectedMentor.id}
        />
      )}
    </>
  );
};

// Mentor Card Component
const MentorCard = ({ 
  mentor, 
  isSuggested, 
  enrollment,
  hasBookedCall,
  hasCompletedCall,
  callInfo,
  onRequestCall,
  onSelect,
  onViewProfile,
  isSelecting 
}) => {
  const availableSlots = mentor.availableSlots || 
    Math.max((mentor.maxStudents || 0) - (mentor.currentStudents || 0), 0);

  return (
    <div
      className={`rounded-2xl border p-6 shadow-soft transition hover:shadow-md ${
        isSuggested
          ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-accent-50'
          : 'border-brintelli-border bg-brintelli-card'
      }`}
    >
      {isSuggested && (
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-medium text-brand-700">Suggested</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
            isSuggested
              ? 'bg-gradient-to-br from-brand-500 to-accent-500'
              : 'bg-gradient-to-br from-brand-500/20 to-accent-500/20 text-brand-600'
          }`}>
            {mentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">{mentor.name}</h3>
            <p className="text-sm text-textMuted">{mentor.experience}</p>
          </div>
        </div>
      </div>

      {mentor.bio && (
        <p className="text-sm text-textSoft mb-4 line-clamp-3">{mentor.bio}</p>
      )}

      <div className="space-y-2 mb-4">
        {mentor.email && (
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <Mail className="h-4 w-4" />
            <span className="truncate">{mentor.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Users className="h-4 w-4" />
          <span>
            {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>

      {/* Call Status */}
      {hasBookedCall && callInfo && (
        <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2 text-xs text-blue-700 mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">
              {callInfo.status === 'PENDING' && 'Call request sent'}
              {callInfo.status === 'SCHEDULED' && callInfo.scheduledDate && (
                <>Scheduled: {new Date(callInfo.scheduledDate).toLocaleString()}</>
              )}
              {callInfo.status === 'COMPLETED' && 'Call completed ✓'}
            </span>
          </div>
          {callInfo.meetingLink && (
            <a
              href={callInfo.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline flex items-center gap-1 mt-1"
            >
              <Video className="h-3 w-3" />
              Join Call
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {mentor.specialization && mentor.specialization.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-textMuted mb-2">Specializations:</p>
          <div className="flex flex-wrap gap-2">
            {mentor.specialization.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 rounded-lg text-xs ${
                  isSuggested
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-brintelli-baseAlt text-textSoft'
                }`}
              >
                {spec}
              </span>
            ))}
            {mentor.specialization.length > 3 && (
              <span className="px-2 py-1 rounded-lg bg-brintelli-baseAlt text-textSoft text-xs">
                +{mentor.specialization.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!hasBookedCall ? (
          <Button
            variant={isSuggested ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => onRequestCall(mentor.id)}
            disabled={availableSlots === 0}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Request Call
          </Button>
        ) : hasCompletedCall ? (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onSelect(mentor.id)}
            disabled={isSelecting || availableSlots === 0}
          >
            {isSelecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Selecting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Select Mentor
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="flex-1"
            disabled
          >
            <Clock className="h-4 w-4 mr-2" />
            Call Pending
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewProfile}
        >
          View
        </Button>
      </div>
    </div>
  );
};

// Mentor Modal Component
const MentorModal = ({ 
  mentor, 
  isSuggested,
  enrollment,
  hasBookedCall,
  hasCompletedCall,
  callInfo,
  onRequestCall,
  onSelect,
  onClose,
  isSelecting 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Mentor Profile</h3>
          <button
            onClick={onClose}
            className="text-textMuted hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center text-brand-600 text-2xl font-bold flex-shrink-0">
              {mentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-semibold text-text">{mentor.name}</h4>
                {isSuggested && (
                  <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                    Suggested
                  </span>
                )}
              </div>
              {mentor.experience && (
                <p className="text-sm text-textMuted">{mentor.experience}</p>
              )}
            </div>
          </div>

          {mentor.bio && (
            <div>
              <h5 className="font-semibold text-text mb-2">About</h5>
              <p className="text-sm text-textSoft">{mentor.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {mentor.email && (
              <div>
                <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-sm text-text">{mentor.email}</p>
              </div>
            )}
            {mentor.phone && (
              <div>
                <div className="flex items-center gap-2 text-sm text-textMuted mb-1">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Phone</span>
                </div>
                <p className="text-sm text-text">{mentor.phone}</p>
              </div>
            )}
          </div>

          {mentor.specialization && mentor.specialization.length > 0 && (
            <div>
              <h5 className="font-semibold text-text mb-2">Specializations</h5>
              <div className="flex flex-wrap gap-2">
                {mentor.specialization.map((spec, idx) => (
                  <span key={idx} className="px-2 py-1 bg-brand-500/10 text-brand-600 rounded text-xs">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Call Status */}
          <div className="pt-4 border-t border-brintelli-border">
            {hasBookedCall && callInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-700 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Call Status</span>
                </div>
                <p className="text-sm text-blue-600">
                  {callInfo.status === 'PENDING' && 'Call request sent. Waiting for mentor to schedule.'}
                  {callInfo.status === 'SCHEDULED' && callInfo.scheduledDate && (
                    <>Scheduled for: {new Date(callInfo.scheduledDate).toLocaleString()}</>
                  )}
                  {callInfo.status === 'COMPLETED' && 'Call completed. You can now select this mentor.'}
                </p>
                {callInfo.meetingLink && (
                  <a
                    href={callInfo.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline flex items-center gap-1 mt-2"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!hasBookedCall ? (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    onRequestCall(mentor.id);
                    onClose();
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Call
                </Button>
              ) : hasCompletedCall ? (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    onSelect(mentor.id);
                    onClose();
                  }}
                  disabled={isSelecting}
                >
                  {isSelecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Selecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Select as My Mentor
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Call Pending
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorConnectorChoose;

