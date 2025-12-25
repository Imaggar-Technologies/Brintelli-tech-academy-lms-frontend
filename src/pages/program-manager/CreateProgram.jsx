import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, ChevronRight, Plus, X, Layers3, FileText, BookOpen, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';

const CreateProgram = () => {
  const navigate = useNavigate();
  const { programId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [programData, setProgramData] = useState({
    name: '',
    code: '',
    description: '',
    duration: 6,
    price: 0,
    status: 'DRAFT',
  });
  const [modules, setModules] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleIndex, setEditingModuleIndex] = useState(null);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
  const [editingObjectiveIndex, setEditingObjectiveIndex] = useState(null);

  const totalSteps = 2;

  useEffect(() => {
    if (programId) {
      loadProgram();
    }
  }, [programId]);

  // Auto-save functionality
  useEffect(() => {
    if (programId) {
      const autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [programData, modules, programId]);

  const loadProgram = async () => {
    try {
      const response = await programAPI.getProgramById(programId);
      if (response.success) {
        const program = response.data.program;
        setProgramData({
          name: program.name || '',
          code: program.code || '',
          description: program.description || '',
          duration: program.duration || 6,
          price: program.price || 0,
          status: program.status || 'DRAFT',
        });

        // Load modules
        const modulesResponse = await programAPI.getModulesByProgram(programId);
        if (modulesResponse.success && modulesResponse.data.modules) {
          setModules(modulesResponse.data.modules.map(m => ({
            ...m,
            objectives: m.objectives || []
          })));
        }
      }
    } catch (error) {
      console.error('Error loading program:', error);
      toast.error('Failed to load program');
    }
  };

  const autoSave = async () => {
    if (!programId) return;
    
    setSaving(true);
    try {
      await programAPI.updateProgram(programId, {
        ...programData,
        status: 'DRAFT', // Keep as draft until explicitly activated
      });
      // Silently save - don't show toast for auto-save
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleProgramChange = (field, value) => {
    setProgramData({ ...programData, [field]: value });
  };

  const handleCreateProgram = async () => {
    if (!programData.name.trim()) {
      toast.error('Program name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await programAPI.createProgram(programData);
      if (response.success) {
        const newProgramId = response.data.program.id || response.data.program._id;
        toast.success('Program created successfully!');
        // Navigate to the same page but with programId
        navigate(`/program-manager/programs/create/${newProgramId}`, { replace: true });
        setCurrentStep(2); // Move to modules step
      }
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error(error.message || 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveModule = async (moduleData) => {
    if (!programId) {
      toast.error('Please create the program first');
      return;
    }

    try {
      if (editingModuleIndex !== null) {
        // Update existing module
        const module = modules[editingModuleIndex];
        if (module.id || module._id) {
          await programAPI.updateModule(module.id || module._id, moduleData);
        }
        const updated = [...modules];
        updated[editingModuleIndex] = { ...moduleData, id: module.id || module._id };
        setModules(updated);
        toast.success('Module updated');
      } else {
        // Create new module
        const response = await programAPI.createModule(programId, { ...moduleData, order: modules.length });
        if (response.success) {
          const newModule = response.data.module || { ...moduleData, id: response.data.moduleId };
          setModules([...modules, newModule]);
          toast.success('Module created');
        }
      }
      setShowModuleModal(false);
      setEditingModuleIndex(null);
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Failed to save module');
    }
  };

  const handleDeleteModule = async (index) => {
    const module = modules[index];
    if (module.id || module._id) {
      try {
        await programAPI.updateModule(module.id || module._id, { status: 'DELETED' });
        toast.success('Module deleted');
      } catch (error) {
        toast.error('Failed to delete module');
      }
    }
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleSaveObjective = async (objectiveData) => {
    if (!programId || selectedModuleIndex === null) {
      toast.error('Please create the program and module first');
      return;
    }

    try {
      const module = modules[selectedModuleIndex];
      const updated = [...modules];
      if (!updated[selectedModuleIndex].objectives) {
        updated[selectedModuleIndex].objectives = [];
      }

      if (editingObjectiveIndex !== null) {
        // Update existing objective
        updated[selectedModuleIndex].objectives[editingObjectiveIndex] = objectiveData;
        toast.success('Objective updated');
      } else {
        // Add new objective
        updated[selectedModuleIndex].objectives.push(objectiveData);
        toast.success('Objective added');
      }

      // Save module with updated objectives
      if (module.id || module._id) {
        await programAPI.updateModule(module.id || module._id, {
          ...module,
          objectives: updated[selectedModuleIndex].objectives
        });
      }

      setModules(updated);
      setShowObjectiveModal(false);
      setSelectedModuleIndex(null);
      setEditingObjectiveIndex(null);
    } catch (error) {
      console.error('Error saving objective:', error);
      toast.error('Failed to save objective');
    }
  };

  const handleDeleteObjective = async (moduleIndex, objectiveIndex) => {
    if (!programId) return;
    
    const updated = [...modules];
    updated[moduleIndex].objectives = updated[moduleIndex].objectives.filter((_, i) => i !== objectiveIndex);
    setModules(updated);

    // Save module with updated objectives
    const module = modules[moduleIndex];
    if (module.id || module._id) {
      try {
        await programAPI.updateModule(module.id || module._id, updated[moduleIndex]);
        toast.success('Objective deleted');
      } catch (error) {
        console.error('Error deleting objective:', error);
        toast.error('Failed to delete objective');
      }
    } else {
      toast.success('Objective deleted');
    }
  };

  const handleAddResource = async (moduleIndex, objectiveIndex, resourceType) => {
    if (!programId) return;
    
    const updated = [...modules];
    if (!updated[moduleIndex].objectives[objectiveIndex].resources) {
      updated[moduleIndex].objectives[objectiveIndex].resources = [];
    }
    updated[moduleIndex].objectives[objectiveIndex].resources.push({
      type: resourceType,
      title: '',
      url: '',
      content: '',
    });
    setModules(updated);

    // Auto-save module with updated resources
    const module = modules[moduleIndex];
    if (module.id || module._id) {
      try {
        await programAPI.updateModule(module.id || module._id, updated[moduleIndex]);
      } catch (error) {
        console.error('Error auto-saving resource:', error);
      }
    }
  };

  const handleUpdateResource = async (moduleIndex, objectiveIndex, resourceIndex, field, value) => {
    if (!programId) return;
    
    const updated = [...modules];
    updated[moduleIndex].objectives[objectiveIndex].resources[resourceIndex][field] = value;
    setModules(updated);

    // Auto-save module with updated resources
    const module = modules[moduleIndex];
    if (module.id || module._id) {
      try {
        await programAPI.updateModule(module.id || module._id, updated[moduleIndex]);
      } catch (error) {
        console.error('Error auto-saving resource:', error);
      }
    }
  };

  const handleDeleteResource = async (moduleIndex, objectiveIndex, resourceIndex) => {
    if (!programId) return;
    
    const updated = [...modules];
    updated[moduleIndex].objectives[objectiveIndex].resources = updated[moduleIndex].objectives[objectiveIndex].resources.filter((_, i) => i !== resourceIndex);
    setModules(updated);

    // Auto-save module with updated resources
    const module = modules[moduleIndex];
    if (module.id || module._id) {
      try {
        await programAPI.updateModule(module.id || module._id, updated[moduleIndex]);
      } catch (error) {
        console.error('Error auto-saving resource:', error);
      }
    }
  };

  const handleSaveAll = async () => {
    if (!programId) {
      await handleCreateProgram();
      return;
    }

    setIsSubmitting(true);
    try {
      // Save program
      await programAPI.updateProgram(programId, programData);

      // Save all modules
      for (const module of modules) {
        if (module.id || module._id) {
          await programAPI.updateModule(module.id || module._id, module);
        } else {
          await programAPI.createModule(programId, module);
        }
      }

      toast.success('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateProgram = async () => {
    if (modules.length === 0) {
      toast.error('Please add at least one module before activating');
      return;
    }

    for (const module of modules) {
      if (!module.objectives || module.objectives.length === 0) {
        toast.error(`Module "${module.name}" must have at least one learning objective`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await programAPI.updateProgram(programId, { ...programData, status: 'ACTIVE' });
      toast.success('Program activated successfully!');
      navigate('/program-manager/programs');
    } catch (error) {
      console.error('Error activating program:', error);
      toast.error('Failed to activate program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateStats = () => {
    const totalModules = modules.length;
    const totalObjectives = modules.reduce((sum, m) => sum + (m.objectives?.length || 0), 0);
    const totalDuration = modules.reduce((sum, m) => sum + (m.duration || 0), 0);
    return { totalModules, totalObjectives, totalDuration };
  };

  const stats = calculateStats();

  return (
    <>
      <PageHeader
        title={programId ? `Edit Program - ${programData.name || 'Untitled'}` : 'Create New Program'}
        description={programId ? 'Edit your program details and modules' : 'Create a new program with modules and learning objectives'}
        actions={
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-textMuted flex items-center gap-1">
                <Save className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate('/program-manager/programs')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {programId && (
              <Button
                variant="primary"
                onClick={handleSaveAll}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        }
      />

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > step
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : currentStep === step
                      ? 'border-brand-500 text-brand-500 bg-brand-50'
                      : 'border-brintelli-border text-textMuted'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step}</span>
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? 'text-text' : 'text-textMuted'
                  }`}
                >
                  {step === 1 ? 'Program Details' : 'Add Modules'}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-brand-500' : 'bg-brintelli-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Step 1: Program Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-text mb-4">Program Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={programData.name}
                onChange={(e) => handleProgramChange('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="e.g., Full Stack Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Program Code</label>
              <input
                type="text"
                value={programData.code}
                onChange={(e) => handleProgramChange('code', e.target.value)}
                className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Auto-generated if left empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Description</label>
              <textarea
                value={programData.description}
                onChange={(e) => handleProgramChange('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                rows={4}
                placeholder="Describe the program..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Duration (months)</label>
                <input
                  type="number"
                  value={programData.duration}
                  onChange={(e) => handleProgramChange('duration', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={programData.price}
                  onChange={(e) => handleProgramChange('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Status</label>
                <select
                  value={programData.status}
                  onChange={(e) => handleProgramChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  disabled
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <p className="text-xs text-textMuted mt-1">Status will be Active when you complete the program</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => navigate('/program-manager/programs')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={programId ? () => setCurrentStep(2) : handleCreateProgram}
                disabled={isSubmitting || !programData.name.trim()}
              >
                {programId ? 'Continue to Modules' : isSubmitting ? 'Creating...' : 'Create Program'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Modules */}
        {currentStep === 2 && programId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-text mb-2">Modules & Learning Objectives</h3>
                <div className="flex items-center gap-4 text-sm text-textMuted">
                  <span className="flex items-center gap-1">
                    <Layers3 className="h-4 w-4" />
                    {stats.totalModules} Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {stats.totalObjectives} Objectives
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {stats.totalDuration}h Duration
                  </span>
                </div>
              </div>
              <Button variant="secondary" onClick={() => {
                setEditingModuleIndex(null);
                setShowModuleModal(true);
              }}>
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
                <Button variant="primary" onClick={() => {
                  setEditingModuleIndex(null);
                  setShowModuleModal(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <div
                    key={moduleIndex}
                    className="border border-brintelli-border rounded-xl p-5 bg-brintelli-baseAlt"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-text">{module.name || `Module ${moduleIndex + 1}`}</h4>
                        {module.description && (
                          <p className="text-sm text-textMuted mt-1">{module.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-textMuted">
                          <span>Order: {module.order}</span>
                          <span>Duration: {module.duration || 0}h</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            module.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            module.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {module.status || 'DRAFT'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingModuleIndex(moduleIndex);
                            setShowModuleModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModule(moduleIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-text">
                          Learning Objectives ({module.objectives?.length || 0})
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedModuleIndex(moduleIndex);
                            setEditingObjectiveIndex(null);
                            setShowObjectiveModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Objective
                        </Button>
                      </div>

                      {module.objectives && module.objectives.length > 0 ? (
                        <div className="space-y-3">
                          {module.objectives.map((objective, objIndex) => (
                            <div
                              key={objIndex}
                              className="border border-brintelli-border rounded-lg p-4 bg-brintelli-card"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h5 className="font-medium text-text mb-1">
                                    Objective {objIndex + 1}: {objective.text}
                                  </h5>
                                  {objective.minDuration > 0 && (
                                    <p className="text-xs text-textMuted">
                                      Min Duration: {objective.minDuration}h
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedModuleIndex(moduleIndex);
                                      setEditingObjectiveIndex(objIndex);
                                      setShowObjectiveModal(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteObjective(moduleIndex, objIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Resources */}
                              {objective.resources && objective.resources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-brintelli-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-textMuted">Resources</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddResource(moduleIndex, objIndex, 'NOTE')}
                                        className="text-xs"
                                      >
                                        + Note
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddResource(moduleIndex, objIndex, 'DOCUMENT')}
                                        className="text-xs"
                                      >
                                        + Doc
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddResource(moduleIndex, objIndex, 'ASSIGNMENT')}
                                        className="text-xs"
                                      >
                                        + Assignment
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {objective.resources.map((resource, resIndex) => (
                                      <div
                                        key={resIndex}
                                        className="flex items-center gap-2 p-2 bg-brintelli-baseAlt rounded border border-brintelli-border"
                                      >
                                        <span className="text-xs px-2 py-1 rounded bg-brand-100 text-brand-700 font-medium">
                                          {resource.type}
                                        </span>
                                        <input
                                          type="text"
                                          placeholder="Title"
                                          value={resource.title || ''}
                                          onChange={(e) => handleUpdateResource(moduleIndex, objIndex, resIndex, 'title', e.target.value)}
                                          className="flex-1 px-2 py-1 text-sm border border-brintelli-border rounded bg-brintelli-card text-text"
                                        />
                                        <input
                                          type="text"
                                          placeholder="URL or content"
                                          value={resource.url || resource.content || ''}
                                          onChange={(e) => handleUpdateResource(moduleIndex, objIndex, resIndex, resource.type === 'NOTE' ? 'content' : 'url', e.target.value)}
                                          className="flex-1 px-2 py-1 text-sm border border-brintelli-border rounded bg-brintelli-card text-text"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteResource(moduleIndex, objIndex, resIndex)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {(!objective.resources || objective.resources.length === 0) && (
                                <div className="mt-3 pt-3 border-t border-brintelli-border">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-textMuted">No resources added</span>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddResource(moduleIndex, objIndex, 'NOTE')}
                                        className="text-xs"
                                      >
                                        + Note
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddResource(moduleIndex, objIndex, 'DOCUMENT')}
                                        className="text-xs"
                                      >
                                        + Doc
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddResource(moduleIndex, objIndex, 'ASSIGNMENT')}
                                        className="text-xs"
                                      >
                                        + Assignment
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border-2 border-dashed border-brintelli-border rounded-lg bg-brintelli-card">
                          <p className="text-sm text-textMuted mb-3">No learning objectives added</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedModuleIndex(moduleIndex);
                              setEditingObjectiveIndex(null);
                              setShowObjectiveModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Objective
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(1)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSaveAll}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
                <Button
                  variant="primary"
                  onClick={handleActivateProgram}
                  disabled={isSubmitting || modules.length === 0}
                >
                  {isSubmitting ? 'Activating...' : 'Activate Program'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <ModuleModal
          module={editingModuleIndex !== null ? modules[editingModuleIndex] : null}
          onClose={() => {
            setShowModuleModal(false);
            setEditingModuleIndex(null);
          }}
          onSave={handleSaveModule}
        />
      )}

      {/* Objective Modal */}
      {showObjectiveModal && selectedModuleIndex !== null && (
        <ObjectiveModal
          objective={editingObjectiveIndex !== null ? modules[selectedModuleIndex].objectives[editingObjectiveIndex] : null}
          onClose={() => {
            setShowObjectiveModal(false);
            setSelectedModuleIndex(null);
            setEditingObjectiveIndex(null);
          }}
          onSave={handleSaveObjective}
        />
      )}
    </>
  );
};

// Module Modal Component
const ModuleModal = ({ module, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: module?.name || '',
    description: module?.description || '',
    order: module?.order || 0,
    duration: module?.duration || 0,
    status: module?.status || 'DRAFT',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Module name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text">
            {module ? 'Edit Module' : 'Create Module'}
          </h3>
          <button onClick={onClose} className="text-textMuted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="e.g., Introduction to React"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
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
                value={formData.order}
                onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Duration (hours)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brintelli-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {module ? 'Update' : 'Create'} Module
          </Button>
        </div>
      </div>
    </div>
  );
};

// Objective Modal Component
const ObjectiveModal = ({ objective, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    text: objective?.text || '',
    minDuration: objective?.minDuration || 0,
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (!formData.text.trim()) {
      toast.error('Objective text is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text">
            {objective ? 'Edit Learning Objective' : 'Create Learning Objective'}
          </h3>
          <button onClick={onClose} className="text-textMuted hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Objective Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              rows={4}
              placeholder="Enter learning objective..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Minimum Duration (hours)</label>
            <input
              type="number"
              value={formData.minDuration}
              onChange={(e) => handleChange('minDuration', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brintelli-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {objective ? 'Update' : 'Create'} Objective
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProgram;

