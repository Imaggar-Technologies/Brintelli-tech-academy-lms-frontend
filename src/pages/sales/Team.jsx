import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Mail, Phone, UserCheck, RefreshCw, Building2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import { fetchSalesTeam, selectSalesTeam, selectSalesTeamLoading, selectSalesTeamError, selectSalesTeamHierarchy } from "../../store/slices/salesTeamSlice";
import { userAPI } from "../../api/user";
import toast from "react-hot-toast";

const SalesTeam = () => {
  const dispatch = useDispatch();
  const salesTeam = useSelector(selectSalesTeam);
  const loadingTeam = useSelector(selectSalesTeamLoading);
  const teamError = useSelector(selectSalesTeamError);
  const hierarchy = useSelector(selectSalesTeamHierarchy);

  // Fetch sales team on mount
  useEffect(() => {
    dispatch(fetchSalesTeam()).then((result) => {
      if (result.type === 'salesTeam/fetchSalesTeam/fulfilled') {
        console.log('Sales team loaded:', result.payload);
      } else if (result.type === 'salesTeam/fetchSalesTeam/rejected') {
        console.error('Failed to load sales team:', result.error);
      }
    });
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchSalesTeam()).then((result) => {
      if (result.type === 'salesTeam/fetchSalesTeam/fulfilled') {
        toast.success('Team refreshed successfully');
      } else if (result.type === 'salesTeam/fetchSalesTeam/rejected') {
        toast.error(teamError || 'Failed to refresh team');
      }
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'sales_admin':
        return 'bg-purple-100 text-purple-700';
      case 'sales_lead':
        return 'bg-blue-100 text-blue-700';
      case 'sales_agent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'sales_admin':
        return 'Sales Admin';
      case 'sales_lead':
        return 'Sales Lead';
      case 'sales_agent':
        return 'Sales Agent';
      default:
        return role;
    }
  };

  return (
    <>
      <PageHeader
        title="Sales Team"
        description="View and manage your sales team members and hierarchy."
        actions={
          <Button variant="secondary" onClick={handleRefresh} disabled={loadingTeam} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loadingTeam ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {loadingTeam ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-brand" />
          <span className="ml-3 text-textMuted">Loading team...</span>
        </div>
      ) : teamError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800">{teamError}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Team Stats */}
          <div className="grid gap-5 md:grid-cols-3 mb-6">
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{hierarchy.admins.length}</p>
                  <p className="text-sm text-textMuted">Sales Admins</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{hierarchy.leads.length}</p>
                  <p className="text-sm text-textMuted">Sales Leads</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">{hierarchy.agents.length}</p>
                  <p className="text-sm text-textMuted">Sales Agents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team List */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
            <div className="border-b border-brintelli-border p-4">
              <h3 className="text-lg font-semibold text-text">All Team Members ({salesTeam.length})</h3>
            </div>
            <div>
              <table className="w-full">
                <thead className="bg-brintelli-baseAlt">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border">
                  {salesTeam.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-textMuted">
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    salesTeam.map((member) => (
                      <tr key={member.id || member.email} className="transition hover:bg-brintelli-baseAlt">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-text">{member.name || member.fullName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-textMuted" />
                            <p className="text-sm text-textSoft">{member.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {member.managerName ? (
                            <p className="text-sm text-textSoft">{member.managerName}</p>
                          ) : (
                            <span className="text-xs text-textMuted">No manager</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {member.teamName ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-textMuted" />
                              <p className="text-sm text-textSoft">{member.teamName}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-textMuted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            member.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hierarchy View */}
          {hierarchy.admins.length > 0 && (
            <div className="mt-6 rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <h3 className="text-lg font-semibold text-text mb-4">Team Hierarchy</h3>
              <div className="space-y-4">
                {hierarchy.admins.map((admin) => (
                  <div key={admin.id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-text">{admin.name || admin.fullName}</span>
                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Admin</span>
                    </div>
                    {hierarchy.leads.filter(lead => lead.managerId === admin.id).map((lead) => (
                      <div key={lead.id} className="ml-6 border-l-4 border-blue-500 pl-4 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-text">{lead.name || lead.fullName}</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Lead</span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {hierarchy.agents.filter(agent => agent.managerId === lead.id).map((agent) => (
                            <div key={agent.id} className="flex items-center gap-2">
                              <span className="text-sm text-textSoft">{agent.name || agent.fullName}</span>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Agent</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default SalesTeam;

