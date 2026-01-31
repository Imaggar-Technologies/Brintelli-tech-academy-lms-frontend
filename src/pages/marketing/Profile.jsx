import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, Building2, MapPin, Settings, Award, Shield, Calendar, Edit2, Megaphone, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatsCard from '../../components/StatsCard';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const user = useSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      setEditData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
    // TODO: Fetch marketing stats from API
    setStats({
      activeCampaigns: 0,
      totalLeads: 0,
      conversionRate: 0,
    });
  }, [user]);

  const handleSave = () => {
    // TODO: Implement API call to update marketing profile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'MK';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.fullName || user?.name || 'Marketing User';
  const displayEmail = user?.email || 'marketing@brintelli.com';
  const displayPhone = user?.phone || 'Not provided';
  const displayAddress = user?.address || 'Not provided';

  return (
    <>
      <PageHeader
        title="Profile & Settings"
        description="Manage your marketing profile and preferences"
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
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Settings className="h-4 w-4" />
                Save Changes
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-5 md:grid-cols-3 mb-6">
          <StatsCard
            icon={Megaphone}
            value={stats.activeCampaigns || '—'}
            label="Active Campaigns"
            trend="Running now"
          />
          <StatsCard
            icon={TrendingUp}
            value={stats.totalLeads || '—'}
            label="Total Leads"
            trend="This month"
          />
          <StatsCard
            icon={Award}
            value={stats.conversionRate ? `${stats.conversionRate}%` : '—'}
            label="Conversion Rate"
            trend="Average"
          />
        </div>
      )}

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
                  <p className="text-sm text-textMuted mt-1">Marketing Manager</p>
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
                      className="w-full mt-1 px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                      className="w-full mt-1 px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                      className="w-full mt-1 px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                  <p className="font-semibold text-text mt-1">Marketing Manager</p>
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
                className="w-full px-3 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                onClick={() => {
                  window.location.href = window.location.pathname.replace('/profile', '/campaigns');
                }}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Manage Campaigns
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  toast.info('Password change feature coming soon');
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
