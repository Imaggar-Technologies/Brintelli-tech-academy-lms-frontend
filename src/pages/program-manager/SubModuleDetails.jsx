import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, ArrowRight, Layers3, Plus, Target } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';

const SubModuleDetails = () => {
  const navigate = useNavigate();
  const { programId, moduleId, subModuleId } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subModuleData, setSubModuleData] = useState({
    name: '',
    description: '',
    order: 0,
    duration: 0,
    status: 'DRAFT',
  });
  const [objectives, setObjectives] = useState([]);

  useEffect(() => {
    if (subModuleId && subModuleId !== 'new') {
      loadSubModule();
    } else {
      setLoading(false);
    }
  }, [subModuleId]);

  // Auto-save functionality
  useEffect(() => {
    if (subModuleId && subModuleId !== 'new' && subModuleData.name) {
      const autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [subModuleData, subModuleId]);

  const loadSubModule = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getSubModuleById(subModuleId);
      if (response.success && response.data.subModule) {
        const subModule = response.data.subModule;
        setSubModuleData({
          name: subModule.name || '',
          description: subModule.description || '',
          order: subModule.order || 0,
          duration: subModule.duration || 0,
          status: subModule.status || 'DRAFT',
        });
        // Load objectives
        const objectivesResponse = await programAPI.getSubModuleObjectives(subModuleId);
        if (objectivesResponse.success) {
          setObjectives(objectivesResponse.data.objectives || []);
        }
      }
    } catch (error) {
      console.error('Error loading sub-module:', error);
      toast.error('Failed to load sub-module');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!subModuleId || subModuleId === 'new') return;
    
    setSaving(true);
    try {
      await programAPI.updateSubModule(subModuleId, {
        ...subModuleData,
        status: 'DRAFT',
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSubModuleData({ ...subModuleData, [field]: value });
  };

  const handleSave = async () => {
    if (!subModuleData.name.trim()) {
      toast.error('Sub-module name is required');
      return;
    }

    setSaving(true);
    try {
      if (subModuleId && subModuleId !== 'new') {
        await programAPI.updateSubModule(subModuleId, subModuleData);
        toast.success('Sub-module updated successfully');
      } else {
        // Get current sub-modules to determine order
        const subModulesResponse = await programAPI.getSubModulesByModule(moduleId);
        const currentSubModules = subModulesResponse.success ? subModulesResponse.data.subModules : [];
        const response = await programAPI.createSubModule(moduleId, {
          ...subModuleData,
          order: subModuleData.order || currentSubModules.length
        });
        if (response.success) {
          toast.success('Sub-module created successfully');
          const newSubModuleId = response.data.subModule?.id || response.data.subModule?._id || response.data.subModuleId;
          navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${newSubModuleId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error saving sub-module:', error);
      toast.error(error.message || 'Failed to save sub-module');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading sub-module...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={subModuleId && subModuleId !== 'new' ? `Edit Sub-Module` : 'Create Sub-Module'}
        description={subModuleId && subModuleId !== 'new' ? 'Edit sub-module details' : 'Create a new sub-module for this module'}
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
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}`)}
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
              Save Sub-Module
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold text-text">Sub-Module Details</h3>
              <p className="mt-1 text-sm text-textMuted">Configure the sub-module information</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                Sub-Module Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subModuleData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                placeholder="e.g., React Components Basics"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Description</label>
              <textarea
                value={subModuleData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                rows={4}
                placeholder="Sub-module description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text">Order</label>
                <input
                  type="number"
                  value={subModuleData.order}
                  onChange={(e) => handleChange('order', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text">Duration (hours)</label>
                <input
                  type="number"
                  value={subModuleData.duration}
                  onChange={(e) => handleChange('duration', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text">Status</label>
                <select
                  value={subModuleData.status}
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

        {subModuleId && subModuleId !== 'new' && (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-text">Learning Objectives</h3>
                  <p className="mt-1 text-sm text-textMuted">Manage learning objectives for this sub-module</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}/objectives`)}
                  className="w-full justify-between"
                >
                  <span>Manage Learning Objectives</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {objectives.length === 0 ? (
                <div className="text-center py-8 text-textMuted">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No learning objectives yet</p>
                  <p className="text-sm mt-2">Click "Manage Objectives" to add learning objectives</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {objectives.map((objective, index) => (
                    <div
                      key={objective.id || objective._id || index}
                      className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 hover:border-brand-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-lg bg-brand-500 text-white text-xs font-bold">
                              Objective {index + 1}
                            </span>
                            {objective.minDuration > 0 && (
                              <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                ⏱️ {objective.minDuration}h
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-semibold text-text mb-1">
                            {objective.title || objective.text || 'Untitled Objective'}
                          </h4>
                          {objective.description && (
                            <p className="text-sm text-textMuted">{objective.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SubModuleDetails;

