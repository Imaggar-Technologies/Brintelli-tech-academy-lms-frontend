import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, User, Search, Filter, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import mentorAPI from '../../api/mentor';

const RiskStudents = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filters, setFilters] = useState({
    riskLevel: '',
    search: '',
  });

  useEffect(() => {
    fetchMentees();
  }, []);

  useEffect(() => {
    identifyRiskStudents();
  }, [mentees]);

  useEffect(() => {
    filterStudents();
  }, [filters, riskStudents]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      const [menteesRes, progressRes, engagementRes] = await Promise.all([
        mentorAPI.getMentees(),
        mentorAPI.getMenteesProgress(),
        mentorAPI.getMenteesEngagement(),
      ]);

      if (menteesRes.success) {
        const menteesData = menteesRes.data.mentees || [];
        const progressData = progressRes.success ? progressRes.data.progress || [] : [];
        const engagementData = engagementRes.success ? engagementRes.data.engagement || [] : [];

        // Enrich mentees with progress and engagement data
        const enrichedMentees = menteesData.map(mentee => {
          const progress = progressData.find(p => p.studentId === mentee.studentId);
          const engagement = engagementData.find(e => e.studentId === mentee.studentId);
          return {
            ...mentee,
            progress: progress?.progress || {},
            engagement: engagement || {},
          };
        });

        setMentees(enrichedMentees);
      } else {
        toast.error(menteesRes.message || 'Failed to load mentees');
        setMentees([]);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error(error.message || 'Failed to load mentees');
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const identifyRiskStudents = () => {
    const risks = mentees.map(mentee => {
      const riskSignals = [];
      let riskLevel = 'LOW';

      // Check progress
      const overallProgress = mentee.progress?.overallProgress || 0;
      if (overallProgress < 50) {
        riskSignals.push('Low course progress');
        riskLevel = 'HIGH';
      } else if (overallProgress < 70) {
        riskSignals.push('Below average progress');
        if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
      }

      // Check engagement
      const engagementScore = mentee.engagement?.engagementScore || 0;
      if (engagementScore < 50) {
        riskSignals.push('Low engagement');
        if (riskLevel !== 'HIGH') riskLevel = 'HIGH';
      } else if (engagementScore < 70) {
        riskSignals.push('Moderate engagement');
        if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
      }

      // Check assignments
      const assignmentsProgress = mentee.progress?.assignmentsCompletionPercent || 0;
      if (assignmentsProgress < 50) {
        riskSignals.push('Missing assignments');
        if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
      }

      // Check last session
      const lastSession = mentee.engagement?.lastSessionDate;
      if (lastSession) {
        const daysSinceLastSession = Math.floor(
          (new Date() - new Date(lastSession)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastSession > 14) {
          riskSignals.push('No recent sessions');
          if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
        }
      }

      return {
        ...mentee,
        riskLevel,
        riskSignals,
        overallProgress,
        engagementScore,
      };
    }).filter(mentee => mentee.riskLevel !== 'LOW' || mentee.riskSignals.length > 0);

    setRiskStudents(risks);
  };

  const filterStudents = () => {
    let filtered = [...riskStudents];

    // Filter by risk level
    if (filters.riskLevel) {
      filtered = filtered.filter(s => s.riskLevel === filters.riskLevel);
    }

    // Filter by search
    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.studentName?.toLowerCase().includes(term) ||
        s.studentEmail?.toLowerCase().includes(term) ||
        s.programName?.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: riskStudents.length,
    high: riskStudents.filter(s => s.riskLevel === 'HIGH').length,
    medium: riskStudents.filter(s => s.riskLevel === 'MEDIUM').length,
    low: riskStudents.filter(s => s.riskLevel === 'LOW').length,
  };

  return (
    <>
      <PageHeader
        title="Risk Students"
        description="Identify and support students at risk"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total at Risk</p>
              <p className="text-3xl font-bold text-brand-600">{stats.total}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">High Risk</p>
              <p className="text-3xl font-bold text-red-600">{stats.high}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.medium}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Low Risk</p>
              <p className="text-3xl font-bold text-blue-600">{stats.low}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by name, email, or program..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
          <Button variant="ghost" size="sm" onClick={fetchMentees}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Students List */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading risk students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {filters.search || filters.riskLevel
                ? 'No students found matching your filters'
                : 'No students at risk identified'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id || student.enrollmentId}
                className={`flex flex-col gap-3 rounded-xl border-2 p-4 ${getRiskColor(student.riskLevel)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">{student.studentName}</p>
                      <p className="text-xs opacity-75">{student.studentEmail}</p>
                      <p className="text-xs opacity-75 mt-1">{student.programName}</p>
                    </div>
                  </div>
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-white/50">
                    {student.riskLevel} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Progress</p>
                    <p className="font-semibold">{student.overallProgress || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Engagement</p>
                    <p className="font-semibold">{student.engagementScore || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Assignments</p>
                    <p className="font-semibold">
                      {student.progress?.assignmentsCompletionPercent || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-75 mb-1">Sessions</p>
                    <p className="font-semibold">
                      {student.engagement?.sessionsCompleted || 0}
                    </p>
                  </div>
                </div>

                {student.riskSignals && student.riskSignals.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold mb-1">Risk Signals:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {student.riskSignals.map((signal, idx) => (
                        <li key={idx}>{signal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      // Navigate to mentee details or open communication
                      toast.info(`Opening communication with ${student.studentName}`);
                    }}
                    className="flex-1"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RiskStudents;
