import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, ArrowRight, Layers3, Plus, Target, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';

const ModuleDetails = () => {
  const navigate = useNavigate();
  const { programId, moduleId } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState({
    name: '',
    description: '',
    order: 0,
    duration: 0,
    status: 'DRAFT',
  });
  const [subModules, setSubModules] = useState([]);
  const [loadingSubModules, setLoadingSubModules] = useState(false);

  useEffect(() => {
    if (moduleId && moduleId !== 'new') {
      loadModule();
      loadSubModules();
    } else {
      setLoading(false);
    }
  }, [moduleId]);

  // Auto-save functionality
  useEffect(() => {
    if (moduleId && moduleData.name) {
      const autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [moduleData, moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      // Get all modules and find the one we need
      const response = await programAPI.getModulesByProgram(programId);
      if (response.success && response.data.modules) {
        const foundModule = response.data.modules.find(m => 
          (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
        );
        if (foundModule) {
          setModuleData({
            name: foundModule.name || '',
            description: foundModule.description || '',
            order: foundModule.order || 0,
            duration: foundModule.duration || 0,
            status: foundModule.status || 'DRAFT',
          });
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const loadSubModules = async () => {
    if (!moduleId || moduleId === 'new') return;
    
    try {
      setLoadingSubModules(true);
      const response = await programAPI.getSubModulesByModule(moduleId);
      if (response.success) {
        setSubModules(response.data.subModules || []);
      }
    } catch (error) {
      console.error('Error loading sub-modules:', error);
      // Don't show error if endpoint doesn't exist yet
    } finally {
      setLoadingSubModules(false);
    }
  };

  const handleDeleteSubModule = async (subModuleId) => {
    if (!window.confirm('Are you sure you want to delete this sub-module?')) {
      return;
    }

    try {
      await programAPI.deleteSubModule(subModuleId);
      toast.success('Sub-module deleted successfully');
      loadSubModules();
    } catch (error) {
      console.error('Error deleting sub-module:', error);
      toast.error('Failed to delete sub-module');
    }
  };

  const autoSave = async () => {
    if (!moduleId) return;
    
    setSaving(true);
    try {
      await programAPI.updateModule(moduleId, {
        ...moduleData,
        status: 'DRAFT',
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setModuleData({ ...moduleData, [field]: value });
  };

  const handleSave = async () => {
    if (!moduleData.name.trim()) {
      toast.error('Module name is required');
      return;
    }

    setSaving(true);
    try {
      if (moduleId && moduleId !== 'new') {
        await programAPI.updateModule(moduleId, moduleData);
        toast.success('Module updated successfully');
      } else {
        // Get current modules to determine order
        const modulesResponse = await programAPI.getModulesByProgram(programId);
        const currentModules = modulesResponse.success ? modulesResponse.data.modules : [];
        const response = await programAPI.createModule(programId, {
          ...moduleData,
          order: moduleData.order || currentModules.length
        });
        if (response.success) {
          toast.success('Module created successfully');
          const newModuleId = response.data.module?.id || response.data.module?._id || response.data.moduleId;
          navigate(`/program-manager/programs/${programId}/modules/${newModuleId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error(error.message || 'Failed to save module');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading module...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={moduleId ? `Edit Module` : 'Create Module'}
        description={moduleId ? 'Edit module details' : 'Create a new module for this program'}
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
              onClick={() => navigate(`/program-manager/programs/create/${programId}`)}
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
              Save Module
            </Button>
          </div>
        }
      />

      <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-xl font-semibold text-text">Module Details</h3>
            <p className="mt-1 text-sm text-textMuted">Configure the module information</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={moduleData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="e.g., Introduction to React"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={moduleData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
              rows={4}
              placeholder="Module description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Order</label>
              <input
                type="number"
                value={moduleData.order}
                onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Duration (hours)</label>
              <input
                type="number"
                value={moduleData.duration}
                onChange={(e) => handleChange('duration', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                min="0"
                step="0.5"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Status</label>
              <select
                value={moduleData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {moduleId && moduleId !== 'new' && (
        <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Sub-Modules</h3>
                <p className="mt-1 text-sm text-textMuted">Organize content into sub-modules with learning objectives</p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/new`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sub-Module
              </Button>
            </div>

            {loadingSubModules ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-textMuted">Loading sub-modules...</p>
              </div>
            ) : subModules.length === 0 ? (
              <div className="text-center py-8 text-textMuted">
                <Layers3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No sub-modules yet</p>
                <p className="text-sm mt-2">Create sub-modules to organize learning objectives</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subModules
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((subModule, index) => (
                    <div
                      key={subModule.id || subModule._id || index}
                      className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 hover:border-brand-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModule.id || subModule._id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-text">
                              {subModule.name || `Sub-Module ${index + 1}`}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              subModule.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200' :
                              subModule.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}>
                              {subModule.status || 'DRAFT'}
                            </span>
                          </div>
                          {subModule.description && (
                            <p className="text-sm text-textMuted mb-3">{subModule.description}</p>
                          )}
                          <div className="flex items-center gap-6 text-xs font-medium text-textMuted">
                            <span>Order: {subModule.order || 0}</span>
                            <span>Duration: {subModule.duration || 0}h</span>
                            {subModule.objectives && subModule.objectives.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {subModule.objectives.length} Objective{subModule.objectives.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModule.id || subModule._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubModule(subModule.id || subModule._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ModuleDetails;

