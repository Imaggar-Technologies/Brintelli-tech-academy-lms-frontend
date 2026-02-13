import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, Briefcase, FileText, MapPin, Target, Mail, Phone, Star, Edit2, Settings } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
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
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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

