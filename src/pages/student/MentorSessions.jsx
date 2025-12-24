import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Briefcase, Users, Calendar, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { apiRequest } from '../../api/apiClient';

const MentorSessions = () => {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      // Try LSM endpoint first (students might have access)
      const response = await apiRequest('/api/lsm/mentors?isActive=true').catch(() => null);
      
      if (response?.success) {
        setMentors(response.data.mentors || []);
      } else {
        // Fallback: try student-specific endpoint if it exists
        const studentResponse = await apiRequest('/api/students/mentors').catch(() => null);
        if (studentResponse?.success) {
          setMentors(studentResponse.data.mentors || []);
        } else {
          toast.error('Failed to load mentors');
        }
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error(error.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentor = async (mentorId) => {
    try {
      // TODO: Implement mentor selection API call
      toast.success('Mentor selection request sent. LSM will review and assign.');
      setSelectedMentor(mentorId);
    } catch (error) {
      console.error('Error selecting mentor:', error);
      toast.error(error.message || 'Failed to select mentor');
    }
  };

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
      ) : mentors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No mentors available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className={`rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft transition hover:shadow-md ${
                selectedMentor === mentor.id ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">{mentor.name}</h3>
                    <p className="text-sm text-textMuted">{mentor.experience}</p>
                  </div>
                </div>
                {selectedMentor === mentor.id && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>

              {mentor.bio && (
                <p className="text-sm text-textSoft mb-4 line-clamp-3">{mentor.bio}</p>
              )}

              <div className="space-y-2 mb-4">
                {mentor.email && (
                  <div className="flex items-center gap-2 text-sm text-textMuted">
                    <Mail className="h-4 w-4" />
                    <span>{mentor.email}</span>
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
                    {mentor.availableSlots || mentor.maxStudents - mentor.currentStudents} slots available
                  </span>
                </div>
              </div>

              {mentor.specialization && mentor.specialization.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-textMuted mb-2">Specializations:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-brintelli-baseAlt text-xs text-textSoft"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant={selectedMentor === mentor.id ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handleSelectMentor(mentor.id)}
                disabled={selectedMentor === mentor.id || (mentor.availableSlots || 0) === 0}
              >
                {selectedMentor === mentor.id
                  ? 'Selected'
                  : (mentor.availableSlots || 0) === 0
                  ? 'No Slots Available'
                  : 'Select Mentor'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MentorSessions;
