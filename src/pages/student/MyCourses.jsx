import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  GraduationCap,
  FileText,
  Calendar,
  MoreVertical,
  ArrowRight,
  Download,
  ChevronDown,
  ChevronRight,
  Lock,
  Video,
  Unlock
} from 'lucide-react';
import studentAPI from '../../api/student';

const StudentMyCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'in-progress', 'completed', 'expired'

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyPrograms();
      if (response.success) {
        // Show all programs - use programName from enrollment if program data is incomplete
        const allPrograms = (response.data.programs || []).map(programData => {
          // If program name is missing but enrollment has programName, use it
          if (!programData.program?.name && programData.enrollment?.programName) {
            return {
              ...programData,
              program: {
                ...programData.program,
                name: programData.enrollment.programName,
                id: programData.enrollment.programId || programData.program?.id || programData.enrollmentId,
              }
            };
          }
          return programData;
        }).filter(programData => {
          // Only filter out if there's absolutely no program information
          if (!programData.program && !programData.enrollment?.programName) {
            console.warn('Program without any name found, skipping');
            return false;
          }
          // Ensure we have at least an ID or enrollmentId
          if (!programData.program?.id && !programData.enrollmentId) {
            console.warn('Program without valid ID found, skipping');
            return false;
          }
          return true;
        });
        
        setPrograms(allPrograms);
      } else {
        toast.error(response.message || 'Failed to load programs');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error(error.message || 'Failed to load programs');
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (programData) => {
    if (!programData.modules || programData.modules.length === 0) return 0;
    const completedModules = programData.modules.filter(m => m.status === 'COMPLETED').length;
    return Math.round((completedModules / programData.modules.length) * 100);
  };

  const getSelfLearningProgress = (programData) => {
    // Calculate self-learning progress (watched videos, completed content)
    // This would come from actual tracking data
    return Math.floor(Math.random() * 50) + 30; // Placeholder
  };

  const getSessionsAttended = (programData) => {
    if (!programData.sessions || programData.sessions.length === 0) return 0;
    const attended = programData.sessions.filter(s => 
      s.attendance && s.attendance.includes && s.attendance.length > 0
    ).length;
    return attended;
  };

  const getTotalSessions = (programData) => {
    return programData.sessions?.length || 0;
  };

  const isCertified = (programData) => {
    // Check if all mandatory modules are completed
    if (!programData.modules || programData.modules.length === 0) return false;
    return programData.modules.every(m => m.status === 'COMPLETED');
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


  // Sort modules by order
  const sortModulesByOrder = (modules) => {
    return [...modules].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  };

  const getStatusBadge = (programData) => {
    if (isCertified(programData)) {
      return { text: 'Certified', color: 'bg-green-100 text-green-700', icon: GraduationCap };
    }
    if (programData.enrollment?.status === 'ACTIVE') {
      return { text: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock };
    }
    if (programData.enrollment?.status === 'EXPIRED') {
      return { text: 'Full access expired', color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
    return { text: 'Enrolled', color: 'bg-purple-100 text-purple-700', icon: BookOpen };
  };

  const filteredPrograms = programs.filter(programData => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return !isCertified(programData);
    if (filter === 'completed') return isCertified(programData);
    if (filter === 'expired') return programData.enrollment?.status === 'EXPIRED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading your programs...</p>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">My Learning</h1>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="text-center py-16 rounded-2xl border border-brintelli-border bg-white">
          <BookOpen className="h-20 w-20 text-textMuted mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-semibold text-text mb-3">No programs enrolled yet</h3>
          <p className="text-textMuted mb-6 max-w-md mx-auto">
            {filter === 'all' 
              ? 'You will see your enrolled programs here once you are allocated to a batch. If you have been allocated to a batch, please contact your LSM or complete your onboarding.' 
              : 'No programs match the selected filter.'}
          </p>
          {filter === 'all' && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/student/onboarding')}
                className="px-6 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
              >
                Complete Onboarding
              </button>
              <button
                onClick={() => navigate('/student/sessions')}
                className="px-6 py-2 rounded-xl border border-brintelli-border text-text font-semibold hover:bg-gray-50 transition"
              >
                View Sessions
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">My Learning</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-brintelli-border px-4 py-2 text-sm text-textSoft outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Programs</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Programs List - Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((programData) => {
          const program = programData.program || {};
          const batch = programData.batch;
          const enrollment = programData.enrollment;
          const programName = program.name || enrollment?.programName || 'My Program';
          const progress = calculateProgress(programData);
          const statusBadge = getStatusBadge(programData);
          const StatusIcon = statusBadge.icon;
          const totalModules = (programData.modules || []).length;
          const completedModules = (programData.modules || []).filter(m => m.status === 'COMPLETED').length;
          const totalSessions = (programData.sessions || []).length;

          return (
            <div
              key={programData.enrollmentId}
              className="rounded-2xl border-2 border-brintelli-border bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => navigate(`/student/program/${programData.enrollmentId}`)}
            >
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusBadge.text}
                  </span>
                  {batch && (
                    <span className="text-xs text-textMuted bg-gray-100 px-2 py-1 rounded">
                      {batch.name}
                    </span>
                  )}
                </div>

                {/* Program Name */}
                <h3 className="text-2xl font-bold text-text mb-2 group-hover:text-brand-600 transition">
                  {programName}
                </h3>

                {/* Description */}
                {program.description && (
                  <p className="text-sm text-textMuted line-clamp-2 mb-4">
                    {program.description}
                  </p>
                )}

                {/* Batch Dates */}
                {batch && (
                  <div className="flex items-center gap-4 text-xs text-textMuted mb-4">
                    {batch.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(batch.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {batch.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(batch.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-textMuted mb-1">Modules</div>
                    <div className="text-lg font-bold text-text">
                      {completedModules}/{totalModules}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-textMuted mb-1">Sessions</div>
                    <div className="text-lg font-bold text-text">{totalSessions}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-textMuted mb-2">
                    <span>Progress</span>
                    <span className="font-semibold text-text">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/student/program/${programData.enrollmentId}`);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition flex items-center justify-center gap-2"
                >
                  View Program
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentMyCourses;
