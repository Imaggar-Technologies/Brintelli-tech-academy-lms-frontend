import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronRight, ChevronLeft, Calendar, Users, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const LsmBatches = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const minRows = 10;
  const [filters, setFilters] = useState({
    status: '',
    courseId: '',
  });
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchBatches();
    fetchPrograms();
  }, [filters]);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getAllBatches(filters);
      if (response.success) {
        setBatches(response.data.batches || []);
      } else {
        toast.error(response.message || 'Failed to load batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error(error.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const getProgramName = (courseId) => {
    if (!courseId) return 'N/A';
    const program = programs.find(p => (p.id || p._id) === courseId);
    return program ? program.name : courseId;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewStudents = async (batch) => {
    setSelectedBatch(batch);
    setShowStudentsModal(true);
    setLoadingStudents(true);
    
    try {
      const response = await lsmAPI.getBatchStudents(batch.id || batch._id);
      if (response.success) {
        setBatchStudents(response.data.students || []);
      } else {
        toast.error(response.message || 'Failed to load students');
        // Fallback to students from batch data if available
        setBatchStudents(batch.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(error.message || 'Failed to load students');
      // Fallback to students from batch data if available
      setBatchStudents(batch.students || []);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(batches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBatches = batches.slice(startIndex, endIndex);

  const batchColumns = [
    { key: 'name', title: 'Batch Name' },
    {
      key: 'courseId',
      title: 'Program',
      render: (row) => getProgramName(row?.courseId),
    },
    {
      key: 'startDate',
      title: 'Start Date',
      render: (row) => formatDate(row?.startDate),
    },
    {
      key: 'endDate',
      title: 'End Date',
      render: (row) => formatDate(row?.endDate),
    },
    {
      key: 'enrolled',
      title: 'Enrolled',
      render: (row) => `${row?.enrolled || 0}/${row?.capacity || 0}`,
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(row?.status)}`}>
          {row?.status || 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewStudents(row)}
          >
            <Users className="h-4 w-4 mr-1" />
            Students ({row?.students?.length || row?.enrolled || 0})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/lsm/batches/${row?.id || row?._id}/sessions`)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Sessions
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Batches"
        description="View and manage batches for student allocation"
      />

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
            >
              <option value="">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Program</label>
            <select
              value={filters.courseId}
              onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id || program._id} value={program.id || program._id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => setFilters({ status: '', courseId: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <h3 className="text-lg font-semibold text-text mb-4">All Batches</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No batches found.</p>
          </div>
        ) : (
          <>
            <Table columns={batchColumns} data={paginatedBatches} minRows={minRows} />
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, batches.length)} of {batches.length} batches
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-text">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Students Modal */}
      {showStudentsModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Enrolled Students - {selectedBatch.name}
              </h3>
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  setSelectedBatch(null);
                  setBatchStudents([]);
                }}
                className="text-textMuted hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingStudents ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-textMuted">Loading students...</p>
              </div>
            ) : batchStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
                <p className="text-textMuted">No students enrolled in this batch yet.</p>
              </div>
            ) : (
              <div>
                <table className="min-w-full divide-y divide-brintelli-border">
                  <thead className="bg-brintelli-baseAlt">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textMuted uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textMuted uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textMuted uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textMuted uppercase">Mentor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-textMuted uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brintelli-border">
                    {batchStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-brintelli-baseAlt/50">
                        <td className="px-4 py-3 text-sm text-text">
                          {student.lead?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-textSoft">
                          {student.lead?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-textSoft">
                          {student.lead?.phone || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-textSoft">
                          {student.mentor?.name || 'Not Assigned'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            student.status === 'ENROLLED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.status || student.onboardingStatus || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LsmBatches;

