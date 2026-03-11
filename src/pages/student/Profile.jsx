import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Briefcase,
  FileText,
  MapPin,
  Mail,
  Phone,
  Edit2,
  Flame,
  GraduationCap,
  Linkedin,
  Github,
  Instagram,
  AlertCircle,
  User,
  Monitor,
  Coins,
  BookOpen,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import PhoneInput from '../../components/PhoneInput';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import Tooltip from '../../components/Tooltip';
import { selectCurrentUser, updateUser as updateUserInStore } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import apiRequest from '../../api/apiClient';

/** Points per profile field (must match backend UserController.PROFILE_POINTS) */
const PROFILE_POINTS = {
  fullName: 10,
  phone: 10,
  address: 5,
  bio: 15,
  profileImageUrl: 20,
  college: 15,
  degree: 10,
  department: 10,
  yearOfEducation: 10,
  areaOfInterest: 10,
  goal: 10,
  linkedin: 5,
  github: 5,
  instagram: 5,
  google: 5,
};

const TAB_PROFILE = 'profile';
const TAB_ACTIVITY = 'activity';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_PROFILE);
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
        const res = await apiRequest('/api/users/me');
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
        setError(e?.message || 'Failed to load profile');
        toast.error(e?.message || 'Failed to load profile');
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
      const res = await apiRequest('/api/users/me', {
        method: 'PUT',
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
      const pointsAdded = res?.data?.pointsAdded;
      setProfile(user);
      setIsEditing(false);
      if (user) {
        dispatch(
          updateUserInStore({
            fullName: user.fullName,
            phone: user.phone,
            address: user.address,
            bio: user.bio,
            profileCompleted: user.profileCompleted,
          })
        );
      }
      if (pointsAdded > 0) {
        toast.success(`Profile updated. You earned ${pointsAdded} points!`);
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (e) {
      setError(e?.message || 'Failed to update profile');
      toast.error(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const user = profile || authUser;
  const displayName = user?.fullName || user?.name || 'Student';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || '';
  const displayAddress = user?.address || '';
  const avatarUrl = user?.profileImageUrl || user?.avatarUrl || null;
  const streak = user?.streak != null ? Number(user.streak) : 0;
  const brintelliPoints = user?.brintelliPoints != null ? Number(user.brintelliPoints) : 0;
  const profilePointsAwarded = user?.profilePointsAwarded && typeof user.profilePointsAwarded === 'object' ? user.profilePointsAwarded : {};

  const hasValue = (field) => {
    const v = user?.[field];
    return v != null && String(v).trim() !== '';
  };
  const earnedFor = (field) => !!profilePointsAwarded[field];
  const pointsFor = (field) => PROFILE_POINTS[field] ?? 0;
  const canEarn = (field) => !hasValue(field) && pointsFor(field) > 0;

  // Profile completion progress (for progress bar)
  const profileProgress = (() => {
    const fields = Object.keys(PROFILE_POINTS);
    let filled = 0;
    let pointsRemaining = 0;
    for (const field of fields) {
      if (hasValue(field)) filled += 1;
      else pointsRemaining += pointsFor(field);
    }
    const total = fields.length;
    const percent = total ? Math.round((filled / total) * 100) : 100;
    return { filled, total, percent, pointsRemaining };
  })();

  const renderPointHint = (field, label) => {
    if (hasValue(field)) {
      const pts = pointsFor(field);
      const earned = earnedFor(field);
      return pts > 0 ? (
        <span className="text-xs text-emerald-600 ml-1">
          {earned ? `+${pts} pts earned` : `+${pts} pts`}
        </span>
      ) : null;
    }
    const pts = pointsFor(field);
    if (pts <= 0) return null;
    return (
      <span className="text-xs text-amber-600 ml-1">Earn {pts} pts by adding {label}</span>
    );
  };

  return (
    <>
      <PageHeader
        title="User Profile"
        description="Student Profile • Brintelli Tech Academy"
      />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && profile && (
        <div className="mb-4 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="font-semibold text-amber-900">
                  {profileProgress.percent === 100
                    ? 'Profile complete'
                    : 'Complete your profile to earn more points'}
                </p>
                <span className="text-sm font-medium text-amber-800">
                  {profileProgress.filled} of {profileProgress.total} fields
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-amber-200/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${profileProgress.percent}%` }}
                />
              </div>
              <p className="text-sm text-amber-800 mt-2">
                {profileProgress.pointsRemaining > 0 ? (
                  <>
                    <span className="font-medium">Earn up to {profileProgress.pointsRemaining} more points</span>
                    {' '}by filling in name, phone, college, degree, department, year, area of interest, goal, bio, address, and social links.
                  </>
                ) : (
                  <>All set! You’ve earned all profile points.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-textMuted">Loading profile...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner + Avatar + Name + Stats (MatDash style) */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card overflow-hidden shadow-soft">
            <div
              className="h-32 sm:h-40 relative"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a855f7 70%, #7c3aed 100%)',
                backgroundSize: 'cover',
              }}
            >
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
            </div>
            <div className="px-4 sm:px-6 pb-4 -mt-12 sm:-mt-14 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <div className="w-24 h-24 rounded-full border-4 border-brintelli-card bg-brintelli-baseAlt shadow-lg overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 text-2xl font-bold">
                        {(displayName || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-xl font-bold text-text">{displayName}</h1>
                    <p className="text-sm text-textMuted">Learner</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                  <Tooltip
                    placement="bottom"
                    content={
                      <>
                        <p className="font-semibold text-text mb-1">Brintelli points</p>
                        <p className="text-textMuted text-xs mb-1">
                          Earned from profile completion, quizzes, workshops, reporting bugs, and engagement.
                        </p>
                        <p className="text-textSoft text-xs font-medium">Benefits: Unlock rewards, climb leaderboards, and get recognized for your progress.</p>
                      </>
                    }
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 cursor-help">
                      <Coins className="h-5 w-5 text-amber-500" />
                      <span className="font-semibold text-text">{brintelliPoints}</span>
                      <span className="text-sm text-textMuted">Points</span>
                    </div>
                  </Tooltip>
                  <Tooltip
                    placement="bottom"
                    content={
                      <>
                        <p className="font-semibold text-text mb-1">Login streak</p>
                        <p className="text-textMuted text-xs mb-1">
                          Consecutive days you’ve logged in. Log in every day to keep your streak going.
                        </p>
                        <p className="text-textSoft text-xs font-medium">Benefits: Stay on track, build a learning habit, and get recognized for consistency.</p>
                      </>
                    }
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 cursor-help">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-text">{streak}</span>
                      <span className="text-sm text-textMuted">Day Streak</span>
                    </div>
                  </Tooltip>
                  <Tooltip
                    placement="bottom"
                    content={
                      <>
                        <p className="font-semibold text-text mb-1">Programs</p>
                        <p className="text-textMuted text-xs mb-1">
                          Number of programs you’re enrolled in.
                        </p>
                        <p className="text-textSoft text-xs font-medium">Benefits: Access live sessions, mentors, and content for your enrolled programs.</p>
                      </>
                    }
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 cursor-help">
                      <BookOpen className="h-5 w-5 text-brand-500" />
                      <span className="font-semibold text-text">—</span>
                      <span className="text-sm text-textMuted">Programs</span>
                    </div>
                  </Tooltip>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={loading || saving}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    {isEditing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-brintelli-border px-4 sm:px-6">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab(TAB_PROFILE)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === TAB_PROFILE
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-textMuted hover:text-text'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(TAB_ACTIVITY)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === TAB_ACTIVITY
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-textMuted hover:text-text'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Activity
                </button>
              </div>
            </div>
          </div>

          {activeTab === TAB_PROFILE && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              {/* Left: Introduction + Contact details with points */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-text mb-3">Introduction</h3>
                  {isEditing ? (
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us a bit about yourself..."
                        className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      {renderPointHint('bio', 'bio')}
                    </div>
                  ) : (
                    <>
                      <p className="text-textSoft text-sm leading-relaxed">
                        {user?.bio?.trim() || 'Add a short bio to introduce yourself.'}
                      </p>
                      {renderPointHint('bio', 'bio')}
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-brand-500" />
                    Details
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex flex-wrap items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <span className="text-textSoft">
                        {isEditing ? (
                          <>
                            <span className="font-semibold text-text">Education:</span>
                            <input
                              type="text"
                              value={editData.college}
                              onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                              placeholder="College name"
                              className="ml-1 flex-1 min-w-[120px] px-2 py-1 border border-brintelli-border rounded bg-brintelli-baseAlt text-text"
                            />
                            {renderPointHint('college', 'college')}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-text">Education:</span>
                            {user?.college || '—'}
                            {renderPointHint('college', 'college')}
                          </>
                        )}
                      </span>
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <Mail className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <span className="text-textSoft">
                        <span className="font-semibold text-text">Email:</span> {displayEmail || '—'}
                      </span>
                    </li>
                    {isEditing ? (
                      <>
                        <li className="flex flex-wrap items-center gap-2">
                          <Phone className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          <PhoneInput
                            value={editData.phone}
                            onChange={(v) => setEditData({ ...editData, phone: v })}
                            placeholder="Phone"
                            className="flex-1 min-w-[140px]"
                          />
                          {renderPointHint('phone', 'phone')}
                        </li>
                        <li className="flex flex-wrap items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={editData.address}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                            placeholder="Location"
                            className="flex-1 min-w-[140px] px-2 py-1 border border-brintelli-border rounded bg-brintelli-baseAlt text-text text-sm"
                          />
                          {renderPointHint('address', 'address')}
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex flex-wrap items-center gap-2">
                          <Phone className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          <span className="text-textSoft">
                            <span className="font-semibold text-text">Phone:</span> {displayPhone || '—'}
                            {renderPointHint('phone', 'phone')}
                          </span>
                        </li>
                        <li className="flex flex-wrap items-center gap-2">
                          <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
                          <span className="text-textSoft">
                            <span className="font-semibold text-text">Location:</span> {displayAddress || '—'}
                            {renderPointHint('address', 'address')}
                          </span>
                        </li>
                      </>
                    )}
                    <li className="flex flex-wrap items-center gap-2">
                      <Monitor className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <span className="text-textSoft">
                        {isEditing ? (
                          <>
                            <span className="font-semibold text-text">LinkedIn:</span>
                            <input
                              type="text"
                              value={editData.linkedin}
                              onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                              placeholder="Profile URL"
                              className="ml-1 flex-1 min-w-[120px] px-2 py-1 border border-brintelli-border rounded bg-brintelli-baseAlt text-text text-sm"
                            />
                            {renderPointHint('linkedin', 'LinkedIn')}
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-text">Website / LinkedIn:</span>
                            {user?.linkedin || '—'}
                            {renderPointHint('linkedin', 'LinkedIn')}
                          </>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Education & Career block */}
                <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-text flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-brand-500" />
                    Education & Career
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">Goal</label>
                          <input
                            type="text"
                            value={editData.goal}
                            onChange={(e) => setEditData({ ...editData, goal: e.target.value })}
                            placeholder="e.g. Placements, Higher studies"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('goal', 'goal')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">College</label>
                          <input
                            type="text"
                            value={editData.college}
                            onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                            placeholder="College name"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('college', 'college')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">Degree</label>
                          <input
                            type="text"
                            value={editData.degree}
                            onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                            placeholder="e.g. B.Tech, MCA"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('degree', 'degree')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">Department</label>
                          <input
                            type="text"
                            value={editData.department}
                            onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                            placeholder="e.g. CSE, ECE"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('department', 'department')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">Year of education</label>
                          <input
                            type="text"
                            value={editData.yearOfEducation}
                            onChange={(e) => setEditData({ ...editData, yearOfEducation: e.target.value })}
                            placeholder="e.g. 2nd year"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('yearOfEducation', 'year')}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-text mb-1">Area of interest</label>
                          <input
                            type="text"
                            value={editData.areaOfInterest}
                            onChange={(e) => setEditData({ ...editData, areaOfInterest: e.target.value })}
                            placeholder="e.g. Web development, DSA, AI/ML"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('areaOfInterest', 'area of interest')}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-text mb-1">Full Name</label>
                          <input
                            type="text"
                            value={editData.fullName}
                            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('fullName', 'name')}
                        </div>
                      </>
                    ) : (
                      <>
                        {user?.goal && (
                          <p>
                            <span className="font-semibold text-text">Goal:</span>{' '}
                            <span className="text-textSoft">{user.goal}</span>
                            {renderPointHint('goal', 'goal')}
                          </p>
                        )}
                        {user?.degree && (
                          <p>
                            <span className="font-semibold text-text">Degree:</span>{' '}
                            <span className="text-textSoft">{user.degree}</span>
                            {renderPointHint('degree', 'degree')}
                          </p>
                        )}
                        {user?.department && (
                          <p>
                            <span className="font-semibold text-text">Department:</span>{' '}
                            <span className="text-textSoft">{user.department}</span>
                            {renderPointHint('department', 'department')}
                          </p>
                        )}
                        {user?.yearOfEducation && (
                          <p>
                            <span className="font-semibold text-text">Year:</span>{' '}
                            <span className="text-textSoft">{user.yearOfEducation}</span>
                            {renderPointHint('yearOfEducation', 'year')}
                          </p>
                        )}
                        {user?.areaOfInterest && (
                          <p className="md:col-span-2">
                            <span className="font-semibold text-text">Area of interest:</span>{' '}
                            <span className="text-textSoft">{user.areaOfInterest}</span>
                            {renderPointHint('areaOfInterest', 'area of interest')}
                          </p>
                        )}
                        {!user?.goal && !user?.college && !user?.degree && !user?.department && !user?.yearOfEducation && !user?.areaOfInterest && (
                          <p className="text-textMuted text-sm md:col-span-2">
                            Add education and career details to earn points.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Social links */}
                <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-text mb-4">Social & Links</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">Instagram</label>
                          <input
                            type="text"
                            value={editData.instagram}
                            onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                            placeholder="Username or URL"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('instagram', 'Instagram')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">GitHub</label>
                          <input
                            type="text"
                            value={editData.github}
                            onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                            placeholder="Username or URL"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('github', 'GitHub')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">LinkedIn</label>
                          <input
                            type="text"
                            value={editData.linkedin}
                            onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                            placeholder="Profile URL"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('linkedin', 'LinkedIn')}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text mb-1">Google / Other</label>
                          <input
                            type="text"
                            value={editData.google}
                            onChange={(e) => setEditData({ ...editData, google: e.target.value })}
                            placeholder="Email or link"
                            className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          />
                          {renderPointHint('google', 'Google')}
                        </div>
                      </>
                    ) : (
                      <>
                        {(user?.instagram || user?.github || user?.linkedin || user?.google) ? (
                          <>
                            {user?.instagram && (
                              <p className="inline-flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-brand-500" />
                                <span className="text-textSoft">{user.instagram}</span>
                                {renderPointHint('instagram', 'Instagram')}
                              </p>
                            )}
                            {user?.github && (
                              <p className="inline-flex items-center gap-2">
                                <Github className="h-4 w-4 text-brand-500" />
                                <span className="text-textSoft">{user.github}</span>
                                {renderPointHint('github', 'GitHub')}
                              </p>
                            )}
                            {user?.linkedin && (
                              <p className="inline-flex items-center gap-2">
                                <Linkedin className="h-4 w-4 text-brand-500" />
                                <span className="text-textSoft">{user.linkedin}</span>
                                {renderPointHint('linkedin', 'LinkedIn')}
                              </p>
                            )}
                            {user?.google && (
                              <p className="inline-flex items-center gap-2 text-textSoft">
                                {user.google}
                                {renderPointHint('google', 'Google')}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-textMuted text-sm md:col-span-2">
                            Add social links to earn up to 5 pts each.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Activity */}
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                <h3 className="text-lg font-semibold text-text mb-1">Activity</h3>
                <p className="text-sm text-textMuted mb-4">
                  Your contributions over the last year (logins, workshops, certificates).
                </p>
                <ActivityHeatmap />
              </div>
            </div>
          )}

          {activeTab === TAB_ACTIVITY && (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-text mb-1">Activity</h3>
              <p className="text-sm text-textMuted mb-4">
                Your contributions over the last year (logins, workshops, certificates).
              </p>
              <ActivityHeatmap />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentProfile;
