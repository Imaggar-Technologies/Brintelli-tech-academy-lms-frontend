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
  MessageSquare,
  FileText,
  Clock,
  Award
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { studentAPI } from '../../api/student';
import { apiRequest } from '../../api/apiClient';

const MentorSessions = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [selectingMentor, setSelectingMentor] = useState(null);

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
        // Continue without all mentors if this fails
      }

      // If mentor is assigned, find and set current mentor
      if (enrollmentData?.mentorId) {
        // First check in suggested mentors
        const assignedMentor = enrollmentData.suggestedMentors?.find(
          m => m.id === enrollmentData.mentorId
        );
        if (assignedMentor) {
          setCurrentMentor(assignedMentor);
        } else if (allMentorsList.length > 0) {
          // Find in all mentors list
          const mentor = allMentorsList.find(
            m => m.id === enrollmentData.mentorId
          );
          if (mentor) {
            setCurrentMentor(mentor);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = async (mentorId) => {
    try {
      setSelectingMentor(mentorId);
      
      const response = await studentAPI.selectMentor(mentorId);
      
      if (response?.success) {
        toast.success('Mentor selected successfully!');
        // Refresh data
        await fetchData();
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

  // If mentor is assigned, show mentor details
  if (currentMentor) {
    return (
      <>
        <PageHeader
          title="My Mentor"
          description="Your assigned mentor and interaction history"
        />

        <div className="space-y-6">
          {/* Current Mentor Card */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {currentMentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-semibold text-text">{currentMentor.name}</h2>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        Assigned
                      </span>
                    </div>
                    <p className="text-textMuted">{currentMentor.experience}</p>
                  </div>
                </div>

                {currentMentor.bio && (
                  <p className="text-textSoft mb-4">{currentMentor.bio}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {currentMentor.email && (
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <Mail className="h-4 w-4" />
                      <span>{currentMentor.email}</span>
                    </div>
                  )}
                  {currentMentor.phone && (
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <Phone className="h-4 w-4" />
                      <span>{currentMentor.phone}</span>
                    </div>
                  )}
                </div>

                {currentMentor.specialization && currentMentor.specialization.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-textMuted mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentMentor.specialization.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-brand-100 text-brand-700 text-xs font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = '/student/mentors/book'}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book a Session
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // TODO: Navigate to mentor details page with call history, resources, etc.
                      toast.info('Mentor details page coming soon!');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for future sections */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Mentor Interaction History</h3>
            <p className="text-textMuted text-center py-8">
              Call history, discussions, and shared resources will be displayed here.
            </p>
          </div>
        </div>
      </>
    );
  }

  // If no mentor assigned, show suggested mentors and all available mentors
  // Filter out suggested mentors from allMentors to avoid duplication
  const suggestedMentorIds = new Set(suggestedMentors.map(m => m.id));
  const otherMentors = allMentors.filter(m => !suggestedMentorIds.has(m.id));

  return (
    <>
      <PageHeader
        title="Available Mentors"
        description="Browse and select a mentor to guide you through your learning journey"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading mentors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Section - Suggested Mentors */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suggested Mentors Section */}
            {suggestedMentors.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                  <h2 className="text-xl font-semibold text-text">Suggested Mentors</h2>
                  <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                    Recommended by LSM
                  </span>
                </div>
                <p className="text-sm text-textMuted mb-6">
                  These mentors have been suggested by your Learning Success Manager. We recommend selecting one of them.
                </p>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {suggestedMentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor}
                      isSuggested={true}
                      onSelect={handleSelectMentor}
                      isSelecting={selectingMentor === mentor.id}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
                <p className="text-textMuted">No suggested mentors at the moment.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - All Other Available Mentors */}
          <div className="lg:col-span-1">
            {otherMentors.length > 0 ? (
              <div className="sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-textMuted" />
                  <h2 className="text-lg font-semibold text-text">
                    {suggestedMentors.length > 0 ? 'All Other Mentors' : 'Available Mentors'}
                  </h2>
                </div>
                {suggestedMentors.length > 0 && (
                  <p className="text-xs text-textMuted mb-4">
                    Browse all other available mentors for your program.
                  </p>
                )}
                
                {/* List view for other mentors */}
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {otherMentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="rounded-lg border border-brintelli-border bg-brintelli-card p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center text-brand-600 text-sm font-bold flex-shrink-0">
                          {mentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-text truncate">{mentor.name}</h3>
                          {mentor.experience && (
                            <p className="text-xs text-textMuted truncate">{mentor.experience}</p>
                          )}
                        </div>
                      </div>

                      {mentor.bio && (
                        <p className="text-xs text-textSoft mb-3 line-clamp-2">{mentor.bio}</p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-textMuted">
                          <Users className="h-3 w-3" />
                          <span>
                            {mentor.availableSlots || Math.max((mentor.maxStudents || 0) - (mentor.currentStudents || 0), 0)} available
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleSelectMentor(mentor.id)}
                        disabled={selectingMentor === mentor.id || (mentor.availableSlots || 0) === 0}
                      >
                        {selectingMentor === mentor.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                            Selecting...
                          </>
                        ) : (mentor.availableSlots || 0) === 0 ? (
                          'No Slots'
                        ) : (
                          'Select Mentor'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : suggestedMentors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
                <p className="text-textMuted">No mentors available at the moment.</p>
                <p className="text-sm text-textMuted mt-2">
                  Please contact your Learning Success Manager for mentor assignment.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-textMuted">No other mentors available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Mentor Card Component
const MentorCard = ({ mentor, isSuggested, onSelect, isSelecting }) => {
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
          <span className="text-xs font-medium text-brand-700">LSM Suggested</span>
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
        {mentor.phone && (
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <Phone className="h-4 w-4" />
            <span>{mentor.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Users className="h-4 w-4" />
          <span>
            {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>

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

      <Button
        variant={isSuggested ? 'primary' : 'secondary'}
        className="w-full"
        onClick={() => onSelect(mentor.id)}
        disabled={isSelecting || availableSlots === 0}
      >
        {isSelecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Selecting...
          </>
        ) : availableSlots === 0 ? (
          'No Slots Available'
        ) : (
          'Select Mentor'
        )}
      </Button>
    </div>
  );
};

export default MentorSessions;
