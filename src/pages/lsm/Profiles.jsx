import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Plus, Search, Edit2, Tag, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const Profiles = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    batchId: '',
    courseId: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    leadId: '',
    enrollmentId: '',
    batchId: '',
    courseId: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
    tags: [],
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getStudents({
        status: filters.status || undefined,
        batchId: filters.batchId || undefined,
        courseId: filters.courseId || undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setStudents(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(error.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    try {
      const response = await lsmAPI.createStudent(formData);
      if (response.success) {
        toast.success('Student profile created successfully');
        setShowModal(false);
        setFormData({
          leadId: '',
          enrollmentId: '',
          batchId: '',
          courseId: '',
          phone: '',
          email: '',
          status: 'ACTIVE',
          tags: [],
        });
        fetchStudents();
      } else {
        toast.error(response.message || 'Failed to create student profile');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error(error.message || 'Failed to create student profile');
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const response = await lsmAPI.updateStudent(selectedStudent.id, formData);
      if (response.success) {
        toast.success('Student profile updated successfully');
        setShowEditModal(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        toast.error(response.message || 'Failed to update student profile');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.message || 'Failed to update student profile');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
      case 'DROPPED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PLACED': return 'bg-purple-100 text-purple-800';
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
      key: 'program',
      title: 'Course',
      render: (row) => <span className="text-sm">{row.program?.name || 'N/A'}</span>,
    },
    {
      key: 'batch',
      title: 'Batch',
      render: (row) => <span className="text-sm">{row.batch?.name || 'N/A'}</span>,
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (row) => <span className="text-sm text-textMuted">{row.phone || 'N/A'}</span>,
    },
    {
      key: 'email',
      title: 'Email',
      render: (row) => <span className="text-sm text-textMuted">{row.email || 'N/A'}</span>,
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
      title: 'Joined',
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
              setSelectedStudent(row);
              setFormData({
                status: row.status,
                tags: row.tags || [],
              });
              setShowEditModal(true);
            }}
            className="p-1 text-brand-600 hover:text-brand-700"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading && students.length === 0) {
    return (
      <>
        <PageHeader
          title="Student Profiles"
          description="Student profile directory"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading students...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Student Profiles"
        description="Student profile directory"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Profile
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
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="DROPPED">Dropped</option>
            <option value="COMPLETED">Completed</option>
            <option value="PLACED">Placed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={students}
          emptyLabel="No students found"
          minRows={10}
        />
      </div>

      {/* Create Profile Modal */}
      {showModal && (
        <Modal
          title="Add Student Profile"
          onClose={() => {
            setShowModal(false);
            setFormData({
              leadId: '',
              enrollmentId: '',
              batchId: '',
              courseId: '',
              phone: '',
              email: '',
              status: 'ACTIVE',
              tags: [],
            });
          }}
          onSubmit={handleCreateStudent}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Lead ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DROPPED">Dropped</option>
                <option value="COMPLETED">Completed</option>
                <option value="PLACED">Placed</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && selectedStudent && (
        <Modal
          title="Edit Student Profile"
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={handleUpdateStudent}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DROPPED">Dropped</option>
                <option value="COMPLETED">Completed</option>
                <option value="PLACED">Placed</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Profiles;
