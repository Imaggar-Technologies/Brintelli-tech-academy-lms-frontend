import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Layers3, Users, Calendar, FileText, ArrowRight, TrendingUp, CheckCircle2, Clock, Plus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import StatsCard from "../../components/StatsCard";
import programAPI from "../../api/program";
import lsmAPI from "../../api/lsm";
import toast from "react-hot-toast";

/**
 * PROGRAM MANAGER DASHBOARD
 * 
 * Overview dashboard for program managers
 * Shows KPIs, recent programs, batches, and quick actions
 * 
 * RBAC: program_manager role
 */
const ProgramManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalModules: 0,
    totalLearningObjectives: 0,
    collectiveDuration: 0,
    totalBatches: 0,
    activeBatches: 0,
    totalAssignments: 0,
    totalSessions: 0,
  });
  const [recentPrograms, setRecentPrograms] = useState([]);
  const [recentBatches, setRecentBatches] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [programsResponse, batchesResponse] = await Promise.all([
        programAPI.getAllPrograms().catch(err => {
          console.error('Error fetching programs:', err);
          return { success: false, data: { programs: [] } };
        }),
        lsmAPI.getAllBatches({}).catch(err => {
          console.error('Error fetching batches:', err);
          return { success: false, data: { batches: [] } };
        }),
      ]);

      // Process programs data
      if (programsResponse.success && programsResponse.data.programs) {
        const programs = programsResponse.data.programs;
        setStats(prev => ({ ...prev, totalPrograms: programs.length }));

        // Fetch modules for each program to get total modules count
        let totalModules = 0;
        let totalLearningObjectives = 0;
        let collectiveDuration = 0;
        let totalSessions = 0;
        let totalAssignments = 0;

        const modulePromises = programs.map(async (program) => {
          try {
            const modulesRes = await programAPI.getModulesByProgram(program.id || program._id).catch(() => null);
            if (modulesRes?.success && modulesRes.data?.modules) {
              const modules = modulesRes.data.modules;
              totalModules += modules.length;

              // Calculate learning objectives and duration
              modules.forEach(module => {
                if (module.objectives && Array.isArray(module.objectives)) {
                  totalLearningObjectives += module.objectives.length;
                }
                if (module.duration) {
                  collectiveDuration += parseFloat(module.duration) || 0;
                }
              });

              // Fetch sessions and assignments for each module
              const sessionPromises = modules.map(async (module) => {
                try {
                  const [sessionsRes, assignmentsRes] = await Promise.all([
                    programAPI.getSessionsByModule(module.id || module._id).catch(() => null),
                    programAPI.getAssignmentsByModule(module.id || module._id).catch(() => null),
                  ]);
                  
                  if (sessionsRes?.success && sessionsRes.data?.sessions) {
                    totalSessions += sessionsRes.data.sessions.length;
                  }
                  if (assignmentsRes?.success && assignmentsRes.data?.assignments) {
                    totalAssignments += assignmentsRes.data.assignments.length;
                  }
                } catch (err) {
                  console.error('Error fetching module details:', err);
                }
              });

              await Promise.all(sessionPromises);
            }
          } catch (err) {
            console.error('Error fetching modules:', err);
          }
        });

        await Promise.all(modulePromises);

        setStats(prev => ({
          ...prev,
          totalModules,
          totalLearningObjectives,
          collectiveDuration,
          totalSessions,
          totalAssignments,
        }));

        // Get recent 5 programs
        const recent = programs
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0);
            const dateB = new Date(b.createdAt || b.created_at || 0);
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentPrograms(recent);
      }

      // Process batches data
      if (batchesResponse.success && batchesResponse.data.batches) {
        const batches = batchesResponse.data.batches;
        setStats(prev => ({
          ...prev,
          totalBatches: batches.length,
          activeBatches: batches.filter(b => b.status === 'ACTIVE').length,
        }));

        // Get recent 5 batches
        const recent = batches
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0);
            const dateB = new Date(b.createdAt || b.created_at || 0);
            return dateB - dateA;
          })
          .slice(0, 5);
        setRecentBatches(recent);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <PageHeader
        title="Program Manager Dashboard"
        description="Overview of programs, batches, and academic operations"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/program-manager/programs')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Program
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <StatsCard
              icon={Layers3}
              value={stats.totalPrograms}
              label="Total Programs"
              trend="Active programs"
            />
            <StatsCard
              icon={BookOpen}
              value={stats.totalModules}
              label="Total Modules"
              trend="Across all programs"
            />
            <StatsCard
              icon={FileText}
              value={stats.totalLearningObjectives}
              label="Learning Objectives"
              trend="Total objectives"
            />
            <StatsCard
              icon={Clock}
              value={`${stats.collectiveDuration.toFixed(1)}h`}
              label="Collective Duration"
              trend="Total hours"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mb-6">
            <StatsCard
              icon={Users}
              value={stats.totalBatches}
              label="Total Batches"
              trend={`${stats.activeBatches} active`}
            />
            <StatsCard
              icon={CheckCircle2}
              value={stats.activeBatches}
              label="Active Batches"
              trend="Currently running"
            />
            <StatsCard
              icon={Calendar}
              value={stats.totalSessions}
              label="Total Sessions"
              trend="Scheduled sessions"
            />
          </div>

          {/* Quick Actions and Recent Items */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            {/* Recent Programs */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Recent Programs</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/program-manager/programs')}
                  className="gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentPrograms.length === 0 ? (
                  <div className="text-center py-8 text-textMuted">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No programs yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/program-manager/programs')}
                      className="mt-2"
                    >
                      Create First Program
                    </Button>
                  </div>
                ) : (
                  recentPrograms.map((program) => (
                    <div
                      key={program.id || program._id}
                      className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4 hover:bg-brintelli-base transition cursor-pointer"
                      onClick={() => navigate(`/program-manager/modules/${program.id || program._id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-text">{program.name}</p>
                          <p className="text-xs text-textMuted mt-1">
                            Created {formatDate(program.createdAt || program.created_at)}
                          </p>
                          {program.description && (
                            <p className="text-sm text-textSoft mt-2 line-clamp-2">
                              {program.description}
                            </p>
                          )}
                        </div>
                        <Layers3 className="h-5 w-5 text-brand flex-shrink-0 ml-3" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Batches */}
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Recent Batches</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/program-manager/batches')}
                  className="gap-1"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentBatches.length === 0 ? (
                  <div className="text-center py-8 text-textMuted">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No batches yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/program-manager/batches/create')}
                      className="mt-2"
                    >
                      Create First Batch
                    </Button>
                  </div>
                ) : (
                  recentBatches.map((batch) => (
                    <div
                      key={batch.id || batch._id}
                      className="rounded-xl border border-brintelli-border bg-brintelli-baseAlt p-4 hover:bg-brintelli-base transition cursor-pointer"
                      onClick={() => navigate(`/program-manager/batches/${batch.id || batch._id}/sessions`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-text">{batch.name || batch.batchName}</p>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(batch.status)}`}
                            >
                              {batch.status || 'ACTIVE'}
                            </span>
                          </div>
                          <p className="text-xs text-textMuted">
                            Created {formatDate(batch.createdAt || batch.created_at)}
                          </p>
                          {batch.startDate && (
                            <p className="text-sm text-textSoft mt-2">
                              Starts: {formatDate(batch.startDate)}
                            </p>
                          )}
                        </div>
                        <Users className="h-5 w-5 text-brand flex-shrink-0 ml-3" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center p-4 h-auto gap-2 hover:bg-brintelli-baseAlt"
                onClick={() => navigate('/program-manager/programs')}
              >
                <Layers3 className="h-6 w-6 text-brand" />
                <span className="text-sm font-semibold">Manage Programs</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center p-4 h-auto gap-2 hover:bg-brintelli-baseAlt"
                onClick={() => navigate('/program-manager/batches/create')}
              >
                <Plus className="h-6 w-6 text-brand" />
                <span className="text-sm font-semibold">Create Batch</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center p-4 h-auto gap-2 hover:bg-brintelli-baseAlt"
                onClick={() => navigate('/program-manager/curriculum')}
              >
                <BookOpen className="h-6 w-6 text-brand" />
                <span className="text-sm font-semibold">Curriculum Builder</span>
              </Button>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center p-4 h-auto gap-2 hover:bg-brintelli-baseAlt"
                onClick={() => navigate('/program-manager/batches')}
              >
                <Calendar className="h-6 w-6 text-brand" />
                <span className="text-sm font-semibold">View Batches</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProgramManagerDashboard;

