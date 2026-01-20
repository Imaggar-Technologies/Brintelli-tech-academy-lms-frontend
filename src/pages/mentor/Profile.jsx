import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Settings, User, Mail, Phone, BookOpen, Users, Save, AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import mentorAPI from '../../api/mentor';
import programAPI from '../../api/program';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    experience: '',
    maxStudents: 20,
    specialization: [],
    isActive: true,
  });

  useEffect(() => {
    fetchProfile();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getProfile();
      
      if (response.success && response.data) {
        const mentor = response.data.mentor;
        const mentorStats = response.data.stats;
        
        setProfileData({
          name: mentor.name || '',
          email: mentor.email || '',
          phone: mentor.phone || '',
          bio: mentor.bio || '',
          experience: mentor.experience || '',
          maxStudents: mentor.maxStudents || 20,
          specialization: mentor.specialization || [],
          isActive: mentor.isActive !== false,
        });
        
        setStats(mentorStats);
        
        // If specialization programs are provided, use them to pre-select programs
        if (mentor.specializationPrograms && mentor.specializationPrograms.length > 0) {
          // The specialization array contains program IDs
          // We'll use it as is for the form
        }
      } else {
        // Fallback: Try to get from user context or localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setProfileData(prev => ({
              ...prev,
              name: user.fullName || user.name || '',
              email: user.email || '',
            }));
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      const response = await mentorAPI.updateProfile(profileData);
      
      if (response.success) {
        toast.success('Profile saved successfully');
        // Refresh profile data
        await fetchProfile();
      } else {
        toast.error(response.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialization = (programId) => {
    const programIdStr = String(programId);
    setProfileData(prev => {
      const current = prev.specialization || [];
      const isSelected = current.some(id => String(id) === programIdStr);
      return {
        ...prev,
        specialization: isSelected
          ? current.filter(id => String(id) !== programIdStr)
          : [...current, programId],
      };
    });
  };

  return (
    <>
      <PageHeader
        title="Profile & Settings"
        description="Manage your mentor profile and preferences"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading profile...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textMuted mb-1">Total Mentees</p>
                    <p className="text-3xl font-bold text-brand-600">{stats.totalMentees}</p>
                    <p className="text-xs text-textMuted mt-1">
                      {stats.availableSlots} slots available
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-brand-600 opacity-20" />
                </div>
              </div>
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textMuted mb-1">Pending Meetings</p>
                    <p className="text-3xl font-bold text-amber-600">{stats.pendingMeetings}</p>
                  </div>
                  <Clock className="h-12 w-12 text-amber-600 opacity-20" />
                </div>
              </div>
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textMuted mb-1">Scheduled Meetings</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.scheduledMeetings}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </div>
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-textMuted mb-1">Completed Meetings</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completedMeetings}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
                </div>
              </div>
            </div>
          )}
          {/* Basic Information */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
                  placeholder="Tell us about yourself, your expertise, and your mentoring approach..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  value={profileData.experience}
                  onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g., 10+ years in software development"
                />
              </div>
            </div>
          </div>

          {/* Specialization */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Specialization
            </h3>
            <p className="text-sm text-textMuted mb-4">
              Select the programs you specialize in. Leave empty to mentor any program.
            </p>
            {programs.length === 0 ? (
              <p className="text-sm text-textMuted">Loading programs...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {programs.map((program) => {
                  const programId = program.id || program._id?.toString();
                  const isSelected = profileData.specialization.some(id => String(id) === String(programId));
                  return (
                    <label
                      key={programId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-brintelli-border hover:bg-brintelli-baseAlt'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSpecialization(programId)}
                        className="rounded"
                      />
                      <span className="text-sm text-text">{program.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {profileData.specialization.length === 0 && (
              <p className="text-xs text-textMuted mt-2">
                No specializations selected - you can mentor any program
              </p>
            )}
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Maximum Students <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={profileData.maxStudents}
                  onChange={(e) => setProfileData({ ...profileData, maxStudents: parseInt(e.target.value) || 20 })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-textMuted mt-1">
                  Maximum number of students you can mentor simultaneously
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={profileData.isActive}
                  onChange={(e) => setProfileData({ ...profileData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-text cursor-pointer">
                  Active (available for new mentee assignments)
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              disabled={saving || !profileData.name || !profileData.email}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
      </div>
    </div>
      )}
    </>
  );
};

export default Profile;

