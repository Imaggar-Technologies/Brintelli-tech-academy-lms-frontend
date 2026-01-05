import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, FileText, Layers3, Target, ArrowRight, Eye, Edit, Trash2 } from 'lucide-react';
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const subModuleColumns = [
    { 
      key: 'name', 
      title: 'Sub-Module Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Layers3 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-text">{row.name || '—'}</div>
            {row.description && (
              <div className="text-xs text-textMuted mt-0.5 line-clamp-1">{row.description}</div>
            )}
          </div>
        </div>
      )
    },
    { 
      key: 'objectives', 
      title: 'Learning Objectives',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-text">{row.objectivesCount || 0}</span>
          <span className="text-xs text-textMuted">objectives</span>
        </div>
      )
    },
    { 
      key: 'order', 
      title: 'Order',
      render: (_, row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
          {row.order ?? '—'}
        </span>
      )
    },
    { 
      key: 'duration', 
      title: 'Duration',
      render: (_, row) => (
        <span className="text-text font-medium">{row.duration ? `${row.duration}h` : '—'}</span>
      )
    },
    { 
      key: 'status', 
      title: 'Status',
      render: (_, row) => getStatusBadge(row.status)
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => {
        const subModuleId = row.id || row._id;
        return (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}/objectives`);
              }}
              className="hover:bg-brand-600"
            >
              <Target className="h-4 w-4 mr-1" />
              Objectives
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}`);
              }}
              className="hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeleteSubModule(subModuleId);
              }}
              className="hover:bg-red-50 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">All Sub-Modules</h3>
            <p className="text-sm text-gray-600 mt-1">
              {module ? `Manage sub-modules and their learning objectives for ${module.name}` : 'Manage sub-modules for this module'}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">Sub-Modules</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">Objectives</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">Content</span>
            </div>
          </div>
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
            <div className="overflow-hidden">
              <Table 
                columns={subModuleColumns} 
                data={paginatedSubModules} 
                minRows={10}
                onRowClick={(row) => {
                  const subModuleId = row.id || row._id;
                  navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}`);
                }}
                rowClassName="cursor-pointer hover:bg-gray-50"
              />
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

