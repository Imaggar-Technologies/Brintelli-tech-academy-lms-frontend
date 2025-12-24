import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, Clock3, FileText, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import ProgressBar from "../../components/ProgressBar";
import Button from "../../components/Button";
import studentAPI from '../../api/student';

const StudentAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const [filter, setFilter] = useState('upcoming'); // 'all', 'upcoming', 'overdue', 'completed'

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMyAssignments();
      if (response.success) {
        setAssignments(response.data.assignments || []);
      } else {
        toast.error(response.message || 'Failed to load assignments');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error(error.message || 'Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on selected filter
  const getFilteredAssignments = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return assignments.filter(a => {
          if (!a.dueDate) return false;
          return new Date(a.dueDate) > now;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'overdue':
        return assignments.filter(a => {
          if (!a.dueDate) return false;
          return new Date(a.dueDate) < now && (a.status !== 'SUBMITTED' && a.status !== 'COMPLETED');
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      case 'completed':
        return assignments.filter(a => 
          a.status === 'SUBMITTED' || a.status === 'COMPLETED'
        ).sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
          return dateB - dateA;
        });
      default:
        return assignments.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
          return dateA - dateB;
        });
    }
  };

  const filteredAssignments = getFilteredAssignments();

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader
          title="Assignments & Deliverables"
          description="Plan your week, submit on time, and request reviews for faster feedback."
        />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading assignments...</p>
        </div>
      </>
    );
  }

  if (assignments.length === 0) {
    return (
      <>
        <PageHeader
          title="Assignments & Deliverables"
          description="Plan your week, submit on time, and request reviews for faster feedback."
          actions={
            <Button variant="secondary" onClick={fetchAssignments}>Refresh</Button>
          }
        />
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-2">No assignments found.</p>
          <p className="text-sm text-textMuted">Assignments will appear here once you're enrolled in a program.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Assignments & Deliverables"
        description="Plan your week, submit on time, and request reviews for faster feedback."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchAssignments}>Refresh</Button>
            <Button variant="secondary">View Submission Guidelines</Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'upcoming'
                ? 'bg-brand-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            Upcoming ({assignments.filter(a => a.dueDate && new Date(a.dueDate) > new Date()).length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'overdue'
                ? 'bg-red-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            Overdue ({assignments.filter(a => {
              if (!a.dueDate) return false;
              return new Date(a.dueDate) < new Date() && (a.status !== 'SUBMITTED' && a.status !== 'COMPLETED');
            }).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            Completed ({assignments.filter(a => a.status === 'SUBMITTED' || a.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-brintelli-baseAlt text-textSoft hover:bg-brintelli-baseAlt/80'
            }`}
          >
            All ({assignments.length})
          </button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {filteredAssignments.map((assignment) => {
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
          const isOverdue = dueDate && dueDate < new Date() && (assignment.status !== 'SUBMITTED' && assignment.status !== 'COMPLETED');
          const daysUntilDue = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
          const isUrgent = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;
          return (
            <div
              key={assignment.id}
              className={`flex flex-col gap-4 rounded-2xl border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft ${
                isOverdue
                  ? 'border-red-300 bg-red-50/50'
                  : isUrgent
                  ? 'border-orange-300 bg-orange-50/30'
                  : 'border-brintelli-border bg-brintelli-card'
              }`}
            >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-soft/20 p-3 text-brand">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">{assignment.name}</h3>
                <p className="text-sm text-textSoft">{assignment.moduleName || 'Module Assignment'}</p>
                <p className="text-xs text-textMuted mt-1">Type: {assignment.type}</p>
              </div>
            </div>
            {assignment.description && (
              <p className="text-sm text-textSoft line-clamp-2">{assignment.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-textMuted">
              {assignment.dueDate && (
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                  isOverdue
                    ? 'border-red-300 bg-red-100 text-red-800'
                    : isUrgent
                    ? 'border-orange-300 bg-orange-100 text-orange-800'
                    : 'border-brintelli-border bg-brintelli-baseAlt text-textSoft'
                }`}>
                  <Clock3 className={`h-4 w-4 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-brand'}`} />
                  Due {formatDueDate(assignment.dueDate)}
                  {daysUntilDue !== null && !isOverdue && (
                    <span className="ml-1">({daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} left)</span>
                  )}
                  {isOverdue && <span className="ml-1 font-bold">OVERDUE</span>}
                </span>
              )}
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${getStatusColor(assignment.status || 'PENDING')}`}>
                <ClipboardCheck className="h-4 w-4" />
                {assignment.status || 'PENDING'}
              </span>
              {assignment.maxMarks && (
                <span className="inline-flex items-center gap-2 rounded-full border border-brintelli-border bg-brintelli-baseAlt px-3 py-1 text-textSoft">
                  Max: {assignment.maxMarks} marks
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                className={`flex-1 justify-center gap-2 ${isOverdue ? 'bg-red-500 hover:bg-red-600' : ''}`}
              >
                {isOverdue ? 'Submit Now' : 'Submit Work'}
              </Button>
              <Button variant="secondary" className="flex-1 justify-center">
                Request Review
              </Button>
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
};

export default StudentAssignments;

