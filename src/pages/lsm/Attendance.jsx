import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CalendarCheck, Plus, Search, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [filters, setFilters] = useState({
    studentId: '',
    batchId: '',
    week: '',
    period: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    sessionId: '',
    attended: true,
    late: false,
  });

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getAttendance({
        studentId: filters.studentId || undefined,
        batchId: filters.batchId || undefined,
        week: filters.week || undefined,
        period: filters.period || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setAttendance(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error(error.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const response = await lsmAPI.markAttendance(formData);
      if (response.success) {
        toast.success('Attendance marked successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          sessionId: '',
          attended: true,
          late: false,
        });
        fetchAttendance();
      } else {
        toast.error(response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.message || 'Failed to mark attendance');
    }
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'batchName',
      title: 'Batch',
      render: (row) => <span className="text-sm">{row.batchName || 'N/A'}</span>,
    },
    {
      key: 'week',
      title: 'Week/Month',
      render: (row) => <span className="text-sm">{row.week || 'N/A'}</span>,
    },
    {
      key: 'attendancePercent',
      title: 'Attendance %',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                (row.attendancePercent || 0) >= 80 ? 'bg-green-500' :
                (row.attendancePercent || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${row.attendancePercent || 0}%` }}
            ></div>
          </div>
          <span className="text-sm">{row.attendancePercent || 0}%</span>
        </div>
      ),
    },
    {
      key: 'absents',
      title: 'Absents',
      render: (row) => (
        <span className={`text-sm ${(row.absents || 0) > 3 ? 'text-red-600 font-medium' : 'text-textMuted'}`}>
          {row.absents || 0}
        </span>
      ),
    },
    {
      key: 'lateCount',
      title: 'Late',
      render: (row) => <span className="text-sm text-textMuted">{row.lateCount || 0}</span>,
    },
  ];

  if (loading && attendance.length === 0) {
    return (
      <>
        <PageHeader
          title="Attendance Tracking"
          description="Attendance tracking"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading attendance records...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Attendance Tracking"
        description="Attendance tracking"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Mark Attendance
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
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Periods</option>
            <option value="WEEK">Week</option>
            <option value="MONTH">Month</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={attendance}
          emptyLabel="No attendance records found"
          minRows={10}
        />
      </div>

      {/* Mark Attendance Modal */}
      {showModal && (
        <Modal
          title="Mark Attendance"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              sessionId: '',
              attended: true,
              late: false,
            });
          }}
          onSubmit={handleMarkAttendance}
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
                Session ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.sessionId}
                onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.attended}
                  onChange={(e) => setFormData({ ...formData, attended: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-text">Attended</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.late}
                  onChange={(e) => setFormData({ ...formData, late: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-text">Late</span>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Attendance;
