import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Plus, Search, Video, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Sessions = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    batchId: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    batchId: '',
    name: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    meetingLink: '',
  });

  useEffect(() => {
    fetchSessions();
  }, [filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Fetch all batches first, then get sessions for each
      const batchesResponse = await lsmAPI.getAllBatches();
      if (batchesResponse.success && batchesResponse.data) {
        const allSessions = [];
        for (const batch of batchesResponse.data) {
          if (!filters.batchId || batch.id === filters.batchId) {
            const sessionsResponse = await lsmAPI.getBatchSessions(batch.id);
            if (sessionsResponse.success && sessionsResponse.data) {
              allSessions.push(...sessionsResponse.data.map(s => ({ ...s, batch: { id: batch.id, name: batch.name } })));
            }
          }
        }
        setSessions(allSessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error(error.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await lsmAPI.createSession(formData.batchId, formData);
      if (response.success) {
        toast.success('Session scheduled successfully');
        setShowModal(false);
        setFormData({
          batchId: '',
          name: '',
          description: '',
          scheduledDate: '',
          duration: 60,
          meetingLink: '',
        });
        fetchSessions();
      } else {
        toast.error(response.message || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to schedule session');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ONGOING': return 'bg-blue-100 text-blue-800';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Topic',
      render: (row) => <span className="font-medium text-text">{row.name}</span>,
    },
    {
      key: 'batch',
      title: 'Batch',
      render: (row) => <span className="text-sm">{row.batch?.name || 'N/A'}</span>,
    },
    {
      key: 'scheduledDate',
      title: 'Date/Time',
      render: (row) => (
        <span className="text-sm">
          {row.scheduledDate ? new Date(row.scheduledDate).toLocaleString() : 'Not scheduled'}
        </span>
      ),
    },
    {
      key: 'meetingLink',
      title: 'Link',
      render: (row) => (
        row.meetingLink ? (
          <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
            Join
          </a>
        ) : (
          <span className="text-textMuted text-sm">No link</span>
        )
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'attendance',
      title: 'Attendance',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.attendance?.length || 0} attended
        </span>
      ),
    },
  ];

  if (loading && sessions.length === 0) {
    return (
      <>
        <PageHeader
          title="Sessions"
          description="Group sessions calendar/list"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading sessions...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Group sessions calendar/list"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Session
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
                placeholder="Search sessions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={sessions}
          emptyLabel="No sessions found"
          minRows={10}
        />
      </div>

      {/* Schedule Session Modal */}
      {showModal && (
        <Modal
          title="Schedule Session"
          onClose={() => {
            setShowModal(false);
            setFormData({
              batchId: '',
              name: '',
              description: '',
              scheduledDate: '',
              duration: 60,
              meetingLink: '',
            });
          }}
          onSubmit={handleCreateSession}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Batch ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Scheduled Date/Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Meeting Link</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Sessions;
