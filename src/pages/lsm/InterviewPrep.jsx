import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Briefcase, Plus, Search, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const InterviewPrep = () => {
  const [loading, setLoading] = useState(true);
  const [prepPlans, setPrepPlans] = useState([]);
  const [filters, setFilters] = useState({
    studentId: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedPrep, setSelectedPrep] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    enrollmentId: '',
    focusAreas: [],
    resources: [],
    mockInterviews: [],
  });
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchPrepPlans();
  }, [filters]);

  const fetchPrepPlans = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getInterviewPrep({
        studentId: filters.studentId || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setPrepPlans(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load interview prep plans');
      }
    } catch (error) {
      console.error('Error fetching interview prep:', error);
      toast.error(error.message || 'Failed to load interview prep plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrep = async () => {
    try {
      const response = await lsmAPI.createInterviewPrep(formData);
      if (response.success) {
        toast.success('Interview prep plan created successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          focusAreas: [],
          resources: [],
          mockInterviews: [],
        });
        fetchPrepPlans();
      } else {
        toast.error(response.message || 'Failed to create interview prep plan');
      }
    } catch (error) {
      console.error('Error creating interview prep:', error);
      toast.error(error.message || 'Failed to create interview prep plan');
    }
  };

  const handleAddFeedback = async () => {
    try {
      const response = await lsmAPI.addInterviewPrepFeedback(
        selectedPrep.id,
        feedbackText,
        'current-user-id' // This should come from auth context
      );
      if (response.success) {
        toast.success('Feedback added successfully');
        setShowFeedbackModal(false);
        setSelectedPrep(null);
        setFeedbackText('');
        fetchPrepPlans();
      } else {
        toast.error(response.message || 'Failed to add feedback');
      }
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast.error(error.message || 'Failed to add feedback');
    }
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'focusAreas',
      title: 'Focus Areas',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.focusAreas?.length || 0} areas
        </span>
      ),
    },
    {
      key: 'resources',
      title: 'Resources',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.resources?.length || 0} resources
        </span>
      ),
    },
    {
      key: 'mockInterviews',
      title: 'Mock Interviews',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.mockInterviews?.length || 0} scheduled
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedPrep(row);
            setShowFeedbackModal(true);
          }}
          className="p-1 text-brand-600 hover:text-brand-700"
          title="Add Feedback"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (loading && prepPlans.length === 0) {
    return (
      <>
        <PageHeader
          title="Interview Prep"
          description="Interview preparation plans"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading interview prep plans...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Interview Prep"
        description="Interview preparation plans"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-4 mb-6 shadow-soft">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
              <input
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={prepPlans}
          emptyLabel="No interview prep plans found"
          minRows={10}
        />
      </div>

      {/* Create Prep Plan Modal */}
      {showModal && (
        <Modal
          title="Create Interview Prep Plan"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              focusAreas: [],
              resources: [],
              mockInterviews: [],
            });
          }}
          onSubmit={handleCreatePrep}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Focus Areas (comma-separated)</label>
              <input
                type="text"
                value={formData.focusAreas.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  focusAreas: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                placeholder="e.g., Data Structures, System Design"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Resources (comma-separated)</label>
              <input
                type="text"
                value={formData.resources.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  resources: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                placeholder="e.g., LeetCode, Cracking the Coding Interview"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Add Feedback Modal */}
      {showFeedbackModal && selectedPrep && (
        <Modal
          title="Add Feedback"
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedPrep(null);
            setFeedbackText('');
          }}
          onSubmit={handleAddFeedback}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                rows={4}
                placeholder="Enter feedback..."
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default InterviewPrep;
