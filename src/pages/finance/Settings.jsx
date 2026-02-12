import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Settings, Bell, Lock, Shield, Save, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';

const FinanceSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      paymentAlerts: true,
      dueReminders: true,
      refundRequests: true,
      weeklyReports: true,
    },
    privacy: {
      showProfile: true,
      allowDirectMessages: true,
    },
    preferences: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: 'en',
      currency: 'INR',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await financeAPI.getSettings();
      // if (response.success) {
      //   setSettings(response.data.settings || settings);
      // }
      
      // For now, load from localStorage if available
      const savedSettings = localStorage.getItem('financeSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error('Error parsing saved settings:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await financeAPI.updateSettings(settings);
      // if (response.success) {
      //   toast.success('Settings saved successfully');
      // } else {
      //   toast.error(response.message || 'Failed to save settings');
      // }
      
      // For now, save to localStorage
      localStorage.setItem('financeSettings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updatePreference = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your finance account settings and preferences"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Email Notifications</span>
                  <p className="text-sm text-textMuted">Receive email updates about financial activities</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateNotificationSetting('emailNotifications', e.target.checked)}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Payment Alerts</span>
                  <p className="text-sm text-textMuted">Get notified when payments are received</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.paymentAlerts}
                  onChange={(e) => updateNotificationSetting('paymentAlerts', e.target.checked)}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Due Reminders</span>
                  <p className="text-sm text-textMuted">Reminders for overdue payments</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.dueReminders}
                  onChange={(e) => updateNotificationSetting('dueReminders', e.target.checked)}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Refund Requests</span>
                  <p className="text-sm text-textMuted">Notifications for new refund requests</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.refundRequests}
                  onChange={(e) => updateNotificationSetting('refundRequests', e.target.checked)}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Weekly Reports</span>
                  <p className="text-sm text-textMuted">Receive weekly financial summary reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyReports}
                  onChange={(e) => updateNotificationSetting('weeklyReports', e.target.checked)}
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Show Profile</span>
                  <p className="text-sm text-textMuted">Allow others to view your finance profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.showProfile}
                  onChange={(e) => updatePrivacySetting('showProfile', e.target.checked)}
                  className="rounded"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-text font-medium">Allow Direct Messages</span>
                  <p className="text-sm text-textMuted">Let students send you direct messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.allowDirectMessages}
                  onChange={(e) => updatePrivacySetting('allowDirectMessages', e.target.checked)}
                  className="rounded"
                />
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Timezone
                </label>
                <select
                  value={settings.preferences.timezone}
                  onChange={(e) => updatePreference('timezone', e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Language
                </label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => updatePreference('language', e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Currency
                </label>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => updatePreference('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Password Management</p>
                    <p className="text-sm text-amber-700 mt-1">
                      To change your password, please contact the administrator or use the account settings in your user profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FinanceSettings;


