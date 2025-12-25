import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Plus, BookOpen, ArrowRight, Edit2, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';

const ObjectivesList = () => {
  const navigate = useNavigate();
  const { programId, moduleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [objectives, setObjectives] = useState([]);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      setLoading(true);
      // First get all modules to find the one we need
      const response = await programAPI.getModulesByProgram(programId);
      if (response.success && response.data.modules) {
        const foundModule = response.data.modules.find(m => 
          (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
        );
        if (foundModule) {
          setModule(foundModule);
          setObjectives(foundModule.objectives || []);
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObjective = async (index) => {
    if (!window.confirm('Are you sure you want to delete this objective?')) return;

    const updated = objectives.filter((_, i) => i !== index);
    setObjectives(updated);

    try {
      await programAPI.updateModule(moduleId, {
        ...module,
        objectives: updated
      });
      toast.success('Objective deleted');
      loadModule();
    } catch (error) {
      console.error('Error deleting objective:', error);
      toast.error('Failed to delete objective');
      loadModule(); // Reload on error
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
        title={`Learning Objectives - ${module?.name || 'Module'}`}
        description="Manage learning objectives for this module"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Objective
            </Button>
          </div>
        }
      />

      <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
        {objectives.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-text mb-2">No learning objectives yet</p>
            <p className="text-sm text-textMuted mb-6">
              Start by adding your first learning objective
            </p>
            <Button
              variant="primary"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Objective
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl p-6 bg-white hover:border-brand-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
                        Objective {index + 1}
                      </span>
                      {objective.minDuration > 0 && (
                        <span className="text-xs font-medium text-textMuted">
                          {objective.minDuration}h duration
                        </span>
                      )}
                    </div>
                    <p className="text-text font-semibold mb-3 leading-relaxed">{objective.text}</p>
                    <div className="flex items-center gap-6 text-xs font-medium text-textMuted">
                      {objective.resources && objective.resources.length > 0 && (
                        <span>{objective.resources.length} Resource{objective.resources.length !== 1 ? 's' : ''}</span>
                      )}
                      {objective.assignments && objective.assignments.length > 0 && (
                        <span>{objective.assignments.length} Assignment{objective.assignments.length !== 1 ? 's' : ''}</span>
                      )}
                      {objective.practiceTasks && objective.practiceTasks.length > 0 && (
                        <span>{objective.practiceTasks.length} Practice Task{objective.practiceTasks.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives/${index}`)}
                      className="text-text hover:text-brand-600"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteObjective(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ObjectivesList;

