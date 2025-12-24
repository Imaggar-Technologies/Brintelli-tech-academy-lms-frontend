import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Search, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const SessionLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    studentId: '',
    batchId: '',
    date: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'SESSION',
    sessionId: '',
    oneOnOneId: '',
    studentId: '',
    batchId: '',
    date: new Date().toISOString().split('T')[0],
    attendance: false,
    notes: '',
    actionItems: [],
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getSessionLogs({
        type: filters.type || undefined,
        studentId: filters.studentId || undefined,
        batchId: filters.batchId || undefined,
        date: filters.date || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setLogs(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load session logs');
      }
    } catch (error) {
      console.error('Error fetching session logs:', error);
      toast.error(error.message || 'Failed to load session logs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLog = async () => {
    try {
      const response = await lsmAPI.createSessionLog(formData);
      if (response.success) {
        toast.success('Session log created successfully');
        setShowModal(false);
        setFormData({
          type: 'SESSION',
          sessionId: '',
          oneOnOneId: '',
          studentId: '',
          batchId: '',
          date: new Date().toISOString().split('T')[0],
          attendance: false,
          notes: '',
          actionItems: [],
        });
        fetchLogs();
      } else {
        toast.error(response.message || 'Failed to create session log');
      }
    } catch (error) {
      console.error('Error creating session log:', error);
      toast.error(error.message || 'Failed to create session log');
    }
  };

  const columns = [
    {
      key: 'type',
      title: 'Type',
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          {row.type}
        </span>
      ),
    },
    {
      key: 'studentName',
      title: 'Student/Batch',
      render: (row) => (
        <div className="text-sm">
          {row.studentName && <div>{row.studentName}</div>}
          {row.batchName && <div className="text-textMuted text-xs">{row.batchName}</div>}
        </div>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      render: (row) => (
        <span className="text-sm">
          {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'attendance',
      title: 'Attendance',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.attendance ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.attendance ? 'Present' : 'Absent'}
        </span>
      ),
    },
    {
      key: 'notes',
      title: 'Notes',
      render: (row) => (
        <span className="text-sm text-textMuted line-clamp-2">{row.notes || 'No notes'}</span>
      ),
    },
    {
      key: 'actionItems',
      title: 'Action Items',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.actionItems?.length || 0} items
        </span>
      ),
    },
  ];

  if (loading && logs.length === 0) {
    return (
      <>
        <PageHeader
          title="Session Logs"
          description="Logs for sessions and one-on-ones"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading session logs...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Session Logs"
        description="Logs for sessions and one-on-ones"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Log
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
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Types</option>
            <option value="SESSION">Session</option>
            <option value="ONE_ON_ONE">One-on-One</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={logs}
          emptyLabel="No session logs found"
          minRows={10}
        />
      </div>

      {/* Create Log Modal */}
      {showModal && (
        <Modal
          title="Add Session Log"
          onClose={() => {
            setShowModal(false);
            setFormData({
              type: 'SESSION',
              sessionId: '',
              oneOnOneId: '',
              studentId: '',
              batchId: '',
              date: new Date().toISOString().split('T')[0],
              attendance: false,
              notes: '',
              actionItems: [],
            });
          }}
          onSubmit={handleCreateLog}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="SESSION">Session</option>
                <option value="ONE_ON_ONE">One-on-One</option>
              </select>
            </div>
            {formData.type === 'SESSION' ? (
              <div>
                <label className="block text-sm font-medium text-text mb-2">Session ID</label>
                <input
                  type="text"
                  value={formData.sessionId}
                  onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text mb-2">One-on-One ID</label>
                <input
                  type="text"
                  value={formData.oneOnOneId}
                  onChange={(e) => setFormData({ ...formData, oneOnOneId: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-text">Attendance</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                rows={4}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default SessionLogs;
