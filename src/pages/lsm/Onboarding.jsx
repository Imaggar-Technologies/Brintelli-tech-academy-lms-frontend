import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserPlus, Calendar, GraduationCap, UserCheck, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, MoreVertical, Phone, Mail, User, FileText, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import lsmAPI from '../../api/lsm';
import leadAPI from '../../api/lead';
import programAPI from '../../api/program';

const Onboarding = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [batchData, setBatchData] = useState({
    batchId: '',
  });
  const [mentorData, setMentorData] = useState({
    suggestedMentors: [], // Array of up to 4 mentor IDs
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showCallNotesModal, setShowCallNotesModal] = useState(false);
  const [selectedLeadForCallNotes, setSelectedLeadForCallNotes] = useState(null);
  const [callNoteText, setCallNoteText] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEnrollmentForDetails, setSelectedEnrollmentForDetails] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu')) {
        setExpandedRows(new Set());
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to page 1 when enrollments change
  useEffect(() => {
    setCurrentPage(1);
  }, [enrollments.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollmentsRes, batchesRes, mentorsRes, programsRes] = await Promise.all([
        lsmAPI.getPendingOnboarding(),
        lsmAPI.getAllBatches(),
        lsmAPI.getAllMentors({ isActive: true }),
        programAPI.getAllPrograms(),
      ]);

      if (enrollmentsRes.success) {
        const enrollments = enrollmentsRes.data.enrollments || [];
        // Filter out enrollments without lead data (shouldn't happen, but just in case)
        const validEnrollments = enrollments.filter(e => e.lead);
        console.log('Loaded enrollments:', validEnrollments.length, 'out of', enrollments.length);
        console.log('Sample enrollment data:', validEnrollments[0]);
        setEnrollments(validEnrollments);
      } else {
        console.error('Failed to load enrollments:', enrollmentsRes);
        toast.error(enrollmentsRes.message || 'Failed to load enrollments');
        setEnrollments([]);
      }
      
      if (batchesRes.success) {
        // Handle different response structures - same as LSM Batches page
        const batchesData = (batchesRes.data?.batches || batchesRes.batches || []).map(batch => ({
          ...batch,
          // Normalize ID to ensure it's always a string
          id: (batch.id || batch._id)?.toString(),
          _id: (batch._id || batch.id)?.toString(),
          // Ensure all fields have defaults
          courseId: batch.courseId || batch.programId || null,
          programId: batch.programId || batch.courseId || null,
          programName: batch.programName || null,
          startDate: batch.startDate || null,
          endDate: batch.endDate || null,
          status: batch.status || 'UPCOMING',
          capacity: batch.capacity || 0,
          enrolled: batch.enrolled || 0,
        }));
        console.log('=== Batch Loading Debug ===');
        console.log('Batches API Response:', batchesRes);
        console.log('Batches data structure:', batchesRes.data);
        console.log('Loaded batches count:', batchesData.length);
        console.log('First batch sample:', batchesData[0]);
        console.log('All batch IDs:', batchesData.map(b => ({ id: b.id, name: b.name, status: b.status })));
        console.log('=== End Batch Loading Debug ===');
        setBatches(batchesData);
      } else {
        console.error('Failed to load batches:', batchesRes);
        toast.error(batchesRes.message || 'Failed to load batches');
        setBatches([]); // Ensure batches is set to empty array on error
      }
      
      if (mentorsRes.success) {
        const mentorsData = mentorsRes.data.mentors || [];
        console.log('Loaded mentors:', mentorsData.length);
        setMentors(mentorsData);
      } else {
        console.error('Failed to load mentors:', mentorsRes);
        toast.error(mentorsRes.message || 'Failed to load mentors');
      }

      if (programsRes.success) {
        const programsData = programsRes.data.programs || [];
        console.log('Loaded programs:', programsData.length);
        setPrograms(programsData);
      } else {
        console.error('Failed to load programs:', programsRes);
        // Don't show error toast for programs, just log it
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load data');
      setEnrollments([]);
      setBatches([]); // Ensure batches is set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getProgramName = (courseId) => {
    try {
      if (!courseId) {
        return 'N/A';
      }
      
      if (!programs || !Array.isArray(programs) || programs.length === 0) {
        return 'N/A';
      }
      
      // Normalize courseId for comparison
      const normalizedCourseId = String(courseId).trim();
      
      // Find matching program
      const program = programs.find(p => {
        if (!p) return false;
        const programId = String(p.id || p._id || '').trim();
        return programId === normalizedCourseId;
      });
      
      if (program) {
        return program.name || 'N/A';
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error in getProgramName:', error);
      return 'N/A';
    }
  };

  const handleAllocateBatch = (enrollment) => {
    console.log('=== Opening Batch Modal ===');
    console.log('Current batches state:', batches);
    console.log('Batches count:', batches.length);
    console.log('Enrollment:', enrollment);
    setSelectedEnrollment(enrollment);
    setBatchData({
      batchId: enrollment.batchId || '',
    });
    setShowBatchModal(true);
    
    // If batches are empty, try to fetch them again
    if (batches.length === 0) {
      console.log('Batches are empty, fetching again...');
      lsmAPI.getAllBatches().then(batchesRes => {
        if (batchesRes.success) {
          const batchesData = (batchesRes.data?.batches || batchesRes.batches || []).map(batch => ({
            ...batch,
            id: (batch.id || batch._id)?.toString(),
            _id: (batch._id || batch.id)?.toString(),
            courseId: batch.courseId || batch.programId || null,
            programId: batch.programId || batch.courseId || null,
            status: batch.status || 'UPCOMING',
            capacity: batch.capacity || 0,
            enrolled: batch.enrolled || 0,
          }));
          console.log('Refetched batches:', batchesData.length);
          setBatches(batchesData);
        }
      });
    }
  };

  const handleSuggestMentors = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setMentorData({
      suggestedMentors: [], // Reset suggested mentors
    });
    setShowMentorModal(true);
  };

  const handleSubmitBatch = async () => {
    if (!selectedEnrollment || !batchData.batchId) {
      toast.error('Please select a batch');
      return;
    }

    try {
      const response = await lsmAPI.allocateBatch(selectedEnrollment.id, {
        batchId: batchData.batchId,
        courseId: selectedEnrollment.courseId || selectedEnrollment.offer?.courseId,
      });
      if (response.success) {
        toast.success('Batch allocated successfully');
        setShowBatchModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error allocating batch:', error);
      toast.error(error.message || 'Failed to allocate batch');
    }
  };

  const handleSubmitMentorSuggestions = async () => {
    if (!selectedEnrollment || !mentorData.suggestedMentors || mentorData.suggestedMentors.length === 0) {
      toast.error('Please suggest at least one mentor');
      return;
    }

    try {
      const response = await lsmAPI.suggestMentors(selectedEnrollment.id, {
        suggestedMentors: mentorData.suggestedMentors,
      });
      if (response.success) {
        toast.success('Mentors suggested successfully. Student will choose one.');
        setShowMentorModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error suggesting mentors:', error);
      toast.error(error.message || 'Failed to suggest mentors');
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

  const getLastCallNote = (callNotes) => {
    if (!callNotes || !Array.isArray(callNotes) || callNotes.length === 0) {
      return null;
    }
    // Sort by createdAt and get the most recent
    const sorted = [...callNotes].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.callDate || 0);
      const dateB = new Date(b.createdAt || b.callDate || 0);
      return dateB - dateA;
    });
    return sorted[0];
  };

  const formatCallNoteTooltip = (callNote) => {
    if (!callNote) return 'No calls yet';
    const date = callNote.callDate || (callNote.createdAt ? new Date(callNote.createdAt).toLocaleDateString() : '');
    const time = callNote.callTime || '';
    const notes = callNote.notes || '';
    return `${date} ${time}\n${notes}`;
  };

  const handleAddCallNote = async () => {
    if (!selectedLeadForCallNotes || !callNoteText.trim()) {
      toast.error('Please enter call notes');
      return;
    }

    try {
      const response = await leadAPI.addCallNotes(selectedLeadForCallNotes, {
        notes: callNoteText.trim(),
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().slice(0, 5),
      });

      if (response.success) {
        toast.success('Call notes added successfully');
        setCallNoteText('');
        setShowCallNotesModal(false);
        setSelectedLeadForCallNotes(null);
        fetchData(); // Refresh to get updated call notes
      }
    } catch (error) {
      console.error('Error adding call notes:', error);
      toast.error(error.message || 'Failed to add call notes');
    }
  };

  const columns = [
    {
      key: 'lead',
      title: 'Student Name',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex) where value = row[column.key]
        // For 'lead' key, value is row.lead, but we need the full row object
        const enrollment = row || {};
        const lastCallNote = getLastCallNote(enrollment?.lead?.callNotes);
        const tooltipText = formatCallNoteTooltip(lastCallNote);
        return (
          <div className="flex items-center gap-2">
            <span>{enrollment?.lead?.name || 'N/A'}</span>
            {lastCallNote && (
              <div className="group relative">
                <MessageSquare className="h-4 w-4 text-blue-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-pre-line">
                  <div className="font-semibold mb-1">Last Call:</div>
                  {tooltipText}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex)
        const enrollment = row || {};
        return enrollment?.lead?.phone || 'N/A';
      },
    },
    {
      key: 'batchId',
      title: 'Batch',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex)
        const enrollment = row || {};
        return (
          <span className={enrollment?.batchId ? 'text-green-600 font-semibold' : 'text-amber-600'}>
            {enrollment?.batchId ? 'Assigned' : 'Not Assigned'}
          </span>
        );
      },
    },
    {
      key: 'courseId',
      title: 'Course',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex)
        const enrollment = row || {};
        // Use programName directly from API response, fallback to lookup if not available
        const programName = enrollment?.programName || getProgramName(enrollment?.courseId || enrollment?.offer?.courseId);
        const courseId = enrollment?.courseId || enrollment?.offer?.courseId;
        return (
          <span className={courseId ? 'text-green-600 font-semibold' : 'text-amber-600'}>
            {programName && programName !== 'N/A' ? programName : 'Not Assigned'}
          </span>
        );
      },
    },
    {
      key: 'mentorId',
      title: 'Mentor',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex)
        const enrollment = row || {};
        return (
          <span className={enrollment?.mentorId ? 'text-green-600 font-semibold' : 'text-amber-600'}>
            {enrollment?.mentorId ? 'Assigned' : 'Not Assigned'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        // Table component passes (value, row, rowIndex)
        const enrollment = row || {};
        // Safety check: if row is undefined or doesn't have an id, return empty div
        if (!enrollment || !enrollment.id) {
          return <div className="text-textMuted text-sm">N/A</div>;
        }
        
        const rowId = enrollment.id || enrollment._id;
        
        return (
          <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
            {!enrollment?.batchId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAllocateBatch(enrollment);
                }}
              >
                Allocate Batch
              </Button>
            )}
            {enrollment?.batchId && !enrollment?.mentorId && (
            <Button
              variant="secondary"
              size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSuggestMentors(enrollment);
                }}
            >
                Suggest Mentors
            </Button>
            )}
            {enrollment?.batchId && enrollment?.mentorId && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompleteOnboarding(rowId);
                }}
              >
                Complete
              </Button>
            )}
            {/* Dropdown Menu */}
            <div className="relative dropdown-menu">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRows(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(rowId)) {
                      newSet.delete(rowId);
                    } else {
                      newSet.add(rowId);
                    }
                    return newSet;
                  });
                }}
                className="p-1.5 rounded hover:bg-brintelli-baseAlt transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4 text-textMuted" />
              </button>
              {expandedRows.has(rowId) && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-brintelli-border rounded-lg shadow-lg z-50 dropdown-menu">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEnrollmentForDetails(enrollment);
                    setShowDetailsModal(true);
                    setExpandedRows(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(rowId);
                      return newSet;
                    });
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-brintelli-baseAlt flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Contact Details
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEnrollmentForDetails(enrollment);
                    setShowDetailsModal(true);
                    setExpandedRows(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(rowId);
                      return newSet;
                    });
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-brintelli-baseAlt flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Other Details
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLeadForCallNotes(enrollment?.leadId);
                    setShowCallNotesModal(true);
                    setExpandedRows(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(rowId);
                      return newSet;
                    });
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-brintelli-baseAlt flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Add Call Notes
                </button>
              </div>
            )}
          </div>
        </div>
        );
      },
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
          <div>
          <h3 className="text-lg font-semibold text-text">Pending Onboarding</h3>
            <p className="text-sm text-textMuted mt-1">
              Total: {enrollments.length} student{enrollments.length !== 1 ? 's' : ''}
            </p>
          </div>
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
          <>
            {/* Pagination Info */}
            {(() => {
              const totalPages = Math.ceil(enrollments.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = Math.min(startIndex + itemsPerPage, enrollments.length);
              const paginatedEnrollments = enrollments.slice(startIndex, endIndex);

              return (
                <>
                  <Table columns={columns} data={paginatedEnrollments} minRows={itemsPerPage} />
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                      <div className="text-sm text-textMuted">
                        Showing {startIndex + 1} to {endIndex} of {enrollments.length} students
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const maxVisible = 5;
                            let startPage, endPage;
                            
                            if (totalPages <= maxVisible) {
                              startPage = 1;
                              endPage = totalPages;
                            } else {
                              if (currentPage <= 3) {
                                startPage = 1;
                                endPage = maxVisible;
                              } else if (currentPage >= totalPages - 2) {
                                startPage = totalPages - maxVisible + 1;
                                endPage = totalPages;
                              } else {
                                startPage = currentPage - 2;
                                endPage = currentPage + 2;
                              }
                            }
                            
                            return (
                              <>
                                {startPage > 1 && (
                                  <>
                                    <button
                                      onClick={() => setCurrentPage(1)}
                                      className="px-3 py-1 text-sm rounded-md bg-brintelli-baseAlt text-text hover:bg-brintelli-border transition-colors"
                                    >
                                      1
                                    </button>
                                    {startPage > 2 && (
                                      <span className="px-2 text-textMuted">...</span>
                                    )}
                                  </>
                                )}
                                {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                  const pageNum = startPage + i;
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentPage(pageNum)}
                                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                        currentPage === pageNum
                                          ? 'bg-brand-500 text-white font-semibold'
                                          : 'bg-brintelli-baseAlt text-text hover:bg-brintelli-border'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}
                                {endPage < totalPages && (
                                  <>
                                    {endPage < totalPages - 1 && (
                                      <span className="px-2 text-textMuted">...</span>
                                    )}
                                    <button
                                      onClick={() => setCurrentPage(totalPages)}
                                      className="px-3 py-1 text-sm rounded-md bg-brintelli-baseAlt text-text hover:bg-brintelli-border transition-colors"
                                    >
                                      {totalPages}
                                    </button>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* Call Notes Modal */}
      {showCallNotesModal && selectedLeadForCallNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCallNotesModal(false)}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Add Call Notes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Call Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={callNoteText}
                  onChange={(e) => setCallNoteText(e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text min-h-[150px]"
                  placeholder="Enter call notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleAddCallNote}
                disabled={!callNoteText.trim()}
              >
                Add Notes
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCallNotesModal(false);
                  setSelectedLeadForCallNotes(null);
                  setCallNoteText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEnrollmentForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Student Details</h3>
            <div className="space-y-4">
              {/* Contact Details */}
              <div>
                <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contact Details
                </h4>
                <div className="bg-brintelli-baseAlt rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-textMuted" />
                    <span className="text-sm text-textMuted">Email:</span>
                    <span className="text-sm text-text">{selectedEnrollmentForDetails.lead?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-textMuted" />
                    <span className="text-sm text-textMuted">Phone:</span>
                    <span className="text-sm text-text">{selectedEnrollmentForDetails.lead?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Other Details */}
              <div>
                <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Other Details
                </h4>
                <div className="bg-brintelli-baseAlt rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm text-textMuted">Company:</span>
                    <span className="text-sm text-text ml-2">{selectedEnrollmentForDetails.lead?.company || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-textMuted">Source:</span>
                    <span className="text-sm text-text ml-2">{selectedEnrollmentForDetails.lead?.source || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-textMuted">Enrollment Status:</span>
                    <span className="text-sm text-text ml-2">{selectedEnrollmentForDetails.status || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-sm text-textMuted">Onboarding Status:</span>
                    <span className="text-sm text-text ml-2">{selectedEnrollmentForDetails.onboardingStatus || 'N/A'}</span>
                  </div>
                  {selectedEnrollmentForDetails.offer && (
                    <>
                      <div>
                        <span className="text-sm text-textMuted">Amount Paid:</span>
                        <span className="text-sm text-text ml-2">
                          ₹{selectedEnrollmentForDetails.offer.offeredPrice?.toLocaleString('en-IN') || selectedEnrollmentForDetails.offer.paymentAmount?.toLocaleString('en-IN') || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-textMuted">Payment Date:</span>
                        <span className="text-sm text-text ml-2">
                          {selectedEnrollmentForDetails.offer.paymentDate
                            ? new Date(selectedEnrollmentForDetails.offer.paymentDate).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Call Notes History */}
              {selectedEnrollmentForDetails.lead?.callNotes && selectedEnrollmentForDetails.lead.callNotes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Call Notes History
                  </h4>
                  <div className="bg-brintelli-baseAlt rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                    {[...selectedEnrollmentForDetails.lead.callNotes]
                      .sort((a, b) => {
                        const dateA = new Date(a.createdAt || a.callDate || 0);
                        const dateB = new Date(b.createdAt || b.callDate || 0);
                        return dateB - dateA;
                      })
                      .map((note, idx) => (
                        <div key={idx} className="border-b border-brintelli-border pb-2 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-textMuted">
                              {note.callDate || (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '')}
                              {note.callTime && ` • ${note.callTime}`}
                            </span>
                          </div>
                          <p className="text-sm text-text">{note.notes}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEnrollmentForDetails(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Allocation Modal */}
      {showBatchModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBatchModal(false)}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Allocate Batch</h3>
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
                  value={batchData.batchId}
                  onChange={(e) => setBatchData({ batchId: e.target.value })}
                >
                  <option value="">Select Batch</option>
                  {(() => {
                    // Get enrollment courseId from multiple possible sources
                    const enrollmentCourseId = selectedEnrollment?.courseId 
                      || selectedEnrollment?.offer?.courseId
                      || null;
                    
                    console.log('=== Batch Filtering Debug ===');
                    console.log('Enrollment courseId:', enrollmentCourseId);
                    console.log('Total batches:', batches.length);
                    
                    // Ensure batches is an array
                    if (!Array.isArray(batches)) {
                      console.error('Batches is not an array!', batches);
                      return (
                        <option value="" disabled>
                          Error: Batches data is invalid
                        </option>
                      );
                    }
                    
                    if (batches.length === 0) {
                      console.warn('No batches in state');
                      return (
                        <option value="" disabled>
                          No batches available. Please create batches first.
                        </option>
                      );
                    }
                    
                    // Filter batches by courseId/programId if available
                    let relevantBatches = batches;
                    if (enrollmentCourseId) {
                      const enrollmentCourseIdStr = String(enrollmentCourseId).trim();
                      
                      // Try to match by courseId or programId (check both fields)
                      relevantBatches = batches.filter(b => {
                        const batchCourseId = String(b.courseId || '').trim();
                        const batchProgramId = String(b.programId || '').trim();
                        const matches = batchCourseId === enrollmentCourseIdStr || batchProgramId === enrollmentCourseIdStr;
                        if (matches) {
                          console.log('✓ Matched batch:', b.name, {
                            courseId: batchCourseId,
                            programId: batchProgramId,
                            enrollmentCourseId: enrollmentCourseIdStr
                          });
                        }
                        return matches;
                      });
                      
                      console.log('Relevant batches (matching courseId/programId):', relevantBatches.length);
                      
                      if (relevantBatches.length === 0) {
                        console.log('No batches match courseId/programId, showing all batches as fallback');
                        relevantBatches = batches; // Show all if no match found
                      }
                    } else {
                      console.log('No courseId found, showing all batches');
                    }
                    
                    // Filter by status - show ACTIVE, UPCOMING, and ONGOING batches
                    const availableBatches = relevantBatches.filter(b => {
                      const isActive = ['UPCOMING', 'ACTIVE', 'ONGOING'].includes(b.status);
                      return isActive;
                    });
                    
                    console.log('Available batches (status filter):', availableBatches.length);
                    console.log('Batch details:', availableBatches.map(b => ({
                      name: b.name,
                      courseId: b.courseId || b.programId,
                      status: b.status,
                      enrolled: b.enrolled,
                      capacity: b.capacity
                    })));
                    console.log('=== End Debug ===');
                    
                    if (availableBatches.length === 0) {
                      return (
                        <option value="" disabled>
                          No available batches found for this program. Please create a batch first.
                        </option>
                      );
                    }
                    
                    // Sort batches: available capacity first, then by name
                    const sortedBatches = [...availableBatches].sort((a, b) => {
                      const aHasCapacity = (a.enrolled || 0) < (a.capacity || 0);
                      const bHasCapacity = (b.enrolled || 0) < (b.capacity || 0);
                      if (aHasCapacity && !bHasCapacity) return -1;
                      if (!aHasCapacity && bHasCapacity) return 1;
                      return (a.name || '').localeCompare(b.name || '');
                    });
                    
                    return sortedBatches.map(batch => {
                      const hasCapacity = (batch.enrolled || 0) < (batch.capacity || 0);
                      const capacityText = hasCapacity 
                        ? `${batch.enrolled || 0}/${batch.capacity || 0}` 
                        : `FULL (${batch.enrolled || 0}/${batch.capacity || 0})`;
                      
                      return (
                        <option key={batch.id || batch._id} value={batch.id || batch._id}>
                          {batch.name || 'Unnamed Batch'} - {capacityText} - {batch.status || 'N/A'}
                        </option>
                      );
                    });
                  })()}
                </select>
                {(() => {
                  const enrollmentCourseId = selectedEnrollment?.courseId || selectedEnrollment?.offer?.courseId;
                  const programName = getProgramName(enrollmentCourseId);
                  
                  if (enrollmentCourseId) {
                    // Filter batches matching the enrollment's courseId/programId
                    const enrollmentCourseIdStr = String(enrollmentCourseId).trim();
                    const relevantBatches = batches.filter(b => {
                      const batchCourseId = String(b.courseId || '').trim();
                      const batchProgramId = String(b.programId || '').trim();
                      return batchCourseId === enrollmentCourseIdStr || batchProgramId === enrollmentCourseIdStr;
                    });
                    
                    // Filter by status
                    const availableBatches = relevantBatches.filter(b => {
                      return ['UPCOMING', 'ACTIVE', 'ONGOING'].includes(b.status);
                    });
                    
                    return (
                      <>
                        <p className="text-xs text-textMuted mt-1">
                          Showing batches for: <strong>{programName}</strong>
                        </p>
                        {availableBatches.length === 0 && relevantBatches.length > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            Found {relevantBatches.length} batch(es) for this program, but none are currently available (all may be COMPLETED or CANCELLED).
                          </p>
                        )}
                        {availableBatches.length === 0 && relevantBatches.length === 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            No batches found for this program. You may need to create a batch first.
                          </p>
                        )}
                        {availableBatches.length > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Found {availableBatches.length} available batch(es) for this program.
                          </p>
                        )}
                      </>
                    );
                  }
                  return (
                    <p className="text-xs text-amber-600 mt-1">
                      No course/program assigned to this student. Please assign a course first.
                    </p>
                  );
                })()}
              </div>

              {/* Course Display (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Course/Program
                </label>
                <div className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text">
                  {(() => {
                    const courseId = selectedEnrollment?.courseId || selectedEnrollment?.offer?.courseId;
                    const programName = getProgramName(courseId);
                    return (
                      <div>
                        <div className="font-semibold">{programName}</div>
                        {courseId && (
                          <div className="text-xs text-textMuted mt-1">ID: {courseId}</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <p className="text-xs text-textMuted mt-1">
                  Course is automatically set based on the student's enrollment
                </p>
              </div>
              </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleSubmitBatch}
                disabled={!batchData.batchId}
              >
                Allocate Batch
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowBatchModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Suggestions Modal */}
      {showMentorModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMentorModal(false)}>
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Suggest Mentors</h3>
            <p className="text-textMuted mb-6">
              Student: <strong>{selectedEnrollment.lead?.name}</strong>
              <br />
              <span className="text-sm">Select up to 4 mentors. The student will choose one.</span>
            </p>

            <div className="space-y-4">
              {/* Mentor Suggestions (3-4 mentors) */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Suggested Mentors (Select up to 4)
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-brintelli-border rounded-lg p-3">
                  {(() => {
                    // Filter mentors by the enrollment's courseId (program) if available
                    const enrollmentCourseId = selectedEnrollment?.courseId;
                    const relevantMentors = enrollmentCourseId
                      ? mentors.filter(m => {
                          // Match by courseId if mentor has courseId
                          const mentorCourseId = m.courseId?.toString() || m.courseId;
                          const enrollmentCourseIdStr = enrollmentCourseId?.toString() || enrollmentCourseId;
                          return !mentorCourseId || mentorCourseId === enrollmentCourseIdStr;
                        })
                      : mentors; // If no courseId, show all mentors
                    
                    const availableMentors = relevantMentors
                      .filter(m => m.availableSlots > 0)
                      .slice(0, 10); // Show more options, but user can only select 4
                    
                    if (availableMentors.length === 0) {
                      return (
                        <p className="text-sm text-textMuted text-center py-2">
                          No available mentors found for this program
                        </p>
                      );
                    }
                    
                    return availableMentors.map(mentor => {
                      const isSelected = mentorData.suggestedMentors.includes(mentor.id);
                      
                      return (
                        <div
                          key={mentor.id}
                          className={`flex items-center gap-3 p-2 rounded border ${
                            isSelected ? 'border-green-500 bg-green-50' : 'border-brintelli-border'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSuggested = e.target.checked
                                ? [...mentorData.suggestedMentors, mentor.id].slice(0, 4)
                                : mentorData.suggestedMentors.filter(id => id !== mentor.id);
                              setMentorData({ suggestedMentors: newSuggested });
                            }}
                            disabled={!isSelected && mentorData.suggestedMentors.length >= 4}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{mentor.name}</span>
                            </div>
                            <p className="text-xs text-textMuted">
                              {mentor.availableSlots} slots available
                              {mentor.email && ` • ${mentor.email}`}
                              {mentor.bio && ` • ${mentor.bio.substring(0, 50)}...`}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <p className="text-xs text-textMuted mt-1">
                  Selected: {mentorData.suggestedMentors.length}/4 mentors
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleSubmitMentorSuggestions}
                disabled={!mentorData.suggestedMentors || mentorData.suggestedMentors.length === 0}
              >
                Suggest Mentors
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowMentorModal(false)}
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

