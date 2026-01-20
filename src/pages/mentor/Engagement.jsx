import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Activity, MessageSquare, Calendar, User, AlertCircle, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import mentorAPI from '../../api/mentor';

const Engagement = () => {
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState([]);

  useEffect(() => {
    fetchEngagement();
  }, []);

  const fetchEngagement = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMenteesEngagement();
      
      if (response.success) {
        setEngagementData(response.data.engagement || []);
      } else {
        toast.error(response.message || 'Failed to load engagement');
        setEngagementData([]);
      }
    } catch (error) {
      console.error('Error fetching engagement:', error);
      toast.error(error.message || 'Failed to load engagement');
      setEngagementData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getEngagementLevel = (score) => {
    if (score >= 80) return { label: 'High', color: 'text-green-600 bg-green-100' };
    if (score >= 50) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Low', color: 'text-red-600 bg-red-100' };
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Mentee',
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <div className="font-semibold text-text">{row.studentName || 'Unknown'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'sessionsCompleted',
      title: 'Sessions Completed',
      render: (value, row) => {
        return (
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-600" />
            <span className="font-semibold text-text">{row.sessionsCompleted || 0}</span>
          </div>
        );
      },
    },
    {
      key: 'lastSessionDate',
      title: 'Last Session',
      render: (value, row) => {
        return (
          <div className="flex items-center gap-2 text-sm text-textMuted">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(row.lastSessionDate)}</span>
          </div>
        );
      },
    },
    {
      key: 'engagementScore',
      title: 'Engagement Level',
      render: (value, row) => {
        const level = getEngagementLevel(row.engagementScore || 0);
        return (
          <div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${level.color}`}>
              {level.label} ({row.engagementScore || 0}%)
            </span>
          </div>
        );
      },
    },
  ];

  const avgEngagement = engagementData.length > 0
    ? Math.round(engagementData.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / engagementData.length)
    : 0;
  const totalSessions = engagementData.reduce((sum, e) => sum + (e.sessionsCompleted || 0), 0);
  const activeMentees = engagementData.filter(e => (e.engagementScore || 0) >= 50).length;

  return (
    <>
      <PageHeader
        title="Engagement Tracking"
        description="Monitor mentee engagement and participation"
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Engagement</p>
              <p className="text-3xl font-bold text-brand-600">{avgEngagement}%</p>
            </div>
            <Activity className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-accent-600">{totalSessions}</p>
            </div>
            <MessageSquare className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Active Mentees</p>
              <p className="text-3xl font-bold text-green-600">{activeMentees}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Engagement Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Mentee Engagement Details</h3>
            <p className="text-sm text-textMuted mt-1">
              {engagementData.length} mentee{engagementData.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchEngagement}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading engagement...</p>
          </div>
        ) : engagementData.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No engagement data available</p>
          </div>
        ) : (
          <Table columns={columns} data={engagementData} minRows={10} />
        )}
      </div>
    </>
  );
};

export default Engagement;

