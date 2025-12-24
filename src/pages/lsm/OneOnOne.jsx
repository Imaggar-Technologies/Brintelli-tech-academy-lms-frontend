import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserCheck, Plus, Search, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const OneOnOne = () => {
  const [loading, setLoading] = useState(true);
  const [oneOnOnes, setOneOnOnes] = useState([]);
  const [filters, setFilters] = useState({
    studentId: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOneOnOne, setSelectedOneOnOne] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    enrollmentId: '',
    reason: '',
    scheduledDate: '',
    duration: 30,
    meetingLink: '',
  });

  useEffect(() => {
    fetchOneOnOnes();
  }, [filters]);

  const fetchOneOnOnes = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getOneOnOnes({
        studentId: filters.studentId || undefined,
        status: filters.status || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setOneOnOnes(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load one-on-ones');
      }
    } catch (error) {
      console.error('Error fetching one-on-ones:', error);
      toast.error(error.message || 'Failed to load one-on-ones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOneOnOne = async () => {
    try {
      const response = await lsmAPI.createOneOnOne(formData);
      if (response.success) {
        toast.success('One-on-one scheduled successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          reason: '',
          scheduledDate: '',
          duration: 30,
          meetingLink: '',
        });
        fetchOneOnOnes();
      } else {
        toast.error(response.message || 'Failed to schedule one-on-one');
      }
    } catch (error) {
      console.error('Error creating one-on-one:', error);
      toast.error(error.message || 'Failed to schedule one-on-one');
    }
  };

  const handleUpdateOneOnOne = async () => {
    try {
      const response = await lsmAPI.updateOneOnOne(selectedOneOnOne.id, formData);
      if (response.success) {
        toast.success('One-on-one updated successfully');
        setShowUpdateModal(false);
        setSelectedOneOnOne(null);
        fetchOneOnOnes();
      } else {
        toast.error(response.message || 'Failed to update one-on-one');
      }
    } catch (error) {
      console.error('Error updating one-on-one:', error);
      toast.error(error.message || 'Failed to update one-on-one');
    }
  };

  const handleMarkNoShow = async (id) => {
    try {
      const response = await lsmAPI.updateOneOnOne(id, { status: 'NO_SHOW' });
      if (response.success) {
        toast.success('Marked as no-show');
        fetchOneOnOnes();
      }
    } catch (error) {
      console.error('Error marking no-show:', error);
      toast.error(error.message || 'Failed to mark no-show');
    }
  };

  const handleComplete = async (id) => {
    try {
      const outcome = prompt('Enter outcome/notes:');
      if (outcome !== null) {
        const response = await lsmAPI.updateOneOnOne(id, {
          status: 'COMPLETED',
          outcome,
        });
        if (response.success) {
          toast.success('One-on-one completed');
          fetchOneOnOnes();
        }
      }
    } catch (error) {
      console.error('Error completing one-on-one:', error);
      toast.error(error.message || 'Failed to complete one-on-one');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'NO_SHOW': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (row) => <span className="text-sm">{row.reason || 'N/A'}</span>,
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
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'outcome',
      title: 'Outcome',
      render: (row) => <span className="text-sm text-textMuted">{row.outcome || 'N/A'}</span>,
    },
    {
      key: 'nextFollowupDate',
      title: 'Next Followup',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.nextFollowupDate ? new Date(row.nextFollowupDate).toLocaleDateString() : 'Not set'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.status === 'SCHEDULED' && (
            <>
              <button
                onClick={() => handleMarkNoShow(row.id)}
                className="p-1 text-red-600 hover:text-red-700"
                title="Mark No-Show"
              >
                <XCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleComplete(row.id)}
                className="p-1 text-green-600 hover:text-green-700"
                title="Complete"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading && oneOnOnes.length === 0) {
    return (
      <>
        <PageHeader
          title="One-on-One Sessions"
          description="1:1 interventions"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading one-on-ones...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="One-on-One Sessions"
        description="1:1 interventions"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule 1:1
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
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No Show</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={oneOnOnes}
          emptyLabel="No one-on-one sessions found"
          minRows={10}
        />
      </div>

      {/* Schedule One-on-One Modal */}
      {showModal && (
        <Modal
          title="Schedule One-on-One"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              reason: '',
              scheduledDate: '',
              duration: 30,
              meetingLink: '',
            });
          }}
          onSubmit={handleCreateOneOnOne}
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
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
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
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
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

export default OneOnOne;
