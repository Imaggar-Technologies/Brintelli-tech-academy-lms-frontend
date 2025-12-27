import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, Users, Calendar, ChevronRight, GraduationCap, Clock, TrendingUp, Target, Layers3 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import tutorAPI from '../../api/tutor';
import { useNavigate } from 'react-router-dom';

const TutorCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [moduleOfferings, setModuleOfferings] = useState([]);
  const [programModules, setProgramModules] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchesRes, offeringsRes, programModulesRes] = await Promise.all([
        tutorAPI.getMyBatches(),
        tutorAPI.getMyModuleOfferings(),
        tutorAPI.getMyProgramModules(),
      ]);

      if (batchesRes.success) {
        setBatches(batchesRes.data.batches || []);
      }

      if (offeringsRes.success) {
        setModuleOfferings(offeringsRes.data.moduleOfferings || []);
      }

      if (programModulesRes.success) {
        setProgramModules(programModulesRes.data.programModules || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50';
      case 'UPCOMING':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/50';
      case 'COMPLETED':
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/50';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/50';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="My Courses"
          description="View and manage your assigned courses, batches, and modules."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading courses...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My Courses"
        description="View and manage your assigned courses, batches, and modules."
      />

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-100/50 p-3 text-brand-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">{batches.length}</p>
              <p className="text-sm font-medium text-textMuted">Assigned Batches</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100/50 p-3 text-purple-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">{moduleOfferings.length}</p>
              <p className="text-sm font-medium text-textMuted">Module Assignments</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100/50 p-3 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">
                {batches.filter(b => b.status === 'ACTIVE').length}
              </p>
              <p className="text-sm font-medium text-textMuted">Active Batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm">
        <div className="p-6 border-b border-brintelli-border/60">
          <h3 className="text-xl font-bold text-text">Assigned Batches</h3>
          <p className="mt-1 text-sm text-textMuted">
            Batches where you are assigned as a tutor
          </p>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-100/50 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-lg font-semibold text-text">No batches assigned</p>
            <p className="mt-2 text-sm text-textMuted">
              You'll see batches here once you're assigned to modules by the program manager.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brintelli-border/60">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-6 hover:bg-brand-50/30 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-text">{batch.name}</h4>
                      {batch.code && (
                        <span className="px-2.5 py-1 rounded-lg bg-brand-100/50 text-xs font-bold text-brand-700">
                          {batch.code}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(batch.status)}`}>
                        {batch.status || 'N/A'}
                      </span>
                    </div>
                    
                    {batch.program && (
                      <p className="text-sm text-textMuted mb-3">
                        <GraduationCap className="h-4 w-4 inline mr-1.5" />
                        {batch.program.name}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDate(batch.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>End: {formatDate(batch.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>{batch.modules.length} module{batch.modules.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Modules */}
                    {batch.modules.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-2">
                          Assigned Modules
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {batch.modules.map((module) => (
                            <div
                              key={module.id}
                              className="inline-flex items-center gap-2 rounded-xl border border-brintelli-border/60 bg-white px-3 py-2 text-sm font-medium text-textSoft"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                              <span>{module.name}</span>
                              {module.objectives && module.objectives.length > 0 && (
                                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-purple-100/50 px-2 py-0.5 text-xs font-bold text-purple-700">
                                  <Target className="h-3 w-3" />
                                  {module.objectives.length}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    className="gap-2 ml-4"
                    onClick={() => navigate(`/tutor/schedule?batchId=${batch.id}`)}
                  >
                    View Sessions
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Modules Overview */}
      {programModules.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm">
          <div className="p-6 border-b border-brintelli-border/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text">Program Modules & Learning Objectives</h3>
                <p className="mt-1 text-sm text-textMuted">
                  Complete view of all program modules and their learning objectives
                </p>
              </div>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => navigate('/tutor/curriculum')}
              >
                View Full Curriculum
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-brintelli-border/60">
            {programModules.map((programData) => (
              <div key={programData.program?.id || 'unknown'} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-brand-600 p-2 text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-text">
                      {programData.program?.name || 'Unknown Program'}
                    </h4>
                    <p className="text-xs text-textMuted">
                      {programData.modules.length} modules • {programData.batches.length} batches
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {programData.modules.map((module) => (
                    <div
                      key={module.id}
                      className="rounded-xl border border-brintelli-border/60 bg-gradient-to-br from-white to-brand-50/20 p-4 hover:border-brand-300/60 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-brand-600 mt-0.5" />
                        <h5 className="font-semibold text-text text-sm">{module.name}</h5>
                      </div>
                      {module.description && (
                        <p className="text-xs text-textMuted mb-3 line-clamp-2">{module.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-textMuted">
                        {module.objectives && module.objectives.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className="font-medium">{module.objectives.length} objectives</span>
                          </div>
                        )}
                        {module.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.duration}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module Offerings List */}
      {moduleOfferings.length > 0 && (
        <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm">
          <div className="p-6 border-b border-brintelli-border/60">
            <h3 className="text-xl font-bold text-text">Module Assignments</h3>
            <p className="mt-1 text-sm text-textMuted">
              Detailed view of all your module assignments across batches
            </p>
          </div>
          <div className="divide-y divide-brintelli-border/60">
            {moduleOfferings.map((offering) => (
              <div
                key={offering.id}
                className="p-6 hover:bg-brand-50/30 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-text">
                        {offering.module?.name || 'Unknown Module'}
                      </h4>
                      {offering.module?.objectives && offering.module.objectives.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/50 px-2.5 py-1 text-xs font-bold text-purple-700">
                          <Target className="h-3 w-3" />
                          {offering.module.objectives.length} objectives
                        </span>
                      )}
                    </div>
                    
                    {offering.module?.description && (
                      <p className="text-sm text-textMuted mb-3">{offering.module.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted">
                      {offering.batch && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{offering.batch.name}</span>
                          {offering.batch.code && (
                            <span className="text-xs">({offering.batch.code})</span>
                          )}
                        </div>
                      )}
                      {offering.program && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4" />
                          <span>{offering.program.name}</span>
                        </div>
                      )}
                      {offering.module?.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{offering.module.duration}h</span>
                        </div>
                      )}
                    </div>

                    {/* Learning Objectives Preview */}
                    {offering.module?.objectives && offering.module.objectives.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-brintelli-border/60">
                        <p className="text-xs font-semibold text-textMuted uppercase tracking-wide mb-2">
                          Learning Objectives
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {offering.module.objectives.slice(0, 3).map((objective) => (
                            <div
                              key={objective.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50/50 border border-purple-200/50 px-2.5 py-1.5 text-xs font-medium text-purple-700"
                            >
                              <Target className="h-3 w-3" />
                              <span className="line-clamp-1">{objective.title}</span>
                            </div>
                          ))}
                          {offering.module.objectives.length > 3 && (
                            <span className="inline-flex items-center rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-textMuted">
                              +{offering.module.objectives.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TutorCourses;
