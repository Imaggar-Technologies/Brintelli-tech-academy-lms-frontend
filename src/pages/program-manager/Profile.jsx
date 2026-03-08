import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Building2, Settings, Award, Calendar, Edit2, Camera, KeyRound } from 'lucide-react';
import PhoneInput from '../../components/PhoneInput';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatsCard from '../../components/StatsCard';
import { selectCurrentUser, updateUser as updateUserInStore } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import apiRequest from '../../api/apiClient';
import { uploadAPI } from '../../api/upload';

const roleLabelMap = {
  'program-manager': 'Program Manager',
  'student': 'Student',
  'tutor': 'Tutor',
  'lsm': 'Learning Success Manager',
  'mentor': 'Mentor',
  'sales_agent': 'Sales Agent',
  'sales_lead': 'Sales Lead',
  'sales_head': 'Sales Head',
  'sales_admin': 'Sales Admin',
  'finance': 'Finance Manager',
  'marketing': 'Marketing Manager',
  'placement': 'Placement Officer',
  'external-hr': 'External HR',
  'admin': 'Admin',
};

const Profile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profileImageUrl: '',
  });

  const loadProfile = async () => {
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
        profileImageUrl: user?.profileImageUrl || '',
      });
    } catch (e) {
      setError(e?.message || "Failed to load profile");
      toast.error(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
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
          profileImageUrl: editData.profileImageUrl || undefined,
        }),
      });
      const user = res?.data?.user || null;
      setProfile(user);
      setIsEditing(false);
      if (user) {
        dispatch(updateUserInStore({
          fullName: user.fullName,
          phone: user.phone,
          address: user.address,
          bio: user.bio,
          profileImageUrl: user.profileImageUrl,
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setUploadingPhoto(true);
    uploadAPI
      .uploadFile(file, 'avatars')
      .then((result) => {
        if (result?.success && result?.data?.url) {
          setEditData((prev) => ({ ...prev, profileImageUrl: result.data.url }));
          return apiRequest("/api/users/me", {
            method: "PUT",
            body: JSON.stringify({ profileImageUrl: result.data.url }),
          });
        }
        throw new Error(result?.message || 'Upload failed');
      })
      .then((res) => {
        const user = res?.data?.user || null;
        if (user) {
          setProfile(user);
          dispatch(updateUserInStore({ profileImageUrl: user.profileImageUrl }));
        }
        toast.success('Profile picture updated');
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to upload photo');
      })
      .finally(() => {
        setUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const user = profile || authUser;
  const displayName = user?.fullName || user?.name || 'User';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || 'Not provided';
  const displayRole = roleLabelMap[user?.role] || user?.role || 'User';
  const displayAddress = user?.address || 'Not provided';
  const profileImageUrl = editData.profileImageUrl || user?.profileImageUrl || user?.avatarUrl || '';

  return (
    <>
      <PageHeader
        title="Profile & Settings"
        description="Manage your profile, photo, and preferences"
        actions={
          <Button
            variant={isEditing ? 'ghost' : 'secondary'}
            size="sm"
            onClick={() => {
              if (isEditing) handleSave();
              else setIsEditing(true);
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
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile hero card with avatar */}
          <div className="rounded-2xl border border-brintelli-border bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30 p-6 shadow-soft">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <div className="h-28 w-28 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center text-brand-600 text-3xl font-bold shadow-inner ring-2 ring-white">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-70"
                    >
                      <div className="text-center text-white">
                        <Camera className="h-8 w-8 mx-auto mb-1" />
                        <span className="text-xs font-medium">{uploadingPhoto ? 'Uploading...' : 'Change photo'}</span>
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-text">{displayName}</h1>
                <p className="text-brand-600 font-medium mt-0.5">{displayRole}</p>
                <p className="text-sm text-textMuted mt-1">{displayEmail}</p>
                {user?.isActive !== undefined && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-3 ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main: Personal info + About */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-500" />
                  Personal information
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Full name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.fullName}
                        onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                        className="w-full px-3 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="font-medium text-text">{displayName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Email address</label>
                    <p className="font-medium text-text">{displayEmail}</p>
                    <p className="text-xs text-textMuted mt-0.5">Email cannot be changed here</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Phone number</label>
                    {isEditing ? (
                      <PhoneInput
                        value={editData.phone}
                        onChange={(v) => setEditData({ ...editData, phone: v })}
                        placeholder="e.g. 98765 43210"
                        className="w-full"
                      />
                    ) : (
                      <p className="font-medium text-text">{displayPhone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Address</label>
                    {isEditing ? (
                      <textarea
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        placeholder="Street, city, country"
                      />
                    ) : (
                      <p className="font-medium text-text">{displayAddress}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Role</label>
                    <p className="font-medium text-text">{displayRole}</p>
                  </div>
                  {user?.id && (
                    <div>
                      <label className="block text-sm font-medium text-textMuted mb-1">User ID</label>
                      <p className="font-mono text-xs text-textMuted">{user.id}</p>
                    </div>
                  )}
                  {user?.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand-500" />
                  About
                </h2>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself, your role, or interests..."
                    className="w-full px-3 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                ) : (
                  <p className="text-sm text-text leading-relaxed">
                    {user?.bio || editData.bio || 'No bio added yet. Click "Edit Profile" to add a short bio.'}
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-text mb-4">Account status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">Status</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      user?.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user?.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {user?.emailVerified !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-textMuted">Email verified</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.emailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-text mb-4">Quick actions</h2>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-11"
                    onClick={() => {
                      const path = window.location.pathname.replace('/profile', '/settings');
                      if (path !== window.location.pathname) window.location.href = path;
                      else toast.info('Settings page not available');
                    }}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-11"
                    onClick={() => toast.info('Use "Forgot password" on the sign-in page, or contact admin to reset.')}
                  >
                    <KeyRound className="h-4 w-4 shrink-0" />
                    Change password
                  </Button>
                </div>
              </div>

              {user?.role === 'program-manager' && (
                <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-text mb-4">Activity</h2>
                  <div className="space-y-3">
                    <StatsCard icon={Award} value="—" label="Programs" trend="This month" />
                    <StatsCard icon={Award} value="—" label="Modules managed" trend="Active" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
