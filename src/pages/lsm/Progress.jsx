import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { TrendingUp, Plus, Search, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);
  const [filters, setFilters] = useState({
    studentId: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    enrollmentId: '',
    moduleCompletionPercent: 0,
    assignmentsCompletionPercent: 0,
    assessmentCompletionPercent: 0,
    pendingTasks: [],
  });

  useEffect(() => {
    fetchProgress();
  }, [filters]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getProgress({
        studentId: filters.studentId || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setProgress(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load progress metrics');
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error(error.message || 'Failed to load progress metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgress = async () => {
    try {
      const response = await lsmAPI.createProgress(formData);
      if (response.success) {
        toast.success('Progress metric created successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          moduleCompletionPercent: 0,
          assignmentsCompletionPercent: 0,
          assessmentCompletionPercent: 0,
          pendingTasks: [],
        });
        fetchProgress();
      } else {
        toast.error(response.message || 'Failed to create progress metric');
      }
    } catch (error) {
      console.error('Error creating progress:', error);
      toast.error(error.message || 'Failed to create progress metric');
    }
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'moduleCompletionPercent',
      title: 'Module %',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full"
              style={{ width: `${row.moduleCompletionPercent || 0}%` }}
            ></div>
          </div>
          <span className="text-sm">{row.moduleCompletionPercent || 0}%</span>
        </div>
      ),
    },
    {
      key: 'assignmentsCompletionPercent',
      title: 'Assignments %',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${row.assignmentsCompletionPercent || 0}%` }}
            ></div>
          </div>
          <span className="text-sm">{row.assignmentsCompletionPercent || 0}%</span>
        </div>
      ),
    },
    {
      key: 'assessmentCompletionPercent',
      title: 'Assessment %',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${row.assessmentCompletionPercent || 0}%` }}
            ></div>
          </div>
          <span className="text-sm">{row.assessmentCompletionPercent || 0}%</span>
        </div>
      ),
    },
    {
      key: 'pendingTasks',
      title: 'Pending Tasks',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.pendingTasks?.length || 0} tasks
        </span>
      ),
    },
  ];

  if (loading && progress.length === 0) {
    return (
      <>
        <PageHeader
          title="Progress Metrics"
          description="Course/module completion"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading progress metrics...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Progress Metrics"
        description="Course/module completion"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Progress
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
          data={progress}
          emptyLabel="No progress metrics found"
          minRows={10}
        />
      </div>

      {/* Create Progress Modal */}
      {showModal && (
        <Modal
          title="Add Progress Metric"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              moduleCompletionPercent: 0,
              assignmentsCompletionPercent: 0,
              assessmentCompletionPercent: 0,
              pendingTasks: [],
            });
          }}
          onSubmit={handleCreateProgress}
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
              <label className="block text-sm font-medium text-text mb-2">Module Completion %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.moduleCompletionPercent}
                onChange={(e) => setFormData({ ...formData, moduleCompletionPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Assignments Completion %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.assignmentsCompletionPercent}
                onChange={(e) => setFormData({ ...formData, assignmentsCompletionPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Assessment Completion %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.assessmentCompletionPercent}
                onChange={(e) => setFormData({ ...formData, assessmentCompletionPercent: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Progress;
