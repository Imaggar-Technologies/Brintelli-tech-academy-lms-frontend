import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { GraduationCap, Phone, Calendar, Users, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import { apiRequest } from '../../api/apiClient';

const Tutors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/users/role/tutor');
      console.log('Tutors API Response:', response);
      console.log('Response data:', response.data);
      console.log('Users array:', response.data?.users);
      
      if (response.success && response.data) {
        const usersArray = response.data.users || [];
        console.log('Users array length:', usersArray.length);
        console.log('First user:', usersArray[0]);
        
        // Normalize the data to ensure all tutors have required fields
        const normalizedTutors = usersArray.map((tutor, index) => {
          const normalized = {
            id: tutor.id || tutor._id?.toString() || `tutor-${index}`,
            _id: tutor._id?.toString() || tutor.id || `tutor-${index}`,
            fullName: tutor.fullName || tutor.name || (tutor.email ? tutor.email.split('@')[0] : 'Unknown User'),
            email: tutor.email || `tutor${index}@example.com`,
            phone: tutor.phone || null,
            isActive: tutor.isActive !== undefined ? tutor.isActive : true,
            role: tutor.role || 'tutor',
          };
          console.log(`Tutor ${index}:`, normalized);
          return normalized;
        });
        
        console.log('Final normalized tutors:', normalizedTutors);
        setTutors(normalizedTutors);
        
        if (normalizedTutors.length === 0) {
          toast.error('No tutors found in the system');
        }
      } else {
        console.error('API response not successful:', response);
        toast.error(response.message || 'Failed to load tutors');
        setTutors([]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      console.error('Error details:', error.response || error.message);
      toast.error(error.message || 'Failed to load tutors');
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search tutors
  const filteredTutors = useMemo(() => {
    let filtered = [...tutors];

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(tutor => tutor.isActive === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(tutor => tutor.isActive === false);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tutor => {
        const fullName = (tutor.fullName || '').toLowerCase();
        const email = (tutor.email || '').toLowerCase();
        const phone = (tutor.phone || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
      });
    }

    return filtered;
  }, [tutors, searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTutors = filteredTutors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const columns = [
    {
      key: 'name',
      title: 'Tutor',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex)
        // value is row[column.key], but we need the full row object
        const tutor = row || value;
        if (!tutor || (!tutor.fullName && !tutor.email)) {
          return <span className="text-textMuted">N/A</span>;
        }
        const displayName = tutor.fullName || tutor.email || 'Unknown';
        const displayEmail = tutor.email || 'No email';
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100/50 text-brand-600 ring-1 ring-brand-200/50">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-text">{displayName}</p>
              <p className="text-xs text-textMuted">{displayEmail}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      title: 'Contact',
      render: (value, row) => {
        const tutor = row || value;
        if (!tutor) return <span className="text-textMuted">N/A</span>;
        return (
          <div className="text-sm text-textSoft">
            {tutor.phone ? (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{tutor.phone}</span>
              </div>
            ) : (
              <span className="text-textMuted">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => {
        const tutor = row || value;
        if (!tutor) return <span className="text-textMuted">N/A</span>;
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              tutor.isActive
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200/50'
            }`}
          >
            {tutor.isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        const tutor = row || value;
        if (!tutor || !tutor.id) return <span className="text-textMuted">N/A</span>;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => navigate(`/program-manager/tutors/assign?tutorId=${tutor.id || tutor._id}`)}
            >
              <Users className="h-3.5 w-3.5" />
              Assign
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => navigate(`/program-manager/tutor-performance?tutorId=${tutor.id || tutor._id}`)}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Performance
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="All Tutors"
        description="View and manage all tutors in the system."
        actions={
          <>
            <Button
              variant="ghost"
              className="gap-2"
              onClick={fetchTutors}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => navigate('/program-manager/tutors/assign')}
            >
              <Users className="h-4 w-4" />
              Assign Tutors
            </Button>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => navigate('/program-manager/tutor-schedule')}
            >
              <Calendar className="h-4 w-4" />
              View Schedules
            </Button>
          </>
        }
      />

      {/* Filters and Search */}
      <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-textMuted">
          Showing {filteredTutors.length} of {tutors.length} tutor{tutors.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Tutors Table */}
      <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading tutors...</p>
          </div>
        ) : paginatedTutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-brand-100/50 p-4 mb-4">
              <GraduationCap className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-lg font-semibold text-text">
              {searchTerm || statusFilter !== 'all' ? 'No tutors found' : 'No tutors available'}
            </p>
            <p className="mt-2 text-sm text-textMuted">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Tutors will appear here once they are added to the system'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedTutors}
                emptyLabel=""
                minRows={itemsPerPage}
              />
            </div>

            {/* Pagination */}
            {filteredTutors.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTutors.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Tutors;
