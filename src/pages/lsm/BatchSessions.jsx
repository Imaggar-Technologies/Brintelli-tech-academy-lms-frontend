import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, Calendar, Video, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import { apiRequest } from '../../api/apiClient';

const LsmBatchSessions = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'LIVE',
    status: 'SCHEDULED',
    duration: 60,
  });
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ type: '', url: '', title: '' });

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails();
      fetchSessions();
      fetchTutors();
    }
  }, [batchId]);

  const fetchBatchDetails = async () => {
    try {
      const response = await apiRequest(`/api/lsm/batches`).catch(() => null);
      if (response?.success) {
        const foundBatch = response.data.batches?.find(b => (b.id || b._id) === batchId);
        if (foundBatch) {
          setBatch(foundBatch);
        }
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/lsm/batches/${batchId}/sessions`);
      if (response.success) {
        setSessions(response.data.sessions || []);
      } else {
        toast.error(response.message || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await apiRequest('/api/users/role/tutor').catch(() => null);
      if (response?.success && response.data?.users) {
        setTutors(response.data.users);
      } else {
        const altResponse = await apiRequest('/api/users?role=tutor').catch(() => null);
        if (altResponse?.success && altResponse.data?.users) {
          setTutors(altResponse.data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const sessionData = {
        ...formData,
        materials,
      };
      const response = await apiRequest(`/api/lsm/batches/${batchId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      if (response.success) {
        toast.success('Session created successfully');
        setShowSessionModal(false);
        resetForm();
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create session');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'LIVE',
      status: 'SCHEDULED',
      scheduledDate: '',
      duration: 60,
      tutorId: '',
      meetingLink: '',
      recordingUrl: '',
    });
    setMaterials([]);
    setNewMaterial({ type: '', url: '', title: '' });
  };

  const addMaterial = () => {
    if (newMaterial.title && newMaterial.url) {
      setMaterials([...materials, { ...newMaterial }]);
      setNewMaterial({ type: '', url: '', title: '' });
    }
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'ONGOING':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LIVE':
        return <Video className="h-4 w-4" />;
      case 'RECORDED':
        return <FileText className="h-4 w-4" />;
      case 'HYBRID':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = sessions.slice(startIndex, endIndex);

  const sessionColumns = [
    { key: 'name', title: 'Session Name' },
    {
      key: 'type',
      title: 'Type',
      render: (row) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(row?.type)}
          <span>{row?.type || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      title: 'Scheduled Date',
      render: (row) => formatDate(row?.scheduledDate),
    },
    {
      key: 'duration',
      title: 'Duration (min)',
      render: (row) => `${row?.duration || 0} min`,
    },
    {
      key: 'tutorId',
      title: 'Tutor',
      render: (row) => {
        if (!row?.tutorId) return 'Not assigned';
        const tutor = tutors.find(t => (t.id || t._id) === row.tutorId);
        return tutor ? (tutor.fullName || tutor.email) : 'Unknown';
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(row?.status)}`}>
          {row?.status || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={batch ? `Sessions - ${batch.name}` : 'Sessions'}
        description="Manage sessions for this batch"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/lsm/batches')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setShowSessionModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </div>
        }
      />

      {/* Sessions Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">All Sessions</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No sessions found. Create your first session!</p>
          </div>
        ) : (
          <>
            <Table columns={sessionColumns} data={paginatedSessions} minRows={10} />
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, sessions.length)} of {sessions.length} sessions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm text-text">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create Session</h3>
            <div className="space-y-4">
              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Session Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type || 'LIVE'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  >
                    <option value="LIVE">Live</option>
                    <option value="RECORDED">Recorded</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'SCHEDULED'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || 60}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Assign Tutor</label>
                <select
                  name="tutorId"
                  value={formData.tutorId || ''}
                  onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                >
                  <option value="">Select Tutor (Optional)</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id || tutor._id} value={tutor.id || tutor._id}>
                      {tutor.fullName || tutor.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Meeting Link</label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink || ''}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Recording URL</label>
                <input
                  type="url"
                  name="recordingUrl"
                  value={formData.recordingUrl || ''}
                  onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                />
              </div>

              {/* Session Materials */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Session Materials</label>
                <div className="space-y-2">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2 bg-brintelli-baseAlt p-2 rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text">{material.title}</div>
                        <div className="text-xs text-textMuted">{material.type} - {material.url}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="border border-brintelli-border rounded-lg p-3 space-y-2">
                    <input
                      type="text"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      placeholder="Material Title"
                      className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newMaterial.type}
                        onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                        className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                      >
                        <option value="">Select Type</option>
                        <option value="SLIDES">Slides</option>
                        <option value="DOCUMENT">Document</option>
                        <option value="VIDEO">Video</option>
                        <option value="CODE">Code</option>
                        <option value="LINK">Link</option>
                      </select>
                      <input
                        type="url"
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                        placeholder="Material URL"
                        className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={addMaterial} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleCreateSession}>
                Create Session
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowSessionModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LsmBatchSessions;

