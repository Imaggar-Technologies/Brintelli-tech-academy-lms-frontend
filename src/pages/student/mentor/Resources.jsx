import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BookOpen, Link, FileText, Video, Image, Search, ExternalLink, AlertCircle } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import { studentAPI } from '../../../api/student';
import { apiRequest } from '../../../api/apiClient';

const Resources = () => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, typeFilter, resources]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollment to get current mentor
      const enrollmentResponse = await studentAPI.getMyEnrollment();
      if (enrollmentResponse?.success && enrollmentResponse.data?.enrollment) {
        const enrollmentData = enrollmentResponse.data.enrollment;
        setEnrollment(enrollmentData);
        
        // Set current mentor if assigned
        if (enrollmentData.mentorId && enrollmentData.suggestedMentors) {
          const mentor = enrollmentData.suggestedMentors.find(
            m => m.id === enrollmentData.mentorId
          );
          if (mentor) {
            setCurrentMentor(mentor);
          }
        }
      }

      // Load shared resources from localStorage (in production, this would be from API)
      const saved = localStorage.getItem('mentorSharedResources');
      if (saved) {
        try {
          const sharedResources = JSON.parse(saved);
          // Filter resources for this student's mentor
          if (currentMentor) {
            const mentorId = currentMentor.id;
            const mentorResources = Object.values(sharedResources)
              .flat()
              .filter(r => r.menteeId === enrollment?.leadId || r.menteeId === enrollment?.id);
            setResources(mentorResources);
          } else {
            // If no mentor, show all resources (or empty)
            setResources([]);
          }
        } catch (e) {
          console.error('Error loading resources:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    setFilteredResources(filtered);
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
        title="Mentor Resources"
        description="Resources shared by your mentor"
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading resources...</p>
        </div>
      ) : !currentMentor ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted">No mentor assigned yet</p>
          <p className="text-sm text-textMuted mt-2">
            Please select a mentor first to view shared resources
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mentor Info */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                {currentMentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">{currentMentor.name}</h3>
                <p className="text-sm text-textMuted">{currentMentor.email}</p>
              </div>
            </div>
          </div>

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

          {/* Filters */}
          <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
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
                    : 'No resources shared yet'}
                </p>
                <p className="text-sm text-textMuted mt-2">
                  Your mentor will share resources here when available
                </p>
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
                              {new Date(resource.sharedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {resource.description && (
                        <p className="text-sm text-textMuted line-clamp-2">{resource.description}</p>
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
        </div>
      )}
    </>
  );
};

export default Resources;

