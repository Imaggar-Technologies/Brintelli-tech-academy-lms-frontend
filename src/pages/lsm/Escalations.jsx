import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle, Plus, Search, MessageSquare, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Escalations = () => {
  const [loading, setLoading] = useState(true);
  const [escalations, setEscalations] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    enrollmentId: '',
    category: 'ACADEMIC',
    priority: 'MEDIUM',
    title: '',
    description: '',
    assignedTo: '',
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchEscalations();
  }, [filters]);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getEscalations({
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setEscalations(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load escalations');
      }
    } catch (error) {
      console.error('Error fetching escalations:', error);
      toast.error(error.message || 'Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEscalation = async () => {
    try {
      const response = await lsmAPI.createEscalation(formData);
      if (response.success) {
        toast.success('Escalation created successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          category: 'ACADEMIC',
          priority: 'MEDIUM',
          title: '',
          description: '',
          assignedTo: '',
        });
        fetchEscalations();
      } else {
        toast.error(response.message || 'Failed to create escalation');
      }
    } catch (error) {
      console.error('Error creating escalation:', error);
      toast.error(error.message || 'Failed to create escalation');
    }
  };

  const handleUpdateEscalation = async () => {
    try {
      const response = await lsmAPI.updateEscalation(selectedEscalation.id, formData);
      if (response.success) {
        toast.success('Escalation updated successfully');
        setShowUpdateModal(false);
        setSelectedEscalation(null);
        fetchEscalations();
      } else {
        toast.error(response.message || 'Failed to update escalation');
      }
    } catch (error) {
      console.error('Error updating escalation:', error);
      toast.error(error.message || 'Failed to update escalation');
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await lsmAPI.addEscalationComment(selectedEscalation.id, comment);
      if (response.success) {
        toast.success('Comment added successfully');
        setShowCommentModal(false);
        setComment('');
        setSelectedEscalation(null);
        fetchEscalations();
      } else {
        toast.error(response.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
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
      key: 'category',
      title: 'Category',
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          {row.category}
        </span>
      ),
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(row.priority)}`}>
          {row.priority}
        </span>
      ),
    },
    {
      key: 'title',
      title: 'Title',
      render: (row) => <span className="text-sm">{row.title}</span>,
    },
    {
      key: 'assignedTo',
      title: 'Assigned To',
      render: (row) => <span className="text-sm text-textMuted">{row.assignedTo ? 'Assigned' : 'Unassigned'}</span>,
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
      key: 'createdAt',
      title: 'Created',
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedEscalation(row);
              setFormData({
                status: row.status,
                assignedTo: row.assignedTo,
              });
              setShowUpdateModal(true);
            }}
            className="p-1 text-brand-600 hover:text-brand-700"
            title="Update Status"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedEscalation(row);
              setShowCommentModal(true);
            }}
            className="p-1 text-brand-600 hover:text-brand-700"
            title="Add Comment"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading && escalations.length === 0) {
    return (
      <>
        <PageHeader
          title="Escalations"
          description="Manage and track student escalations"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading escalations...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Escalations"
        description="Manage and track student escalations"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Escalation
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
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="BEHAVIOR">Behavior</option>
            <option value="FINANCE">Finance</option>
            <option value="TECHNICAL">Technical</option>
            <option value="OTHER">Other</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={escalations}
          emptyLabel="No escalations found"
          minRows={10}
        />
      </div>

      {/* Create Escalation Modal */}
      {showModal && (
        <Modal
          title="Create Escalation"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              category: 'ACADEMIC',
              priority: 'MEDIUM',
              title: '',
              description: '',
              assignedTo: '',
            });
          }}
          onSubmit={handleCreateEscalation}
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
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="BEHAVIOR">Behavior</option>
                <option value="FINANCE">Finance</option>
                <option value="TECHNICAL">Technical</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          </div>
        </Modal>
      )}

      {/* Update Escalation Modal */}
      {showUpdateModal && selectedEscalation && (
        <Modal
          title="Update Escalation"
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedEscalation(null);
          }}
          onSubmit={handleUpdateEscalation}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Comment Modal */}
      {showCommentModal && selectedEscalation && (
        <Modal
          title="Add Comment"
          onClose={() => {
            setShowCommentModal(false);
            setSelectedEscalation(null);
            setComment('');
          }}
          onSubmit={handleAddComment}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                rows={4}
                placeholder="Enter your comment..."
              />
      </div>
    </div>
        </Modal>
      )}
    </>
  );
};

export default Escalations;
