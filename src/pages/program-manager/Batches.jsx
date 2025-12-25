import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, Calendar, Users, X, Search, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const Batches = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    courseId: '',
  });
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    fetchBatches();
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
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
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

  // Filter batches by search term
  const filteredBatches = batches.filter((batch) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      batch.name?.toLowerCase().includes(term) ||
      getProgramName(batch.courseId)?.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);


  return (
    <>
      <PageHeader
        title="Batches"
        description="Manage all batches"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate('/program-manager/batches/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </div>
        }
      />

      {/* Batches Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              value={filters.courseId}
              onChange={(e) => {
                setFilters({ ...filters, courseId: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id || program._id} value={program.id || program._id}>
                  {program.name}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ status: '', courseId: '' });
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchBatches}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-textMuted">Loading batches...</span>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm ? "No batches match your search." : "No batches found. Create your first batch!"}
            </p>
            {!searchTerm && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate('/program-manager/batches/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            )}
          </div>
        ) : (
          <>
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Batch Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Program</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Start Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">End Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Enrolled</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border/30">
                {paginatedBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-textMuted">
                          {searchTerm ? "No batches match your search." : "No batches found."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBatches.map((batch) => (
                    <tr 
                      key={batch.id || batch._id} 
                      className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text">{batch.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">{getProgramName(batch.courseId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">{formatDate(batch.startDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">{formatDate(batch.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text">
                          {batch.enrolled || batch.students?.length || 0} / {batch.capacity || 30}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(batch.status)}`}>
                          {batch.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewStudents(batch)}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors"
                          >
                            <Users className="h-4 w-4" />
                            Students ({batch.students?.length || batch.enrolled || 0})
                          </button>
                          <button
                            onClick={() => navigate(`/program-manager/batches/${batch.id || batch._id}/sessions`)}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors"
                          >
                            <Calendar className="h-4 w-4" />
                            Sessions
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {filteredBatches.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredBatches.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
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

export default Batches;

