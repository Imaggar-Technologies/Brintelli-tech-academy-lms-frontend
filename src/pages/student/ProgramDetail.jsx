import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Lock,
  Video,
  ArrowLeft,
  FileText,
  PlayCircle
} from 'lucide-react';
import studentAPI from '../../api/student';

const ProgramDetail = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programData, setProgramData] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());

  useEffect(() => {
    fetchProgramDetails();
  }, [enrollmentId]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyPrograms();
      if (response.success) {
        const program = (response.data.programs || []).find(
          p => p.enrollmentId === enrollmentId
        );
        if (program) {
          setProgramData(program);
        } else {
          toast.error('Program not found');
          navigate('/student/my-courses');
        }
      } else {
        toast.error(response.message || 'Failed to load program');
        navigate('/student/my-courses');
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error(error.message || 'Failed to load program');
      navigate('/student/my-courses');
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by moduleId
  const groupSessionsByModule = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      const moduleId = session.moduleId || 'unassigned';
      if (!grouped[moduleId]) {
        grouped[moduleId] = [];
      }
      grouped[moduleId].push(session);
    });
    return grouped;
  };

  // Check if a module is locked (previous module not completed)
  const isModuleLocked = (module, modules, moduleIndex) => {
    if (moduleIndex === 0) return false; // First module is always unlocked
    if (module.status === 'COMPLETED') return false; // Completed modules are unlocked
    
    // Check if previous module is completed
    const previousModule = modules[moduleIndex - 1];
    return previousModule && previousModule.status !== 'COMPLETED';
  };

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Sort modules by order
  const sortModulesByOrder = (modules) => {
    return [...modules].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="text-center py-12">
        <p className="text-textMuted">Program not found</p>
        <button
          onClick={() => navigate('/student/my-courses')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          Back to Programs
        </button>
      </div>
    );
  }

  const program = programData.program || {};
  const batch = programData.batch;
  const enrollment = programData.enrollment;
  const programName = program.name || enrollment?.programName || 'My Program';
  const sortedModules = sortModulesByOrder(programData.modules || []);
  const sessionsByModule = groupSessionsByModule(programData.sessions || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/student/my-courses')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5 text-textMuted" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text">{programName}</h1>
          {program.description && (
            <p className="text-textMuted mt-1">{program.description}</p>
          )}
        </div>
      </div>

      {/* Batch Info */}
      {batch && (
        <div className="rounded-xl border border-brintelli-border bg-white p-4">
          <div className="flex items-center gap-4 text-sm">
            {batch.name && (
              <span className="text-textMuted">
                <span className="font-semibold">Batch:</span> {batch.name}
              </span>
            )}
            {batch.startDate && (
              <span className="text-textMuted flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Start: {new Date(batch.startDate).toLocaleDateString()}
              </span>
            )}
            {batch.endDate && (
              <span className="text-textMuted flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                End: {new Date(batch.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-text">Modules</h2>
        {sortedModules.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-brintelli-border bg-white">
            <BookOpen className="h-12 w-12 text-textMuted mx-auto mb-3 opacity-50" />
            <p className="text-textMuted">No modules available for this program yet.</p>
          </div>
        ) : (
          sortedModules.map((module, moduleIndex) => {
            const isLocked = isModuleLocked(module, sortedModules, moduleIndex);
            const isModuleExpanded = expandedModules.has(module.id);
            const moduleSessions = sessionsByModule[module.id] || [];
            const completedAssignments = (module.assignments || []).filter(a => a.status === 'COMPLETED').length;
            const totalAssignments = (module.assignments || []).length;
            
            return (
              <div
                key={module.id}
                className="rounded-xl border border-brintelli-border bg-white shadow-sm hover:shadow-md transition-all"
              >
                {/* Module Header */}
                <div 
                  className={`p-6 cursor-pointer hover:bg-gray-50 transition ${
                    isLocked ? 'opacity-60' : ''
                  }`}
                  onClick={() => !isLocked && toggleModule(module.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {isLocked ? (
                        <Lock className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      ) : isModuleExpanded ? (
                        <ChevronDown className="h-6 w-6 text-textMuted flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-textMuted flex-shrink-0" />
                      )}
                      
                      <div className="flex items-center gap-3 flex-1">
                        {module.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <Clock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold text-text ${isLocked ? 'text-gray-400' : ''}`}>
                            {module.name || `Module ${moduleIndex + 1}`}
                            {isLocked && <span className="ml-2 text-sm text-gray-500">(Locked)</span>}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-textMuted mt-1 line-clamp-2">{module.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      {totalAssignments > 0 && (
                        <span className="text-textMuted flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {completedAssignments}/{totalAssignments} assignments
                        </span>
                      )}
                      {moduleSessions.length > 0 && (
                        <span className="text-textMuted flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          {moduleSessions.length} session{moduleSessions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Module Content - Sessions */}
                {isModuleExpanded && !isLocked && (
                  <div className="border-t border-brintelli-border bg-gray-50 px-6 pb-6">
                    {/* Sessions */}
                    {moduleSessions.length > 0 ? (
                      <div className="pt-4">
                        <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Sessions ({moduleSessions.length})
                        </h4>
                        <div className="space-y-2">
                          {moduleSessions.map((session) => {
                            const isUpcoming = session.scheduledDate && new Date(session.scheduledDate) > new Date();
                            const isOngoing = session.status === 'ONGOING';
                            
                            return (
                              <div
                                key={session.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-brintelli-border bg-white hover:bg-gray-50 cursor-pointer transition"
                                onClick={() => {
                                  if (isOngoing || session.meetingLink) {
                                    navigate(`/student/sessions/${session.id}/live`);
                                  } else {
                                    navigate('/student/sessions');
                                  }
                                }}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-text">{session.name || 'Untitled Session'}</span>
                                    {isOngoing && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1">
                                        <PlayCircle className="h-3 w-3" />
                                        LIVE
                                      </span>
                                    )}
                                    {isUpcoming && !isOngoing && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                        Upcoming
                                      </span>
                                    )}
                                    {session.status === 'COMPLETED' && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                        Completed
                                      </span>
                                    )}
                                  </div>
                                  {session.scheduledDate && (
                                    <div className="flex items-center gap-2 text-xs text-textMuted">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(session.scheduledDate).toLocaleString()}</span>
                                      {session.duration && (
                                        <>
                                          <span>•</span>
                                          <Clock className="h-3 w-3" />
                                          <span>{session.duration} mins</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                  {session.description && (
                                    <p className="text-xs text-textMuted mt-1 line-clamp-1">{session.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isOngoing || session.meetingLink) {
                                      navigate(`/student/sessions/${session.id}/live`);
                                    } else {
                                      navigate('/student/sessions');
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition ml-4"
                                >
                                  {isOngoing ? 'Join Now' : session.meetingLink ? 'Join' : 'View'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 text-center py-4 text-textMuted text-sm">
                        No sessions available for this module yet.
                      </div>
                    )}
                    
                    {/* Assignments */}
                    {module.assignments && module.assignments.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-brintelli-border">
                        <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Assignments ({module.assignments.length})
                        </h4>
                        <div className="space-y-2">
                          {module.assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-brintelli-border bg-white hover:bg-gray-50 cursor-pointer transition"
                              onClick={() => navigate('/student/assignments')}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-text">{assignment.name}</span>
                                  {assignment.status === 'COMPLETED' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                                {assignment.type && (
                                  <span className="text-xs text-textMuted">Type: {assignment.type}</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/student/assignments');
                                }}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-text text-sm font-semibold hover:bg-gray-200 transition ml-4"
                              >
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProgramDetail;

