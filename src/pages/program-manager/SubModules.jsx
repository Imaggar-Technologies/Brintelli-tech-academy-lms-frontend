import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, FileText, Layers3, Target, ArrowRight, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import programAPI from '../../api/program';

const SubModules = () => {
  const { programId, moduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [module, setModule] = useState(null);
  const [subModules, setSubModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  useEffect(() => {
    if (programId && moduleId) {
      fetchProgramDetails();
      fetchModuleDetails();
      fetchSubModules();
    }
  }, [programId, moduleId]);

  const fetchProgramDetails = async () => {
    try {
      const response = await programAPI.getProgramById(programId);
      if (response.success) {
        setProgram(response.data.program);
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('Failed to load program details');
    }
  };

  const fetchModuleDetails = async () => {
    try {
      const response = await programAPI.getModulesByProgram(programId);
      if (response.success) {
        const foundModule = response.data.modules.find(m => 
          (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
        );
        if (foundModule) {
          setModule(foundModule);
        }
      }
    } catch (error) {
      console.error('Error fetching module:', error);
      toast.error('Failed to load module details');
    }
  };

  const fetchSubModules = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getSubModulesByModule(moduleId);
      if (response.success) {
        const subModulesData = response.data.subModules || [];
        // Fetch objectives count for each sub-module
        const subModulesWithCounts = await Promise.all(
          subModulesData.map(async (subModule) => {
            try {
              const objectivesResponse = await programAPI.getSubModuleObjectives(subModule.id || subModule._id);
              const objectivesCount = objectivesResponse.success && objectivesResponse.data.objectives 
                ? objectivesResponse.data.objectives.length 
                : 0;
              return { ...subModule, objectivesCount };
            } catch (error) {
              console.error(`Error fetching objectives for sub-module ${subModule.id}:`, error);
              return { ...subModule, objectivesCount: 0 };
            }
          })
        );
        setSubModules(subModulesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching sub-modules:', error);
      toast.error('Failed to load sub-modules');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubModule = async (subModuleId) => {
    if (!window.confirm('Are you sure you want to delete this sub-module? This will also delete all associated learning objectives.')) {
      return;
    }

    try {
      await programAPI.deleteSubModule(subModuleId);
      toast.success('Sub-module deleted successfully');
      fetchSubModules();
    } catch (error) {
      console.error('Error deleting sub-module:', error);
      toast.error('Failed to delete sub-module');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(subModules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubModules = subModules.slice(startIndex, endIndex);


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.values(menuRefs.current).forEach((ref) => {
        if (ref && !ref.contains(event.target)) {
          setOpenMenuId(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const subModuleColumns = [
    { 
      key: 'name', 
      title: 'Sub-Module',
      render: (_, row) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Layers3 className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-text truncate">{row.name || '—'}</div>
            {row.description && (
              <div className="text-xs text-textMuted mt-0.5 truncate max-w-xs">{row.description}</div>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'objectives', 
      title: 'Objectives',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-text">{row.objectivesCount || 0}</span>
        </div>
      )
    },
    { 
      key: 'order', 
      title: '#',
      render: (_, row) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-medium text-xs">
          {row.order ?? '—'}
        </span>
      )
    },
    { 
      key: 'duration', 
      title: 'Duration',
      render: (_, row) => (
        <span className="text-sm text-text">{row.duration ? `${row.duration}h` : '—'}</span>
      )
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (_, row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
          row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
          row.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.status || 'Draft'}
        </span>
      )
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => {
        const subModuleId = row.id || row._id;
        const isOpen = openMenuId === subModuleId;
        
        return (
          <div className="relative" ref={(el) => (menuRefs.current[subModuleId] = el)}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOpenMenuId(isOpen ? null : subModuleId);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-textMuted" />
            </button>
            {isOpen && (
              <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpenMenuId(null);
                    navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}/objectives`);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-50 flex items-center gap-2"
                >
                  <Target className="h-4 w-4 text-green-600" />
                  View Objectives
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpenMenuId(null);
                    navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}`);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-text hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpenMenuId(null);
                    handleDeleteSubModule(subModuleId);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title={module ? `Sub-Modules - ${module.name}` : 'Sub-Modules'}
        description={program ? `Manage sub-modules for ${program.name}` : 'Manage sub-modules for this module'}
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sub-Module
            </Button>
          </div>
        }
      />

      {/* Navigation Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-textMuted">
        <button 
          onClick={() => navigate('/program-manager/programs')}
          className="hover:text-brand-600 transition-colors"
        >
          Programs
        </button>
        <ChevronRight className="h-4 w-4" />
        <button 
          onClick={() => navigate(`/program-manager/programs/${programId}`)}
          className="hover:text-brand-600 transition-colors"
        >
          {program?.name || 'Program'}
        </button>
        <ChevronRight className="h-4 w-4" />
        <button 
          onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}`)}
          className="hover:text-brand-600 transition-colors"
        >
          {module?.name || 'Module'}
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-text font-medium">Sub-Modules</span>
      </div>

      {/* Sub-Modules Overview Cards */}
      {!loading && subModules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Total Sub-Modules</p>
                <p className="text-2xl font-bold text-purple-900">{subModules.length}</p>
              </div>
              <Layers3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Objectives</p>
                <p className="text-2xl font-bold text-green-900">
                  {subModules.reduce((sum, sm) => sum + (sm.objectivesCount || 0), 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Active Sub-Modules</p>
                <p className="text-2xl font-bold text-blue-900">
                  {subModules.filter(sm => sm.status === 'ACTIVE').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Total Duration</p>
                <p className="text-2xl font-bold text-orange-900">
                  {subModules.reduce((sum, sm) => sum + (sm.duration || 0), 0)}h
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modules Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-4 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Sub-Modules</h3>
          <p className="text-xs text-gray-600 mt-1">
            {module ? `Manage sub-modules and their learning objectives for ${module.name}` : 'Manage sub-modules for this module'}
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading sub-modules...</p>
          </div>
        ) : subModules.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <Layers3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">No sub-modules found</p>
            <p className="text-sm text-gray-500 mb-6">Create your first sub-module to get started!</p>
            <Button
              variant="primary"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Sub-Module
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {subModuleColumns.map((column) => (
                      <th
                        key={column.key}
                        className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSubModules.map((row) => (
                    <tr
                      key={row.id || row._id}
                      onClick={() => {
                        const subModuleId = row.id || row._id;
                        navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}`);
                      }}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {subModuleColumns.map((column) => (
                        <td key={column.key} className="px-3 py-3 whitespace-nowrap">
                          {column.render(null, row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, subModules.length)} of {subModules.length} sub-modules
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-text">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SubModules;

