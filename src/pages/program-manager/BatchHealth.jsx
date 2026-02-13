import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ChartSpline, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Target, UserPlus, X, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import StatsCard from '../../components/StatsCard';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const BatchHealth = () => {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchHealth, setBatchHealth] = useState(null);
  const [students, setStudents] = useState([]);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollments, setSelectedEnrollments] = useState(new Set());

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchBatchHealth();
    }
  }, [selectedBatchId]);

  useEffect(() => {
    if (showEnrollmentModal) {
      fetchPendingEnrollments();
    }
  }, [showEnrollmentModal]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await lsmAPI.getAllBatches();
      if (response.success && response.data) {
        setBatches(response.data.batches || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEnrollments = async () => {
    try {
      setEnrollmentLoading(true);
      const response = await lsmAPI.getPendingOnboarding();
      if (response.success && response.data) {
        const enrollments = response.data.enrollments || response.data || [];
        // Filter enrollments that don't have a batch assigned or match the selected batch's program
        const selectedBatch = batches.find(b => (b.id || b._id) === selectedBatchId);
        const filteredEnrollments = enrollments.filter(enrollment => {
          // Show enrollments without batch or with matching program
          if (!enrollment.batchId) {
            if (selectedBatch && selectedBatch.courseId) {
              return enrollment.courseId === selectedBatch.courseId || 
                     enrollment.programId === selectedBatch.courseId;
            }
            return true;
          }
          return false;
        });
        setPendingEnrollments(filteredEnrollments);
      }
    } catch (error) {
      console.error('Error fetching pending enrollments:', error);
      toast.error('Failed to load pending enrollments');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleEnrollStudents = async () => {
    if (selectedEnrollments.size === 0) {
      toast.error('Please select at least one student to enroll');
      return;
    }

    try {
      setEnrollmentLoading(true);
      const selectedBatch = batches.find(b => (b.id || b._id) === selectedBatchId);
      
      if (!selectedBatch) {
        toast.error('Batch not found');
        return;
      }

      const enrollmentPromises = Array.from(selectedEnrollments).map(enrollmentId => {
        return lsmAPI.allocateBatch(enrollmentId, {
          batchId: selectedBatchId,
          courseId: selectedBatch.courseId || selectedBatch.programId,
        });
      });

      const results = await Promise.allSettled(enrollmentPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`Successfully enrolled ${successful} student(s)`);
        setShowEnrollmentModal(false);
        setSelectedEnrollments(new Set());
        // Refresh batch health data
        await fetchBatchHealth();
        await fetchBatches();
      }
      
      if (failed > 0) {
        toast.error(`Failed to enroll ${failed} student(s)`);
      }
    } catch (error) {
      console.error('Error enrolling students:', error);
      toast.error('Failed to enroll students');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const toggleEnrollmentSelection = (enrollmentId) => {
    setSelectedEnrollments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(enrollmentId)) {
        newSet.delete(enrollmentId);
      } else {
        newSet.add(enrollmentId);
      }
      return newSet;
    });
  };

  const filteredEnrollments = pendingEnrollments.filter(enrollment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const leadName = enrollment.lead?.name || enrollment.lead?.fullName || '';
    const leadEmail = enrollment.lead?.email || '';
    return leadName.toLowerCase().includes(searchLower) || 
           leadEmail.toLowerCase().includes(searchLower);
  });

  const fetchBatchHealth = async () => {
    try {
      setLoading(true);
      
      // Fetch batch details
      const batchResponse = await lsmAPI.getAllBatches();
      const batch = batchResponse.data?.batches?.find(b => (b.id || b._id) === selectedBatchId) ||
                    batchResponse.data?.find(b => (b.id || b._id) === selectedBatchId);
      
      if (!batch) {
        toast.error('Batch not found');
        return;
      }

      // Fetch students in batch
      let batchStudents = [];
      try {
        const studentsResponse = await lsmAPI.getBatchStudents(selectedBatchId);
        if (studentsResponse.success) {
          batchStudents = studentsResponse.data?.students || studentsResponse.data || [];
          // Normalize student data
          batchStudents = batchStudents.map(s => ({
            ...s,
            id: s.id || s._id || s.studentId || s.leadId,
            name: s.name || s.fullName || s.email || 'Unknown Student',
          }));
        }
      } catch (error) {
        console.error('Error fetching batch students:', error);
      }
      setStudents(batchStudents);

      // Fetch attendance data
      const attendanceResponse = await lsmAPI.getAttendance({ batchId: selectedBatchId });
      const attendanceData = attendanceResponse.success ? (attendanceResponse.data || []) : [];

      // Fetch performance data
      const performanceResponse = await lsmAPI.getPerformance({ batchId: selectedBatchId });
      const performanceData = performanceResponse.success ? (performanceResponse.data || []) : [];

      // Fetch progress data
      const progressResponse = await lsmAPI.getProgress({ batchId: selectedBatchId });
      const progressData = progressResponse.success ? (progressResponse.data || []) : [];

      // Calculate health metrics
      const totalStudents = batchStudents.length;
      const avgAttendance = attendanceData.length > 0
        ? attendanceData.reduce((sum, record) => sum + (record.attendancePercent || 0), 0) / attendanceData.length
        : 0;
      
      const avgPerformance = performanceData.length > 0
        ? performanceData.reduce((sum, record) => {
            const score = (record.assessmentAverage || 0) + (record.codingScore || 0) + (record.mockInterviewScore || 0);
            return sum + (score / 3);
          }, 0) / performanceData.length
        : 0;

      const avgProgress = progressData.length > 0
        ? progressData.reduce((sum, record) => {
            const progress = (record.moduleCompletionPercent || 0) + (record.assignmentsCompletionPercent || 0);
            return sum + (progress / 2);
          }, 0) / progressData.length
        : 0;

      // Determine health status
      let healthStatus = 'HEALTHY';
      let healthScore = (avgAttendance * 0.3 + avgPerformance * 0.4 + avgProgress * 0.3);
      
      if (healthScore < 50) {
        healthStatus = 'CRITICAL';
      } else if (healthScore < 70) {
        healthStatus = 'AT_RISK';
      } else if (healthScore < 85) {
        healthStatus = 'NEEDS_ATTENTION';
      }

      // Count students by status
      const healthyStudents = students.filter(s => {
        const studentAttendance = attendanceData.find(a => (a.studentId || a._id) === (s.id || s._id || s.studentId));
        const studentPerformance = performanceData.find(p => (p.studentId || p._id) === (s.id || s._id || s.studentId));
        const studentProgress = progressData.find(pr => (pr.studentId || pr._id) === (s.id || s._id || s.studentId));
        
        const att = studentAttendance?.attendancePercent || 0;
        const perf = studentPerformance ? ((studentPerformance.assessmentAverage || 0) + (studentPerformance.codingScore || 0)) / 2 : 0;
        const prog = studentProgress ? ((studentProgress.moduleCompletionPercent || 0) + (studentProgress.assignmentsCompletionPercent || 0)) / 2 : 0;
        const score = (att * 0.3 + perf * 0.4 + prog * 0.3);
        return score >= 70;
      }).length;

      const atRiskStudents = totalStudents - healthyStudents;

      setBatchHealth({
        batch,
        totalStudents,
        avgAttendance: Math.round(avgAttendance),
        avgPerformance: Math.round(avgPerformance),
        avgProgress: Math.round(avgProgress),
        healthScore: Math.round(healthScore),
        healthStatus,
        healthyStudents,
        atRiskStudents,
        attendanceData,
        performanceData,
        progressData,
      });
    } catch (error) {
      console.error('Error fetching batch health:', error);
      toast.error('Failed to load batch health data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600 bg-green-100';
      case 'NEEDS_ATTENTION':
        return 'text-yellow-600 bg-yellow-100';
      case 'AT_RISK':
        return 'text-orange-600 bg-orange-100';
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthLabel = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'Healthy';
      case 'NEEDS_ATTENTION':
        return 'Needs Attention';
      case 'AT_RISK':
        return 'At Risk';
      case 'CRITICAL':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const studentColumns = [
    { key: 'name', title: 'Student Name' },
    {
      key: 'attendance',
      title: 'Attendance %',
      render: (value, row) => {
        const studentAttendance = batchHealth?.attendanceData?.find(
          a => (a.studentId || a._id) === (row.id || row._id || row.studentId)
        );
        const percent = studentAttendance?.attendancePercent || 0;
        return (
          <span className={percent >= 80 ? 'text-green-600' : percent >= 60 ? 'text-yellow-600' : 'text-red-600'}>
            {percent.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'performance',
      title: 'Performance',
      render: (value, row) => {
        const studentPerformance = batchHealth?.performanceData?.find(
          p => (p.studentId || p._id) === (row.id || row._id || row.studentId)
        );
        if (!studentPerformance) return 'N/A';
        const score = ((studentPerformance.assessmentAverage || 0) + (studentPerformance.codingScore || 0)) / 2;
        return (
          <span className={score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}>
            {score.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (value, row) => {
        const studentProgress = batchHealth?.progressData?.find(
          pr => (pr.studentId || pr._id) === (row.id || row._id || row.studentId)
        );
        if (!studentProgress) return 'N/A';
        const progress = ((studentProgress.moduleCompletionPercent || 0) + (studentProgress.assignmentsCompletionPercent || 0)) / 2;
        return (
          <span className={progress >= 70 ? 'text-green-600' : progress >= 50 ? 'text-yellow-600' : 'text-red-600'}>
            {progress.toFixed(1)}%
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => {
        const studentAttendance = batchHealth?.attendanceData?.find(
          a => (a.studentId || a._id) === (row.id || row._id || row.studentId)
        );
        const studentPerformance = batchHealth?.performanceData?.find(
          p => (p.studentId || p._id) === (row.id || row._id || row.studentId)
        );
        const studentProgress = batchHealth?.progressData?.find(
          pr => (pr.studentId || pr._id) === (row.id || row._id || row.studentId)
        );
        
        const att = studentAttendance?.attendancePercent || 0;
        const perf = studentPerformance ? ((studentPerformance.assessmentAverage || 0) + (studentPerformance.codingScore || 0)) / 2 : 0;
        const prog = studentProgress ? ((studentProgress.moduleCompletionPercent || 0) + (studentProgress.assignmentsCompletionPercent || 0)) / 2 : 0;
        const score = (att * 0.3 + perf * 0.4 + prog * 0.3);
        
        let status = 'HEALTHY';
        if (score < 50) status = 'CRITICAL';
        else if (score < 70) status = 'AT_RISK';
        else if (score < 85) status = 'NEEDS_ATTENTION';
        
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthColor(status)}`}>
            {getHealthLabel(status)}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Batch Health"
        description="Monitor batch health metrics including attendance, performance, and progress."
        actions={
          selectedBatchId && (
            <Button
              variant="primary"
              onClick={() => setShowEnrollmentModal(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Enroll Students
            </Button>
          )
        }
      />

      <div className="space-y-6">
        {/* Batch Selection */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-text mb-2">Select Batch</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name} {batch.courseId ? `- ${batch.programName || 'Program'}` : ''}
              </option>
            ))}
          </select>
        </div>

        {loading && selectedBatchId ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-textMuted">Loading batch health data...</div>
          </div>
        ) : batchHealth ? (
          <>
            {/* Health Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                icon={ChartSpline}
                label="Health Score"
                value={`${batchHealth.healthScore}%`}
                trend={null}
                className={getHealthColor(batchHealth.healthStatus)}
              />
              <StatsCard
                icon={Users}
                label="Total Students"
                value={batchHealth.totalStudents}
                trend={null}
              />
              <StatsCard
                icon={CheckCircle2}
                label="Healthy Students"
                value={batchHealth.healthyStudents}
                trend={null}
                className="text-green-600"
              />
              <StatsCard
                icon={AlertCircle}
                label="At Risk Students"
                value={batchHealth.atRiskStudents}
                trend={null}
                className="text-red-600"
              />
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-brand-600" />
                  <h3 className="text-lg font-semibold text-text">Average Attendance</h3>
                </div>
                <div className="text-3xl font-bold text-text">{batchHealth.avgAttendance}%</div>
                <div className="text-sm text-textMuted mt-2">
                  Based on {batchHealth.attendanceData?.length || 0} attendance records
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                  <h3 className="text-lg font-semibold text-text">Average Performance</h3>
                </div>
                <div className="text-3xl font-bold text-text">{batchHealth.avgPerformance}%</div>
                <div className="text-sm text-textMuted mt-2">
                  Based on assessments and coding scores
                </div>
              </div>

              <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-brand-600" />
                  <h3 className="text-lg font-semibold text-text">Average Progress</h3>
                </div>
                <div className="text-3xl font-bold text-text">{batchHealth.avgProgress}%</div>
                <div className="text-sm text-textMuted mt-2">
                  Module and assignment completion
                </div>
              </div>
            </div>

            {/* Health Status */}
            <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Batch Health Status</h3>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getHealthColor(batchHealth.healthStatus)}`}>
                  {getHealthLabel(batchHealth.healthStatus)}
                </span>
              </div>
              <div className="text-sm text-textMuted">
                <p><strong>Batch:</strong> {batchHealth.batch.name}</p>
                {batchHealth.batch.startDate && batchHealth.batch.endDate && (
                  <p className="mt-1">
                    <strong>Duration:</strong>{' '}
                    {new Date(batchHealth.batch.startDate).toLocaleDateString()} -{' '}
                    {new Date(batchHealth.batch.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Student Health Table */}
            <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-text mb-4">Student Health Overview</h3>
              <Table columns={studentColumns} data={students} />
            </div>
          </>
        ) : selectedBatchId ? (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-lg font-semibold text-text">No health data available</p>
            <p className="text-sm text-textMuted mt-2">
              Health metrics will appear once students have attendance, performance, and progress data.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-12 text-center shadow-sm">
            <ChartSpline className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-lg font-semibold text-text">Select a batch to view health metrics</p>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false);
          setSelectedEnrollments(new Set());
          setSearchTerm('');
        }}
        title="Enroll Students to Batch"
        size="large"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Enrollment List */}
          {enrollmentLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-textMuted">Loading students...</div>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 text-textMuted">
              {searchTerm ? 'No students found matching your search' : 'No students available for enrollment'}
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto border border-brintelli-border rounded-lg">
                <table className="w-full">
                  <thead className="bg-brintelli-baseAlt sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text">
                        <input
                          type="checkbox"
                          checked={filteredEnrollments.length > 0 && filteredEnrollments.every(e => selectedEnrollments.has(e.id || e._id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEnrollments(new Set(filteredEnrollments.map(e => e.id || e._id)));
                            } else {
                              setSelectedEnrollments(new Set());
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text">Program</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brintelli-border">
                    {filteredEnrollments.map((enrollment) => {
                      const enrollmentId = enrollment.id || enrollment._id;
                      const isSelected = selectedEnrollments.has(enrollmentId);
                      const lead = enrollment.lead || {};
                      return (
                        <tr
                          key={enrollmentId}
                          className={`hover:bg-brintelli-baseAlt cursor-pointer ${isSelected ? 'bg-brand-50' : ''}`}
                          onClick={() => toggleEnrollmentSelection(enrollmentId)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleEnrollmentSelection(enrollmentId)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-text">
                            {lead.name || lead.fullName || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-textMuted">
                            {lead.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-textMuted">
                            {enrollment.programName || enrollment.courseName || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  {selectedEnrollments.size} student(s) selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowEnrollmentModal(false);
                      setSelectedEnrollments(new Set());
                      setSearchTerm('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleEnrollStudents}
                    disabled={selectedEnrollments.size === 0 || enrollmentLoading}
                  >
                    {enrollmentLoading ? 'Enrolling...' : `Enroll ${selectedEnrollments.size} Student(s)`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default BatchHealth;

