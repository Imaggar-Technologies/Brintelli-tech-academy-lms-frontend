import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserPlus, Calendar, GraduationCap, UserCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import lsmAPI from '../../api/lsm';
import offerAPI from '../../api/offer';

const Onboarding = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationData, setAllocationData] = useState({
    batchId: '',
    courseId: '',
    mentorId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, batchesRes, mentorsRes] = await Promise.all([
        lsmAPI.getPendingOnboarding(),
        lsmAPI.getAllBatches(),
        lsmAPI.getAllMentors({ isActive: true }),
      ]);

      if (enrollmentsRes.success) {
        const enrollments = enrollmentsRes.data.enrollments || [];
        // Filter out enrollments without lead data (shouldn't happen, but just in case)
        setEnrollments(enrollments.filter(e => e.lead));
      } else {
        toast.error(enrollmentsRes.message || 'Failed to load enrollments');
        setEnrollments([]);
      }
      
      if (batchesRes.success) {
        setBatches(batchesRes.data.batches || []);
      }
      
      if (mentorsRes.success) {
        setMentors(mentorsRes.data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load data');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setAllocationData({
      batchId: enrollment.batchId || '',
      courseId: enrollment.courseId || '',
      mentorId: enrollment.mentorId || '',
    });
    setShowAllocationModal(true);
  };

  const handleSubmitAllocation = async () => {
    if (!selectedEnrollment) return;

    try {
      const response = await lsmAPI.allocateStudent(selectedEnrollment.id, allocationData);
      if (response.success) {
        toast.success('Student allocated successfully');
        setShowAllocationModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error allocating student:', error);
      toast.error(error.message || 'Failed to allocate student');
    }
  };

  const handleCompleteOnboarding = async (enrollmentId) => {
    try {
      const response = await lsmAPI.completeOnboarding(enrollmentId);
      if (response.success) {
        toast.success('Onboarding completed successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    }
  };

  const columns = [
    {
      key: 'lead',
      title: 'Student Name',
      render: (row) => row?.lead?.name || 'N/A',
    },
    {
      key: 'lead',
      title: 'Email',
      render: (row) => row?.lead?.email || 'N/A',
    },
    {
      key: 'lead',
      title: 'Phone',
      render: (row) => row?.lead?.phone || 'N/A',
    },
    {
      key: 'offer',
      title: 'Amount Paid',
      render: (row) => {
        const amount = row?.offer?.offeredPrice || row?.offer?.paymentAmount;
        return amount ? `₹${amount.toLocaleString('en-IN')}` : 'N/A';
      },
    },
    {
      key: 'offer',
      title: 'Payment Date',
      render: (row) => {
        const date = row?.offer?.paymentDate;
        return date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';
      },
    },
    {
      key: 'batchId',
      title: 'Batch',
      render: (row) => row?.batchId ? 'Assigned' : 'Not Assigned',
    },
    {
      key: 'courseId',
      title: 'Course',
      render: (row) => row?.courseId ? 'Assigned' : 'Not Assigned',
    },
    {
      key: 'mentorId',
      title: 'Mentor',
      render: (row) => row?.mentorId ? 'Assigned' : 'Not Assigned',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAllocate(row)}
          >
            Allocate
          </Button>
          {row?.batchId && row?.courseId && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleCompleteOnboarding(row?.id)}
            >
              Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  const stats = [
    {
      icon: Clock,
      label: 'Pending Onboarding',
      value: enrollments.length,
      color: 'text-yellow-600',
    },
    {
      icon: CheckCircle2,
      label: 'Batch Allocated',
      value: enrollments.filter(e => e.batchId).length,
      color: 'text-blue-600',
    },
    {
      icon: UserCheck,
      label: 'Mentor Assigned',
      value: enrollments.filter(e => e.mentorId).length,
      color: 'text-green-600',
    },
  ];

  return (
    <>
      <PageHeader
        title="Student Onboarding"
        description="Allocate batches, courses, and mentors for paid students"
      />

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
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

      {/* Enrollments Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">Pending Onboarding</h3>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No students pending onboarding</p>
          </div>
        ) : (
          <Table columns={columns} data={enrollments} minRows={10} />
        )}
      </div>

      {/* Allocation Modal */}
      {showAllocationModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Allocate Student</h3>
            <p className="text-textMuted mb-6">
              Student: <strong>{selectedEnrollment.lead?.name}</strong>
            </p>

            <div className="space-y-4">
              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  value={allocationData.batchId}
                  onChange={(e) => setAllocationData({ ...allocationData, batchId: e.target.value })}
                >
                  <option value="">Select Batch</option>
                  {batches
                    .filter(b => b.status === 'UPCOMING' || b.status === 'ACTIVE')
                    .filter(b => b.enrolled < b.capacity)
                    .map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} ({batch.enrolled}/{batch.capacity})
                      </option>
                    ))}
                </select>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Course
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  value={allocationData.courseId || selectedEnrollment.courseId || ''}
                  onChange={(e) => setAllocationData({ ...allocationData, courseId: e.target.value })}
                  placeholder="Course ID or Name"
                />
              </div>

              {/* Mentor Selection */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Mentor
                </label>
                <select
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  value={allocationData.mentorId}
                  onChange={(e) => setAllocationData({ ...allocationData, mentorId: e.target.value })}
                >
                  <option value="">Select Mentor (Optional)</option>
                  {mentors
                    .filter(m => m.availableSlots > 0)
                    .map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name} ({mentor.availableSlots} slots available)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleSubmitAllocation}
                disabled={!allocationData.batchId}
              >
                Allocate
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAllocationModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Onboarding;

