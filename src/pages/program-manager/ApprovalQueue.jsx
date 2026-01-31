import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertCircle, Clock, BookOpen, User, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import sessionAPI from '../../api/session';
import lsmAPI from '../../api/lsm';

const ApprovalQueue = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingSessions();
  }, []);

  const fetchPendingSessions = async () => {
    try {
      setLoading(true);
      // Fetch all batches, then get sessions for each batch
      const batchesResponse = await lsmAPI.getAllBatches();
      if (batchesResponse.success && batchesResponse.data) {
        const allSessions = [];
        for (const batch of batchesResponse.data) {
          try {
            const sessionsResponse = await lsmAPI.getBatchSessions(batch.id);
            if (sessionsResponse.success && sessionsResponse.data) {
              allSessions.push(...sessionsResponse.data);
            }
          } catch (err) {
            console.error(`Error fetching sessions for batch ${batch.id}:`, err);
          }
        }
        const pendingSessions = allSessions.filter(
          s => s.preparationStatus === 'PENDING_APPROVAL' || s.preparationStatus === 'APPROVED'
        );
        setSessions(pendingSessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sessionId) => {
    try {
      await sessionAPI.approvePreparation(sessionId);
      toast.success('Preparation approved');
      fetchPendingSessions();
    } catch (error) {
      toast.error(error.message || 'Failed to approve preparation');
    }
  };

  const handleReject = async () => {
    if (!selectedSession || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await sessionAPI.rejectPreparation(selectedSession.id, rejectionReason);
      toast.success('Preparation rejected');
      setShowRejectModal(false);
      setSelectedSession(null);
      setRejectionReason('');
      fetchPendingSessions();
    } catch (error) {
      toast.error(error.message || 'Failed to reject preparation');
    }
  };

  const handleEnable = async (sessionId) => {
    try {
      await sessionAPI.enableSession(sessionId);
      toast.success('Session enabled');
      fetchPendingSessions();
    } catch (error) {
      toast.error(error.message || 'Failed to enable session');
    }
  };

  const handleTerminate = async (sessionId, reason) => {
    if (!reason || !reason.trim()) {
      toast.error('Please provide a termination reason');
      return;
    }

    try {
      await sessionAPI.terminateSession(sessionId, reason);
      toast.success('Session terminated');
      fetchPendingSessions();
    } catch (error) {
      toast.error(error.message || 'Failed to terminate session');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING_APPROVAL: { label: 'Pending Approval', color: 'bg-orange-100 text-orange-700' },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    };
    const config = configs[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Session Approval Queue" description="Review and approve tutor preparations" />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Session Approval Queue"
        description="Review and approve tutor session preparations"
      />

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-text mb-2">No sessions pending approval</p>
            <p className="text-sm text-textMuted">All session preparations have been reviewed.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text">{session.name || 'Unnamed Session'}</h3>
                    {getStatusBadge(session.preparationStatus)}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-textMuted">
                    {session.scheduledDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(session.scheduledDate).toLocaleString()}
                      </div>
                    )}
                    {session.tutorId && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Tutor ID: {session.tutorId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {session.preparationData && (
                <div className="mb-4 space-y-3">
                  {session.preparationData.lessonPlan && (
                    <div>
                      <p className="text-sm font-medium text-text mb-1">Lesson Plan:</p>
                      <p className="text-sm text-textMuted bg-gray-50 p-3 rounded-lg">
                        {session.preparationData.lessonPlan}
                      </p>
                    </div>
                  )}
                  {session.preparationData.objectives && session.preparationData.objectives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-text mb-1">Learning Objectives:</p>
                      <ul className="text-sm text-textMuted bg-gray-50 p-3 rounded-lg list-disc list-inside">
                        {session.preparationData.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {session.preparationData.notes && (
                    <div>
                      <p className="text-sm font-medium text-text mb-1">Notes:</p>
                      <p className="text-sm text-textMuted bg-gray-50 p-3 rounded-lg">
                        {session.preparationData.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {session.preparationStatus === 'PENDING_APPROVAL' && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowRejectModal(true);
                      }}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(session.id)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
                {session.preparationStatus === 'APPROVED' && !session.enabled && (
                  <Button
                    onClick={() => handleEnable(session.id)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Enable Session
                  </Button>
                )}
                {session.preparationStatus === 'APPROVED' && session.enabled && (
                  <span className="text-sm text-green-600 font-medium">Session Enabled</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Reject Preparation</h3>
            <p className="text-sm text-textMuted mb-4">
              Please provide a reason for rejecting this preparation:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedSession(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApprovalQueue;

