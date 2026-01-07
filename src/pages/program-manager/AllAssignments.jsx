import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, RefreshCw, FileSpreadsheet, Eye, Filter, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';
import { extractCategory, getCategoryColor } from '../../utils/categoryExtractor';

const AllAssignments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAllAssignments();
  }, [typeFilter, difficultyFilter, categoryFilter]);

  const fetchAllAssignments = async () => {
    try {
      setLoading(true);
      
      const filters = {};
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (difficultyFilter !== 'all') filters.difficulty = difficultyFilter;

      const response = await programAPI.getAllAssignments(filters);
      if (response.success && response.data?.assignments) {
        // Add category to each assignment
        const assignmentsWithCategory = response.data.assignments.map(assignment => ({
          ...assignment,
          category: extractCategory(assignment.programName || '', assignment.programDescription || ''),
        }));
        setAssignments(assignmentsWithCategory);
      } else {
        throw new Error('Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching all assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    let filtered = [...assignments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.title?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.programName?.toLowerCase().includes(term) ||
        item.moduleName?.toLowerCase().includes(term) ||
        item.objectiveTitle?.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(item => item.difficulty === difficultyFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = extractCategory(item.programName || '', item.programDescription || '');
        return itemCategory.toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    return filtered;
  };

  const filteredAssignments = getFilteredAssignments();
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'HARD':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-textMuted">Loading all assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Assignments"
        description="View and manage all assignments across all programs"
        actions={
          <>
            <Button variant="primary" size="sm" onClick={() => {
              toast.info('Please navigate to a specific objective\'s content page to create assignments');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchAllAssignments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Total Assignments</p>
          <p className="text-xl font-bold text-text">{assignments.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Projects</p>
          <p className="text-xl font-bold text-blue-600">
            {assignments.filter(a => a.type === 'PROJECT').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Tasks</p>
          <p className="text-xl font-bold text-purple-600">
            {assignments.filter(a => a.type === 'TASK').length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-[10px] font-medium text-textMuted mb-1">Exercises</p>
          <p className="text-xl font-bold text-green-600">
            {assignments.filter(a => a.type === 'EXERCISE').length}
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
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Types</option>
            <option value="PROJECT">Project</option>
            <option value="TASK">Task</option>
            <option value="EXERCISE">Exercise</option>
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-brintelli-border rounded-lg bg-brintelli-card text-text focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
          >
            <option value="all">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
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

      {/* Assignments Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {paginatedAssignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-textMuted">
              {searchTerm || typeFilter !== 'all' || difficultyFilter !== 'all' || categoryFilter !== 'all'
                ? 'No assignments match your filters.' 
                : 'No assignments found.'}
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
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Difficulty</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Category</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Max Marks</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedAssignments.map((assignment) => {
                    const category = assignment.category || extractCategory(assignment.programName || '', assignment.programDescription || '');
                    return (
                      <tr key={assignment.id || assignment._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] font-medium text-text">{assignment.name || assignment.title || 'Untitled'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-textMuted">{assignment.type || 'PROJECT'}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {assignment.difficulty ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                              {assignment.difficulty}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(category)}`}>
                            {category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[11px] text-textMuted">{assignment.maxMarks || 0}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const moduleId = assignment.moduleId;
                                const subModuleId = assignment.subModuleId;
                                if (subModuleId) {
                                  navigate(`/program-manager/programs/${assignment.programId}/modules/${moduleId}/submodules/${subModuleId}/objectives/${assignment.objectiveId}/content`);
                                } else if (moduleId) {
                                  navigate(`/program-manager/programs/${assignment.programId}/modules/${moduleId}/objectives/${assignment.objectiveId}/content`);
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
                  totalItems={filteredAssignments.length}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default AllAssignments;

