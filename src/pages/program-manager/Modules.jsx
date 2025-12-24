import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, FileText } from 'lucide-react';
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
        setModules(response.data.modules || []);
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

  const moduleColumns = [
    { key: 'name', title: 'Module Name' },
    { key: 'order', title: 'Order' },
    { key: 'duration', title: 'Duration (hours)' },
    { key: 'status', title: 'Status' },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate(`/program-manager/modules/${programId}/assignments/${row.id || row._id}`);
            }}
          >
            <FileText className="h-4 w-4 mr-1" />
            Assignments
          </Button>
        </div>
      ),
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

      {/* Modules Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">All Modules</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading...</p>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textMuted">No modules found. Create your first module!</p>
          </div>
        ) : (
          <>
            <Table columns={moduleColumns} data={paginatedModules} minRows={10} />
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
