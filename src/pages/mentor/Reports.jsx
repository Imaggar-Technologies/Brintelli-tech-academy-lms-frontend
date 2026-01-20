import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileBarChart, Download, Calendar, User, TrendingUp, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import mentorAPI from '../../api/mentor';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [menteesRes, progressRes, engagementRes, meetingsRes] = await Promise.all([
        mentorAPI.getMentees(),
        mentorAPI.getMenteesProgress(),
        mentorAPI.getMenteesEngagement(),
        mentorAPI.getAllMeetings(),
      ]);

      if (menteesRes.success) {
        setMentees(menteesRes.data.mentees || []);
      }

      if (progressRes.success) {
        setProgressData(progressRes.data.progress || []);
      }

      if (engagementRes.success) {
        setEngagementData(engagementRes.data.engagement || []);
      }

      if (meetingsRes.success) {
        const allMeetings = meetingsRes.data.meetings || [];
        // Filter by date range
        const filtered = allMeetings.filter(m => {
          if (!m.scheduledDate && !m.createdAt) return false;
          const meetingDate = m.scheduledDate ? new Date(m.scheduledDate) : new Date(m.createdAt);
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);
          return meetingDate >= start && meetingDate <= end;
        });
        setMeetings(filtered);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: {
        totalMentees: mentees.length,
        totalMeetings: meetings.length,
        completedMeetings: meetings.filter(m => m.status === 'COMPLETED').length,
        avgProgress: progressData.length > 0
          ? Math.round(progressData.reduce((sum, p) => sum + (p.progress?.overallProgress || 0), 0) / progressData.length)
          : 0,
        avgEngagement: engagementData.length > 0
          ? Math.round(engagementData.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / engagementData.length)
          : 0,
      },
      mentees: mentees.map(mentee => {
        const progress = progressData.find(p => p.studentId === mentee.studentId);
        const engagement = engagementData.find(e => e.studentId === mentee.studentId);
        const menteeMeetings = meetings.filter(m => m.studentId === mentee.studentId);
        return {
          name: mentee.studentName,
          email: mentee.studentEmail,
          program: mentee.programName,
          progress: progress?.progress?.overallProgress || 0,
          engagement: engagement?.engagementScore || 0,
          meetingsCompleted: menteeMeetings.filter(m => m.status === 'COMPLETED').length,
        };
      }),
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentor-report-${dateRange.start}-to-${dateRange.end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully');
  };

  const avgProgress = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + (p.progress?.overallProgress || 0), 0) / progressData.length)
    : 0;

  const avgEngagement = engagementData.length > 0
    ? Math.round(engagementData.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / engagementData.length)
    : 0;

  const completedMeetings = meetings.filter(m => m.status === 'COMPLETED').length;

  return (
    <>
      <PageHeader
        title="Performance Reports"
        description="Generate and view performance reports"
      />

      {/* Date Range Filter */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Mentees</p>
              <p className="text-3xl font-bold text-brand-600">{mentees.length}</p>
            </div>
            <User className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Progress</p>
              <p className="text-3xl font-bold text-accent-600">{avgProgress}%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Engagement</p>
              <p className="text-3xl font-bold text-green-600">{avgEngagement}%</p>
            </div>
            <FileBarChart className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Meetings Completed</p>
              <p className="text-3xl font-bold text-blue-600">{completedMeetings}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Mentee Performance Summary</h3>
            <p className="text-sm text-textMuted mt-1">
              {mentees.length} mentee{mentees.length !== 1 ? 's' : ''} in report
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchReportData}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading report data...</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No mentees found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mentees.map((mentee) => {
              const progress = progressData.find(p => p.studentId === mentee.studentId);
              const engagement = engagementData.find(e => e.studentId === mentee.studentId);
              const menteeMeetings = meetings.filter(m => m.studentId === mentee.studentId);
              const completed = menteeMeetings.filter(m => m.status === 'COMPLETED').length;
              
              return (
                <div
                  key={mentee.id || mentee.enrollmentId}
                  className="flex items-center justify-between p-4 rounded-xl border border-brintelli-border bg-white/70"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-text">{mentee.studentName}</p>
                    <p className="text-xs text-textMuted">{mentee.programName}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-textMuted">Progress</p>
                      <p className="text-sm font-semibold text-text">
                        {progress?.progress?.overallProgress || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-textMuted">Engagement</p>
                      <p className="text-sm font-semibold text-text">
                        {engagement?.engagementScore || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-textMuted">Meetings</p>
                      <p className="text-sm font-semibold text-text">{completed}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;

