import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, ArrowRight, Layers3 } from 'lucide-react';
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

  useEffect(() => {
    if (moduleId && moduleId !== 'new') {
      loadModule();
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

          {moduleId && (
            <div className="pt-6 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`)}
                className="w-full justify-between"
              >
                <span>Manage Learning Objectives</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModuleDetails;

