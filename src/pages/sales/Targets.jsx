import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { TrendingUp, Target, Calendar, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * TARGETS PAGE
 * 
 * WORKFLOW: Target setting and tracking based on batches
 * 
 * RBAC: Sales Lead and Head (requires sales:lead:view or sales:head:view)
 * 
 * ABAC (Attribute-Based Access Control):
 * - Sales Lead: Targets set by Head for their team
 * - Sales Head: Set targets for Leads, view department targets
 * 
 * BUSINESS LOGIC:
 * - Targets are set based on batches created by Program Manager
 * - Sales Head sets targets for Sales Leads
 * - Sales Lead views their team's targets
 * - Track progress against targets
 */

const Targets = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalTarget: 0,
    achieved: 0,
    remaining: 0,
    progress: 0,
  });

  const isSalesLead = currentUser?.role === 'sales_lead';
  const isSalesHead = currentUser?.role === 'sales_head' || currentUser?.role === 'sales_admin';

  // Fetch targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        // TODO: Implement API call to fetch targets
        // const response = await targetsAPI.getTargets();
        
        // Placeholder data
        const mockTargets = [
          {
            id: 1,
            batchName: "Full Stack Development - Batch 1",
            targetLeads: 50,
            achievedLeads: 32,
            targetDeals: 20,
            achievedDeals: 12,
            deadline: "2024-12-31",
            status: "on_track",
          },
          {
            id: 2,
            batchName: "Data Science - Batch 2",
            targetLeads: 40,
            achievedLeads: 28,
            targetDeals: 15,
            achievedDeals: 10,
            deadline: "2024-12-31",
            status: "on_track",
          },
        ];
        
        setTargets(mockTargets);
        
        // Calculate metrics
        const totalTarget = mockTargets.reduce((sum, t) => sum + t.targetDeals, 0);
        const achieved = mockTargets.reduce((sum, t) => sum + t.achievedDeals, 0);
        setMetrics({
          totalTarget,
          achieved,
          remaining: totalTarget - achieved,
          progress: totalTarget > 0 ? ((achieved / totalTarget) * 100).toFixed(1) : 0,
        });
      } catch (error) {
        console.error('Error fetching targets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [isSalesLead, isSalesHead]);

  return (
    <>
      <PageHeader
        title={isSalesHead ? "Set & Manage Targets" : "Team Targets"}
        description={
          isSalesHead
            ? "Set targets for Sales Leads based on batches. Track department performance."
            : "View targets set for your team. Track progress and performance."
        }
        actions={
          isSalesHead && (
            <Button className="gap-2">
              <Target className="h-4 w-4" />
              Set New Target
            </Button>
          )
        }
      />

      {/* Metrics */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <StatsCard 
          icon={Target} 
          value={metrics.totalTarget} 
          label="Total Target" 
          trend="Deals" 
        />
        <StatsCard 
          icon={CheckCircle} 
          value={metrics.achieved} 
          label="Achieved" 
          trend="Deals" 
        />
        <StatsCard 
          icon={AlertCircle} 
          value={metrics.remaining} 
          label="Remaining" 
          trend="Deals" 
        />
        <StatsCard 
          icon={TrendingUp} 
          value={`${metrics.progress}%`} 
          label="Progress" 
          trend="Completion" 
        />
      </div>

      {/* Targets List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-textMuted">Loading targets...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {targets.length === 0 ? (
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
              <Target className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">No targets set</p>
            </div>
          ) : (
            targets.map((target) => {
              const leadProgress = (target.achievedLeads / target.targetLeads) * 100;
              const dealProgress = (target.achievedDeals / target.targetDeals) * 100;
              
              return (
                <div
                  key={target.id}
                  className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text mb-2">{target.batchName}</h3>
                      <div className="flex items-center gap-2 text-sm text-textMuted">
                        <Calendar className="h-4 w-4" />
                        <span>Deadline: {new Date(target.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      target.status === 'on_track' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {target.status === 'on_track' ? 'On Track' : 'At Risk'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Leads Target */}
                    <div className="p-4 rounded-xl bg-brintelli-baseAlt border border-brintelli-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text">Leads Target</span>
                        <span className="text-sm text-textMuted">
                          {target.achievedLeads} / {target.targetLeads}
                        </span>
                      </div>
                      <div className="w-full bg-brintelli-border rounded-full h-2 mb-2">
                        <div
                          className="bg-brand h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(leadProgress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-textMuted">{leadProgress.toFixed(1)}% complete</div>
                    </div>

                    {/* Deals Target */}
                    <div className="p-4 rounded-xl bg-brintelli-baseAlt border border-brintelli-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text">Deals Target</span>
                        <span className="text-sm text-textMuted">
                          {target.achievedDeals} / {target.targetDeals}
                        </span>
                      </div>
                      <div className="w-full bg-brintelli-border rounded-full h-2 mb-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(dealProgress, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-textMuted">{dealProgress.toFixed(1)}% complete</div>
                    </div>
                  </div>

                  {isSalesHead && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-brintelli-border">
                      <Button variant="secondary" size="sm">
                        Edit Target
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
};

export default Targets;

