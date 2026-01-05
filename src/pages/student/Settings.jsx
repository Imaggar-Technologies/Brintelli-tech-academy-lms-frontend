import { useState } from "react";
import { Bell, Lock, Globe, Moon, Shield } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const StudentSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    assignments: true,
    sessions: true,
    announcements: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: true,
    showPhone: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and privacy settings"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold text-text">Notifications</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
              { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
              { key: "sms", label: "SMS Notifications", desc: "Text message alerts" },
              { key: "assignments", label: "Assignment Reminders", desc: "Get notified about new assignments" },
              { key: "sessions", label: "Session Alerts", desc: "Reminders for upcoming sessions" },
              { key: "announcements", label: "Announcements", desc: "Important announcements from mentors" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3">
                <div>
                  <p className="font-semibold text-text text-sm">{item.label}</p>
                  <p className="text-xs text-textMuted">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={notifications[item.key]}
                    onChange={() => toggleNotification(item.key)}
                  />
                  <div className="h-6 w-11 rounded-full bg-brintelli-baseAlt transition peer-checked:bg-brand-500" />
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold text-text">Privacy</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text">Profile Visibility</label>
              <select
                className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm text-textSoft outline-none focus:border-brand-500"
                value={privacy.profileVisibility}
                onChange={(e) => setPrivacy((prev) => ({ ...prev, profileVisibility: e.target.value }))}
              >
                <option value="public">Public</option>
                <option value="mentors">Mentors Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            {[
              { key: "showEmail", label: "Show Email Address", desc: "Display email on profile" },
              { key: "showPhone", label: "Show Phone Number", desc: "Display phone on profile" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3">
                <div>
                  <p className="font-semibold text-text text-sm">{item.label}</p>
                  <p className="text-xs text-textMuted">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={privacy[item.key]}
                    onChange={() => togglePrivacy(item.key)}
                  />
                  <div className="h-6 w-11 rounded-full bg-brintelli-baseAlt transition peer-checked:bg-brand-500" />
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Account Security */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold text-text">Account Security</h3>
          </div>
          <div className="space-y-4">
            <Button variant="secondary" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Active Sessions
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold text-text">Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text">Language</label>
              <select className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm text-textSoft outline-none focus:border-brand-500">
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text">Time Zone</label>
              <select className="w-full rounded-xl border border-brintelli-border px-4 py-2 text-sm text-textSoft outline-none focus:border-brand-500">
                <option>IST (UTC+5:30)</option>
                <option>UTC</option>
                <option>EST (UTC-5)</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brintelli-border px-4 py-3">
              <div>
                <p className="font-semibold text-text text-sm">Dark Mode</p>
                <p className="text-xs text-textMuted">Switch to dark theme</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-brintelli-baseAlt transition peer-checked:bg-brand-500" />
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentSettings;

