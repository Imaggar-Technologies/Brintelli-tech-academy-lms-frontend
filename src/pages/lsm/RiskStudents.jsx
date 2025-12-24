import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Plus, Search, Filter, Edit2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';

const RiskStudents = () => {
  const [loading, setLoading] = useState(true);
  const [riskStudents, setRiskStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, critical: 0, noIntervention: 0 });
  const [filters, setFilters] = useState({
    riskLevel: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const minRows = 10;
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    enrollmentId: '',
    riskLevel: 'LOW',
    signals: [],
    lastContactDate: '',
    nextActionDate: '',
  });

  useEffect(() => {
    fetchRiskStudents();
  }, [filters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.riskLevel, filters.status, filters.search]);

  const fetchRiskStudents = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getRiskStudents({
        riskLevel: filters.riskLevel || undefined,
        status: filters.status || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setRiskStudents(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      } else {
        toast.error(response.message || 'Failed to load risk students');
      }
    } catch (error) {
      console.error('Error fetching risk students:', error);
      toast.error(error.message || 'Failed to load risk students');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async () => {
    try {
      const response = await lsmAPI.createRisk(formData);
      if (response.success) {
        toast.success('Risk record created successfully');
        setShowModal(false);
        setFormData({
          studentId: '',
          enrollmentId: '',
          riskLevel: 'LOW',
          signals: [],
          lastContactDate: '',
          nextActionDate: '',
        });
        fetchRiskStudents();
      } else {
        toast.error(response.message || 'Failed to create risk record');
      }
    } catch (error) {
      console.error('Error creating risk:', error);
      toast.error(error.message || 'Failed to create risk record');
    }
  };

  const handleUpdateRisk = async () => {
    try {
      const response = await lsmAPI.updateRisk(selectedRisk.id, formData);
      if (response.success) {
        toast.success('Risk record updated successfully');
        setShowUpdateModal(false);
        setSelectedRisk(null);
        fetchRiskStudents();
      } else {
        toast.error(response.message || 'Failed to update risk record');
      }
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error(error.message || 'Failed to update risk record');
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
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
      title: 'Course/Batch',
      render: (row) => (
        <div className="text-sm">
          {row.program?.name && <div>{row.program.name}</div>}
          {row.batch?.name && <div className="text-textMuted text-xs">{row.batch.name}</div>}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      title: 'Risk Level',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(row.riskLevel)}`}>
          {row.riskLevel}
        </span>
      ),
    },
    {
      key: 'signalsCount',
      title: 'Signals',
      render: (row) => (
        <span className="text-sm">{row.signalsCount || row.signals?.length || 0}</span>
      ),
    },
    {
      key: 'lastContactDate',
      title: 'Last Contact',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.lastContactDate ? new Date(row.lastContactDate).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'nextActionDate',
      title: 'Next Action',
      render: (row) => (
        <span className="text-sm text-textMuted">
          {row.nextActionDate ? new Date(row.nextActionDate).toLocaleDateString() : 'Not set'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
          row.status === 'INTERVENTION_IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
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
              setSelectedRisk(row);
              setFormData({
                riskLevel: row.riskLevel,
                status: row.status,
                lastContactDate: row.lastContactDate ? new Date(row.lastContactDate).toISOString().split('T')[0] : '',
                nextActionDate: row.nextActionDate ? new Date(row.nextActionDate).toISOString().split('T')[0] : '',
              });
              setShowUpdateModal(true);
            }}
            className="p-1 text-brand-600 hover:text-brand-700"
            title="Update Risk"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading && riskStudents.length === 0) {
    return (
      <>
        <PageHeader
          title="Risk Students"
          description="Identify and support students at risk"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading risk students...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Risk Students"
        description="Identify and support students at risk"
        actions={
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Risk Record
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">Total at Risk</p>
              <p className="text-2xl font-semibold text-text mt-1">{stats.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">High Risk</p>
              <p className="text-2xl font-semibold text-text mt-1">{stats.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">Critical</p>
              <p className="text-2xl font-semibold text-text mt-1">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-700" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted">No Intervention</p>
              <p className="text-2xl font-semibold text-text mt-1">{stats.noIntervention}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-yellow-500" />
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
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INTERVENTION_IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {(() => {
          // Pagination
          const totalPages = Math.ceil(riskStudents.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedData = riskStudents.slice(startIndex, endIndex);

          return (
            <>
              <Table
                columns={columns}
                data={paginatedData}
                emptyLabel="No risk students found"
                minRows={minRows}
              />
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, riskStudents.length)} of {riskStudents.length} records
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
          );
        })()}
      </div>

      {/* Create Risk Modal */}
      {showModal && (
        <Modal
          title="Add Risk Record"
          onClose={() => {
            setShowModal(false);
            setFormData({
              studentId: '',
              enrollmentId: '',
              riskLevel: 'LOW',
              signals: [],
              lastContactDate: '',
              nextActionDate: '',
            });
          }}
          onSubmit={handleCreateRisk}
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
              <label className="block text-sm font-medium text-text mb-2">Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Last Contact Date</label>
              <input
                type="date"
                value={formData.lastContactDate}
                onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Next Action Date</label>
              <input
                type="date"
                value={formData.nextActionDate}
                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Update Risk Modal */}
      {showUpdateModal && selectedRisk && (
        <Modal
          title="Update Risk Record"
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedRisk(null);
          }}
          onSubmit={handleUpdateRisk}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              >
                <option value="OPEN">Open</option>
                <option value="INTERVENTION_IN_PROGRESS">Intervention In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Last Contact Date</label>
              <input
                type="date"
                value={formData.lastContactDate}
                onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Next Action Date</label>
              <input
                type="date"
                value={formData.nextActionDate}
                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
              />
      </div>
    </div>
        </Modal>
      )}
    </>
  );
};

export default RiskStudents;
