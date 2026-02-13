import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Building2, MapPin, Settings, Shield, Calendar, Edit2, Save } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { selectCurrentUser, updateUser as updateUserInStore } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import apiRequest from '../../api/apiClient';

const FinanceProfile = () => {
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

  const getInitials = (name) => {
    if (!name) return 'FN';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const user = profile || authUser;
  const displayName = user?.fullName || user?.name || 'Finance User';
  const displayEmail = user?.email || 'finance@brintelli.com';
  const displayPhone = user?.phone || 'Not provided';
  const displayAddress = user?.address || 'Not provided';

  return (
    <>
      <PageHeader
        title="Profile & Settings"
        description="Manage your finance profile and preferences"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/finance/settings'}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
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
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
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
        <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(displayName)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text">{displayName}</h3>
                  <p className="text-sm text-textMuted mt-1">Finance Manager</p>
                  {user?.isActive !== undefined && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-textMuted flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-textMuted">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-brintelli-border rounded-lg bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  ) : (
                    <p className="font-semibold text-text mt-1">{displayEmail}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-textMuted flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-textMuted">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-brintelli-border rounded-lg bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  ) : (
                    <p className="font-semibold text-text mt-1">{displayPhone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-textMuted flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-textMuted">Address</p>
                  {isEditing ? (
                    <textarea
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      rows={2}
                      className="w-full mt-1 px-3 py-2 border border-brintelli-border rounded-lg bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  ) : (
                    <p className="font-semibold text-text mt-1">{displayAddress}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-textMuted flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-textMuted">Role</p>
                  <p className="font-semibold text-text mt-1">Finance Manager</p>
                </div>
              </div>

              {user?.id && (
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-textMuted flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-textMuted">User ID</p>
                    <p className="font-mono text-xs text-textMuted mt-1">{user.id}</p>
                  </div>
                </div>
              )}

              {user?.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-textMuted flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-textMuted">Member Since</p>
                    <p className="font-semibold text-text mt-1">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text mb-4">About</h3>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            ) : (
              <p className="text-sm text-textMuted">
                {user?.bio || editData.bio || 'No bio available. Click "Edit Profile" to add one.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textMuted">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.isActive !== false
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user?.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              {user?.emailVerified !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-textMuted">Email Verified</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.emailVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.location.href = '/finance/dashboard'}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.location.href = '/finance/transactions'}
              >
                Transactions
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.location.href = '/finance/refunds'}
              >
                Refunds
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default FinanceProfile;
