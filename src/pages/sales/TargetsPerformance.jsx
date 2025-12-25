import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BarChart3, TrendingUp, Users, Target, Award, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * TARGETS & PERFORMANCE PAGE
 * 
 * WORKFLOW: Set targets for Sales Leads, review performance
 * 
 * RBAC: Only Sales Head/Admin (requires sales:head:view)
 * 
 * ABAC: Department-wide targets and performance metrics
 * 
 * BUSINESS LOGIC:
 * - Sales Head sets targets for Sales Leads
 * - View department-wide performance
 * - Compare team performance
 * - Analytics and insights
 */

const TargetsPerformance = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalTeams: 0,
    onTrackTeams: 0,
    atRiskTeams: 0,
    avgProgress: 0,
  });

  // Fetch team performance
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        // TODO: Implement API call to fetch team performance
        // const response = await targetsAPI.getTeamPerformance();
        
        // Placeholder data
        const mockTeams = [
          {
            id: 1,
            leadName: "Priya Sharma",
            teamSize: 2,
            targetDeals: 40,
            achievedDeals: 28,
            progress: 70,
            status: "on_track",
          },
          {
            id: 2,
            leadName: "Rajesh Kumar",
            teamSize: 2,
            targetDeals: 35,
            achievedDeals: 22,
            progress: 63,
            status: "on_track",
          },
        ];
        
        setTeams(mockTeams);
        
        // Calculate metrics
        setMetrics({
          totalTeams: mockTeams.length,
          onTrackTeams: mockTeams.filter(t => t.status === 'on_track').length,
          atRiskTeams: mockTeams.filter(t => t.status === 'at_risk').length,
          avgProgress: mockTeams.reduce((sum, t) => sum + t.progress, 0) / mockTeams.length,
        });
      } catch (error) {
        console.error('Error fetching performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  return (
    <>
      <PageHeader
        title="Targets & Performance"
        description="Set targets for Sales Leads and review department-wide performance metrics."
        actions={
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            Set Targets
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatsCard 
          icon={Users} 
          value={metrics.totalTeams} 
          label="Total Teams" 
          trend="Active teams" 
        />
        <StatsCard 
          icon={Award} 
          value={metrics.onTrackTeams} 
          label="On Track" 
          trend="Teams" 
        />
        <StatsCard 
          icon={AlertCircle} 
          value={metrics.atRiskTeams} 
          label="At Risk" 
          trend="Teams" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={`${metrics.avgProgress.toFixed(1)}%`} 
          label="Avg Progress" 
          trend="Department" 
        />
      </div>

      {/* Team Performance Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-textMuted">Loading performance data...</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft overflow-hidden">
          <div>
            <table className="w-full">
              <thead className="bg-brintelli-baseAlt border-b border-brintelli-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Sales Lead</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Team Size</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Target</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Achieved</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-textMuted">
                      No teams found
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => (
                    <tr key={team.id} className="hover:bg-brintelli-baseAlt transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-text">{team.leadName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textMuted">{team.teamSize} agents</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">{team.targetDeals} deals</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">{team.achievedDeals} deals</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-brintelli-border rounded-full h-2">
                            <div
                              className="bg-brand h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(team.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-textMuted">{team.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          team.status === 'on_track' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {team.status === 'on_track' ? 'On Track' : 'At Risk'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TODO: Add charts and graphs for performance visualization */}
      <div className="mt-6 rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Performance Analytics</h3>
        <p className="text-textMuted text-sm">
          TODO: Add performance charts, trends, and insights
        </p>
      </div>
    </>
  );
};

export default TargetsPerformance;

