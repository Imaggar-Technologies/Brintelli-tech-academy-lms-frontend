import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, BookOpen, FileCheck, Code, HelpCircle, Eye, Edit2, Trash2, FileIcon, Video, Link2, FileText, Filter } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';
import { apiRequest } from '../../api/apiClient';

const Content = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources'); // 'resources', 'assignments', 'practiceCodes', 'mcqs'
  const [content, setContent] = useState({
    resources: [],
    assignments: [],
    practiceCodes: [],
    mcqs: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('all');

  useEffect(() => {
    fetchAllContent();
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

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      
      // Fetch all programs first
      const programsResponse = await programAPI.getAllPrograms();
      if (!programsResponse.success) {
        throw new Error('Failed to fetch programs');
      }

      const allPrograms = programsResponse.data.programs || [];
      const allResources = [];
      const allAssignments = [];
      const allPracticeCodes = [];
      const allMCQs = [];

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

                // Fetch content for each objective
                for (const objective of objectives) {
                  const objectiveId = objective.id || objective._id;
                  
                  try {
                    const [resourcesRes, assignmentsRes, practiceCodesRes, mcqsRes] = await Promise.all([
                      programAPI.getResourcesByObjective(objectiveId).catch(() => ({ success: false, data: { resources: [] } })),
                      programAPI.getAssignmentsByObjective(objectiveId).catch(() => ({ success: false, data: { assignments: [] } })),
                      programAPI.getPracticeCodesByObjective(objectiveId).catch(() => ({ success: false, data: { practiceCodes: [] } })),
                      programAPI.getMCQsByObjective(objectiveId).catch(() => ({ success: false, data: { mcqs: [] } })),
                    ]);

                    // Add program and module context to each item
                    const resources = (resourcesRes.success && resourcesRes.data?.resources) || [];
                    resources.forEach(r => {
                      allResources.push({
                        ...r,
                        programId: program.id || program._id,
                        programName: program.name,
                        moduleId: module.id || module._id,
                        moduleName: module.name,
                        objectiveId: objectiveId,
                        objectiveTitle: objective.title || objective.text,
                      });
                    });

                    const assignments = (assignmentsRes.success && assignmentsRes.data?.assignments) || [];
                    assignments.forEach(a => {
                      allAssignments.push({
                        ...a,
                        programId: program.id || program._id,
                        programName: program.name,
                        moduleId: module.id || module._id,
                        moduleName: module.name,
                        objectiveId: objectiveId,
                        objectiveTitle: objective.title || objective.text,
                      });
                    });

                    const practiceCodes = (practiceCodesRes.success && practiceCodesRes.data?.practiceCodes) || [];
                    practiceCodes.forEach(pc => {
                      allPracticeCodes.push({
                        ...pc,
                        programId: program.id || program._id,
                        programName: program.name,
                        moduleId: module.id || module._id,
                        moduleName: module.name,
                        objectiveId: objectiveId,
                        objectiveTitle: objective.title || objective.text,
                      });
                    });

                    const mcqs = (mcqsRes.success && mcqsRes.data?.mcqs) || [];
                    mcqs.forEach(mcq => {
                      allMCQs.push({
                        ...mcq,
                        programId: program.id || program._id,
                        programName: program.name,
                        moduleId: module.id || module._id,
                        moduleName: module.name,
                        objectiveId: objectiveId,
                        objectiveTitle: objective.title || objective.text,
                      });
                    });
                  } catch (err) {
                    console.error(`Error fetching content for objective ${objectiveId}:`, err);
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

      setContent({
        resources: allResources,
        assignments: allAssignments,
        practiceCodes: allPracticeCodes,
        mcqs: allMCQs,
      });
    } catch (error) {
      console.error('Error fetching all content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContent = () => {
    const contentKey = activeTab === 'mcqs' ? 'mcqs' : activeTab;
    let filtered = content[contentKey] || [];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        if (activeTab === 'resources') {
          return (
            item.title?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.programName?.toLowerCase().includes(term) ||
            item.moduleName?.toLowerCase().includes(term) ||
            item.objectiveTitle?.toLowerCase().includes(term)
          );
        } else if (activeTab === 'assignments') {
          return (
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.programName?.toLowerCase().includes(term) ||
            item.moduleName?.toLowerCase().includes(term)
          );
        } else if (activeTab === 'practiceCodes') {
          return (
            item.problem?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.programName?.toLowerCase().includes(term) ||
            item.moduleName?.toLowerCase().includes(term)
          );
        } else if (activeTab === 'mcqs') {
          return (
            item.question?.toLowerCase().includes(term) ||
            item.programName?.toLowerCase().includes(term) ||
            item.moduleName?.toLowerCase().includes(term)
          );
        }
        return true;
      });
    }

    // Filter by program
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(item => {
        const itemProgramId = String(item.programId || item.program?._id || item.program?.id);
        return itemProgramId === selectedProgram;
      });
    }

    // Filter by content type (for resources)
    if (activeTab === 'resources' && contentTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === contentTypeFilter);
    }

    return filtered;
  };

  const filteredContent = getFilteredContent();
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContent = filteredContent.slice(startIndex, endIndex);

  const getContentIcon = (type) => {
    switch (type) {
      case 'resources':
        return BookOpen;
      case 'assignments':
        return FileCheck;
      case 'practiceCodes':
        return Code;
      case 'mcqs':
        return HelpCircle;
      default:
        return FileText;
    }
  };

  const renderResourceRow = (item) => (
    <tr key={item.id || item._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {item.type === 'DOCUMENT' && <FileIcon className="h-3 w-3 text-blue-600" />}
          {item.type === 'VIDEO' && <Video className="h-3 w-3 text-red-600" />}
          {item.type === 'LINK' && <Link2 className="h-3 w-3 text-green-600" />}
          {item.type === 'NOTE' && <FileText className="h-3 w-3 text-purple-600" />}
          <span className="text-[11px] font-medium text-text">{item.title || 'Untitled'}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.type || 'DOCUMENT'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.programName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.moduleName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted line-clamp-1 max-w-xs">{item.objectiveTitle || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.fileName ? (
          <span className="text-[10px] text-textMuted">{item.fileName}</span>
        ) : item.url ? (
          <span className="text-[10px] text-textMuted">Link</span>
        ) : (
          <span className="text-[10px] text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/program-manager/programs/${item.programId}/modules/${item.moduleId}/objectives/${item.objectiveId}/content`);
            }}
            className="px-2 py-1 text-[10px]"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const renderAssignmentRow = (item) => (
    <tr key={item.id || item._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] font-medium text-text">{item.name || 'Untitled'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.difficulty || 'BEGINNER'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.programName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.moduleName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted line-clamp-1 max-w-xs">{item.objectiveTitle || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.maxMarks || 0} marks</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/program-manager/programs/${item.programId}/modules/${item.moduleId}/objectives/${item.objectiveId}/content`);
            }}
            className="px-2 py-1 text-[10px]"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const renderPracticeCodeRow = (item) => (
    <tr key={item.id || item._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] font-medium text-text">{item.problem || 'Untitled'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.difficulty || 'BEGINNER'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.programName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.moduleName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted line-clamp-1 max-w-xs">{item.objectiveTitle || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.language || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/program-manager/programs/${item.programId}/modules/${item.moduleId}/objectives/${item.objectiveId}/content`);
            }}
            className="px-2 py-1 text-[10px]"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const renderMCQRow = (item) => (
    <tr key={item.id || item._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="max-w-md">
          <span className="text-[11px] font-medium text-text line-clamp-2">{item.question || 'Untitled Question'}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.questionType || 'SINGLE_CHOICE'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.programName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-text">{item.moduleName || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted line-clamp-1 max-w-xs">{item.objectiveTitle || '—'}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[11px] text-textMuted">{item.options?.length || 0} options</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/program-manager/programs/${item.programId}/modules/${item.moduleId}/objectives/${item.objectiveId}/content`);
            }}
            className="px-2 py-1 text-[10px]"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'resources':
        return ['Title', 'Type', 'Program', 'Module', 'Objective', 'File', 'Actions'];
      case 'assignments':
        return ['Name', 'Difficulty', 'Program', 'Module', 'Objective', 'Marks', 'Actions'];
      case 'practiceCodes':
        return ['Problem', 'Difficulty', 'Program', 'Module', 'Objective', 'Language', 'Actions'];
      case 'mcqs':
        return ['Question', 'Type', 'Program', 'Module', 'Objective', 'Options', 'Actions'];
      default:
        return [];
    }
  };

  const renderTableRow = (item) => {
    switch (activeTab) {
      case 'resources':
        return renderResourceRow(item);
      case 'assignments':
        return renderAssignmentRow(item);
      case 'practiceCodes':
        return renderPracticeCodeRow(item);
      case 'mcqs':
        return renderMCQRow(item);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading all content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Content Library"
        description="View and manage all content across all programs, modules, and objectives"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchAllContent}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'resources', label: 'Resources', icon: BookOpen, count: content.resources?.length || 0 },
              { id: 'assignments', label: 'Assignments', icon: FileCheck, count: content.assignments?.length || 0 },
              { id: 'practiceCodes', label: 'Practice Codes', icon: Code, count: content.practiceCodes?.length || 0 },
              { id: 'mcqs', label: 'MCQ Questions', icon: HelpCircle, count: content.mcqs?.length || 0 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-textMuted hover:text-text hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search content..."
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
          {activeTab === 'resources' && (
            <select
              value={contentTypeFilter}
              onChange={(e) => {
                setContentTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
            >
              <option value="all">All Types</option>
              <option value="DOCUMENT">Document</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Link</option>
              <option value="NOTE">Note</option>
            </select>
          )}
        </div>
      </div>

      {/* Content Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {paginatedContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-textMuted">
              {searchTerm || selectedProgram !== 'all' 
                ? 'No content matches your filters.' 
                : `No ${activeTab} found.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    {getTableHeaders().map((header, idx) => (
                      <th key={idx} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedContent.map((item) => renderTableRow(item))}
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
                  totalItems={filteredContent.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Content;

