import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, BookOpen, Layers3, Calendar, FileText, Edit2, Trash2, ChevronRight, ChevronDown, X, Link as LinkIcon, ChevronLeft, CheckCircle2, Circle, Search, RefreshCw, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import programAPI from '../../api/program';
import { apiRequest } from '../../api/apiClient';

const Programs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    fetchPrograms();
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      // Fetch tutors by role
      const response = await apiRequest('/api/users/role/tutor').catch(() => null);
      if (response?.success && response.data?.users) {
        setTutors(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      // If that fails, try alternative endpoint
      try {
        const altResponse = await apiRequest('/api/users?role=tutor').catch(() => null);
        if (altResponse?.success && altResponse.data?.users) {
          setTutors(altResponse.data.users);
        }
      } catch (altError) {
        console.error('Error fetching tutors from alternative endpoint:', altError);
      }
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        // Normalize the data structure - handle both id and _id
        let normalizedPrograms = (response.data.programs || []).map(program => ({
          ...program,
          id: program.id || program._id,
          name: program.name || '',
          code: program.code || '',
          duration: program.duration || 0,
          price: program.price || 0,
          status: program.status || 'DRAFT',
          description: program.description || '',
          modulesCount: 0,
        }));

        // Fetch module counts for each program
        const programsWithModules = await Promise.all(
          normalizedPrograms.map(async (program) => {
            try {
              const modulesRes = await programAPI.getModulesByProgram(program.id).catch(() => null);
              if (modulesRes?.success && modulesRes.data?.modules) {
                return {
                  ...program,
                  modulesCount: modulesRes.data.modules.length,
                };
              }
              return program;
            } catch (error) {
              console.error(`Error fetching modules for program ${program.id}:`, error);
              return program;
            }
          })
        );

        setPrograms(programsWithModules);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramDetails = async (programId) => {
    try {
      const [programRes, modulesRes] = await Promise.all([
        programAPI.getProgramById(programId),
        programAPI.getModulesByProgram(programId),
      ]);

      if (programRes.success) {
        setSelectedProgram(programRes.data.program);
      }
      if (modulesRes.success) {
        setModules(modulesRes.data.modules);
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
      toast.error('Failed to load program details');
    }
  };

  const fetchModuleDetails = async (moduleId) => {
    try {
      const [sessionsRes, assignmentsRes] = await Promise.all([
        programAPI.getSessionsByModule(moduleId),
        programAPI.getAssignmentsByModule(moduleId),
      ]);

      if (sessionsRes.success) {
        setSessions(sessionsRes.data.sessions);
      }
      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data.assignments);
      }
    } catch (error) {
      console.error('Error fetching module details:', error);
    }
  };

  const handleCreateProgram = async () => {
    try {
      const response = await programAPI.createProgram(formData);
      if (response.success) {
        toast.success('Program created successfully');
        setShowProgramModal(false);
        setFormData({});
        fetchPrograms();
      }
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error(error.message || 'Failed to create program');
    }
  };

  const handleCreateModule = async () => {
    if (!selectedProgram) return;
    try {
      const response = await programAPI.createModule(selectedProgram.id, formData);
      if (response.success) {
        toast.success('Module created successfully');
        setShowModuleModal(false);
        setFormData({});
        fetchProgramDetails(selectedProgram.id);
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error(error.message || 'Failed to create module');
    }
  };

  const handleCreateSession = async (moduleId) => {
    try {
      const response = await programAPI.createSession(moduleId, formData);
      if (response.success) {
        toast.success('Session created successfully');
        setShowSessionModal(false);
        setFormData({});
        fetchModuleDetails(moduleId);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create session');
    }
  };

  const handleCreateAssignment = async (moduleId) => {
    try {
      const response = await programAPI.createAssignment(moduleId, formData);
      if (response.success) {
        toast.success('Assignment created successfully');
        setShowAssignmentModal(false);
        setFormData({});
        fetchModuleDetails(moduleId);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.message || 'Failed to create assignment');
    }
  };

  const toggleModule = async (moduleId) => {
    if (!expandedModules[moduleId]) {
      await fetchModuleDetails(moduleId);
    }
    setExpandedModules({
      ...expandedModules,
      [moduleId]: !expandedModules[moduleId],
    });
  };

  // Get unique values for filters
  // Filter programs by search term
  const filteredPrograms = programs.filter(program => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      program.name?.toLowerCase().includes(search) ||
      program.code?.toLowerCase().includes(search) ||
      program.description?.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Archived' },
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };


  return (
    <>
      <PageHeader
        title="Program Management"
        description="Create and manage programs, modules, sessions, and assignments"
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              navigate('/program-manager/programs/create');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Program with Modules
          </Button>
        }
      />

      {/* Programs Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        <div className="border-b border-brintelli-border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">All Programs</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-brand" />
              <span className="ml-3 text-textMuted">Loading programs...</span>
            </div>
          ) : (
            <table className="w-full divide-y divide-brintelli-border">
              <thead className="bg-brintelli-baseAlt/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Program Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Duration</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Modules</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Assigned To</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brintelli-border/30">
                {paginatedPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-textMuted">
                          {searchTerm ? "No programs match your search." : "No programs found."}
                        </p>
                        {!searchTerm && (
                          <Button
                            variant="ghost"
                            className="mt-4"
                            onClick={() => navigate('/program-manager/programs/create')}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Program
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPrograms.map((program) => {
                    const programId = program.id || program._id;
                    return (
                      <tr 
                        key={programId} 
                        className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-semibold text-text">{program.name || '—'}</div>
                            {program.description && (
                              <div className="text-xs text-textMuted mt-0.5 line-clamp-1 max-w-xs">
                                {program.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm text-textMuted">{program.code || '—'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text">
                            {program.duration ? `${program.duration} months` : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-text">
                            ₹{program.price ? program.price.toLocaleString('en-IN') : '0'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(program.status || 'DRAFT')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Layers3 className="h-4 w-4 text-textMuted" />
                            <span className="text-sm text-text">
                              {program.modulesCount || 0} modules
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text">
                            {program.createdByEmail || program.createdBy || program.assignedTo || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (programId) {
                                  navigate(`/program-manager/modules/${programId}`);
                                }
                              }}
                              className="gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (programId) {
                                  navigate(`/program-manager/programs/create/${programId}`);
                                }
                              }}
                              className="gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && filteredPrograms.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPrograms.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Program Details */}
      {selectedProgram && (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-text">{selectedProgram.name}</h3>
              <p className="text-textMuted">{selectedProgram.code}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({ order: modules.length });
                setShowModuleModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Modules List */}
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="border border-brintelli-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="text-text hover:text-brand-500"
                    >
                      {expandedModules[module.id] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                    <div>
                      <h4 className="font-semibold text-text">{module.name}</h4>
                      <p className="text-sm text-textMuted">Order: {module.order}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({ moduleId: module.id });
                        setShowSessionModal(true);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Add Session
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData({ moduleId: module.id, type: 'CODING' });
                        setShowAssignmentModal(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Add Assignment
                    </Button>
                  </div>
                </div>

                {/* Expanded Module Details */}
                {expandedModules[module.id] && (
                  <div className="mt-4 pl-8 space-y-4">
                    {/* Sessions */}
                    <div>
                      <h5 className="font-medium text-text mb-2">Sessions ({sessions.filter(s => s.moduleId === module.id).length})</h5>
                      <div className="space-y-2">
                        {sessions
                          .filter(s => s.moduleId === module.id)
                          .map((session) => (
                            <div key={session.id} className="bg-brintelli-card border border-brintelli-border rounded p-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span>{session.name}</span>
                                <span className="text-textMuted">{session.type}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Assignments */}
                    <div>
                      <h5 className="font-medium text-text mb-2">Assignments ({assignments.filter(a => a.moduleId === module.id).length})</h5>
                      <div className="space-y-2">
                        {assignments
                          .filter(a => a.moduleId === module.id)
                          .map((assignment) => (
                            <div key={assignment.id} className="bg-brintelli-card border border-brintelli-border rounded p-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span>{assignment.name}</span>
                                <span className="text-textMuted">{assignment.type}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Program with Modules Wizard */}
      {/* Create Program Wizard removed - now navigates to CreateProgram page */}

      {/* Create Program Modal (Legacy - kept for backward compatibility) */}
      {showProgramModal && (
        <Modal
          title="Create Program"
          onClose={() => setShowProgramModal(false)}
          onSubmit={handleCreateProgram}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'name', label: 'Program Name', type: 'text', required: true },
            { name: 'code', label: 'Code', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'duration', label: 'Duration (months)', type: 'number' },
            { name: 'price', label: 'Price', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
          ]}
        />
      )}

      {/* Create Module Modal */}
      {showModuleModal && (
        <ModuleModal
          title="Create Module"
          onClose={() => {
            setShowModuleModal(false);
            setFormData({});
          }}
          onSubmit={handleCreateModule}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* Create Session Modal */}
      {showSessionModal && (
        <SessionModal
          title="Create Session"
          onClose={() => {
            setShowSessionModal(false);
            setFormData({});
          }}
          onSubmit={() => handleCreateSession(formData.moduleId)}
          formData={formData}
          setFormData={setFormData}
          tutors={tutors}
        />
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <Modal
          title="Create Assignment"
          onClose={() => setShowAssignmentModal(false)}
          onSubmit={() => handleCreateAssignment(formData.moduleId)}
          formData={formData}
          setFormData={setFormData}
          fields={[
            { name: 'name', label: 'Assignment Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'type', label: 'Type', type: 'select', options: ['CODING', 'MCQ', 'PROJECT', 'ESSAY'] },
            { name: 'dueDate', label: 'Due Date', type: 'datetime-local' },
            { name: 'maxMarks', label: 'Max Marks', type: 'number' },
            { name: 'passingMarks', label: 'Passing Marks', type: 'number' },
          ]}
        />
      )}
    </>
  );
};

// Modal Component
const Modal = ({ title, onClose, onSubmit, formData, setFormData, fields }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brintelli-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-text mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" onClick={onSubmit}>
            Create
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Module Modal with all fields
const ModuleModal = ({ title, onClose, onSubmit, formData, setFormData }) => {
  const [objectives, setObjectives] = useState(formData.objectives || []);
  const [resources, setResources] = useState(formData.resources || []);
  const [newObjective, setNewObjective] = useState('');
  const [newResource, setNewResource] = useState({ type: '', url: '', title: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      const updated = [...objectives, newObjective.trim()];
      setObjectives(updated);
      setFormData({ ...formData, objectives: updated });
      setNewObjective('');
    }
  };

  const removeObjective = (index) => {
    const updated = objectives.filter((_, i) => i !== index);
    setObjectives(updated);
    setFormData({ ...formData, objectives: updated });
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      const updated = [...resources, { ...newResource }];
      setResources(updated);
      setFormData({ ...formData, resources: updated });
      setNewResource({ type: '', url: '', title: '' });
    }
  };

  const removeResource = (index) => {
    const updated = resources.filter((_, i) => i !== index);
    setResources(updated);
    setFormData({ ...formData, resources: updated });
  };

  const handleSubmit = () => {
    setFormData({ ...formData, objectives, resources });
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brintelli-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          {/* Basic Fields */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order || 0}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Duration (hours)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Status</label>
            <select
              name="status"
              value={formData.status || 'DRAFT'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Learning Objectives</label>
            <div className="space-y-2">
              {objectives.map((obj, index) => (
                <div key={index} className="flex items-center gap-2 bg-brintelli-baseAlt p-2 rounded">
                  <span className="flex-1 text-sm text-text">{obj}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                  placeholder="Add learning objective..."
                  className="flex-1 px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                />
                <Button type="button" variant="ghost" size="sm" onClick={addObjective}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Resources</label>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <div key={index} className="flex items-center gap-2 bg-brintelli-baseAlt p-2 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text">{resource.title}</div>
                    <div className="text-xs text-textMuted">{resource.type} - {resource.url}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="border border-brintelli-border rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Resource Title"
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  >
                    <option value="">Select Type</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="LINK">Link</option>
                    <option value="SLIDES">Slides</option>
                    <option value="CODE">Code</option>
                  </select>
                  <input
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="Resource URL"
                    className="px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={addResource} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="primary" onClick={handleSubmit}>
            Create Module
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Session Modal with all fields
const SessionModal = ({ title, onClose, onSubmit, formData, setFormData, tutors = [] }) => {
  const [materials, setMaterials] = useState(formData.materials || []);
  const [newMaterial, setNewMaterial] = useState({ type: '', url: '', title: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addMaterial = () => {
    if (newMaterial.title && newMaterial.url) {
      const updated = [...materials, { ...newMaterial }];
      setMaterials(updated);
      setFormData({ ...formData, materials: updated });
      setNewMaterial({ type: '', url: '', title: '' });
    }
  };

  const removeMaterial = (index) => {
    const updated = materials.filter((_, i) => i !== index);
    setMaterials(updated);
    setFormData({ ...formData, materials: updated });
  };

  const handleSubmit = () => {
    setFormData({ ...formData, materials });
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-brintelli-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
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
              onChange={handleChange}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration || 60}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Assign Tutor</label>
            <select
              name="tutorId"
              value={formData.tutorId || ''}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
          <Button variant="primary" onClick={handleSubmit}>
            Create Session
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Multi-step wizard for creating Program with Modules

export default Programs;

