import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, Plus, X, FileText, BookOpen, Target, Users, User, FileCheck, Upload, Loader2, Edit2, ExternalLink, Link2, Video, File } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import programAPI from '../../api/program';
import uploadAPI from '../../api/upload';

const ObjectiveDetails = () => {
  const navigate = useNavigate();
  const { programId, moduleId, objectiveIndex } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [objective, setObjective] = useState({
    text: '',
    minDuration: 0,
    resources: [],
    assignments: [],
    practiceTasks: [],
  });
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'resources', 'assignments', 'practice'
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track upload progress per resource
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    type: 'DOCUMENT',
    forWhom: 'LEARNER',
    title: '',
    url: '',
    content: '',
    file: null,
  });
  const [viewingResource, setViewingResource] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  // Auto-save functionality
  useEffect(() => {
    if (module && objective.text && objectiveIndex !== 'new') {
      const autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [objective, module, objectiveIndex]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getModulesByProgram(programId);
      if (response.success && response.data.modules) {
        const foundModule = response.data.modules.find(m => 
          (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
        );
        if (foundModule) {
          setModule(foundModule);
          if (objectiveIndex !== 'new' && foundModule.objectives && foundModule.objectives[parseInt(objectiveIndex)]) {
            setObjective(foundModule.objectives[parseInt(objectiveIndex)]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!module || objectiveIndex === 'new') return;
    
    setSaving(true);
    try {
      const updatedObjectives = [...(module.objectives || [])];
      updatedObjectives[parseInt(objectiveIndex)] = objective;
      
      await programAPI.updateModule(moduleId, {
        ...module,
        objectives: updatedObjectives
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleObjectiveChange = (field, value) => {
    setObjective({ ...objective, [field]: value });
  };

  const handleSave = async () => {
    if (!objective.text.trim()) {
      toast.error('Objective text is required');
      return;
    }

    setSaving(true);
    try {
      const updatedObjectives = [...(module.objectives || [])];
      
      if (objectiveIndex === 'new') {
        updatedObjectives.push(objective);
      } else {
        updatedObjectives[parseInt(objectiveIndex)] = objective;
      }

      await programAPI.updateModule(moduleId, {
        ...module,
        objectives: updatedObjectives
      });

      toast.success(objectiveIndex === 'new' ? 'Objective created successfully' : 'Objective updated successfully');
      
      if (objectiveIndex === 'new') {
        navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives/${updatedObjectives.length - 1}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving objective:', error);
      toast.error(error.message || 'Failed to save objective');
    } finally {
      setSaving(false);
    }
  };

  const handleAddResource = () => {
    setResourceFormData({
      type: 'DOCUMENT',
      forWhom: 'LEARNER',
      title: '',
      url: '',
      content: '',
      file: null,
    });
    setEditingResourceIndex(null);
    setShowResourceModal(true);
  };

  const handleEditResource = (index) => {
    const resource = objective.resources[index];
    setResourceFormData({
      type: resource.type || 'DOCUMENT',
      forWhom: resource.forWhom || 'LEARNER',
      title: resource.title || '',
      url: resource.url || '',
      content: resource.content || '',
      file: null,
    });
    setEditingResourceIndex(index);
    setShowResourceModal(true);
  };

  const handleSaveResource = async () => {
    if (!resourceFormData.title.trim()) {
      toast.error('Resource title is required');
      return;
    }

    let resourceData = {
      type: resourceFormData.type,
      forWhom: resourceFormData.forWhom,
      title: resourceFormData.title,
    };

    // Handle file upload if it's a document/video and file is selected
    if ((resourceFormData.type === 'DOCUMENT' || resourceFormData.type === 'VIDEO') && resourceFormData.file) {
      try {
        setUploadingFiles(prev => ({ ...prev, modal: true }));
        const response = await uploadAPI.uploadFile(resourceFormData.file, 'program-resources');
        if (response.success && response.data) {
          resourceData.url = response.data.url;
          resourceData.fileKey = response.data.key;
          resourceData.fileName = response.data.originalName;
          resourceData.fileSize = response.data.size;
          resourceData.mimeType = response.data.mimeType;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(error.message || 'Failed to upload file');
        setUploadingFiles(prev => ({ ...prev, modal: false }));
        return;
      } finally {
        setUploadingFiles(prev => ({ ...prev, modal: false }));
      }
    } else if (resourceFormData.type === 'DOCUMENT' || resourceFormData.type === 'VIDEO') {
      // If editing and file already exists, keep existing file data
      if (editingResourceIndex !== null && objective.resources[editingResourceIndex]?.url) {
        resourceData.url = objective.resources[editingResourceIndex].url;
        resourceData.fileKey = objective.resources[editingResourceIndex].fileKey;
        resourceData.fileName = objective.resources[editingResourceIndex].fileName;
        resourceData.fileSize = objective.resources[editingResourceIndex].fileSize;
        resourceData.mimeType = objective.resources[editingResourceIndex].mimeType;
      } else if (!resourceFormData.file) {
        toast.error('Please upload a file for document/video resources');
        return;
      }
    } else if (resourceFormData.type === 'LINK') {
      if (!resourceFormData.url.trim()) {
        toast.error('URL is required for link resources');
        return;
      }
      resourceData.url = resourceFormData.url;
    } else if (resourceFormData.type === 'NOTE') {
      resourceData.content = resourceFormData.content || '';
    }

    const updated = [...(objective.resources || [])];
    if (editingResourceIndex !== null) {
      // Update existing resource
      updated[editingResourceIndex] = {
        ...updated[editingResourceIndex],
        ...resourceData,
      };
    } else {
      // Add new resource
      updated.push(resourceData);
    }

    setObjective({ ...objective, resources: updated });
    setShowResourceModal(false);
    setResourceFormData({
      type: 'DOCUMENT',
      forWhom: 'LEARNER',
      title: '',
      url: '',
      content: '',
      file: null,
    });
    setEditingResourceIndex(null);
    toast.success(editingResourceIndex !== null ? 'Resource updated' : 'Resource added');
  };


  const handleFileUpload = async (index, file) => {
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [index]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'program-resources');
      
      if (response.success) {
        const updated = [...(objective.resources || [])];
        updated[index] = {
          ...updated[index],
          url: response.data.url,
          fileKey: response.data.key,
          fileName: response.data.originalName,
          fileSize: response.data.size,
          mimeType: response.data.mimeType,
        };
        setObjective({ ...objective, resources: updated });
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleDeleteUploadedFile = async (index) => {
    const resource = objective.resources[index];
    if (resource.fileKey) {
      try {
        await uploadAPI.deleteFile(resource.fileKey);
        const updated = [...(objective.resources || [])];
        updated[index] = {
          ...updated[index],
          url: '',
          fileKey: '',
          fileName: '',
          fileSize: '',
          mimeType: '',
        };
        setObjective({ ...objective, resources: updated });
        toast.success('File deleted successfully');
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDeleteResource = (index) => {
    const updated = objective.resources.filter((_, i) => i !== index);
    setObjective({ ...objective, resources: updated });
  };

  const handleAddAssignment = () => {
    const newAssignment = {
      name: '',
      description: '',
      difficulty: 'BEGINNER', // BEGINNER, INTERMEDIATE, ADVANCED
      maxMarks: 100,
      passingMarks: 50,
      dueDate: '',
    };
    setObjective({
      ...objective,
      assignments: [...(objective.assignments || []), newAssignment]
    });
  };

  const handleUpdateAssignment = (index, field, value) => {
    const updated = [...(objective.assignments || [])];
    updated[index] = { ...updated[index], [field]: value };
    setObjective({ ...objective, assignments: updated });
  };

  const handleDeleteAssignment = (index) => {
    const updated = objective.assignments.filter((_, i) => i !== index);
    setObjective({ ...objective, assignments: updated });
  };

  const handleAddPracticeTask = () => {
    const newTask = {
      name: '',
      description: '',
      difficulty: 'BEGINNER',
      estimatedTime: 0,
      instructions: '',
    };
    setObjective({
      ...objective,
      practiceTasks: [...(objective.practiceTasks || []), newTask]
    });
  };

  const handleUpdatePracticeTask = (index, field, value) => {
    const updated = [...(objective.practiceTasks || [])];
    updated[index] = { ...updated[index], [field]: value };
    setObjective({ ...objective, practiceTasks: updated });
  };

  const handleDeletePracticeTask = (index) => {
    const updated = objective.practiceTasks.filter((_, i) => i !== index);
    setObjective({ ...objective, practiceTasks: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading objective...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={objectiveIndex === 'new' ? 'Create Learning Objective' : 'Edit Learning Objective'}
        description="Define the learning objective and add resources, assignments, and practice tasks"
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
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Objective
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-2">
          {[
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'resources', label: 'Resources', icon: BookOpen },
            { id: 'assignments', label: 'Assignments', icon: FileCheck },
            { id: 'practice', label: 'Practice Tasks', icon: Target },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                  : 'border-transparent text-textMuted hover:text-text hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold text-text">Objective Information</h3>
              <p className="mt-1 text-sm text-textMuted">Define the learning objective details</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                Objective Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={objective.text}
                onChange={(e) => handleObjectiveChange('text', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                rows={5}
                placeholder="Enter learning objective..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Minimum Duration (hours)</label>
              <input
                type="number"
                value={objective.minDuration}
                onChange={(e) => handleObjectiveChange('minDuration', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                min="0"
                step="0.5"
              />
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Resources</h3>
                <p className="mt-1 text-sm text-textMuted">Upload documents, videos, or add links for this objective</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddResource}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {(!objective.resources || objective.resources.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No resources added yet</p>
                <Button variant="ghost" size="sm" onClick={handleAddResource}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Resource
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {objective.resources.map((resource, index) => {
                  const getResourceIcon = () => {
                    switch (resource.type) {
                      case 'DOCUMENT':
                        return <File className="h-5 w-5 text-blue-600" />;
                      case 'VIDEO':
                        return <Video className="h-5 w-5 text-red-600" />;
                      case 'LINK':
                        return <Link2 className="h-5 w-5 text-green-600" />;
                      case 'NOTE':
                        return <FileText className="h-5 w-5 text-purple-600" />;
                      default:
                        return <FileText className="h-5 w-5 text-gray-600" />;
                    }
                  };

                  const getResourceTypeLabel = () => {
                    switch (resource.type) {
                      case 'DOCUMENT':
                        return 'Document';
                      case 'VIDEO':
                        return 'Video';
                      case 'LINK':
                        return 'Link';
                      case 'NOTE':
                        return 'Note';
                      default:
                        return resource.type;
                    }
                  };

                  return (
                    <div key={index} className="border border-gray-200 rounded-2xl p-5 bg-white hover:border-brand-500 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getResourceIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-base font-semibold text-text">{resource.title || 'Untitled Resource'}</h4>
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                {getResourceTypeLabel()}
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                resource.forWhom === 'LEARNER' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {resource.forWhom === 'LEARNER' ? 'Learner' : 'Tutor'}
                              </span>
                            </div>
                            {resource.type === 'NOTE' && resource.content && (
                              <p className="text-sm text-textMuted line-clamp-2 mb-2">{resource.content}</p>
                            )}
                            {resource.type === 'LINK' && resource.url && (
                              <button
                                onClick={() => {
                                  setImageError(false);
                                  setViewingResource(resource);
                                }}
                                className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-2 cursor-pointer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {resource.url}
                              </button>
                            )}
                            {resource.fileName && (
                              <div className="flex items-center gap-2 text-sm text-textMuted">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">{resource.fileName}</span>
                                {resource.fileSize && (
                                  <span className="text-xs">
                                    ({(resource.fileSize / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.url && resource.type !== 'NOTE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImageError(false);
                                setViewingResource(resource);
                              }}
                              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                              title="View Resource"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {resource.type === 'NOTE' && resource.content && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImageError(false);
                                setViewingResource(resource);
                              }}
                              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                              title="View Note"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditResource(index)}
                            className="text-text hover:text-brand-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResource(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Assignments</h3>
                <p className="mt-1 text-sm text-textMuted">Create assignments with difficulty levels and grading criteria</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </div>

            {(!objective.assignments || objective.assignments.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No assignments added yet</p>
                <Button variant="ghost" size="sm" onClick={handleAddAssignment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {objective.assignments.map((assignment, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Name</label>
                            <input
                              type="text"
                              value={assignment.name || ''}
                              onChange={(e) => handleUpdateAssignment(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              placeholder="Assignment name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Difficulty</label>
                            <select
                              value={assignment.difficulty}
                              onChange={(e) => handleUpdateAssignment(index, 'difficulty', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                            >
                              <option value="BEGINNER">Beginner</option>
                              <option value="INTERMEDIATE">Intermediate</option>
                              <option value="ADVANCED">Advanced</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">Description</label>
                          <textarea
                            value={assignment.description || ''}
                            onChange={(e) => handleUpdateAssignment(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={3}
                            placeholder="Assignment description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Max Marks</label>
                            <input
                              type="number"
                              value={assignment.maxMarks || 100}
                              onChange={(e) => handleUpdateAssignment(index, 'maxMarks', parseInt(e.target.value) || 100)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Passing Marks</label>
                            <input
                              type="number"
                              value={assignment.passingMarks || 50}
                              onChange={(e) => handleUpdateAssignment(index, 'passingMarks', parseInt(e.target.value) || 50)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Due Date</label>
                            <input
                              type="date"
                              value={assignment.dueDate || ''}
                              onChange={(e) => handleUpdateAssignment(index, 'dueDate', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssignment(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Practice Tasks Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Practice Tasks</h3>
                <p className="mt-1 text-sm text-textMuted">Create practice tasks with difficulty levels and time estimates</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddPracticeTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Practice Task
              </Button>
            </div>

            {(!objective.practiceTasks || objective.practiceTasks.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No practice tasks added yet</p>
                <Button variant="ghost" size="sm" onClick={handleAddPracticeTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Practice Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {objective.practiceTasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Name</label>
                            <input
                              type="text"
                              value={task.name || ''}
                              onChange={(e) => handleUpdatePracticeTask(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              placeholder="Task name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Difficulty</label>
                            <select
                              value={task.difficulty}
                              onChange={(e) => handleUpdatePracticeTask(index, 'difficulty', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                            >
                              <option value="BEGINNER">Beginner</option>
                              <option value="INTERMEDIATE">Intermediate</option>
                              <option value="ADVANCED">Advanced</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">Description</label>
                          <textarea
                            value={task.description || ''}
                            onChange={(e) => handleUpdatePracticeTask(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={3}
                            placeholder="Task description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Estimated Time (hours)</label>
                            <input
                              type="number"
                              value={task.estimatedTime || 0}
                              onChange={(e) => handleUpdatePracticeTask(index, 'estimatedTime', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              min="0"
                              step="0.5"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">Instructions</label>
                          <textarea
                            value={task.instructions || ''}
                            onChange={(e) => handleUpdatePracticeTask(index, 'instructions', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={4}
                            placeholder="Task instructions"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePracticeTask(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => {
          setShowResourceModal(false);
          setEditingResourceIndex(null);
          setResourceFormData({
            type: 'DOCUMENT',
            forWhom: 'LEARNER',
            title: '',
            url: '',
            content: '',
            file: null,
          });
        }}
        title={editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                Resource Type <span className="text-red-500">*</span>
              </label>
              <select
                value={resourceFormData.type}
                onChange={(e) => setResourceFormData({ ...resourceFormData, type: e.target.value, file: null, url: '', content: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              >
                <option value="DOCUMENT">Document</option>
                <option value="VIDEO">Video</option>
                <option value="LINK">Link</option>
                <option value="NOTE">Note</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                For Whom <span className="text-red-500">*</span>
              </label>
              <select
                value={resourceFormData.forWhom}
                onChange={(e) => setResourceFormData({ ...resourceFormData, forWhom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              >
                <option value="LEARNER">Learner</option>
                <option value="TUTOR">Tutor</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resourceFormData.title}
              onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="Resource title"
            />
          </div>

          {resourceFormData.type === 'NOTE' ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Content</label>
              <textarea
                value={resourceFormData.content}
                onChange={(e) => setResourceFormData({ ...resourceFormData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                rows={6}
                placeholder="Note content..."
              />
            </div>
          ) : resourceFormData.type === 'LINK' ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={resourceFormData.url}
                onChange={(e) => setResourceFormData({ ...resourceFormData, url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                placeholder="https://example.com/resource"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                {editingResourceIndex !== null && objective.resources[editingResourceIndex]?.fileName 
                  ? 'Uploaded File' 
                  : 'Upload File'}
              </label>
              {editingResourceIndex !== null && objective.resources[editingResourceIndex]?.fileName ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-900 truncate">
                      {objective.resources[editingResourceIndex].fileName}
                    </p>
                    {objective.resources[editingResourceIndex].fileSize && (
                      <p className="text-xs text-green-700 mt-0.5">
                        {(objective.resources[editingResourceIndex].fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = [...(objective.resources || [])];
                      updated[editingResourceIndex] = {
                        ...updated[editingResourceIndex],
                        url: '',
                        fileKey: '',
                        fileName: '',
                        fileSize: '',
                        mimeType: '',
                      };
                      setObjective({ ...objective, resources: updated });
                      setResourceFormData({ ...resourceFormData, file: null });
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="resource-file-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) {
                          toast.error('File size must be less than 50MB');
                          return;
                        }
                        setResourceFormData({ ...resourceFormData, file });
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip"
                    disabled={uploadingFiles.modal}
                  />
                  <label
                    htmlFor="resource-file-upload"
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploadingFiles.modal
                        ? 'border-brand-300 bg-brand-50 cursor-wait'
                        : resourceFormData.file
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50'
                    }`}
                  >
                    {uploadingFiles.modal ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                        <span className="text-sm font-medium text-brand-600">Uploading...</span>
                      </>
                    ) : resourceFormData.file ? (
                      <>
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{resourceFormData.file.name}</span>
                        <span className="text-xs text-green-600">
                          ({(resourceFormData.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-textMuted" />
                        <span className="text-sm font-medium text-text">Choose file or drag & drop</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-textMuted mt-2 text-center">
                    PDF, DOC, XLS, PPT, Images, Videos, ZIP (Max 50MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowResourceModal(false);
                setEditingResourceIndex(null);
                setResourceFormData({
                  type: 'DOCUMENT',
                  forWhom: 'LEARNER',
                  title: '',
                  url: '',
                  content: '',
                  file: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveResource}
              disabled={uploadingFiles.modal || !resourceFormData.title.trim()}
            >
              {uploadingFiles.modal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingResourceIndex !== null ? 'Update' : 'Add'} Resource
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Resource Modal */}
      <Modal
        isOpen={viewingResource !== null}
        onClose={() => {
          setViewingResource(null);
          setImageError(false);
        }}
        title={viewingResource?.title || 'View Resource'}
        size="xl"
      >
        {viewingResource && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className={`p-2 rounded-lg ${
                viewingResource.type === 'DOCUMENT' ? 'bg-blue-100 text-blue-600' :
                viewingResource.type === 'VIDEO' ? 'bg-red-100 text-red-600' :
                viewingResource.type === 'LINK' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {viewingResource.type === 'DOCUMENT' ? <File className="h-5 w-5" /> :
                 viewingResource.type === 'VIDEO' ? <Video className="h-5 w-5" /> :
                 viewingResource.type === 'LINK' ? <Link2 className="h-5 w-5" /> :
                 <FileText className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">{viewingResource.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    viewingResource.forWhom === 'LEARNER' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {viewingResource.forWhom === 'LEARNER' ? 'Learner' : 'Tutor'}
                  </span>
                  {viewingResource.fileName && (
                    <span className="text-xs text-textMuted">
                      {viewingResource.fileName}
                      {viewingResource.fileSize && ` (${(viewingResource.fileSize / 1024 / 1024).toFixed(2)} MB)`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[400px] max-h-[70vh] overflow-auto">
              {viewingResource.type === 'NOTE' ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-text font-sans">
                    {viewingResource.content || 'No content available'}
                  </pre>
                </div>
              ) : viewingResource.type === 'VIDEO' ? (
                <div className="w-full">
                  {viewingResource.url ? (
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={viewingResource.url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-center py-16 text-textMuted">
                      <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Video URL not available</p>
                    </div>
                  )}
                </div>
              ) : viewingResource.type === 'LINK' ? (
                <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                  {viewingResource.url ? (
                    <iframe
                      src={viewingResource.url}
                      className="w-full h-full"
                      title={viewingResource.title}
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  ) : (
                    <div className="text-center py-16 text-textMuted">
                      <Link2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Link URL not available</p>
                    </div>
                  )}
                </div>
              ) : (
                // DOCUMENT type
                <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {viewingResource.url ? (
                    <>
                      {viewingResource.url.match(/\.(pdf)$/i) || viewingResource.mimeType?.includes('pdf') ? (
                        <iframe
                          src={viewingResource.url}
                          className="w-full h-full bg-white"
                          title={viewingResource.title}
                          onError={(e) => {
                            console.error('PDF load error:', e);
                          }}
                        />
                      ) : viewingResource.url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || 
                            viewingResource.mimeType?.match(/^image\//) ? (
                        <div className="flex items-center justify-center h-full bg-gray-50 p-4 relative">
                          {!imageError ? (
                            <>
                              <img
                                src={viewingResource.url}
                                alt={viewingResource.title || 'Resource image'}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                onError={(e) => {
                                  console.error('Image load error:', viewingResource.url);
                                  setImageError(true);
                                }}
                                onLoad={() => {
                                  setImageError(false);
                                }}
                                style={{ maxHeight: 'calc(70vh - 100px)' }}
                              />
                              <div className="absolute top-2 right-2 z-10">
                                <a
                                  href={viewingResource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
                                  title="Open in new tab"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4 text-brand-600" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <File className="h-16 w-16 text-gray-400 mb-4" />
                              <p className="text-textMuted mb-2">Failed to load image</p>
                              <p className="text-xs text-textMuted mb-4">The image may be blocked by CORS or the URL may be invalid</p>
                              <a
                                href={viewingResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors inline-flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open in New Tab
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
                          <File className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-textMuted mb-4">Preview not available for this file type</p>
                          <a
                            href={viewingResource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors inline-flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open in New Tab
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 text-textMuted">
                      <File className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Document URL not available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {viewingResource.url && viewingResource.type !== 'NOTE' && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <a
                  href={viewingResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ObjectiveDetails;

