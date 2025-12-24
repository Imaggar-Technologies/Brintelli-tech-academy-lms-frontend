import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart3, Plus, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState([]);
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
    assessmentAverage: 0,
    codingScore: 0,
    mockInterviewScore: 0,
    trend: 'STABLE',
  });

  useEffect(() => {
    fetchPerformance();
  }, [filters]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getPerformance({
        studentId: filters.studentId || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setPerformance(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load performance metrics');
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast.error(error.message || 'Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePerformance = async () => {
    try {
      const response = await lsmAPI.createPerformance(formData);
      if (response.success) {
        toast.success('Performance metric created successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          assessmentAverage: 0,
          codingScore: 0,
          mockInterviewScore: 0,
          trend: 'STABLE',
        });
        fetchPerformance();
      } else {
        toast.error(response.message || 'Failed to create performance metric');
      }
    } catch (error) {
      console.error('Error creating performance:', error);
      toast.error(error.message || 'Failed to create performance metric');
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'assessmentAverage',
      title: 'Assessments Avg',
      render: (row) => <span className="text-sm">{row.assessmentAverage || 0}%</span>,
    },
    {
      key: 'codingScore',
      title: 'Coding Score',
      render: (row) => <span className="text-sm">{row.codingScore || 0}%</span>,
    },
    {
      key: 'mockInterviewScore',
      title: 'Mock Interview',
      render: (row) => <span className="text-sm">{row.mockInterviewScore || 0}%</span>,
    },
    {
      key: 'trend',
      title: 'Trend',
      render: (row) => (
        <div className="flex items-center gap-2">
          {getTrendIcon(row.trend)}
          <span className="text-sm text-textMuted">{row.trend}</span>
        </div>
      ),
    },
  ];

  if (loading && performance.length === 0) {
    return (
      <>
        <PageHeader
          title="Performance Metrics"
          description="Scores and evaluation"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading performance metrics...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Performance Metrics"
        description="Scores and evaluation"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Performance
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
          data={performance}
          emptyLabel="No performance metrics found"
          minRows={10}
        />
      </div>

      {/* Create Performance Modal */}
      {showModal && (
        <Modal
          title="Add Performance Metric"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              assessmentAverage: 0,
              codingScore: 0,
              mockInterviewScore: 0,
              trend: 'STABLE',
            });
          }}
          onSubmit={handleCreatePerformance}
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
              <label className="block text-sm font-medium text-text mb-2">Assessment Average (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.assessmentAverage}
                onChange={(e) => setFormData({ ...formData, assessmentAverage: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Coding Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.codingScore}
                onChange={(e) => setFormData({ ...formData, codingScore: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Mock Interview Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.mockInterviewScore}
                onChange={(e) => setFormData({ ...formData, mockInterviewScore: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Trend</label>
              <select
                value={formData.trend}
                onChange={(e) => setFormData({ ...formData, trend: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="IMPROVING">Improving</option>
                <option value="STABLE">Stable</option>
                <option value="DECLINING">Declining</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Performance;
