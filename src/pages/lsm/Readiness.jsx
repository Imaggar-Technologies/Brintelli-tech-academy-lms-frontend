import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Target, Search, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import lsmAPI from '../../api/lsm';

const Readiness = () => {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState([]);
  const [filters, setFilters] = useState({
    studentId: '',
    search: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchReadiness();
  }, [filters]);

  const fetchReadiness = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getReadiness({
        studentId: filters.studentId || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (response.success) {
        setReadiness(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load readiness scores');
      }
    } catch (error) {
      console.error('Error fetching readiness:', error);
      toast.error(error.message || 'Failed to load readiness scores');
    } finally {
      setLoading(false);
    }
  };

  const handleRecompute = async (studentId) => {
    try {
      const response = await lsmAPI.recomputeReadiness({ studentId });
      if (response.success) {
        toast.success('Readiness score recomputed');
        fetchReadiness();
      } else {
        toast.error(response.message || 'Failed to recompute readiness');
      }
    } catch (error) {
      console.error('Error recomputing readiness:', error);
      toast.error(error.message || 'Failed to recompute readiness');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (row) => <span className="font-medium text-text">{row.studentName || 'Unknown'}</span>,
    },
    {
      key: 'overallScore',
      title: 'Overall Score',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                (row.overallScore || 0) >= 80 ? 'bg-green-500' :
                (row.overallScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${row.overallScore || 0}%` }}
            ></div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(row.overallScore || 0)}`}>
            {row.overallScore || 0}%
          </span>
        </div>
      ),
    },
    {
      key: 'technicalScore',
      title: 'Technical',
      render: (row) => <span className="text-sm">{row.technicalScore || 0}%</span>,
    },
    {
      key: 'communicationScore',
      title: 'Communication',
      render: (row) => <span className="text-sm">{row.communicationScore || 0}%</span>,
    },
    {
      key: 'readinessStatus',
      title: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.readinessStatus === 'READY' ? 'bg-green-100 text-green-800' :
          row.readinessStatus === 'NEEDS_WORK' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.readinessStatus || 'UNKNOWN'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleRecompute(row.studentId)}
          className="p-1 text-brand-600 hover:text-brand-700"
          title="Recompute"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (loading && readiness.length === 0) {
    return (
      <>
        <PageHeader
          title="Placement Readiness"
          description="Placement readiness scores"
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading readiness scores...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Placement Readiness"
        description="Placement readiness scores"
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
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <Table
          columns={columns}
          data={readiness}
          emptyLabel="No readiness scores found"
          minRows={10}
        />
      </div>
    </>
  );
};

export default Readiness;
