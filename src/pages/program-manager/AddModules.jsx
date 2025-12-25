import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, X, ChevronLeft, Save, Layers3 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';

const AddModules = () => {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState(null);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getProgramById(programId);
      if (response.success) {
        setProgram(response.data.program);
        // Load existing modules if any
        const modulesResponse = await programAPI.getModulesByProgram(programId);
        if (modulesResponse.success && modulesResponse.data.modules) {
          setModules(modulesResponse.data.modules.map(m => ({
            ...m,
            objectives: m.objectives || []
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('Failed to load program');
      navigate('/program-manager/programs');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        name: '',
        description: '',
        order: modules.length,
        duration: 0,
        status: 'DRAFT',
        objectives: []
      }
    ]);
  };

  const removeModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index, field, value) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], [field]: value };
    setModules(updated);
  };

  const addObjectiveToModule = (moduleIndex) => {
    const updated = [...modules];
    if (!updated[moduleIndex].objectives) {
      updated[moduleIndex].objectives = [];
    }
    updated[moduleIndex].objectives.push({
      text: '',
      resources: [],
      minDuration: 0
    });
    setModules(updated);
  };

  const removeObjectiveFromModule = (moduleIndex, objectiveIndex) => {
    const updated = [...modules];
    updated[moduleIndex].objectives = updated[moduleIndex].objectives.filter(
      (_, i) => i !== objectiveIndex
    );
    setModules(updated);
  };

  const updateObjectiveInModule = (moduleIndex, objectiveIndex, field, value) => {
    const updated = [...modules];
    updated[moduleIndex].objectives[objectiveIndex] = {
      ...updated[moduleIndex].objectives[objectiveIndex],
      [field]: value
    };
    setModules(updated);
  };

  const addResourceToObjective = (moduleIndex, objectiveIndex) => {
    const updated = [...modules];
    if (!updated[moduleIndex].objectives[objectiveIndex].resources) {
      updated[moduleIndex].objectives[objectiveIndex].resources = [];
    }
    updated[moduleIndex].objectives[objectiveIndex].resources.push({
      type: '',
      url: '',
      title: ''
    });
    setModules(updated);
  };

  const removeResourceFromObjective = (moduleIndex, objectiveIndex, resourceIndex) => {
    const updated = [...modules];
    updated[moduleIndex].objectives[objectiveIndex].resources = updated[moduleIndex].objectives[objectiveIndex].resources.filter(
      (_, i) => i !== resourceIndex
    );
    setModules(updated);
  };

  const updateResourceInObjective = (moduleIndex, objectiveIndex, resourceIndex, field, value) => {
    const updated = [...modules];
    updated[moduleIndex].objectives[objectiveIndex].resources[resourceIndex] = {
      ...updated[moduleIndex].objectives[objectiveIndex].resources[resourceIndex],
      [field]: value
    };
    setModules(updated);
  };

  const validateModules = () => {
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.name?.trim()) {
        toast.error(`Module ${i + 1} name is required`);
        return false;
      }
      if (!module.objectives || module.objectives.length === 0) {
        toast.error(`Module ${i + 1} must have at least one learning objective`);
        return false;
      }
      for (let j = 0; j < module.objectives.length; j++) {
        const objective = module.objectives[j];
        if (!objective.text?.trim()) {
          toast.error(`Module ${i + 1}, Objective ${j + 1} text is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateModules()) return;

    setLoading(true);
    try {
      // Create or update all modules
      for (const module of modules) {
        if (module.id || module._id) {
          // Update existing module
          await programAPI.updateModule(module.id || module._id, module);
        } else {
          // Create new module
          await programAPI.createModule(programId, module);
        }
      }

      toast.success('Modules saved successfully!');
      navigate(`/program-manager/programs`);
    } catch (error) {
      console.error('Error saving modules:', error);
      toast.error(error.message || 'Failed to save modules');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !program) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading program...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Add Modules - ${program?.name || 'Program'}`}
        description="Add modules and learning objectives to your program"
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
              variant="primary"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Modules
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Modules & Learning Objectives</h3>
            <p className="text-sm text-textMuted mt-1">
              Add modules to your program. Each module should have at least one learning objective.
            </p>
          </div>
          <Button variant="secondary" onClick={addModule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-brintelli-border rounded-2xl bg-brintelli-baseAlt">
            <Layers3 className="h-16 w-16 text-textMuted mx-auto mb-4" />
            <p className="text-lg font-medium text-text mb-2">No modules added yet</p>
            <p className="text-sm text-textMuted mb-6">
              Start by adding your first module to the program
            </p>
            <Button variant="primary" onClick={addModule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Module
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {modules.map((module, moduleIndex) => (
              <div
                key={moduleIndex}
                className="border border-brintelli-border rounded-2xl p-6 bg-brintelli-card shadow-soft"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-text">Module {moduleIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeModule(moduleIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Module Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={module.name}
                      onChange={(e) => updateModule(moduleIndex, 'name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="e.g., Introduction to React"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Description
                    </label>
                    <textarea
                      value={module.description || ''}
                      onChange={(e) =>
                        updateModule(moduleIndex, 'description', e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      rows={3}
                      placeholder="Module description..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Order</label>
                      <input
                        type="number"
                        value={module.order}
                        onChange={(e) =>
                          updateModule(moduleIndex, 'order', parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        value={module.duration || ''}
                        onChange={(e) =>
                          updateModule(moduleIndex, 'duration', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        min="0"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">Status</label>
                      <select
                        value={module.status || 'DRAFT'}
                        onChange={(e) => updateModule(moduleIndex, 'status', e.target.value)}
                        className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-text">
                        Learning Objectives <span className="text-red-500">*</span>
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addObjectiveToModule(moduleIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Objective
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {module.objectives?.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-brintelli-border rounded-lg bg-brintelli-baseAlt">
                          <p className="text-sm text-textMuted mb-3">No learning objectives added</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addObjectiveToModule(moduleIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Objective
                          </Button>
                        </div>
                      ) : (
                        module.objectives?.map((objective, objIndex) => (
                          <div
                            key={objIndex}
                            className="border border-brintelli-border rounded-lg p-4 bg-brintelli-baseAlt"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-text">
                                Objective {objIndex + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeObjectiveFromModule(moduleIndex, objIndex)
                                }
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <input
                                type="text"
                                value={objective.text || ''}
                                onChange={(e) =>
                                  updateObjectiveInModule(
                                    moduleIndex,
                                    objIndex,
                                    'text',
                                    e.target.value
                                  )
                                }
                                placeholder="Enter learning objective..."
                                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                              />

                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={objective.minDuration || 0}
                                  onChange={(e) =>
                                    updateObjectiveInModule(
                                      moduleIndex,
                                      objIndex,
                                      'minDuration',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="Min Duration (hours)"
                                  min="0"
                                  step="0.5"
                                  className="flex-1 px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addResourceToObjective(moduleIndex, objIndex)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Resource
                                </Button>
                              </div>

                              {/* Resources for this objective */}
                              {objective.resources?.length > 0 && (
                                <div className="space-y-2 mt-3 pt-3 border-t border-brintelli-border">
                                  {objective.resources.map((resource, resIndex) => (
                                    <div
                                      key={resIndex}
                                      className="flex gap-2 items-start p-2 bg-brintelli-card rounded border border-brintelli-border"
                                    >
                                      <input
                                        type="text"
                                        placeholder="Resource title"
                                        value={resource.title || ''}
                                        onChange={(e) =>
                                          updateResourceInObjective(
                                            moduleIndex,
                                            objIndex,
                                            resIndex,
                                            'title',
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 px-3 py-1.5 text-sm border border-brintelli-border rounded bg-brintelli-baseAlt text-text"
                                      />
                                      <input
                                        type="text"
                                        placeholder="URL"
                                        value={resource.url || ''}
                                        onChange={(e) =>
                                          updateResourceInObjective(
                                            moduleIndex,
                                            objIndex,
                                            resIndex,
                                            'url',
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 px-3 py-1.5 text-sm border border-brintelli-border rounded bg-brintelli-baseAlt text-text"
                                      />
                                      <select
                                        value={resource.type || ''}
                                        onChange={(e) =>
                                          updateResourceInObjective(
                                            moduleIndex,
                                            objIndex,
                                            resIndex,
                                            'type',
                                            e.target.value
                                          )
                                        }
                                        className="px-3 py-1.5 text-sm border border-brintelli-border rounded bg-brintelli-baseAlt text-text"
                                      >
                                        <option value="">Type</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="DOCUMENT">Document</option>
                                        <option value="LINK">Link</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeResourceFromObjective(
                                            moduleIndex,
                                            objIndex,
                                            resIndex
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {modules.length > 0 && (
          <div className="flex justify-end gap-3 pt-6 border-t border-brintelli-border">
            <Button
              variant="ghost"
              onClick={() => navigate('/program-manager/programs')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Modules'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default AddModules;

