import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UsersRound, Mail, Phone, GraduationCap, Calendar, Search, User, BookOpen, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const Mentees = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [filteredMentees, setFilteredMentees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMentees();
  }, []);

  useEffect(() => {
    // Filter mentees based on search term
    if (!searchTerm.trim()) {
      setFilteredMentees(mentees);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = mentees.filter(mentee =>
        mentee.studentName?.toLowerCase().includes(term) ||
        mentee.studentEmail?.toLowerCase().includes(term) ||
        mentee.programName?.toLowerCase().includes(term) ||
        mentee.batchName?.toLowerCase().includes(term)
      );
      setFilteredMentees(filtered);
    }
  }, [searchTerm, mentees]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMentees();
      
      if (response.success) {
        const menteesData = (response.data?.mentees || []).map(mentee => ({
          ...mentee,
          id: mentee.id || mentee.enrollmentId,
        }));
        console.log('Loaded mentees:', menteesData.length);
        setMentees(menteesData);
        setFilteredMentees(menteesData);
      } else {
        toast.error(response.message || 'Failed to load mentees');
        setMentees([]);
        setFilteredMentees([]);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast.error(error.message || 'Failed to load mentees');
      setMentees([]);
      setFilteredMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ENROLLED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING_ONBOARDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOnboardingStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const columns = [
    {
      key: 'studentName',
      title: 'Student',
      render: (value, row) => {
        const mentee = row || {};
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <div className="font-semibold text-text">{mentee.studentName || 'Unknown'}</div>
              <div className="text-xs text-textMuted">{mentee.studentEmail || 'N/A'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'programName',
      title: 'Program',
      render: (value, row) => {
        const mentee = row || {};
        return (
          <div>
            <div className="font-medium text-text">{mentee.programName || 'N/A'}</div>
            {mentee.batchName && (
              <div className="text-xs text-textMuted">Batch: {mentee.batchName}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => {
        const mentee = row || {};
        return (
          <div className="space-y-1">
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(mentee.status)}`}>
              {mentee.status || 'N/A'}
            </span>
            {mentee.onboardingStatus && (
              <div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getOnboardingStatusColor(mentee.onboardingStatus)}`}>
                  {mentee.onboardingStatus}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'enrolledAt',
      title: 'Enrolled',
      render: (value, row) => {
        const mentee = row || {};
        return (
          <div className="text-sm text-textMuted">
            {formatDate(mentee.enrolledAt)}
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        const mentee = row || {};
        return (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedMentee(mentee);
                setShowDetailsModal(true);
              }}
            >
              View Details
            </Button>
          </div>
        );
      },
    },
  ];

  const stats = [
    {
      icon: UsersRound,
      label: 'Total Mentees',
      value: mentees.length,
      color: 'text-blue-600',
    },
    {
      icon: CheckCircle2,
      label: 'Active',
      value: mentees.filter(m => m.status === 'ACTIVE').length,
      color: 'text-green-600',
    },
    {
      icon: Clock,
      label: 'Pending Onboarding',
      value: mentees.filter(m => m.onboardingStatus === 'PENDING').length,
      color: 'text-yellow-600',
    },
    {
      icon: GraduationCap,
      label: 'Programs',
      value: new Set(mentees.map(m => m.programName)).size,
      color: 'text-purple-600',
    },
  ];

  return (
    <>
      <PageHeader
        title="My Mentees"
        description="View and manage all your assigned mentees"
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

      {/* Mentees Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Mentee List</h3>
            <p className="text-sm text-textMuted mt-1">
              Total: {filteredMentees.length} mentee{filteredMentees.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
              <input
                type="text"
                placeholder="Search mentees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={fetchMentees}>
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading mentees...</p>
          </div>
        ) : filteredMentees.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm ? 'No mentees found matching your search' : 'No mentees assigned yet'}
            </p>
          </div>
        ) : (
          <Table columns={columns} data={filteredMentees} minRows={10} />
        )}
      </div>

      {/* Mentee Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMentee(null);
        }}
        title={selectedMentee ? `Mentee Details: ${selectedMentee.studentName}` : 'Mentee Details'}
        size="lg"
      >
        {selectedMentee && (
          <div className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Student Information
              </h3>
              <div className="bg-brintelli-baseAlt rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-textMuted" />
                  <span className="text-sm text-textMuted">Email:</span>
                  <span className="text-sm text-text">{selectedMentee.studentEmail || 'N/A'}</span>
                </div>
                {selectedMentee.studentPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-textMuted" />
                    <span className="text-sm text-textMuted">Phone:</span>
                    <span className="text-sm text-text">{selectedMentee.studentPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Program Information */}
            <div>
              <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Program Information
              </h3>
              <div className="bg-brintelli-baseAlt rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm text-textMuted">Program:</span>
                  <span className="text-sm text-text ml-2 font-semibold">{selectedMentee.programName || 'N/A'}</span>
                </div>
                {selectedMentee.batchName && (
                  <div>
                    <span className="text-sm text-textMuted">Batch:</span>
                    <span className="text-sm text-text ml-2">{selectedMentee.batchName}</span>
                  </div>
                )}
                {selectedMentee.programId && (
                  <div>
                    <span className="text-sm text-textMuted">Program ID:</span>
                    <span className="text-sm text-text ml-2 font-mono">{selectedMentee.programId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Status */}
            <div>
              <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Enrollment Status
              </h3>
              <div className="bg-brintelli-baseAlt rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-textMuted">Status:</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(selectedMentee.status)}`}>
                    {selectedMentee.status || 'N/A'}
                  </span>
                </div>
                {selectedMentee.onboardingStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">Onboarding Status:</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getOnboardingStatusColor(selectedMentee.onboardingStatus)}`}>
                      {selectedMentee.onboardingStatus}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-textMuted">Enrolled At:</span>
                  <span className="text-sm text-text">{formatDate(selectedMentee.enrolledAt)}</span>
                </div>
                {selectedMentee.mentorSelectedBy && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">Selected By:</span>
                    <span className="text-sm text-text capitalize">{selectedMentee.mentorSelectedBy.toLowerCase()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-brintelli-border">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMentee(null);
                }}
                className="flex-1"
              >
                Close
              </Button>
      </div>
    </div>
        )}
      </Modal>
    </>
  );
};

export default Mentees;
