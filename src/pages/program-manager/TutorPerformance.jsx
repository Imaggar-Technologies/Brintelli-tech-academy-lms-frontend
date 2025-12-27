import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, TrendingUp, Users, BookOpen, Calendar, Clock, BarChart3, Award, Target } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { apiRequest } from '../../api/apiClient';

const TutorPerformance = () => {
  const [searchParams] = useSearchParams();
  const tutorIdParam = searchParams.get('tutorId');

  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    if (tutorIdParam) {
      const tutor = tutors.find(t => (t.id || t._id) === tutorIdParam);
      if (tutor) {
        setSelectedTutor(tutor);
        fetchTutorPerformance(tutorIdParam);
      }
    }
  }, [tutorIdParam, tutors]);

  const fetchTutors = async () => {
    try {
      const response = await apiRequest('/api/users/role/tutor');
      if (response.success) {
        setTutors(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const fetchTutorPerformance = async (tutorId) => {
    try {
      setLoading(true);
      // For now, we'll use workload data as performance metrics
      // In a real system, you'd have dedicated performance endpoints
      const response = await apiRequest(`/api/tutors/workload?tutorId=${tutorId}`);
      if (response.success) {
        setPerformance({
          ...response.data.workload,
          tutor: response.data.tutor,
        });
      }
    } catch (error) {
      console.error('Error fetching tutor performance:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTutorChange = (tutorId) => {
    const tutor = tutors.find(t => (t.id || t._id) === tutorId);
    setSelectedTutor(tutor);
    if (tutorId) {
      fetchTutorPerformance(tutorId);
    } else {
      setPerformance(null);
    }
  };

  if (loading && !performance) {
    return (
      <>
        <PageHeader
          title="Tutor Performance"
          description="Monitor tutor performance metrics and engagement."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading performance data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Tutor Performance"
        description="Monitor tutor performance metrics and engagement."
      />

      <div className="grid gap-6">
        {/* Tutor Selection */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-text mb-2">Select Tutor</label>
          <select
            value={selectedTutor?.id || selectedTutor?._id || ''}
            onChange={(e) => handleTutorChange(e.target.value)}
            className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text"
          >
            <option value="">Select a tutor to view performance</option>
            {tutors.map((tutor) => (
              <option key={tutor.id || tutor._id} value={tutor.id || tutor._id}>
                {tutor.fullName || tutor.email}
              </option>
            ))}
          </select>
        </div>

        {performance && selectedTutor ? (
          <>
            {/* Performance Overview Cards */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-100/50 p-3 text-brand-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-text">{performance.batches || 0}</p>
                    <p className="text-sm font-medium text-textMuted">Active Batches</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-purple-100/50 p-3 text-purple-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-text">{performance.modules || 0}</p>
                    <p className="text-sm font-medium text-textMuted">Modules Assigned</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100/50 p-3 text-emerald-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-text">{performance.activeSessions || 0}</p>
                    <p className="text-sm font-medium text-textMuted">Active Sessions</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100/50 p-3 text-blue-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-text">{performance.upcomingSessions || 0}</p>
                    <p className="text-sm font-medium text-textMuted">Upcoming Sessions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Performance */}
            <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-text mb-4">Performance Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-brintelli-border/60 bg-gradient-to-br from-white to-brand-50/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-brand-600" />
                    <h4 className="font-semibold text-text">Total Sessions</h4>
                  </div>
                  <p className="text-3xl font-bold text-text">{performance.totalSessions || 0}</p>
                  <p className="text-xs text-textMuted mt-1">All time sessions conducted</p>
                </div>

                <div className="rounded-xl border border-brintelli-border/60 bg-gradient-to-br from-white to-purple-50/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-text">Engagement Rate</h4>
                  </div>
                  <p className="text-3xl font-bold text-text">
                    {performance.totalSessions > 0
                      ? Math.round((performance.activeSessions / performance.totalSessions) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-textMuted mt-1">Active vs total sessions</p>
                </div>
              </div>
            </div>

            {/* Assigned Batches */}
            {performance.batches && performance.batches.length > 0 && (
              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text mb-4">Assigned Batches</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {performance.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="rounded-xl border border-brintelli-border/60 bg-gradient-to-r from-white to-brand-50/20 p-4 hover:border-brand-300/60 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-brand-600" />
                        <h4 className="font-semibold text-text">{batch.name}</h4>
                      </div>
                      {batch.code && (
                        <p className="text-xs text-textMuted">Code: {batch.code}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-100/50 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-lg font-semibold text-text">Select a tutor to view performance</p>
            <p className="mt-2 text-sm text-textMuted">
              Choose a tutor from the dropdown above to see their performance metrics
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default TutorPerformance;

