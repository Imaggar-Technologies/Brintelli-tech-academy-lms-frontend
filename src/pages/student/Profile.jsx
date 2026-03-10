import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, Briefcase, FileText, MapPin, Target, Mail, Phone, Star, Edit2, Settings, Flame, Calendar, Trophy, GraduationCap, Linkedin, Github, Instagram, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import PhoneInput from "../../components/PhoneInput";
import ActivityHeatmap from "../../components/ActivityHeatmap";
import { selectCurrentUser, updateUser as updateUserInStore } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import apiRequest from '../../api/apiClient';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    instagram: '',
    github: '',
    linkedin: '',
    google: '',
    goal: '',
    college: '',
    degree: '',
    department: '',
    yearOfEducation: '',
    areaOfInterest: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiRequest("/api/users/me");
        const user = res?.data?.user || null;
        setProfile(user);
        setEditData({
          fullName: user?.fullName || user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: user?.address || '',
          bio: user?.bio || '',
          instagram: user?.instagram || '',
          github: user?.github || '',
          linkedin: user?.linkedin || '',
          google: user?.google || '',
          goal: user?.goal || '',
          college: user?.college || '',
          degree: user?.degree || '',
          department: user?.department || '',
          yearOfEducation: user?.yearOfEducation || '',
          areaOfInterest: user?.areaOfInterest || '',
        });
      } catch (e) {
        setError(e?.message || "Failed to load profile");
        toast.error(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: editData.fullName,
          phone: editData.phone,
          address: editData.address,
          bio: editData.bio,
          instagram: editData.instagram,
          github: editData.github,
          linkedin: editData.linkedin,
          google: editData.google,
          goal: editData.goal,
          college: editData.college,
          degree: editData.degree,
          department: editData.department,
          yearOfEducation: editData.yearOfEducation,
          areaOfInterest: editData.areaOfInterest,
        }),
      });
      const user = res?.data?.user || null;
      setProfile(user);
      setIsEditing(false);

      // Keep redux user in sync (used across app)
      if (user) {
        dispatch(updateUserInStore({
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          bio: user.bio,
          profileCompleted: user.profileCompleted,
        }));
      }
      toast.success('Profile updated successfully');
    } catch (e) {
      setError(e?.message || "Failed to update profile");
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const user = profile || authUser;
  const displayName = user?.fullName || user?.name || 'Student';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || '';
  const displayAddress = user?.address || '';
  const joinedAt = user?.createdAt ? new Date(user.createdAt) : null;
  const streak = user?.streak != null ? Number(user.streak) : 0;
  const totalPoints = user?.totalPoints != null ? Number(user.totalPoints) : 0;

  return (
    <>
      <PageHeader
        title={displayName}
        description="Student Profile • Brintelli Tech Academy"
        actions={
          <Button
            variant={isEditing ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={loading || saving}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Settings className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && profile && profile.profileCompleted === false && (
        <div className="mb-4 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Your profile is not completed</p>
            <p className="text-sm text-amber-800 mt-0.5">Please fill in your name, phone, college, degree, department, year of education, area of interest, and goal to complete your profile. This helps us personalize your learning experience.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-textMuted">Loading profile...</div>
        </div>
      ) : (
        <>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Professional Snapshot</h3>
            <div className="mt-4 flex flex-wrap gap-4 mb-5">
              {joinedAt && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt/50 px-3 py-2 text-sm">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  <span className="text-textSoft">Joined </span>
                  <span className="font-semibold text-text">{joinedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {streak > 0 && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-sky-200/60 bg-sky-50/80 px-3 py-2 text-sm">
                  <Flame className="h-4 w-4 text-sky-500" />
                  <span className="text-sky-700 font-semibold">{streak} day login streak</span>
                </div>
              )}
              {totalPoints > 0 && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2 text-sm">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-800 font-semibold">{totalPoints} total points</span>
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-3 text-sm text-textSoft">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="font-semibold text-text">Name:</span> {displayName}
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-3 text-sm text-textSoft">
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-500" />
                  {displayEmail || 'Not provided'}
                </p>
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Phone</label>
                      <PhoneInput
                        value={editData.phone}
                        onChange={(v) => setEditData({ ...editData, phone: v })}
                        placeholder="e.g. 98765 43210"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Address</label>
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-brand-500" />
                      {displayPhone || 'Not provided'}
                    </p>
                    {displayAddress && (
                      <p className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-500" />
                        {displayAddress}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Education & Career */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-brand-500" /> Education & Career
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Goal</label>
                    <input type="text" value={editData.goal} onChange={(e) => setEditData({ ...editData, goal: e.target.value })} placeholder="e.g. Placements, Higher studies" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">College</label>
                    <input type="text" value={editData.college} onChange={(e) => setEditData({ ...editData, college: e.target.value })} placeholder="College name" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Degree</label>
                    <input type="text" value={editData.degree} onChange={(e) => setEditData({ ...editData, degree: e.target.value })} placeholder="e.g. B.Tech, MCA" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Department</label>
                    <input type="text" value={editData.department} onChange={(e) => setEditData({ ...editData, department: e.target.value })} placeholder="e.g. CSE, ECE" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Year of education</label>
                    <input type="text" value={editData.yearOfEducation} onChange={(e) => setEditData({ ...editData, yearOfEducation: e.target.value })} placeholder="e.g. 2nd year, Final year" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-text mb-1">Area of interest</label>
                    <input type="text" value={editData.areaOfInterest} onChange={(e) => setEditData({ ...editData, areaOfInterest: e.target.value })} placeholder="e.g. Web development, DSA, AI/ML" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </>
              ) : (
                <>
                  {user?.goal && <p><span className="font-semibold text-text">Goal:</span> <span className="text-textSoft">{user.goal}</span></p>}
                  {user?.college && <p><span className="font-semibold text-text">College:</span> <span className="text-textSoft">{user.college}</span></p>}
                  {user?.degree && <p><span className="font-semibold text-text">Degree:</span> <span className="text-textSoft">{user.degree}</span></p>}
                  {user?.department && <p><span className="font-semibold text-text">Department:</span> <span className="text-textSoft">{user.department}</span></p>}
                  {user?.yearOfEducation && <p><span className="font-semibold text-text">Year:</span> <span className="text-textSoft">{user.yearOfEducation}</span></p>}
                  {user?.areaOfInterest && <p className="md:col-span-2"><span className="font-semibold text-text">Area of interest:</span> <span className="text-textSoft">{user.areaOfInterest}</span></p>}
                  {!user?.goal && !user?.college && !user?.degree && !user?.department && !user?.yearOfEducation && !user?.areaOfInterest && (
                    <p className="text-textMuted text-sm md:col-span-2">Add your education and career details by editing your profile.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Social & Links */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text mb-4">Social & Links</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Instagram</label>
                    <input type="text" value={editData.instagram} onChange={(e) => setEditData({ ...editData, instagram: e.target.value })} placeholder="Username or profile URL" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">GitHub</label>
                    <input type="text" value={editData.github} onChange={(e) => setEditData({ ...editData, github: e.target.value })} placeholder="Username or profile URL" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">LinkedIn</label>
                    <input type="text" value={editData.linkedin} onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })} placeholder="Profile URL" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Google / Other</label>
                    <input type="text" value={editData.google} onChange={(e) => setEditData({ ...editData, google: e.target.value })} placeholder="Email or profile link" className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  </div>
                </>
              ) : (
                <>
                  {(user?.instagram || user?.github || user?.linkedin || user?.google) ? (
                    <>
                      {user?.instagram && <p className="inline-flex items-center gap-2"><Instagram className="h-4 w-4 text-brand-500" /> <span className="text-textSoft">{user.instagram}</span></p>}
                      {user?.github && <p className="inline-flex items-center gap-2"><Github className="h-4 w-4 text-brand-500" /> <span className="text-textSoft">{user.github}</span></p>}
                      {user?.linkedin && <p className="inline-flex items-center gap-2"><Linkedin className="h-4 w-4 text-brand-500" /> <span className="text-textSoft">{user.linkedin}</span></p>}
                      {user?.google && <p className="inline-flex items-center gap-2 text-textSoft">{user.google}</p>}
                    </>
                  ) : (
                    <p className="text-textMuted text-sm md:col-span-2">Add your social links by editing your profile.</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text mb-1">Activity</h3>
            <p className="text-sm text-textMuted mb-4">Your contributions over the last year (logins, workshops, certificates, and more).</p>
            <ActivityHeatmap days={365} />
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Learning Highlights</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <StatsCard icon={Star} value="Top 5%" label="DSA Leaderboard" trend="+3 positions" />
              <StatsCard icon={Star} value="4.8 / 5" label="Mentor Feedback" trend="Consistent" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-textSoft">
              <p>
                <span className="font-semibold text-text">Strengths:</span> System design
                trade-offs, architecture diagrams, cross-functional communication.
              </p>
              <p>
                <span className="font-semibold text-text">Areas of focus:</span> Optimize coding
                speed for medium-to-hard DSA problems, ramp up case study documentation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Interview Readiness</h3>
            <div className="mt-4 space-y-3 text-sm text-textSoft">
              <p>
                <span className="font-semibold text-text">Mock Interviews:</span> 5 completed
              </p>
              <p>
                <span className="font-semibold text-text">Placement Status:</span> Ready from Dec 10
              </p>
              <p>
                <span className="font-semibold text-text">Resume:</span> Reviewed · Needs minor edits
              </p>
            </div>
            <Button variant="primary" className="mt-5 w-full justify-center">
              Update Portfolio
            </Button>
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text">Badges & Achievements</h3>
            <div className="mt-4 grid gap-3">
              {["System Design Pro", "DSA Challenger", "Capstone Champion"].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center justify-between rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-3 text-sm font-semibold text-textSoft"
                >
                  {badge}
                  <Star className="h-4 w-4 text-brand-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </>
  );
};

export default StudentProfile;

