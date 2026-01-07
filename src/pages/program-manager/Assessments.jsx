import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, FileCheck, Eye, Edit2, Trash2, Calendar, Users, TrendingUp, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';

const Assessments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('all');

  useEffect(() => {
    fetchAllAssessments();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchAllAssessments = async () => {
    try {
      setLoading(true);
      
      // Fetch all programs first
      const programsResponse = await programAPI.getAllPrograms();
      if (!programsResponse.success) {
        throw new Error('Failed to fetch programs');
      }

      const allPrograms = programsResponse.data.programs || [];
      const allAssessments = [];

      // Fetch all modules for each program
      for (const program of allPrograms) {
        try {
          const modulesResponse = await programAPI.getModulesByProgram(program.id || program._id);
          if (modulesResponse.success && modulesResponse.data?.modules) {
            const modules = modulesResponse.data.modules;

            // Fetch objectives for each module
            for (const module of modules) {
              try {
                // Get module-level objectives
                const objectivesResponse = await programAPI.getObjectivesByModule(module.id || module._id);
                const objectives = objectivesResponse.success ? (objectivesResponse.data?.objectives || objectivesResponse.data || []) : [];

                // Get sub-module objectives
                if (module.subModules && module.subModules.length > 0) {
                  for (const subModule of module.subModules) {
                    try {
                      const subModuleObjectivesResponse = await programAPI.getSubModuleObjectives(subModule.id || subModule._id);
                      if (subModuleObjectivesResponse.success) {
                        const subModuleObjectives = subModuleObjectivesResponse.data?.objectives || [];
                        objectives.push(...subModuleObjectives);
                      }
                    } catch (err) {
                      console.error(`Error fetching sub-module objectives for ${subModule.id}:`, err);
                    }
                  }
                }

                // Fetch assignments (assessments) for each objective
                for (const objective of objectives) {
                  const objectiveId = objective.id || objective._id;
                  
                  try {
                    const assignmentsResponse = await programAPI.getAssignmentsByObjective(objectiveId);
                    if (assignmentsResponse.success && assignmentsResponse.data?.assignments) {
                      const assignments = assignmentsResponse.data.assignments;
                      assignments.forEach(a => {
                        allAssessments.push({
                          ...a,
                          programId: program.id || program._id,
                          programName: program.name,
                          moduleId: module.id || module._id,
                          moduleName: module.name,
                          objectiveId: objectiveId,
                          objectiveTitle: objective.title || objective.text,
                        });
                      });
                    }
                  } catch (err) {
                    console.error(`Error fetching assignments for objective ${objectiveId}:`, err);
                  }
                }
              } catch (err) {
                console.error(`Error fetching objectives for module ${module.id}:`, err);
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching modules for program ${program.id}:`, err);
        }
      }

      setAssessments(allAssessments);
    } catch (error) {
      console.error('Error fetching all assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssessments = () => {
    let filtered = [...assessments];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.problemStatement?.toLowerCase().includes(term) ||
        item.programName?.toLowerCase().includes(term) ||
        item.moduleName?.toLowerCase().includes(term) ||
        item.objectiveTitle?.toLowerCase().includes(term)
      );
    }

    // Filter by program
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(item => {
        const itemProgramId = String(item.programId || item.program?._id || item.program?.id);
        return itemProgramId === selectedProgram;
      });
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(item => item.difficulty === difficultyFilter);
    }

    return filtered;
  };

  const filteredAssessments = getFilteredAssessments();
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-700';
      case 'ADVANCED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading all assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Assessments"
        description="View and manage all assessments across all programs, modules, and objectives"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchAllAssessments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Assessments</p>
          <p className="text-xl font-bold text-text">{assessments.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Beginner</p>
          <p className="text-xl font-bold text-green-600">
            {assessments.filter(a => a.difficulty === 'BEGINNER').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Intermediate</p>
          <p className="text-xl font-bold text-yellow-600">
            {assessments.filter(a => a.difficulty === 'INTERMEDIATE').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Advanced</p>
          <p className="text-xl font-bold text-red-600">
            {assessments.filter(a => a.difficulty === 'ADVANCED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={selectedProgram}
            onChange={(e) => {
              setSelectedProgram(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Programs</option>
            {programs.map((program) => (
              <option key={program.id || program._id} value={program.id || program._id}>
                {program.name}
              </option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {paginatedAssessments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-textMuted">
              {searchTerm || selectedProgram !== 'all' || difficultyFilter !== 'all'
                ? 'No assessments match your filters.' 
                : 'No assessments found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Name</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Difficulty</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Program</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Module</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Objective</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Max Marks</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Passing Marks</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedAssessments.map((assessment) => (
                    <tr key={assessment.id || assessment._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-text">{assessment.name || 'Untitled'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                          {assessment.difficulty || 'BEGINNER'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-text">{assessment.programName || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-text">{assessment.moduleName || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted line-clamp-1 max-w-xs">{assessment.objectiveTitle || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{assessment.maxMarks || 0}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{assessment.passingMarks || 0}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigate(`/program-manager/programs/${assessment.programId}/modules/${assessment.moduleId}/objectives/${assessment.objectiveId}/content`);
                            }}
                            className="px-2 py-1 text-[10px]"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="border-t border-brintelli-border p-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={filteredAssessments.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Assessments;

