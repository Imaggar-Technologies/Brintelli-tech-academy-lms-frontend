import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Search, Download } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const WeeklyReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    studentId: '',
    week: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    week: '',
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getWeeklyReports({
        studentId: filters.studentId || undefined,
        week: filters.week || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setReports(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load weekly reports');
      }
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      toast.error(error.message || 'Failed to load weekly reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await lsmAPI.generateWeeklyReport(formData);
      if (response.success) {
        toast.success('Weekly report generated successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          week: '',
        });
        fetchReports();
      } else {
        toast.error(response.message || 'Failed to generate weekly report');
      }
    } catch (error) {
      console.error('Error generating weekly report:', error);
      toast.error(error.message || 'Failed to generate weekly report');
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
      key: 'summary',
      title: 'Summary',
      render: (row) => (
        <span className="text-sm text-textMuted line-clamp-2">{row.summary || 'No summary'}</span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Generated',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => {
            // Download report logic
            toast.info('Download functionality coming soon');
          }}
          className="p-1 text-brand-600 hover:text-brand-700"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (loading && reports.length === 0) {
    return (
      <>
        <PageHeader
          title="Weekly Reports"
          description="Weekly progress reports"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading weekly reports...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Weekly Reports"
        description="Weekly progress reports"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Report
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
          data={reports}
          emptyLabel="No weekly reports found"
          minRows={10}
        />
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <Modal
          title="Generate Weekly Report"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              week: getWeekString(),
            });
          }}
          onSubmit={handleGenerateReport}
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
          </div>
        </Modal>
      )}
    </>
  );
};

export default WeeklyReports;
