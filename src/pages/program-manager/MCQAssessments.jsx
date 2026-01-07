import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, HelpCircle, Eye, Filter, Plus, Upload } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';
import { extractCategory, getCategoryColor } from '../../utils/categoryExtractor';
import BulkMCQUploadModal from '../../components/BulkMCQUploadModal';

const MCQAssessments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mcqs, setMcqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(null);

  useEffect(() => {
    fetchAllMCQs();
  }, [questionTypeFilter, categoryFilter]);


  const fetchAllMCQs = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (questionTypeFilter !== 'all') filters.questionType = questionTypeFilter;

      const response = await programAPI.getAllMCQs(filters);
      if (response.success && response.data?.mcqs) {
        setMcqs(response.data.mcqs);
      } else {
        throw new Error('Failed to fetch MCQs');
      }
    } catch (error) {
      console.error('Error fetching all MCQs:', error);
      toast.error('Failed to load MCQ assessments');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMCQs = () => {
    let filtered = [...mcqs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.question?.toLowerCase().includes(term) ||
        item.programName?.toLowerCase().includes(term) ||
        item.moduleName?.toLowerCase().includes(term) ||
        item.objectiveTitle?.toLowerCase().includes(term)
      );
    }

    if (questionTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.questionType === questionTypeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = extractCategory(item.programName || '', item.programDescription || '');
        return itemCategory.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    return filtered;
  };

  const filteredMCQs = getFilteredMCQs();
  const totalPages = Math.ceil(filteredMCQs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMCQs = filteredMCQs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading all MCQ assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="MCQ Assessments"
        description="View and manage all MCQ questions across all programs"
        actions={
          <>
            <Button variant="primary" size="sm" onClick={() => setShowBulkUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchAllMCQs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total MCQs</p>
          <p className="text-xl font-bold text-text">{mcqs.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Single Choice</p>
          <p className="text-xl font-bold text-blue-600">
            {mcqs.filter(m => m.questionType === 'SINGLE_CHOICE').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Multiple Choice</p>
          <p className="text-xl font-bold text-purple-600">
            {mcqs.filter(m => m.questionType === 'MULTIPLE_CHOICE').length}
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
              placeholder="Search MCQ questions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={questionTypeFilter}
            onChange={(e) => {
              setQuestionTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Types</option>
            <option value="SINGLE_CHOICE">Single Choice</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="ONE_WORD">One Word</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Categories</option>
            <option value="python">Python</option>
            <option value="cyber security">Cyber Security</option>
            <option value="ai/ml">AI/ML</option>
            <option value="dsa">DSA</option>
            <option value="web development">Web Development</option>
            <option value="java">Java</option>
            <option value="cloud">Cloud</option>
            <option value="data science">Data Science</option>
            <option value="mobile">Mobile</option>
            <option value="blockchain">Blockchain</option>
          </select>
        </div>
      </div>

      {/* MCQs Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {paginatedMCQs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-textMuted">
              {searchTerm || selectedProgram !== 'all' || questionTypeFilter !== 'all' || categoryFilter !== 'all'
                ? 'No MCQ questions match your filters.' 
                : 'No MCQ questions found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Question</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Type</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Category</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Options</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedMCQs.map((mcq) => {
                    const category = mcq.category || extractCategory(mcq.programName || '', mcq.programDescription || '');
                    return (
                      <tr key={mcq.id || mcq._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                        <td className="px-4 py-3">
                          <div className="max-w-md">
                            <span className="text-[11px] font-medium text-text line-clamp-2">{mcq.question || 'Untitled Question'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-textMuted">{mcq.questionType || 'SINGLE_CHOICE'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(category)}`}>
                            {category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-textMuted">{mcq.options?.length || 0}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const moduleId = mcq.moduleId;
                                const subModuleId = mcq.subModuleId;
                                if (subModuleId) {
                                  navigate(`/program-manager/programs/${mcq.programId}/modules/${moduleId}/submodules/${subModuleId}/objectives/${mcq.objectiveId}/content`);
                                } else if (moduleId) {
                                  navigate(`/program-manager/programs/${mcq.programId}/modules/${moduleId}/objectives/${mcq.objectiveId}/content`);
                                }
                              }}
                              className="px-2 py-1 text-[10px]"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  totalItems={filteredMCQs.length}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Upload Modal */}
      <BulkMCQUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={() => {
          fetchAllMCQs();
          setShowBulkUploadModal(false);
        }}
      />
    </>
  );
};

export default MCQAssessments;

