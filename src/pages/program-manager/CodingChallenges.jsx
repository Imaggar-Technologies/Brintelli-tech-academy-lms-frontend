import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, Code, Eye, Filter, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';
import { extractCategory, getCategoryColor } from '../../utils/categoryExtractor';

const CodingChallenges = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [practiceCodes, setPracticeCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAllPracticeCodes();
  }, [difficultyFilter, languageFilter, categoryFilter]);

  const fetchAllPracticeCodes = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (difficultyFilter !== 'all') filters.difficulty = difficultyFilter;
      if (languageFilter !== 'all') filters.language = languageFilter;

      const response = await programAPI.getAllPracticeCodes(filters);
      if (response.success && response.data?.practiceCodes) {
        // Add category to each practice code
        const practiceCodesWithCategory = response.data.practiceCodes.map(pc => ({
          ...pc,
          category: extractCategory(pc.programName || '', pc.programDescription || ''),
        }));
        setPracticeCodes(practiceCodesWithCategory);
      } else {
        throw new Error('Failed to fetch practice codes');
      }
    } catch (error) {
      console.error('Error fetching all practice codes:', error);
      toast.error('Failed to load coding challenges');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPracticeCodes = () => {
    let filtered = [...practiceCodes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.problem?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.programName?.toLowerCase().includes(term) ||
        item.moduleName?.toLowerCase().includes(term) ||
        item.objectiveTitle?.toLowerCase().includes(term)
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(item => item.difficulty === difficultyFilter);
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter(item => item.language === languageFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = extractCategory(item.programName || '', item.programDescription || '');
        return itemCategory.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    return filtered;
  };

  const filteredPracticeCodes = getFilteredPracticeCodes();
  const totalPages = Math.ceil(filteredPracticeCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPracticeCodes = filteredPracticeCodes.slice(startIndex, endIndex);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-700';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-700';
      case 'ADVANCED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const uniqueLanguages = [...new Set(practiceCodes.map(pc => pc.language).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading all coding challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Coding Challenges"
        description="View and manage all coding challenges (practice codes) across all programs"
        actions={
          <>
            <Button variant="primary" size="sm" onClick={() => {
              toast.info('Please navigate to a specific objective\'s content page to create coding challenges');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchAllPracticeCodes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Challenges</p>
          <p className="text-xl font-bold text-text">{practiceCodes.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Beginner</p>
          <p className="text-xl font-bold text-green-600">
            {practiceCodes.filter(pc => pc.difficulty === 'BEGINNER').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Intermediate</p>
          <p className="text-xl font-bold text-yellow-600">
            {practiceCodes.filter(pc => pc.difficulty === 'INTERMEDIATE').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Advanced</p>
          <p className="text-xl font-bold text-red-600">
            {practiceCodes.filter(pc => pc.difficulty === 'ADVANCED').length}
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
              placeholder="Search coding challenges..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            value={languageFilter}
            onChange={(e) => {
              setLanguageFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Languages</option>
            {uniqueLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
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

      {/* Practice Codes Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {paginatedPracticeCodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-textMuted">
              {searchTerm || difficultyFilter !== 'all' || languageFilter !== 'all' || categoryFilter !== 'all'
                ? 'No coding challenges match your filters.' 
                : 'No coding challenges found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Problem</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Difficulty</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Language</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Category</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Test Cases</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedPracticeCodes.map((practiceCode) => {
                    const category = practiceCode.category || extractCategory(practiceCode.programName || '', practiceCode.programDescription || '');
                    return (
                      <tr key={practiceCode.id || practiceCode._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-text">{practiceCode.problem || 'Untitled'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(practiceCode.difficulty)}`}>
                            {practiceCode.difficulty || 'BEGINNER'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-textMuted">{practiceCode.language || '—'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(category)}`}>
                            {category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-textMuted">{practiceCode.testCases?.length || 0}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const moduleId = practiceCode.moduleId;
                                const subModuleId = practiceCode.subModuleId;
                                if (subModuleId) {
                                  navigate(`/program-manager/programs/${practiceCode.programId}/modules/${moduleId}/submodules/${subModuleId}/objectives/${practiceCode.objectiveId}/content`);
                                } else if (moduleId) {
                                  navigate(`/program-manager/programs/${practiceCode.programId}/modules/${moduleId}/objectives/${practiceCode.objectiveId}/content`);
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
                  totalItems={filteredPracticeCodes.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CodingChallenges;

