import { useState } from 'react';
import { X, FileCheck } from 'lucide-react';
import Modal from '../Modal';
import Button from '../Button';

/**
 * Modal to create a new workshop assignment/assessment.
 * Expects: isOpen, onClose, onSubmit({ title, description, dueDate }), loading?
 */
export default function CreateAssessmentModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSubmit({ title: t, description: description.trim() || undefined, dueDate: dueDate || undefined });
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={null} size="md">
      <div className="flex flex-col -m-6">
        <div className="rounded-t-2xl bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Create assessment</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="assessment-title" className="block text-sm font-medium text-text mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="assessment-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 1 Assignment"
              className="w-full rounded-xl border border-brintelli-border bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              required
            />
          </div>
          <div>
            <label htmlFor="assessment-description" className="block text-sm font-medium text-text mb-1">
              Description
            </label>
            <textarea
              id="assessment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or guidelines for the assessment..."
              rows={3}
              className="w-full rounded-xl border border-brintelli-border bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
            />
          </div>
          <div>
            <label htmlFor="assessment-due" className="block text-sm font-medium text-text mb-1">
              Due date
            </label>
            <input
              id="assessment-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-brintelli-border bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating…' : 'Create assessment'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
