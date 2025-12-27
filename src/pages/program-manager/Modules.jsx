import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, FileText, Layers3, BookOpen, ArrowRight, Eye, Edit } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import programAPI from '../../api/program';

const Modules = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [objectives, setObjectives] = useState([]); // Array of { text, resources: [], minDuration }

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
      fetchModules();
    }
  }, [programId]);

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

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getModulesByProgram(programId);
      if (response.success) {
        const modulesData = response.data.modules || [];
        // Fetch objectives count for each module
        const modulesWithCounts = await Promise.all(
          modulesData.map(async (module) => {
            try {
              const objectivesResponse = await programAPI.getObjectivesByModule(module.id || module._id);
              const objectivesCount = objectivesResponse.success && objectivesResponse.data.objectives 
                ? objectivesResponse.data.objectives.length 
                : 0;
              return { ...module, objectivesCount };
            } catch (error) {
              console.error(`Error fetching objectives for module ${module.id}:`, error);
              return { ...module, objectivesCount: 0 };
            }
          })
        );
        setModules(modulesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    try {
      const moduleData = {
        ...formData,
        objectives,
      };
      const response = await programAPI.createModule(programId, moduleData);
      if (response.success) {
        toast.success('Module created successfully');
        setShowModuleModal(false);
        setFormData({});
        setObjectives([]);
        fetchModules();
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error(error.message || 'Failed to create module');
    }
  };

  const addObjective = () => {
    setObjectives([...objectives, { text: '', resources: [], minDuration: 0 }]);
  };

  const removeObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const updateObjective = (index, field, value) => {
    const updated = [...objectives];
    updated[index] = { ...updated[index], [field]: value };
    setObjectives(updated);
  };

  const addResourceToObjective = (objectiveIndex) => {
    const updated = [...objectives];
    updated[objectiveIndex].resources = [...updated[objectiveIndex].resources, { type: '', url: '', title: '' }];
    setObjectives(updated);
  };

  const removeResourceFromObjective = (objectiveIndex, resourceIndex) => {
    const updated = [...objectives];
    updated[objectiveIndex].resources = updated[objectiveIndex].resources.filter((_, i) => i !== resourceIndex);
    setObjectives(updated);
  };

  const updateResourceInObjective = (objectiveIndex, resourceIndex, field, value) => {
    const updated = [...objectives];
    updated[objectiveIndex].resources[resourceIndex] = {
      ...updated[objectiveIndex].resources[resourceIndex],
      [field]: value,
    };
    setObjectives(updated);
  };

  // Pagination logic
  const totalPages = Math.ceil(modules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedModules = modules.slice(startIndex, endIndex);

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

  const moduleColumns = [
    { 
      key: 'name', 
      title: 'Module Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Layers3 className="h-5 w-5 text-brand-600" />
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
          <BookOpen className="h-4 w-4 text-blue-600" />
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
        const moduleId = row.id || row._id;
        return (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`);
              }}
              className="hover:bg-brand-600"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Objectives
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/program-manager/programs/${programId}/modules/${moduleId}`);
              }}
              className="hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title={program ? `Modules - ${program.name}` : 'Modules'}
        description="Manage modules for this program"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/program-manager/programs')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({ order: modules.length });
                setObjectives([]);
                setShowModuleModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Module
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
        <span className="text-text font-medium">{program?.name || 'Modules'}</span>
      </div>

      {/* Modules Overview Cards */}
      {!loading && modules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Modules</p>
                <p className="text-2xl font-bold text-blue-900">{modules.length}</p>
              </div>
              <Layers3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Objectives</p>
                <p className="text-2xl font-bold text-green-900">
                  {modules.reduce((sum, m) => sum + (m.objectivesCount || 0), 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Active Modules</p>
                <p className="text-2xl font-bold text-purple-900">
                  {modules.filter(m => m.status === 'ACTIVE').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Total Duration</p>
                <p className="text-2xl font-bold text-orange-900">
                  {modules.reduce((sum, m) => sum + (m.duration || 0), 0)}h
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Modules Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">All Modules</h3>
            <p className="text-sm text-gray-600 mt-1">
              {program ? `Manage modules and their learning objectives for ${program.name}` : 'Manage modules for this program'}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">Modules</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">Objectives</span>
              <ArrowRight className="h-3 w-3" />
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">Content</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading modules...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <Layers3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">No modules found</p>
            <p className="text-sm text-gray-500 mb-6">Create your first module to get started!</p>
            <Button
              variant="primary"
              onClick={() => {
                setFormData({ order: modules.length });
                setObjectives([]);
                setShowModuleModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Module
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden">
              <Table 
                columns={moduleColumns} 
                data={paginatedModules} 
                minRows={10}
                onRowClick={(row) => {
                  const moduleId = row.id || row._id;
                  navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`);
                }}
                rowClassName="cursor-pointer hover:bg-gray-50"
              />
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, modules.length)} of {modules.length} modules
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

      {/* Create Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create Module</h3>
            <div className="space-y-4">
              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Module Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Total Duration (hours)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status || 'DRAFT'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Learning Objectives</label>
                <div className="space-y-4">
                  {objectives.map((objective, objIndex) => (
                    <div key={objIndex} className="border border-brintelli-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text">Objective {objIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeObjective(objIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Objective Text <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={objective.text || ''}
                          onChange={(e) => updateObjective(objIndex, 'text', e.target.value)}
                          placeholder="Enter learning objective..."
                          className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Minimum Duration (hours) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={objective.minDuration || 0}
                          onChange={(e) => updateObjective(objIndex, 'minDuration', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                          className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">Resources</label>
                        <div className="space-y-2">
                          {objective.resources?.map((resource, resIndex) => (
                            <div key={resIndex} className="flex items-center gap-2 bg-brintelli-baseAlt p-2 rounded">
                              <div className="flex-1 grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  value={resource.title || ''}
                                  onChange={(e) => updateResourceInObjective(objIndex, resIndex, 'title', e.target.value)}
                                  placeholder="Resource Title"
                                  className="px-2 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                                />
                                <select
                                  value={resource.type || ''}
                                  onChange={(e) => updateResourceInObjective(objIndex, resIndex, 'type', e.target.value)}
                                  className="px-2 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                                >
                                  <option value="">Select Type</option>
                                  <option value="VIDEO">Video</option>
                                  <option value="DOCUMENT">Document</option>
                                  <option value="LINK">Link</option>
                                  <option value="SLIDES">Slides</option>
                                  <option value="CODE">Code</option>
                                </select>
                                <input
                                  type="url"
                                  value={resource.url || ''}
                                  onChange={(e) => updateResourceInObjective(objIndex, resIndex, 'url', e.target.value)}
                                  placeholder="Resource URL"
                                  className="px-2 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeResourceFromObjective(objIndex, resIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addResourceToObjective(objIndex)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resource
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={addObjective}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Learning Objective
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleCreateModule}>
                Create Module
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowModuleModal(false);
                setFormData({});
                setObjectives([]);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modules;
