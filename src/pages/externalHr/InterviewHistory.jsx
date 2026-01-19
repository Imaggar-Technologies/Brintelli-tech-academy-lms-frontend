import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Building2, User, Clock, Briefcase, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { interviewAPI } from '../../api/interview';

const InterviewHistory = () => {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }
      // Get all interviews, sorted by date (most recent first)
      filters.sortBy = 'scheduledDate';
      
      const response = await interviewAPI.getAllInterviews(filters);
      
      if (response.success) {
        // Filter to show only completed and cancelled interviews
        const historyInterviews = (response.data.interviews || []).filter(
          i => i.status === 'completed' || i.status === 'cancelled'
        );
        setInterviews(historyInterviews);
      } else {
        toast.error(response.message || 'Failed to load interview history');
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interview history:', error);
      toast.error(error.message || 'Failed to load interview history');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInterviews();
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const filteredInterviews = interviews.filter(interview => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      interview.candidateName?.toLowerCase().includes(query) ||
      interview.jobTitle?.toLowerCase().includes(query) ||
      interview.companyName?.toLowerCase().includes(query) ||
      interview.position?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-textMuted">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">Interview History</h1>
            <p className="mt-2 max-w-2xl text-sm text-textMuted">View complete interview history and records.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textMuted" />
            <input
              type="text"
              placeholder="Search by candidate, job title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-xl bg-brintelli-baseAlt text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-textMuted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-brintelli-border rounded-xl bg-brintelli-baseAlt text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interview History Table */}
      {filteredInterviews.length > 0 ? (
        <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brintelli-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Candidate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Position</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text">Rounds</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr
                    key={interview.id}
                    className="border-b border-brintelli-border hover:bg-brintelli-baseAlt transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-brand-500" />
                        <span className="text-sm font-medium text-text">
                          {interview.candidateName || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-text">
                        {interview.jobTitle || interview.position || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-textMuted" />
                        <span className="text-sm text-text">
                          {interview.companyName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {interview.scheduledDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-textMuted" />
                          <span className="text-sm text-text">
                            {new Date(interview.scheduledDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-textMuted">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {interview.location ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-textMuted" />
                          <span className="text-sm text-text">{interview.location}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-textMuted">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status === 'completed' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {interview.status?.replace('_', ' ') || 'unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {interview.rounds && interview.rounds.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text">
                            {interview.rounds.filter((r) => r.status === 'completed').length}/
                            {interview.rounds.length}
                          </span>
                          <div className="flex gap-1">
                            {interview.rounds.map((round, index) => (
                              <div
                                key={round.id || index}
                                className={`w-2 h-2 rounded-full ${
                                  round.status === 'completed'
                                    ? 'bg-green-500'
                                    : round.status === 'in_progress'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-200'
                                }`}
                                title={round.name}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-textMuted">No rounds</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-brintelli-border bg-white p-12 text-center">
          <Briefcase className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">No interview history found</h3>
          <p className="text-sm text-textMuted">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;

