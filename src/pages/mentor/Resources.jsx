import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, Link, FileText, Video, Image, Search, Plus, ExternalLink, AlertCircle, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const Resources = () => {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resourceData, setResourceData] = useState({
    title: '',
    url: '',
    description: '',
    type: 'LINK',
    tags: [],
  });

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, typeFilter, resources]);

  const loadResources = () => {
    const saved = localStorage.getItem('mentorResourceLibrary');
    if (saved) {
      try {
        const savedResources = JSON.parse(saved);
        setResources(savedResources);
      } catch (e) {
        console.error('Error loading resources:', e);
      }
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filter by type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    setFilteredResources(filtered);
  };

  const handleAddResource = () => {
    if (!resourceData.title || !resourceData.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const resource = {
      id: Date.now().toString(),
      ...resourceData,
      createdAt: new Date().toISOString(),
    };

    const newResources = [resource, ...resources];
    setResources(newResources);
    localStorage.setItem('mentorResourceLibrary', JSON.stringify(newResources));
    toast.success('Resource added successfully');
    setShowAddModal(false);
    setResourceData({
      title: '',
      url: '',
      description: '',
      type: 'LINK',
      tags: [],
    });
  };

  const handleDeleteResource = (resourceId) => {
    const newResources = resources.filter(r => r.id !== resourceId);
    setResources(newResources);
    localStorage.setItem('mentorResourceLibrary', JSON.stringify(newResources));
    toast.success('Resource deleted successfully');
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'LINK':
        return Link;
      case 'VIDEO':
        return Video;
      case 'IMAGE':
        return Image;
      case 'DOCUMENT':
        return FileText;
      default:
        return BookOpen;
    }
  };

  return (
    <>
      <PageHeader
        title="Resource Library"
        description="Access and manage your resource library"
      />

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Total Resources</p>
              <p className="text-3xl font-bold text-brand-600">{resources.length}</p>
            </div>
            <BookOpen className="h-12 w-12 text-brand-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-textMuted mb-1">Filtered Results</p>
              <p className="text-3xl font-bold text-accent-600">{filteredResources.length}</p>
            </div>
            <Search className="h-12 w-12 text-accent-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters and Add */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-textMuted" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Types</option>
            <option value="LINK">Links</option>
            <option value="VIDEO">Videos</option>
            <option value="IMAGE">Images</option>
            <option value="DOCUMENT">Documents</option>
          </select>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      {/* Resources List */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm || typeFilter !== 'ALL' 
                ? 'No resources found matching your filters' 
                : 'No resources in library yet'}
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Resource
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => {
              const Icon = getResourceIcon(resource.type);
              return (
                <div
                  key={resource.id}
                  className="flex flex-col gap-3 rounded-xl border border-brintelli-border bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="h-5 w-5 text-brand-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text truncate">{resource.title}</p>
                        <p className="text-xs text-textMuted">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {resource.description && (
                    <p className="text-sm text-textMuted line-clamp-2">{resource.description}</p>
                  )}

                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Resource
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setResourceData({
            title: '',
            url: '',
            description: '',
            type: 'LINK',
            tags: [],
          });
        }}
        title="Add Resource"
        size="md"
      >
        <div className="space-y-4">
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
              <option value="DOCUMENT">Document</option>
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
              Description
            </label>
            <textarea
              value={resourceData.description}
              onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              placeholder="Resource description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={resourceData.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                setResourceData({ ...resourceData, tags });
              }}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleAddResource}
              disabled={!resourceData.title || !resourceData.url}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddModal(false);
                setResourceData({
                  title: '',
                  url: '',
                  description: '',
                  type: 'LINK',
                  tags: [],
                });
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

export default Resources;
