import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, GraduationCap, Layers3, Target, ChevronDown, ChevronRight, Clock, Users, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import tutorAPI from '../../api/tutor';

const TutorCurriculum = () => {
  const [loading, setLoading] = useState(true);
  const [programModules, setProgramModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState(new Set());

  useEffect(() => {
    fetchProgramModules();
  }, []);

  const fetchProgramModules = async () => {
    try {
      setLoading(true);
      const response = await tutorAPI.getMyProgramModules();
      if (response.success) {
        setProgramModules(response.data.programModules || []);
      } else {
        toast.error(response.message || 'Failed to load program modules');
        setProgramModules([]);
      }
    } catch (error) {
      console.error('Error fetching program modules:', error);
      toast.error(error.message || 'Failed to load program modules');
      setProgramModules([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleObjective = (moduleId, objectiveId) => {
    const key = `${moduleId}-${objectiveId}`;
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedObjectives(newExpanded);
  };

  const totalModules = programModules.reduce((sum, program) => sum + program.modules.length, 0);
  const totalObjectives = programModules.reduce(
    (sum, program) => sum + program.modules.reduce((mSum, module) => mSum + (module.objectives?.length || 0), 0),
    0
  );

  if (loading) {
    return (
      <>
        <PageHeader
          title="Curriculum Overview"
          description="View all program modules and learning objectives assigned to you."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading curriculum...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Curriculum Overview"
        description="View all program modules and learning objectives assigned to you."
      />

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-100/50 p-3 text-brand-600">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">{programModules.length}</p>
              <p className="text-sm font-medium text-textMuted">Programs</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100/50 p-3 text-purple-600">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">{totalModules}</p>
              <p className="text-sm font-medium text-textMuted">Modules</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100/50 p-3 text-emerald-600">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">{totalObjectives}</p>
              <p className="text-sm font-medium text-textMuted">Learning Objectives</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100/50 p-3 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-text">
                {programModules.reduce((sum, program) => sum + program.batches.length, 0)}
              </p>
              <p className="text-sm font-medium text-textMuted">Batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Program Modules */}
      {programModules.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-100/50 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-brand-600" />
          </div>
          <p className="text-lg font-semibold text-text">No program modules assigned</p>
          <p className="mt-2 text-sm text-textMuted">
            You'll see program modules here once you're assigned to batches by the program manager.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {programModules.map((programData) => (
            <div
              key={programData.program?.id || 'unknown'}
              className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden"
            >
              {/* Program Header */}
              <div className="bg-gradient-to-r from-brand-50/50 to-purple-50/50 p-6 border-b border-brintelli-border/60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-xl bg-brand-600 p-2 text-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text">
                          {programData.program?.name || 'Unknown Program'}
                        </h3>
                        {programData.program?.description && (
                          <p className="text-sm text-textMuted mt-1">{programData.program.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-textMuted">
                      <div className="flex items-center gap-1.5">
                        <Layers3 className="h-4 w-4" />
                        <span>{programData.modules.length} module{programData.modules.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{programData.batches.length} batch{programData.batches.length !== 1 ? 'es' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="h-4 w-4" />
                        <span>
                          {programData.modules.reduce((sum, m) => sum + (m.objectives?.length || 0), 0)} objectives
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Batches */}
              {programData.batches.length > 0 && (
                <div className="p-4 bg-brintelli-baseAlt/30 border-b border-brintelli-border/60">
                  <div className="flex flex-wrap gap-2">
                    {programData.batches.map((batch) => (
                      <span
                        key={batch.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-brintelli-border/60 px-3 py-1.5 text-xs font-medium text-textSoft"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {batch.name}
                        {batch.code && <span className="text-textMuted">({batch.code})</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modules List */}
              <div className="divide-y divide-brintelli-border/60">
                {programData.modules.map((module) => {
                  const isExpanded = expandedModules.has(module.id);
                  return (
                    <div key={module.id} className="hover:bg-brand-50/20 transition-colors duration-200">
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-brand-50/30 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="rounded-xl bg-brand-100/50 p-2.5 text-brand-600 mt-0.5">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-text">{module.name}</h4>
                              <span className="px-2.5 py-1 rounded-lg bg-brand-100/50 text-xs font-bold text-brand-700">
                                Order: {module.order || 0}
                              </span>
                              {module.status && (
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    module.status === 'ACTIVE'
                                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                                      : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/50'
                                  }`}
                                >
                                  {module.status}
                                </span>
                              )}
                            </div>
                            {module.description && (
                              <p className="text-sm text-textMuted mb-3">{module.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-textMuted">
                              {module.duration && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{module.duration}h duration</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5" />
                                <span>
                                  {module.objectives?.length || 0} learning objective
                                  {module.objectives?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {module.batches && module.batches.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  <span>{module.batches.length} batch{module.batches.length !== 1 ? 'es' : ''}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-textMuted" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-textMuted" />
                          )}
                        </div>
                      </button>

                      {/* Module Details - Learning Objectives */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-0 bg-brintelli-baseAlt/20">
                          {module.objectives && module.objectives.length > 0 ? (
                            <div className="space-y-3 mt-4">
                              <h5 className="text-sm font-bold text-textMuted uppercase tracking-wide mb-3">
                                Learning Objectives
                              </h5>
                              {module.objectives.map((objective) => {
                                const objKey = `${module.id}-${objective.id}`;
                                const isObjExpanded = expandedObjectives.has(objKey);
                                return (
                                  <div
                                    key={objective.id}
                                    className="rounded-xl border border-brintelli-border/60 bg-white p-4 shadow-sm"
                                  >
                                    <button
                                      onClick={() => toggleObjective(module.id, objective.id)}
                                      className="w-full flex items-center justify-between text-left"
                                    >
                                      <div className="flex items-start gap-3 flex-1">
                                        <div className="rounded-lg bg-purple-100/50 p-1.5 text-purple-600 mt-0.5">
                                          <Target className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                          <h6 className="font-semibold text-text">{objective.title}</h6>
                                          {objective.description && (
                                            <p className="text-xs text-textMuted mt-1 line-clamp-2">
                                              {objective.description}
                                            </p>
                                          )}
                                          {objective.minDuration && (
                                            <div className="flex items-center gap-1.5 mt-2 text-xs text-textMuted">
                                              <Clock className="h-3 w-3" />
                                              <span>Min duration: {objective.minDuration} min</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {isObjExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-textMuted ml-2" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-textMuted ml-2" />
                                      )}
                                    </button>
                                    {isObjExpanded && objective.description && (
                                      <div className="mt-3 pt-3 border-t border-brintelli-border/60">
                                        <p className="text-sm text-textSoft">{objective.description}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="mt-4 p-4 rounded-xl border border-dashed border-brintelli-border/60 bg-white text-center">
                              <p className="text-sm text-textMuted">No learning objectives defined for this module</p>
                            </div>
                          )}

                          {/* Batch Information */}
                          {module.batches && module.batches.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-brintelli-border/60">
                              <h5 className="text-sm font-bold text-textMuted uppercase tracking-wide mb-3">
                                Assigned Batches
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {module.batches.map((batch) => (
                                  <span
                                    key={batch.id}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50/50 border border-brand-200/50 px-3 py-1.5 text-xs font-medium text-brand-700"
                                  >
                                    <Users className="h-3.5 w-3.5" />
                                    {batch.name}
                                    {batch.code && <span className="text-brand-600">({batch.code})</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TutorCurriculum;
