import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Building2, User, Clock, Briefcase, Search, Filter, Plus, CheckCircle2, Clock3, Circle } from 'lucide-react';
import { interviewAPI } from '../../api/interview';

const InterviewSchedule = () => {
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
      filters.sortBy = 'scheduledDate';
      
      const response = await interviewAPI.getAllInterviews(filters);
      
      if (response.success) {
        setInterviews(response.data.interviews || []);
      } else {
        toast.error(response.message || 'Failed to load interviews');
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error(error.message || 'Failed to load interviews');
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
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || colors.pending;
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

  const upcomingInterviews = filteredInterviews.filter(i => 
    i.status === 'scheduled' || i.status === 'in_progress'
  );
  const pastInterviews = filteredInterviews.filter(i => 
    i.status === 'completed' || i.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-textMuted">Loading interviews...</p>
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
            <h1 className="text-2xl font-semibold text-text">Interview Scheduling</h1>
            <p className="mt-2 max-w-2xl text-sm text-textMuted">Schedule and manage candidate interviews.</p>
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
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-6">Upcoming Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text">
                      {interview.candidateName || 'Unknown Candidate'}
                    </h3>
                    <p className="text-sm text-textMuted mt-1">
                      {interview.jobTitle || interview.position || 'Position not specified'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      interview.status
                    )}`}
                  >
                    {interview.status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {interview.companyName && (
                    <div className="flex items-center gap-2 text-sm text-textSoft">
                      <Building2 className="h-4 w-4 text-brand-500" />
                      <span>{interview.companyName}</span>
                    </div>
                  )}
                  {interview.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-textSoft">
                      <Calendar className="h-4 w-4 text-brand-500" />
                      <span>
                        {new Date(interview.scheduledDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <Clock className="h-4 w-4 text-brand-500 ml-2" />
                      <span>
                        {new Date(interview.scheduledDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {interview.location && (
                    <div className="flex items-center gap-2 text-sm text-textSoft">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      <span>{interview.location}</span>
                    </div>
                  )}
                  {interview.interviewer && (
                    <div className="flex items-center gap-2 text-sm text-textSoft">
                      <User className="h-4 w-4 text-brand-500" />
                      <span>{interview.interviewer}</span>
                    </div>
                  )}
                </div>

                {interview.rounds && interview.rounds.length > 0 && (
                  <div className="pt-4 border-t border-brintelli-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-textSoft">Rounds</span>
                      <span className="text-xs font-semibold text-text">
                        {interview.rounds.filter((r) => r.status === 'completed').length}/
                        {interview.rounds.length}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {interview.rounds.map((round, index) => (
                        <div
                          key={round.id || index}
                          className={`flex-1 h-2 rounded-full ${
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
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div className="rounded-3xl border border-brintelli-border bg-white p-8 shadow-card">
          <h2 className="text-xl font-semibold text-text mb-6">Past Interviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastInterviews.map((interview) => (
              <div
                key={interview.id}
                className="rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text">
                      {interview.candidateName || 'Unknown Candidate'}
                    </h3>
                    <p className="text-sm text-textMuted mt-1">
                      {interview.jobTitle || interview.position || 'Position not specified'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      interview.status
                    )}`}
                  >
                    {interview.status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>

                <div className="space-y-2">
                  {interview.companyName && (
                    <div className="flex items-center gap-2 text-sm text-textSoft">
                      <Building2 className="h-4 w-4 text-brand-500" />
                      <span>{interview.companyName}</span>
                    </div>
                  )}
                  {interview.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-textSoft">
                      <Calendar className="h-4 w-4 text-brand-500" />
                      <span>
                        {new Date(interview.scheduledDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredInterviews.length === 0 && (
        <div className="rounded-3xl border border-brintelli-border bg-white p-12 text-center">
          <Briefcase className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">No interviews found</h3>
          <p className="text-sm text-textMuted">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default InterviewSchedule;

