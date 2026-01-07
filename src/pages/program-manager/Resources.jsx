import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, BookOpen, Eye, FileIcon, Video, Link2, FileText, Filter, Download, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';
import { getProxyUrl } from '../../utils/s3Helper';

const Resources = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [forWhomFilter, setForWhomFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    fetchAllResources();
  }, [contentTypeFilter, forWhomFilter]);


  const fetchAllResources = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (contentTypeFilter !== 'all') filters.type = contentTypeFilter;
      if (forWhomFilter !== 'all') filters.forWhom = forWhomFilter;

      const response = await programAPI.getAllResources(filters);
      if (response.success && response.data?.resources) {
        setResources(response.data.resources);
      } else {
        throw new Error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching all resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResources = () => {
    let filtered = [...resources];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.fileName?.toLowerCase().includes(term) ||
        item.url?.toLowerCase().includes(term) ||
        item.fileUrl?.toLowerCase().includes(term) ||
        item.fileKey?.toLowerCase().includes(term)
      );
    }


    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === contentTypeFilter);
    }

    if (forWhomFilter !== 'all') {
      filtered = filtered.filter(item => item.forWhom === forWhomFilter);
    }

    return filtered;
  };

  const filteredResources = getFilteredResources();
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading all resources...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Resources"
        description="View and manage all resources across all programs"
        actions={
          <Button variant="ghost" size="sm" onClick={fetchAllResources}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Resources</p>
          <p className="text-xl font-bold text-text">{resources.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Documents</p>
          <p className="text-xl font-bold text-blue-600">
            {resources.filter(r => r.type === 'DOCUMENT').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Videos</p>
          <p className="text-xl font-bold text-red-600">
            {resources.filter(r => r.type === 'VIDEO').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Notes</p>
          <p className="text-xl font-bold text-purple-600">
            {resources.filter(r => r.type === 'NOTE').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={contentTypeFilter}
            onChange={(e) => {
              setContentTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Types</option>
            <option value="DOCUMENT">Document</option>
            <option value="VIDEO">Video</option>
            <option value="LINK">Link</option>
            <option value="NOTE">Note</option>
          </select>
          <select
            value={forWhomFilter}
            onChange={(e) => {
              setForWhomFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Users</option>
            <option value="LEARNER">Learner</option>
            <option value="TUTOR">Tutor</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {paginatedResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-textMuted">
              {searchTerm || contentTypeFilter !== 'all'
                ? 'No resources match your filters.' 
                : 'No resources found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Title</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Type</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">For</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">File/URL</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedResources.map((resource) => (
                    <tr key={resource.id || resource._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {resource.type === 'DOCUMENT' && <FileIcon className="h-3 w-3 text-blue-600" />}
                          {resource.type === 'VIDEO' && <Video className="h-3 w-3 text-red-600" />}
                          {resource.type === 'LINK' && <Link2 className="h-3 w-3 text-green-600" />}
                          {resource.type === 'NOTE' && <FileText className="h-3 w-3 text-purple-600" />}
                          <span className="text-[11px] font-medium text-text">{resource.title || 'Untitled'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{resource.type || 'DOCUMENT'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{resource.forWhom || 'LEARNER'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {resource.fileName || resource.fileKey ? (
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-3 w-3 text-blue-600 flex-shrink-0" />
                              <span className="text-[10px] text-textMuted">{resource.fileName || 'File'}</span>
                              {resource.fileSize && (
                                <span className="text-[9px] text-textMuted">
                                  ({(resource.fileSize / 1024).toFixed(2)} KB)
                                </span>
                              )}
                              {(resource.url || resource.fileKey || resource.fileUrl) && (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={resource.fileKey 
                                      ? getProxyUrl(null, resource.fileKey)
                                      : (resource.fileUrl || resource.url || getProxyUrl(resource.url))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700"
                                    title="View/Download file"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </a>
                                  <a
                                    href={resource.fileKey 
                                      ? getProxyUrl(null, resource.fileKey)
                                      : (resource.fileUrl || resource.url || getProxyUrl(resource.url))}
                                    download
                                    className="text-green-600 hover:text-green-700"
                                    title="Download file"
                                  >
                                    <Download className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : resource.url ? (
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {resource.url.length > 40 ? `${resource.url.substring(0, 40)}...` : resource.url}
                            </a>
                          ) : resource.content ? (
                            <span className="text-[10px] text-textMuted">Note Content</span>
                          ) : (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {resource.objectiveId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const moduleId = resource.moduleId;
                                const subModuleId = resource.subModuleId;
                                if (subModuleId) {
                                  navigate(`/program-manager/programs/${resource.programId}/modules/${moduleId}/submodules/${subModuleId}/objectives/${resource.objectiveId}/content`);
                                } else if (moduleId) {
                                  navigate(`/program-manager/programs/${resource.programId}/modules/${moduleId}/objectives/${resource.objectiveId}/content`);
                                }
                              }}
                              className="px-2 py-1 text-[10px]"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="border-t border-brintelli-border p-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={filteredResources.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Resources;

