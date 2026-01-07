import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Plus, Target, Edit2, Trash2, Save, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import programAPI from '../../api/program';

const SubModuleObjectives = () => {
  const navigate = useNavigate();
  const { programId, moduleId, subModuleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [subModule, setSubModule] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [objectiveFormData, setObjectiveFormData] = useState({
    title: '',
    description: '',
    minDuration: 0,
  });
  const [savingObjective, setSavingObjective] = useState(false);

  useEffect(() => {
    loadSubModule();
    loadObjectives();
  }, [subModuleId]);

  const loadSubModule = async () => {
    try {
      const response = await programAPI.getSubModuleById(subModuleId);
      if (response.success && response.data.subModule) {
        setSubModule(response.data.subModule);
      }
    } catch (error) {
      console.error('Error loading sub-module:', error);
      toast.error('Failed to load sub-module');
    }
  };

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getSubModuleObjectives(subModuleId);
      if (response.success) {
        setObjectives(response.data.objectives || []);
      }
    } catch (error) {
      console.error('Error loading objectives:', error);
      toast.error('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (objective = null) => {
    if (objective) {
      setEditingObjective(objective);
      setObjectiveFormData({
        title: objective.title || objective.text || '',
        description: objective.description || '',
        minDuration: objective.minDuration || 0,
      });
    } else {
      setEditingObjective(null);
      setObjectiveFormData({
        title: '',
        description: '',
        minDuration: 0,
      });
    }
    setShowObjectiveModal(true);
  };

  const handleSaveObjective = async () => {
    if (!objectiveFormData.title.trim()) {
      toast.error('Objective title is required');
      return;
    }

    setSavingObjective(true);
    try {
      const objectiveData = {
        title: objectiveFormData.title,
        description: objectiveFormData.description,
        minDuration: parseFloat(objectiveFormData.minDuration) || 0,
      };

      if (editingObjective) {
        await programAPI.updateSubModuleObjective(editingObjective.id || editingObjective._id, objectiveData);
        toast.success('Objective updated successfully');
      } else {
        await programAPI.createSubModuleObjective(subModuleId, objectiveData);
        toast.success('Objective created successfully');
      }

      setShowObjectiveModal(false);
      loadObjectives();
    } catch (error) {
      console.error('Error saving objective:', error);
      toast.error(error.message || 'Failed to save objective');
    } finally {
      setSavingObjective(false);
    }
  };

  const handleDeleteObjective = async (objectiveId) => {
    if (!window.confirm('Are you sure you want to delete this learning objective?')) {
      return;
    }

    try {
      await programAPI.deleteSubModuleObjective(objectiveId);
      toast.success('Objective deleted successfully');
      loadObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
      toast.error('Failed to delete objective');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading objectives...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Learning Objectives"
        description={`Manage learning objectives for ${subModule?.name || 'Sub-Module'}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Objective
            </Button>
          </div>
        }
      />

      <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
        {objectives.length === 0 ? (
          <div className="text-center py-12 text-textMuted">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold mb-2">No learning objectives yet</p>
            <p className="text-sm mb-4">Create learning objectives to define what students will learn in this sub-module</p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Objective
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {objectives.map((objective, index) => (
              <div
                key={objective.id || objective._id || index}
                className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 hover:border-brand-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-bold shadow-sm">
                        Objective {index + 1}
                      </span>
                      {objective.minDuration > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          ⏱️ {objective.minDuration}h
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {objective.title || objective.text || 'Untitled Objective'}
                    </h3>
                    {objective.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">{objective.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}/objectives/${objective.id || objective._id}/content`)}
                      className="gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Manage Content
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(objective)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteObjective(objective.id || objective._id)}
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

      {/* Objective Modal */}
      <Modal
        isOpen={showObjectiveModal}
        onClose={() => setShowObjectiveModal(false)}
        title={editingObjective ? 'Edit Learning Objective' : 'Create Learning Objective'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Objective Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={objectiveFormData.title}
              onChange={(e) => setObjectiveFormData({ ...objectiveFormData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="e.g., Understand React component lifecycle"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">Description</label>
            <textarea
              value={objectiveFormData.description}
              onChange={(e) => setObjectiveFormData({ ...objectiveFormData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
              rows={4}
              placeholder="Describe what students will learn..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">Minimum Duration (hours)</label>
            <input
              type="number"
              value={objectiveFormData.minDuration}
              onChange={(e) => setObjectiveFormData({ ...objectiveFormData, minDuration: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              min="0"
              step="0.5"
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setShowObjectiveModal(false)}
              disabled={savingObjective}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveObjective}
              disabled={savingObjective}
            >
              {savingObjective ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingObjective ? 'Update' : 'Create'} Objective
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SubModuleObjectives;

