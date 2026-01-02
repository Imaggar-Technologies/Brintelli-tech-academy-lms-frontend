import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Video,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Clock,
  ExternalLink,
  Download,
  BookOpen,
  CheckCircle2,
  X,
  RotateCcw
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import studentAPI from '../../api/student';
import { apiRequest } from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

const MentorConnectorMyMentor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [promisedResources, setPromisedResources] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollment to get current mentor
      const enrollmentResponse = await studentAPI.getMyEnrollment();
      if (enrollmentResponse?.success && enrollmentResponse.data?.enrollment) {
        const enrollmentData = enrollmentResponse.data.enrollment;
        setEnrollment(enrollmentData);
        
        if (enrollmentData.mentorId) {
          // Fetch mentor details
          try {
            const mentorsResponse = await apiRequest('/api/students/mentors');
            if (mentorsResponse?.success) {
              const mentor = mentorsResponse.data.mentors?.find(
                m => m.id === enrollmentData.mentorId
              );
              if (mentor) {
                setCurrentMentor(mentor);
              }
            }
          } catch (err) {
            console.error('Error fetching mentor:', err);
          }

          // Fetch mentor sessions
          await fetchMentorSessions(enrollmentData.mentorId);
          
          // Fetch resources, notes, and promised resources
          await fetchMentorData(enrollmentData.mentorId);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorSessions = async (mentorId) => {
    try {
      // Fetch all sessions and filter for mentor sessions
      const response = await studentAPI.getMySessions();
      if (response.success) {
        // Filter sessions that are related to this mentor
        // This might need to be adjusted based on your data structure
        const mentorSessions = (response.data.sessions || []).filter(session => {
          // You may need to adjust this filter based on your session structure
          return session.mentorId === mentorId || session.type === 'MENTOR_SESSION';
        });
        setSessions(mentorSessions);
      }
    } catch (error) {
      console.error('Error fetching mentor sessions:', error);
    }
  };

  const fetchMentorData = async (mentorId) => {
    try {
      // Fetch resources shared by mentor
      // This endpoint might need to be created
      const resourcesResponse = await apiRequest(`/api/students/mentors/${mentorId}/resources`);
      if (resourcesResponse?.success) {
        setResources(resourcesResponse.data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }

    try {
      // Fetch notes from conversations
      const notesResponse = await apiRequest(`/api/students/mentors/${mentorId}/notes`);
      if (notesResponse?.success) {
        setNotes(notesResponse.data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }

    try {
      // Fetch promised resources
      const promisedResponse = await apiRequest(`/api/students/mentors/${mentorId}/promised-resources`);
      if (promisedResponse?.success) {
        setPromisedResources(promisedResponse.data.promisedResources || []);
      }
    } catch (error) {
      console.error('Error fetching promised resources:', error);
    }
  };

  const handleBookSession = async () => {
    try {
      // Navigate to book session page or open booking modal
      // This might need to be adjusted based on your booking flow
      toast.info('Booking session...');
      // You can implement a booking modal or navigate to a booking page
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error(error.message || 'Failed to book session');
    }
  };

  const handleRevokeMentor = async () => {
    if (!enrollment?.mentorId) return;
    
    if (!window.confirm('Are you sure you want to revoke this mentor? You will need to choose a new one.')) {
      return;
    }
    
    try {
      const response = await studentAPI.revokeMentor(enrollment.mentorId);
      
      if (response?.success) {
        toast.success('Mentor revoked successfully.');
        navigate('/student/mentor-connector/choose');
      } else {
        throw new Error(response?.message || 'Failed to revoke mentor');
      }
    } catch (error) {
      console.error('Error revoking mentor:', error);
      toast.error(error.message || 'Failed to revoke mentor');
    }
  };

  const formatSessionTime = (scheduledDate, duration) => {
    if (!scheduledDate) return 'Not scheduled';
    const date = new Date(scheduledDate);
    const startTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    if (duration) {
      const endDate = new Date(date.getTime() + duration * 60000);
      const endTime = endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="My Mentor"
          description="Your mentor and all your interactions"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading mentor data...</p>
        </div>
      </>
    );
  }

  if (!enrollment?.mentorId || !currentMentor) {
    return (
      <>
        <PageHeader
          title="My Mentor"
          description="You haven't selected a mentor yet"
        />
        <div className="text-center py-12">
          <User className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">You need to choose a mentor first.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/student/mentor-connector/choose')}
          >
            Choose a Mentor
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My Mentor"
        description="Your mentor and all your interactions"
        actions={
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleBookSession}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book a Session
            </Button>
            <Button
              variant="secondary"
              onClick={handleRevokeMentor}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Revoke Mentor
            </Button>
          </div>
        }
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
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Sessions</h3>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id || session._id}
                  className="p-4 border border-brintelli-border rounded-lg hover:bg-brintelli-baseAlt transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text mb-1">
                        {session.name || 'Mentor Session'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-textMuted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatSessionTime(session.scheduledDate, session.duration)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          session.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status || 'SCHEDULED'}
                        </span>
                      </div>
                    </div>
                    {session.meetingLink && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (session.status === 'ONGOING' || session.status === 'SCHEDULED') {
                            navigate(`/student/sessions/${session.id}/live`);
                          } else {
                            window.open(session.meetingLink, '_blank');
                          }
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        {session.status === 'ONGOING' ? 'Join' : 'View'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4 opacity-50" />
              <p className="text-textMuted">No sessions scheduled yet.</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={handleBookSession}
              >
                Book Your First Session
              </Button>
            </div>
          )}
        </div>

        {/* Resources Section */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Shared Resources</h3>
          {resources.length > 0 ? (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id || resource._id}
                  className="p-4 border border-brintelli-border rounded-lg hover:bg-brintelli-baseAlt transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {resource.type === 'LINK' ? (
                      <LinkIcon className="h-5 w-5 text-brand-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-brand-600" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-text">{resource.title || 'Resource'}</h4>
                      {resource.description && (
                        <p className="text-sm text-textMuted">{resource.description}</p>
                      )}
                      {resource.createdAt && (
                        <p className="text-xs text-textMuted mt-1">
                          Shared on {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-textMuted mx-auto mb-4 opacity-50" />
              <p className="text-textMuted">No resources shared yet.</p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Conversation Notes</h3>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id || note._id}
                  className="p-4 border border-brintelli-border rounded-lg bg-brintelli-baseAlt"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <MessageSquare className="h-5 w-5 text-brand-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-text">{note.content || note.note}</p>
                      {note.createdAt && (
                        <p className="text-xs text-textMuted mt-2">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-textMuted mx-auto mb-4 opacity-50" />
              <p className="text-textMuted">No notes from conversations yet.</p>
            </div>
          )}
        </div>

        {/* Promised Resources Section */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">Promised Resources</h3>
          {promisedResources.length > 0 ? (
            <div className="space-y-3">
              {promisedResources.map((promised) => (
                <div
                  key={promised.id || promised._id}
                  className="p-4 border border-brintelli-border rounded-lg hover:bg-brintelli-baseAlt transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {promised.delivered ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-text flex items-center gap-2">
                        {promised.title || 'Resource'}
                        {promised.delivered && (
                          <span className="text-xs text-green-600">(Delivered)</span>
                        )}
                      </h4>
                      {promised.description && (
                        <p className="text-sm text-textMuted">{promised.description}</p>
                      )}
                      {promised.promisedDate && (
                        <p className="text-xs text-textMuted mt-1">
                          Promised on {new Date(promised.promisedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {promised.delivered && promised.resourceUrl && (
                    <a
                      href={promised.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-textMuted mx-auto mb-4 opacity-50" />
              <p className="text-textMuted">No promised resources yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MentorConnectorMyMentor;

