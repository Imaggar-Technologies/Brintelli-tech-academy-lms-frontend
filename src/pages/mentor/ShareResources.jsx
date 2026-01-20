import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Link, FileText, Video, Image, User, Plus, ExternalLink, AlertCircle, X } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import mentorAPI from '../../api/mentor';

const ShareResources = () => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [resourceData, setResourceData] = useState({
    title: '',
    url: '',
    description: '',
    type: 'LINK',
  });
  const [sharedResources, setSharedResources] = useState({}); // menteeId -> resources array

  useEffect(() => {
    fetchMentees();
  }, []);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      const response = await mentorAPI.getMentees();
      
      if (response.success) {
        const menteesData = (response.data.mentees || []).map(mentee => ({
          ...mentee,
          id: mentee.id || mentee.enrollmentId,
          enrollmentId: mentee.enrollmentId || mentee.id,
        }));
        console.log('Loaded mentees:', menteesData.length, menteesData);
        setMentees(menteesData);
        
        // Load shared resources from localStorage (or could be from backend)
        const saved = localStorage.getItem('mentorSharedResources');
        if (saved) {
          try {
            setSharedResources(JSON.parse(saved));
          } catch (e) {
            console.error('Error loading shared resources:', e);
          }
        }
      } else {
        console.error('Failed to load mentees:', response);
        toast.error(response.message || 'Failed to load mentees');
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

  const handleShareResource = () => {
    if (!selectedMentee || !resourceData.title || !resourceData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const resource = {
      id: Date.now().toString(),
      ...resourceData,
      sharedAt: new Date().toISOString(),
    };

    const menteeId = selectedMentee.id || selectedMentee.enrollmentId;
    const newResources = {
      ...sharedResources,
      [menteeId]: [...(sharedResources[menteeId] || []), resource],
    };

    setSharedResources(newResources);
    localStorage.setItem('mentorSharedResources', JSON.stringify(newResources));
    toast.success('Resource shared successfully');
    setShowShareModal(false);
    setSelectedMentee(null);
    setResourceData({ title: '', url: '', description: '', type: 'LINK' });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'LINK':
        return Link;
      case 'VIDEO':
        return Video;
      case 'IMAGE':
        return Image;
      default:
        return FileText;
    }
  };

  return (
    <>
      <PageHeader
        title="Share Resources"
        description="Share resources and materials with your mentees"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Mentees</p>
              <p className="text-3xl font-bold text-brand-600">{mentees.length}</p>
            </div>
            <User className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Resources Shared</p>
              <p className="text-3xl font-bold text-accent-600">
                {Object.values(sharedResources).reduce((sum, resources) => sum + resources.length, 0)}
              </p>
            </div>
            <Sparkles className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Share Resource Button */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Share New Resource</h3>
            <p className="text-sm text-textMuted mt-1">Share a resource with one or more mentees</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowShareModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Resource
          </Button>
        </div>
      </div>

      {/* Mentees with Shared Resources */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Shared Resources by Mentee</h3>
            <p className="text-sm text-textMuted mt-1">
              {mentees.length} mentee{mentees.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchMentees}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading mentees...</p>
          </div>
        ) : mentees.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted font-medium mb-2">No mentees assigned yet</p>
            <p className="text-sm text-textMuted">
              Students need to select you as their mentor and get LSM approval before they appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {mentees.map((mentee) => {
              const menteeId = mentee.id || mentee.enrollmentId;
              const resources = sharedResources[menteeId] || [];
              return (
                <div
                  key={menteeId}
                  className="rounded-xl border border-brintelli-border bg-white/70 p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-5 w-5 text-brand-600" />
                    <div>
                      <p className="font-semibold text-text">{mentee.studentName}</p>
                      <p className="text-xs text-textMuted">{mentee.studentEmail}</p>
                    </div>
                    <span className="ml-auto text-xs text-textMuted">
                      {resources.length} resource{resources.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {resources.length === 0 ? (
                    <p className="text-sm text-textMuted text-center py-4">
                      No resources shared yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {resources.map((resource) => {
                        const Icon = getResourceIcon(resource.type);
                        return (
                          <div
                            key={resource.id}
                            className="flex items-center gap-3 p-3 bg-brintelli-baseAlt rounded-lg"
                          >
                            <Icon className="h-4 w-4 text-brand-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-text truncate">{resource.title}</p>
                              {resource.description && (
                                <p className="text-xs text-textMuted truncate">{resource.description}</p>
                              )}
                              <p className="text-xs text-textMuted mt-1">
                                Shared: {new Date(resource.sharedAt).toLocaleDateString()}
                              </p>
                            </div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0"
                              >
                                <ExternalLink className="h-4 w-4 text-brand-600 hover:text-brand-700" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Resource Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedMentee(null);
          setResourceData({ title: '', url: '', description: '', type: 'LINK' });
        }}
        title="Share Resource"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Mentee <span className="text-red-500">*</span>
            </label>
            {mentees.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  No mentees assigned yet. Students need to select you as their mentor and get LSM approval.
                </p>
              </div>
            ) : (
              <select
                value={selectedMentee?.id || selectedMentee?.enrollmentId || ''}
                onChange={(e) => {
                  const mentee = mentees.find(m => {
                    const menteeId = m.id || m.enrollmentId;
                    const value = e.target.value;
                    return String(menteeId) === String(value);
                  });
                  setSelectedMentee(mentee || null);
                }}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select a mentee...</option>
                {mentees.map((mentee) => {
                  const menteeId = mentee.id || mentee.enrollmentId;
                  const statusBadge = mentee.mentorSelectionStatus === 'PENDING_APPROVAL' 
                    ? ' (Pending Approval)' 
                    : mentee.mentorSelectionStatus === 'APPROVED'
                    ? ' (Approved)'
                    : '';
                  return (
                    <option key={menteeId} value={menteeId}>
                      {mentee.studentName} ({mentee.studentEmail}){statusBadge}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Resource Type <span className="text-red-500">*</span>
            </label>
            <select
              value={resourceData.type}
              onChange={(e) => setResourceData({ ...resourceData, type: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="LINK">Link</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGE">Image</option>
              <option value="FILE">File</option>
              <option value="NOTE">Note</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resourceData.title}
              onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Resource title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              URL/Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={resourceData.url}
              onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Description (Optional)
            </label>
            <textarea
              value={resourceData.description}
              onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              placeholder="Add a description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleShareResource}
              disabled={!selectedMentee || !resourceData.title || !resourceData.url}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Share Resource
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowShareModal(false);
                setSelectedMentee(null);
                setResourceData({ title: '', url: '', description: '', type: 'LINK' });
              }}
            >
              Cancel
            </Button>
      </div>
    </div>
      </Modal>
    </>
  );
};

export default ShareResources;

