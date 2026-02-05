import { useEffect, useMemo, useState } from "react";
import { User, Mail, Phone, Settings, Award, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import apiRequest from "../../api/apiClient";
import { selectCurrentUser, updateUser as updateUserInStore } from "../../store/slices/authSlice";

const SalesProfile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiRequest("/api/users/me");
        const user = res?.data?.user || null;
        setProfile(user);
        setForm({
          fullName: user?.fullName || "",
          phone: user?.phone || "",
        });
      } catch (e) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName = useMemo(() => {
    return profile?.fullName || authUser?.fullName || authUser?.email || "Sales User";
  }, [profile, authUser]);

  const email = profile?.email || authUser?.email || "";
  const role = profile?.role || authUser?.role || "sales";

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
        }),
      });
      const user = res?.data?.user || null;
      setProfile(user);
      setEditMode(false);

      // keep redux user in sync (used across app)
      if (user) {
        dispatch(updateUserInStore({ fullName: user.fullName, phone: user.phone }));
      }
    } catch (e) {
      setError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Profile & Settings"
        description="Manage your sales profile and preferences."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => setEditMode((v) => !v)}
              disabled={loading}
            >
              <Settings className="h-4 w-4" />
              {editMode ? "Cancel" : "Edit Profile"}
            </Button>
            {editMode ? (
              <Button className="gap-2" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard 
          icon={Award} 
          value={"—"} 
          label="Deals Won" 
          trend="This quarter" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={"—"} 
          label="Win Rate" 
          trend="+5% improvement" 
        />
        <StatsCard 
          icon={Award} 
          value={"—"} 
          label="Revenue Generated" 
          trend="This year" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={"—"} 
          label="Leads Assigned" 
          trend="Active pipeline" 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Personal Information</h3>
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          {loading ? (
            <div className="text-sm text-textMuted">Loading profile…</div>
          ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Full Name</p>
                {editMode ? (
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-sm text-text outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="font-semibold text-text">{displayName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Email</p>
                <p className="font-semibold text-text">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Phone</p>
                {editMode ? (
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className="mt-1 w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-3 py-2 text-sm text-text outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="+91 98765 43210"
                  />
                ) : (
                  <p className="font-semibold text-text">{profile?.phone || "—"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Role</p>
                <p className="font-semibold text-text">{role}</p>
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Sales Preferences</h3>
          <div className="space-y-4">
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <p className="text-sm font-semibold text-text">Notification Settings</p>
              <p className="mt-1 text-xs text-textMuted">Manage how you receive sales updates</p>
            </div>
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <p className="text-sm font-semibold text-text">Pipeline View</p>
              <p className="mt-1 text-xs text-textMuted">Customize your pipeline display</p>
            </div>
            <div className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4">
              <p className="text-sm font-semibold text-text">Report Preferences</p>
              <p className="mt-1 text-xs text-textMuted">Set default report parameters</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesProfile;