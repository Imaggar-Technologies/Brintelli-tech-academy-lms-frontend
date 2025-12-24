import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Briefcase, Users, Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import lsmAPI from '../../api/lsm';

const Mentors = () => {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [filters, setFilters] = useState({
    isActive: true,
    courseId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const minRows = 10;

  useEffect(() => {
    fetchMentors();
  }, [filters]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getAllMentors(filters);
      if (response.success) {
        setMentors(response.data.mentors || []);
      } else {
        toast.error(response.message || 'Failed to load mentors');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error(error.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      mentor.name?.toLowerCase().includes(term) ||
      mentor.email?.toLowerCase().includes(term) ||
      mentor.bio?.toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredMentors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMentors = filteredMentors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const stats = [
    {
      label: 'Total Mentors',
      value: mentors.length,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Active Mentors',
      value: mentors.filter((m) => m.isActive).length,
      icon: User,
      color: 'text-green-600',
    },
    {
      label: 'Total Capacity',
      value: mentors.reduce((sum, m) => sum + (m.maxStudents || 0), 0),
      icon: Briefcase,
      color: 'text-purple-600',
    },
    {
      label: 'Available Slots',
      value: mentors.reduce((sum, m) => sum + (m.availableSlots || 0), 0),
      icon: Calendar,
      color: 'text-orange-600',
    },
  ];

  return (
    <>
      <PageHeader
        title="Mentors"
        description="Manage and view all mentors available for student assignment"
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textMuted mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* Mentors Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search mentors..."
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
              value={filters.isActive}
              onChange={(e) =>
                setFilters({ ...filters, isActive: e.target.value === 'true' })
              }
              className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
              <option value="">All</option>
            </select>
            <Button variant="ghost" size="sm" onClick={fetchMentors}>
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-textMuted">Loading mentors...</span>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No mentors found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-brintelli-baseAlt">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Mentor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Specialization</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-textMuted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border">
                {paginatedMentors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-textMuted">
                      {searchTerm ? "No mentors match your search." : "No mentors found."}
                    </td>
                  </tr>
                ) : (
                  paginatedMentors.map((mentor) => (
                    <tr key={mentor.id || mentor._id} className="hover:bg-brintelli-baseAlt/40 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-brand-600" />
                          </div>
                          <div>
                            <div className="font-medium text-text">{mentor?.name || 'N/A'}</div>
                            <div className="text-xs text-textMuted">{mentor?.experience || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm text-text">{mentor?.email || 'N/A'}</div>
                          {mentor?.phone && <div className="text-xs text-textMuted">{mentor?.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {mentor?.specialization && mentor.specialization.length > 0 ? (
                            mentor.specialization.map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded bg-brintelli-baseAlt text-xs text-textSoft"
                              >
                                {spec}
                              </span>
                            ))
                          ) : (
                            <span className="text-textMuted text-xs">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-text">
                            {mentor?.currentStudents || 0} / {mentor?.maxStudents || 0}
                          </div>
                          <div className="text-xs text-textMuted">
                            {mentor?.availableSlots || 0} slots available
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            mentor?.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {mentor?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredMentors.length)} of {filteredMentors.length} mentors
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
    </>
  );
};

export default Mentors;

