import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Activity, Plus, Search, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Engagement = () => {
  const [loading, setLoading] = useState(true);
  const [engagement, setEngagement] = useState([]);
  const [stats, setStats] = useState({ avgLogins: 0, lowEngagement: 0 });
  const [filters, setFilters] = useState({
    studentId: '',
    week: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    enrollmentId: '',
    week: '',
    lmsLogins: 0,
    assignmentsSubmitted: 0,
    mentorMessages: 0,
    calls: 0,
  });

  useEffect(() => {
    fetchEngagement();
  }, [filters]);

  const fetchEngagement = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getEngagement({
        studentId: filters.studentId || undefined,
        week: filters.week || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setEngagement(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        toast.error(response.message || 'Failed to load engagement metrics');
      }
    } catch (error) {
      console.error('Error fetching engagement:', error);
      toast.error(error.message || 'Failed to load engagement metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEngagement = async () => {
    try {
      const response = await lsmAPI.createEngagement(formData);
      if (response.success) {
        toast.success('Engagement metric created successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          week: '',
          lmsLogins: 0,
          assignmentsSubmitted: 0,
          mentorMessages: 0,
          calls: 0,
        });
        fetchEngagement();
      } else {
        toast.error(response.message || 'Failed to create engagement metric');
      }
    } catch (error) {
      console.error('Error creating engagement:', error);
      toast.error(error.message || 'Failed to create engagement metric');
    }
  };

  const getWeekString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil((now - new Date(year, 0, 1)) / 604800000);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'week',
      title: 'Week',
      render: (row) => <span className="text-sm">{row.week || 'N/A'}</span>,
    },
    {
      key: 'lmsLogins',
      title: 'LMS Logins',
      render: (row) => <span className="text-sm">{row.lmsLogins || 0}</span>,
    },
    {
      key: 'assignmentsSubmitted',
      title: 'Assignments',
      render: (row) => <span className="text-sm">{row.assignmentsSubmitted || 0}</span>,
    },
    {
      key: 'mentorMessages',
      title: 'Mentor Messages',
      render: (row) => <span className="text-sm">{row.mentorMessages || 0}</span>,
    },
    {
      key: 'calls',
      title: 'Calls',
      render: (row) => <span className="text-sm">{row.calls || 0}</span>,
    },
  ];

  if (loading && engagement.length === 0) {
    return (
      <>
        <PageHeader
          title="Engagement Metrics"
          description="Weekly engagement metrics"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading engagement metrics...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Engagement Metrics"
        description="Weekly engagement metrics"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Metric
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">Avg Logins</p>
              <p className="text-2xl font-semibold text-text mt-1">{stats.avgLogins}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">Low Engagement</p>
              <p className="text-2xl font-semibold text-text mt-1">{stats.lowEngagement}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

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
          <input
            type="text"
            placeholder="Week (e.g., 2024-W01)"
            value={filters.week}
            onChange={(e) => setFilters({ ...filters, week: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={engagement}
          emptyLabel="No engagement metrics found"
          minRows={10}
        />
      </div>

      {/* Create Engagement Modal */}
      {showModal && (
        <Modal
          title="Add Engagement Metric"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              week: getWeekString(),
              lmsLogins: 0,
              assignmentsSubmitted: 0,
              mentorMessages: 0,
              calls: 0,
            });
          }}
          onSubmit={handleCreateEngagement}
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
              <label className="block text-sm font-medium text-text mb-2">
                Week <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                placeholder="2024-W01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">LMS Logins</label>
              <input
                type="number"
                value={formData.lmsLogins}
                onChange={(e) => setFormData({ ...formData, lmsLogins: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Assignments Submitted</label>
              <input
                type="number"
                value={formData.assignmentsSubmitted}
                onChange={(e) => setFormData({ ...formData, assignmentsSubmitted: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Mentor Messages</label>
              <input
                type="number"
                value={formData.mentorMessages}
                onChange={(e) => setFormData({ ...formData, mentorMessages: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Calls</label>
              <input
                type="number"
                value={formData.calls}
                onChange={(e) => setFormData({ ...formData, calls: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Engagement;
