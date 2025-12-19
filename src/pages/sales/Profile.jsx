import { useState, useEffect } from "react";
import { User, Mail, Phone, Building2, MapPin, Settings, Award, TrendingUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import SalesUserSelector from "../../components/SalesUserSelector";
import { getDefaultUser, salesUsers } from "../../data/users";

const SalesProfile = () => {
  const [selectedUserId, setSelectedUserId] = useState("sales-agent");
  const [currentUser, setCurrentUser] = useState(getDefaultUser("sales-agent"));

  useEffect(() => {
    const user = salesUsers[selectedUserId] || getDefaultUser("sales-agent");
    setCurrentUser(user);
  }, [selectedUserId]);

  return (
    <>
      <PageHeader
        title="Profile & Settings"
        description="Manage your sales profile and preferences."
        actions={
          <div className="flex items-center gap-2">
            <SalesUserSelector
              currentUserId={selectedUserId}
              onUserChange={setSelectedUserId}
            />
            <Button variant="secondary" className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatsCard 
          icon={Award} 
          value={currentUser.stats?.dealsWon || "24"} 
          label="Deals Won" 
          trend="This quarter" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={currentUser.stats?.winRate || "34%"} 
          label="Win Rate" 
          trend="+5% improvement" 
        />
        <StatsCard 
          icon={Award} 
          value={currentUser.stats?.revenueGenerated || "₹2.4M"} 
          label="Revenue Generated" 
          trend="This year" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={currentUser.stats?.leadsAssigned || "45"} 
          label="Leads Assigned" 
          trend="Active pipeline" 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-text mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Full Name</p>
                <p className="font-semibold text-text">{currentUser.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Email</p>
                <p className="font-semibold text-text">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Phone</p>
                <p className="font-semibold text-text">{currentUser.phone || "+91 98765 43210"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-textMuted" />
              <div>
                <p className="text-sm text-textMuted">Department</p>
                <p className="font-semibold text-text">{currentUser.department || "Sales"}</p>
              </div>
            </div>
            {currentUser.title && (
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-textMuted" />
                <div>
                  <p className="text-sm text-textMuted">Title</p>
                  <p className="font-semibold text-text">{currentUser.title}</p>
                </div>
              </div>
            )}
          </div>
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