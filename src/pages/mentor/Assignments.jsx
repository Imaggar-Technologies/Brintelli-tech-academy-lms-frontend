import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, User, Calendar, CheckCircle2, Clock, AlertCircle, Search, FileText, Star } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';
import studentAPI from '../../api/student';

const Assignments = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeData, setGradeData] = useState({
    marks: '',
    feedback: '',
  });

  useEffect(() => {
    fetchMentees();
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, statusFilter, assignments]);

  const fetchMentees = async () => {
    try {
      const response = await mentorAPI.getMentees();
      if (response.success) {
        setMentees(response.data.mentees || []);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Fetch assignments for all mentees
      const allAssignments = [];
      
      for (const mentee of mentees) {
        try {
          // This would need a mentor-specific endpoint, for now we'll use student API structure
          // In production, you'd have: /api/mentors/mentees/{menteeId}/assignments
          const response = await studentAPI.getMyAssignments();
          if (response.success && response.data.assignments) {
            const menteeAssignments = response.data.assignments.map(assignment => ({
              ...assignment,
              menteeId: mentee.id || mentee.enrollmentId,
              menteeName: mentee.studentName,
              menteeEmail: mentee.studentEmail,
            }));
            allAssignments.push(...menteeAssignments);
          }
        } catch (error) {
          console.error(`Error fetching assignments for ${mentee.studentName}:`, error);
        }
      }

      // If no mentees yet, try to get assignments directly
      if (mentees.length === 0) {
        const response = await studentAPI.getMyAssignments();
        if (response.success && response.data.assignments) {
          setAssignments(response.data.assignments || []);
        }
      } else {
        setAssignments(allAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = [...assignments];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(term) ||
        a.menteeName?.toLowerCase().includes(term) ||
        a.moduleName?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    setFilteredAssignments(filtered);
  };

  const handleGradeAssignment = async () => {
    if (!selectedAssignment || !gradeData.marks) {
      toast.error('Please enter marks');
      return;
    }

    const marks = parseFloat(gradeData.marks);
    if (isNaN(marks) || marks < 0 || marks > (selectedAssignment.maxMarks || 100)) {
      toast.error(`Marks must be between 0 and ${selectedAssignment.maxMarks || 100}`);
      return;
    }

    try {
      // In production, this would be: /api/mentors/assignments/{allocationId}/grade
      // For now, we'll save to localStorage
      const gradedAssignments = JSON.parse(localStorage.getItem('mentorGradedAssignments') || '{}');
      const assignmentKey = `${selectedAssignment.id}_${selectedAssignment.menteeId}`;
      
      gradedAssignments[assignmentKey] = {
        assignmentId: selectedAssignment.id,
        menteeId: selectedAssignment.menteeId,
        marks: marks,
        maxMarks: selectedAssignment.maxMarks || 100,
        feedback: gradeData.feedback,
        gradedAt: new Date().toISOString(),
      };

      localStorage.setItem('mentorGradedAssignments', JSON.stringify(gradedAssignments));
      
      // Update local state
      setAssignments(assignments.map(a => {
        if (a.id === selectedAssignment.id && a.menteeId === selectedAssignment.menteeId) {
          return {
            ...a,
            status: 'GRADED',
            submission: {
              ...a.submission,
              marks: marks,
              feedback: gradeData.feedback,
            },
          };
        }
        return a;
      }));

      toast.success('Assignment graded successfully');
      setShowGradeModal(false);
      setSelectedAssignment(null);
      setGradeData({ marks: '', feedback: '' });
    } catch (error) {
      console.error('Error grading assignment:', error);
      toast.error('Failed to grade assignment');
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
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingGrading = assignments.filter(a => a.status === 'SUBMITTED').length;
  const graded = assignments.filter(a => a.status === 'GRADED').length;

  return (
    <>
      <PageHeader
        title="Assignments"
        description="Evaluate and grade assignments assigned by tutors"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Assignments</p>
              <p className="text-3xl font-bold text-brand-600">{assignments.length}</p>
            </div>
            <ClipboardCheck className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Pending Grading</p>
              <p className="text-3xl font-bold text-amber-600">{pendingGrading}</p>
            </div>
            <Clock className="h-12 w-12 text-amber-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Graded</p>
              <p className="text-3xl font-bold text-green-600">{graded}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-20" />
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
              placeholder="Search by assignment name, mentee, or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Status</option>
            <option value="SUBMITTED">Pending Grading</option>
            <option value="GRADED">Graded</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ASSIGNED">Assigned</option>
          </select>
          <Button variant="ghost" size="sm" onClick={fetchAssignments}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Assignments</h3>
            <p className="text-sm text-textMuted mt-1">
              {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No assignments found matching your filters' 
                : 'No assignments available'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={`${assignment.id}_${assignment.menteeId}`}
                className="flex flex-col gap-3 rounded-xl border border-brintelli-border bg-white/70 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="font-semibold text-text">{assignment.name}</p>
                        <p className="text-xs text-textMuted">
                          {assignment.moduleName} • {assignment.programName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-textMuted mt-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{assignment.menteeName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                      <span>Max Marks: {assignment.maxMarks || 100}</span>
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-text mt-2 line-clamp-2">{assignment.description}</p>
                    )}
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>

                {assignment.submission && (
                  <div className="p-3 bg-brintelli-baseAlt rounded-lg">
                    <p className="text-xs text-textMuted mb-1">Submitted: {formatDate(assignment.submission.submittedAt)}</p>
                    {assignment.submission.marks !== null && assignment.submission.marks !== undefined && (
                      <p className="text-sm font-semibold text-text">
                        Marks: {assignment.submission.marks} / {assignment.maxMarks || 100}
                      </p>
                    )}
                  </div>
                )}

                {assignment.status === 'SUBMITTED' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setGradeData({
                        marks: assignment.submission?.marks || '',
                        feedback: '',
                      });
                      setShowGradeModal(true);
                    }}
                    className="w-full"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Grade Assignment
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedAssignment(null);
          setGradeData({ marks: '', feedback: '' });
        }}
        title={selectedAssignment ? `Grade: ${selectedAssignment.name}` : 'Grade Assignment'}
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div className="p-3 bg-brintelli-baseAlt rounded-lg">
              <p className="text-sm font-semibold text-text">Mentee: {selectedAssignment.menteeName}</p>
              <p className="text-xs text-textMuted">{selectedAssignment.menteeEmail}</p>
              <p className="text-xs text-textMuted mt-1">
                Module: {selectedAssignment.moduleName}
              </p>
              <p className="text-xs text-textMuted">
                Max Marks: {selectedAssignment.maxMarks || 100}
              </p>
            </div>

            {selectedAssignment.description && (
              <div>
                <p className="text-sm font-semibold text-text mb-1">Assignment Description:</p>
                <p className="text-sm text-text">{selectedAssignment.description}</p>
              </div>
            )}

            {selectedAssignment.problemStatement && (
              <div>
                <p className="text-sm font-semibold text-text mb-1">Problem Statement:</p>
                <p className="text-sm text-text whitespace-pre-wrap">{selectedAssignment.problemStatement}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max={selectedAssignment.maxMarks || 100}
                step="0.5"
                value={gradeData.marks}
                onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={`0 - ${selectedAssignment.maxMarks || 100}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Feedback
              </label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[120px]"
                placeholder="Provide feedback on the assignment..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                onClick={handleGradeAssignment}
                disabled={!gradeData.marks}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Grade
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedAssignment(null);
                  setGradeData({ marks: '', feedback: '' });
                }}
              >
                Cancel
              </Button>
      </div>
    </div>
        )}
      </Modal>
    </>
  );
};

export default Assignments;
