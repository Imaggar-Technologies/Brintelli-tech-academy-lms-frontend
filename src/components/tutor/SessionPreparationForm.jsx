import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, FileText, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../Button';
import sessionAPI from '../../api/session';

const SessionPreparationForm = ({ sessionId, session, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lessonPlan: '',
    materials: [],
    objectives: [],
    notes: '',
  });
  const [preparationComplete, setPreparationComplete] = useState(false);
  const [preparationStatus, setPreparationStatus] = useState('NOT_STARTED');

  useEffect(() => {
    if (session) {
      setFormData({
        lessonPlan: session.preparationData?.lessonPlan || '',
        materials: session.preparationData?.materials || [],
        objectives: session.preparationData?.objectives || [],
        notes: session.preparationData?.notes || '',
      });
      setPreparationStatus(session.preparationStatus || 'NOT_STARTED');
    }
  }, [session]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { type: 'link', url: '', title: '' }],
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await sessionAPI.updatePreparation(sessionId, formData);
      toast.success('Preparation saved');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to save preparation');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      await sessionAPI.markPreparationComplete(sessionId);
      setPreparationStatus('COMPLETED');
      toast.success('Preparation marked as complete');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to mark preparation complete');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!preparationComplete) {
      toast.error('Please mark preparation as complete first');
      return;
    }

    try {
      setLoading(true);
      await sessionAPI.submitPreparationForApproval(sessionId);
      setPreparationStatus('PENDING_APPROVAL');
      toast.success('Preparation submitted for approval');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to submit preparation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      NOT_STARTED: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
      IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
      COMPLETED: { label: 'Completed', color: 'bg-yellow-100 text-yellow-700' },
      PENDING_APPROVAL: { label: 'Pending Approval', color: 'bg-orange-100 text-orange-700' },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[preparationStatus] || statusConfig.NOT_STARTED;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-brand-600" />
            <div>
              <h2 className="text-xl font-semibold text-text">Session Preparation</h2>
              <p className="text-sm text-textMuted">{session?.name || 'Session'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Lesson Plan */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Lesson Plan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.lessonPlan}
              onChange={(e) => handleInputChange('lessonPlan', e.target.value)}
              placeholder="Enter your lesson plan for this session..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Materials
            </label>
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Material title"
                    value={material.title}
                    onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={material.url}
                    onChange={(e) => handleMaterialChange(index, 'url', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveMaterial(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddMaterial}
                className="w-full"
              >
                + Add Material
              </Button>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Learning Objectives
            </label>
            <textarea
              value={formData.objectives.join('\n')}
              onChange={(e) => handleInputChange('objectives', e.target.value.split('\n').filter(Boolean))}
              placeholder="Enter learning objectives, one per line..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or reminders..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Mark Complete Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="preparationComplete"
              checked={preparationComplete}
              onChange={(e) => setPreparationComplete(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="preparationComplete" className="flex-1 text-sm text-text">
              Mark preparation as complete
            </label>
          </div>

          {/* Approval Status */}
          {preparationStatus === 'PENDING_APPROVAL' && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">Pending Approval</p>
                <p className="text-sm text-orange-700 mt-1">
                  Your preparation has been submitted and is awaiting approval from Program Manager or LSM.
                </p>
              </div>
            </div>
          )}

          {preparationStatus === 'APPROVED' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Approved</p>
                <p className="text-sm text-green-700 mt-1">
                  Your preparation has been approved. The session can now be enabled.
                </p>
              </div>
            </div>
          )}

          {preparationStatus === 'REJECTED' && session?.preparationApproval?.rejectionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-1">Rejected</p>
              <p className="text-sm text-red-700">
                Reason: {session.preparationApproval.rejectionReason}
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={loading || !formData.lessonPlan}
          >
            Save Draft
          </Button>
          {preparationStatus === 'IN_PROGRESS' || preparationStatus === 'NOT_STARTED' ? (
            <Button
              onClick={handleMarkComplete}
              disabled={loading || !formData.lessonPlan || !preparationComplete}
            >
              Mark Complete
            </Button>
          ) : null}
          {preparationStatus === 'COMPLETED' && (
            <Button
              onClick={handleSubmit}
              disabled={loading || !preparationComplete}
            >
              Submit for Approval
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPreparationForm;

