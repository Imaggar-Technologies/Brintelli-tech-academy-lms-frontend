import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ChartBar, TrendingUp, User, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import mentorAPI from '../../api/mentor';

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMenteesProgress();
      
      if (response.success) {
        setProgressData(response.data.progress || []);
      } else {
        toast.error(response.message || 'Failed to load progress');
        setProgressData([]);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error(error.message || 'Failed to load progress');
      setProgressData([]);
    } finally {
      setLoading(false);
    }
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
      key: 'moduleProgress',
      title: 'Module Progress',
      render: (value, row) => {
        const percent = row.progress?.moduleCompletionPercent || 0;
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-textMuted">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'assignmentProgress',
      title: 'Assignment Progress',
      render: (value, row) => {
        const percent = row.progress?.assignmentsCompletionPercent || 0;
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-textMuted">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent-500 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'overallProgress',
      title: 'Overall Progress',
      render: (value, row) => {
        const percent = row.progress?.overallProgress || 0;
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-text">{percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  const avgModuleProgress = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + (p.progress?.moduleCompletionPercent || 0), 0) / progressData.length)
    : 0;
  const avgAssignmentProgress = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + (p.progress?.assignmentsCompletionPercent || 0), 0) / progressData.length)
    : 0;
  const avgOverallProgress = progressData.length > 0
    ? Math.round(progressData.reduce((sum, p) => sum + (p.progress?.overallProgress || 0), 0) / progressData.length)
    : 0;

  return (
    <>
      <PageHeader
        title="Mentee Progress"
        description="Track and monitor mentee progress over time"
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Module Progress</p>
              <p className="text-3xl font-bold text-brand-600">{avgModuleProgress}%</p>
            </div>
            <ChartBar className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Assignment Progress</p>
              <p className="text-3xl font-bold text-accent-600">{avgAssignmentProgress}%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Avg. Overall Progress</p>
              <p className="text-3xl font-bold text-green-600">{avgOverallProgress}%</p>
            </div>
            <ChartBar className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Mentee Progress Details</h3>
            <p className="text-sm text-textMuted mt-1">
              {progressData.length} mentee{progressData.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchProgress}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading progress...</p>
          </div>
        ) : progressData.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No progress data available</p>
          </div>
        ) : (
          <Table columns={columns} data={progressData} minRows={10} />
        )}
      </div>
    </>
  );
};

export default Progress;

