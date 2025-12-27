import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, FileText, Code, BookOpen, Edit3, CheckSquare, Link, File, Database, ListChecks, Upload, Loader2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import programAPI from '../../api/program';
import uploadAPI from '../../api/upload';

const Assignments = () => {
  const { programId, moduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'PROJECT',
    status: 'DRAFT',
    maxMarks: 100,
    passingMarks: 50,
  });
  const [testCases, setTestCases] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [resources, setResources] = useState([]);
  const [scoringRubric, setScoringRubric] = useState([]);
  const [newTestCase, setNewTestCase] = useState({ input: '', expectedOutput: '', marks: 0, description: '' });
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 0 });
  const [newResource, setNewResource] = useState({ type: 'URL', title: '', url: '', description: '', fileUrl: '', file: null });
  const [newRubricItem, setNewRubricItem] = useState({ criterion: '', description: '', marks: 0, required: false });
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track upload progress per resource

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
      fetchAssignments();
    }
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      const response = await programAPI.getModulesByProgram(programId);
      if (response.success) {
        const foundModule = response.data.modules?.find(m => (m.id || m._id) === moduleId);
        if (foundModule) {
          setModule(foundModule);
        }
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getAssignmentsByModule(moduleId);
      if (response.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const assignmentData = {
        ...formData,
      };

      // Add type-specific data
      if (formData.type === 'CODING_CHALLENGE') {
        assignmentData.testCases = testCases;
      } else if (formData.type === 'MCQ') {
        assignmentData.questions = questions;
      } else if (formData.type === 'ESSAY') {
        // essayPrompt is already in formData
      } else if (formData.type === 'PROJECT') {
        // projectGuidelines is already in formData
      }

      // Add resources and scoring rubric
      assignmentData.resources = resources;
      assignmentData.scoringRubric = scoringRubric;

      const response = await programAPI.createAssignment(moduleId, assignmentData);
      if (response.success) {
        toast.success('Assignment created successfully');
        setShowAssignmentModal(false);
        resetForm();
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.message || 'Failed to create assignment');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'PROJECT',
      status: 'DRAFT',
      maxMarks: 100,
      passingMarks: 50,
      name: '',
      description: '',
      instructions: '',
      problemStatement: '',
      essayPrompt: '',
      projectGuidelines: '',
      dueDate: '',
    });
    setTestCases([]);
    setQuestions([]);
    setResources([]);
    setScoringRubric([]);
    setNewTestCase({ input: '', expectedOutput: '', marks: 0, description: '' });
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 0 });
    setNewResource({ type: 'URL', title: '', url: '', description: '', fileUrl: '', file: null });
    setNewRubricItem({ criterion: '', description: '', marks: 0, required: false });
    setUploadingFiles({});
  };

  const addTestCase = () => {
    if (newTestCase.input && newTestCase.expectedOutput) {
      setTestCases([...testCases, { ...newTestCase }]);
      setNewTestCase({ input: '', expectedOutput: '', marks: 0, description: '' });
    }
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    if (newQuestion.question && newQuestion.options.filter(opt => opt.trim()).length >= 2) {
      setQuestions([...questions, { ...newQuestion }]);
      setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 0 });
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionOption = (index, optionIndex, value) => {
    const updated = [...questions];
    updated[index].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewResource({ ...newResource, file, fileUrl: file.name });
    }
  };

  const handleUploadFile = async (resourceIndex = null) => {
    const resource = resourceIndex !== null ? resources[resourceIndex] : newResource;
    const file = resource.file;

    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const uploadKey = resourceIndex !== null ? `existing-${resourceIndex}` : 'new';
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const folder = 'assignment-resources';
      const response = await uploadAPI.uploadFile(file, folder);

        if (response.success) {
          const uploadedResource = {
            ...resource,
            type: resource.type,
            title: resource.title,
            description: resource.description,
            url: response.data.url,
            fileUrl: response.data.url,
            fileKey: response.data.key,
            fileName: response.data.originalName || file.name,
            fileSize: response.data.size || file.size,
            mimeType: response.data.mimeType || file.type,
            file: null, // Clear file object
          };

          if (resourceIndex !== null) {
            // Update existing resource
            const updated = [...resources];
            updated[resourceIndex] = uploadedResource;
            setResources(updated);
            toast.success('File uploaded successfully');
          } else {
            // Update newResource with uploaded file info (don't add to resources yet)
            setNewResource(uploadedResource);
            toast.success('File uploaded successfully. Click "Add Resource" to add it.');
          }
        }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => {
        const updated = { ...prev };
        delete updated[uploadKey];
        return updated;
      });
    }
  };

  const handleDeleteUploadedFile = async (resourceIndex) => {
    const resource = resources[resourceIndex];
    if (resource.fileKey) {
      try {
        await uploadAPI.deleteFile(resource.fileKey);
        const updated = [...resources];
        updated[resourceIndex] = {
          ...updated[resourceIndex],
          url: '',
          fileUrl: '',
          fileKey: '',
          fileName: '',
          fileSize: '',
          mimeType: '',
        };
        setResources(updated);
        toast.success('File deleted successfully');
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      }
    }
  };

  const addResource = () => {
    if (!newResource.title) {
      toast.error('Please enter a resource title');
      return;
    }

    if (newResource.type === 'URL') {
      if (!newResource.url) {
        toast.error('Please enter a URL');
        return;
      }
      setResources([...resources, { ...newResource, fileUrl: newResource.url }]);
      setNewResource({ type: 'URL', title: '', url: '', description: '', fileUrl: '', file: null });
    } else if (newResource.type === 'DOCUMENT' || newResource.type === 'DATA') {
      if (!newResource.file) {
        toast.error('Please select a file first');
        return;
      }
      if (!newResource.fileUrl || !newResource.fileKey) {
        toast.error('Please upload the file to S3 first');
        return;
      }
      // File already uploaded, just add to resources
      setResources([...resources, { ...newResource }]);
      setNewResource({ type: 'URL', title: '', url: '', description: '', fileUrl: '', file: null });
    }
  };

  const removeResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const addRubricItem = () => {
    if (newRubricItem.criterion && newRubricItem.marks > 0) {
      setScoringRubric([...scoringRubric, { ...newRubricItem }]);
      setNewRubricItem({ criterion: '', description: '', marks: 0, required: false });
    }
  };

  const removeRubricItem = (index) => {
    setScoringRubric(scoringRubric.filter((_, i) => i !== index));
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'DOCUMENT':
        return <File className="h-4 w-4" />;
      case 'URL':
        return <Link className="h-4 w-4" />;
      case 'DATA':
        return <Database className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = assignments.slice(startIndex, endIndex);

  const getAssignmentTypeIcon = (type) => {
    switch (type) {
      case 'PROJECT':
        return <FileText className="h-4 w-4" />;
      case 'CODING_CHALLENGE':
        return <Code className="h-4 w-4" />;
      case 'MCQ':
        return <CheckSquare className="h-4 w-4" />;
      case 'ESSAY':
        return <Edit3 className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const assignmentColumns = [
    { key: 'name', title: 'Assignment Name' },
    {
      key: 'type',
      title: 'Type',
      render: (value) => (
        <div className="flex items-center gap-2">
          {getAssignmentTypeIcon(value)}
          <span>{value?.replace('_', ' ') || value}</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No due date',
    },
    { key: 'maxMarks', title: 'Max Marks' },
    { key: 'status', title: 'Status' },
  ];

  return (
    <>
      <PageHeader
        title={module ? `Assignments - ${module.name}` : 'Assignments'}
        description="Manage assignments for this module"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/program-manager/modules/${programId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setShowAssignmentModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        }
      />

      {/* Assignments Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <h3 className="text-lg font-semibold text-text mb-4">All Assignments</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textMuted">No assignments found. Create your first assignment!</p>
          </div>
        ) : (
          <>
            <Table columns={assignmentColumns} data={paginatedAssignments} minRows={10} />
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                <div className="text-sm text-textMuted">
                  Showing {startIndex + 1} to {Math.min(endIndex, assignments.length)} of {assignments.length} assignments
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

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create Assignment</h3>
            <div className="space-y-4">
              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Assignment Name <span className="text-red-500">*</span>
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
                  placeholder="Brief description of the assignment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Detailed Problem Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement || ''}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  rows={6}
                  placeholder="Enter the detailed problem statement, requirements, and what students need to accomplish..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Assignment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type || 'PROJECT'}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      setTestCases([]);
                      setQuestions([]);
                    }}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  >
                    <option value="PROJECT">Project</option>
                    <option value="CODING_CHALLENGE">Coding Challenge</option>
                    <option value="MCQ">MCQ</option>
                    <option value="ESSAY">Essay & Brief Answers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'DRAFT'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions || ''}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Max Marks</label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks || 100}
                    onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Passing Marks</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks || 50}
                    onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) || 50 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {formData.type === 'PROJECT' && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Project Guidelines <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="projectGuidelines"
                    value={formData.projectGuidelines || ''}
                    onChange={(e) => setFormData({ ...formData, projectGuidelines: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                    rows={5}
                    placeholder="Enter project requirements, deliverables, and guidelines..."
                  />
                </div>
              )}

              {formData.type === 'CODING_CHALLENGE' && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Test Cases</label>
                  <div className="space-y-3">
                    {testCases.map((testCase, index) => (
                      <div key={index} className="border border-brintelli-border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text">Test Case {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeTestCase(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Description</label>
                          <input
                            type="text"
                            value={testCase.description || ''}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[index].description = e.target.value;
                              setTestCases(updated);
                            }}
                            placeholder="Test case description"
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-textMuted mb-1">Input</label>
                            <textarea
                              value={testCase.input || ''}
                              onChange={(e) => {
                                const updated = [...testCases];
                                updated[index].input = e.target.value;
                                setTestCases(updated);
                              }}
                              placeholder="Input"
                              className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-textMuted mb-1">Expected Output</label>
                            <textarea
                              value={testCase.expectedOutput || ''}
                              onChange={(e) => {
                                const updated = [...testCases];
                                updated[index].expectedOutput = e.target.value;
                                setTestCases(updated);
                              }}
                              placeholder="Expected Output"
                              className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Marks</label>
                          <input
                            type="number"
                            value={testCase.marks || 0}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[index].marks = parseFloat(e.target.value) || 0;
                              setTestCases(updated);
                            }}
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="border border-brintelli-border rounded-lg p-3 space-y-2">
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Description</label>
                        <input
                          type="text"
                          value={newTestCase.description}
                          onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                          placeholder="Test case description"
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Input</label>
                          <textarea
                            value={newTestCase.input}
                            onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                            placeholder="Input"
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Expected Output</label>
                          <textarea
                            value={newTestCase.expectedOutput}
                            onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                            placeholder="Expected Output"
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Marks</label>
                        <input
                          type="number"
                          value={newTestCase.marks}
                          onChange={(e) => setNewTestCase({ ...newTestCase, marks: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={addTestCase} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test Case
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'MCQ' && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">MCQ Questions</label>
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={index} className="border border-brintelli-border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text">Question {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Question</label>
                          <input
                            type="text"
                            value={question.question || ''}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[index].question = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="Enter question"
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Options</label>
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 mb-1">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correctAnswer === optIndex}
                                onChange={() => {
                                  const updated = [...questions];
                                  updated[index].correctAnswer = optIndex;
                                  setQuestions(updated);
                                }}
                                className="mr-1"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateQuestionOption(index, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1 px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Marks</label>
                          <input
                            type="number"
                            value={question.marks || 0}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[index].marks = parseFloat(e.target.value) || 0;
                              setQuestions(updated);
                            }}
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="border border-brintelli-border rounded-lg p-3 space-y-2">
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Question</label>
                        <input
                          type="text"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          placeholder="Enter question"
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Options</label>
                        {newQuestion.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 mb-1">
                            <input
                              type="radio"
                              name="new-correct"
                              checked={newQuestion.correctAnswer === optIndex}
                              onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: optIndex })}
                              className="mr-1"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updated = [...newQuestion.options];
                                updated[optIndex] = e.target.value;
                                setNewQuestion({ ...newQuestion, options: updated });
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                              className="flex-1 px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Marks</label>
                        <input
                          type="number"
                          value={newQuestion.marks}
                          onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={addQuestion} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'ESSAY' && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Essay Prompt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="essayPrompt"
                    value={formData.essayPrompt || ''}
                    onChange={(e) => setFormData({ ...formData, essayPrompt: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                    rows={5}
                    placeholder="Enter the essay question or prompt..."
                  />
                </div>
              )}

              {/* Supporting Resources Section */}
              <div className="border-t border-brintelli-border pt-4">
                <h4 className="text-md font-semibold text-text mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Supporting Resources (Documents, URLs, Data)
                </h4>
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <div key={index} className="border border-brintelli-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.type)}
                          <span className="font-medium text-text">{resource.title}</span>
                          <span className="text-xs text-textMuted">({resource.type})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(resource.type === 'DOCUMENT' || resource.type === 'DATA') && !resource.fileKey && (
                            <button
                              type="button"
                              onClick={() => handleUploadFile(index)}
                              disabled={uploadingFiles[`existing-${index}`] || !resource.file}
                              className="text-brand-500 hover:text-brand-700 disabled:opacity-50"
                              title="Upload file to S3"
                            >
                              {uploadingFiles[`existing-${index}`] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {(resource.type === 'DOCUMENT' || resource.type === 'DATA') && resource.fileKey && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUploadedFile(index)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete file from S3"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeResource(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-textMuted">{resource.description}</p>
                      )}
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          {resource.url}
                        </a>
                      )}
                      {resource.fileUrl && resource.fileKey && (
                        <div className="flex items-center gap-2">
                          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-500 hover:underline flex items-center gap-1">
                            <File className="h-3 w-3" />
                            {resource.fileName || resource.fileUrl}
                          </a>
                          {resource.fileSize && (
                            <span className="text-xs text-textMuted">({(resource.fileSize / 1024).toFixed(2)} KB)</span>
                          )}
                        </div>
                      )}
                      {(resource.type === 'DOCUMENT' || resource.type === 'DATA') && !resource.fileKey && (
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Select File</label>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const updated = [...resources];
                                updated[index] = { ...updated[index], file, fileUrl: file.name };
                                setResources(updated);
                              }
                            }}
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border border-brintelli-border rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Resource Type</label>
                        <select
                          value={newResource.type}
                          onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        >
                          <option value="URL">URL/Link</option>
                          <option value="DOCUMENT">Document/File</option>
                          <option value="DATA">Data File</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={newResource.title}
                          onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                          placeholder="Resource title"
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                    </div>
                    {newResource.type === 'URL' ? (
                      <div>
                        <label className="block text-xs text-textMuted mb-1">URL <span className="text-red-500">*</span></label>
                        <input
                          type="url"
                          value={newResource.url}
                          onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                          placeholder="https://example.com"
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-textMuted mb-1">Upload File to S3 <span className="text-red-500">*</span></label>
                          <input
                            type="file"
                            onChange={handleFileSelect}
                            className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                            accept={newResource.type === 'DOCUMENT' ? '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx' : '.csv,.json,.xml,.xlsx'}
                          />
                          {newResource.file && (
                            <p className="text-xs text-textMuted mt-1">
                              Selected: {newResource.file.name} ({(newResource.file.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>
                        {newResource.file && (
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUploadFile()}
                              disabled={uploadingFiles.new}
                              className="flex-1"
                            >
                              {uploadingFiles.new ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload to S3
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setNewResource({ ...newResource, file: null, fileUrl: '' })}
                              className="text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <p className="text-xs text-textMuted italic">
                          Files will be uploaded to S3 bucket: assignment-resources/
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-textMuted mb-1">Description (Optional)</label>
                      <textarea
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        placeholder="Brief description of this resource"
                        className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        rows={2}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={addResource} 
                      className="w-full"
                      disabled={
                        (newResource.type === 'DOCUMENT' || newResource.type === 'DATA') 
                        ? (!newResource.fileKey || uploadingFiles.new)
                        : false
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {(newResource.type === 'DOCUMENT' || newResource.type === 'DATA') && !newResource.fileKey
                        ? 'Upload File First'
                        : 'Add Resource'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scoring Rubric / Validation Checklist Section */}
              <div className="border-t border-brintelli-border pt-4">
                <h4 className="text-md font-semibold text-text mb-3 flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Scoring Rubric / Validation Checklist
                </h4>
                <p className="text-sm text-textMuted mb-3">
                  Define validation criteria and marks allocation. Students will be evaluated based on these checkpoints.
                </p>
                <div className="space-y-3">
                  {scoringRubric.map((item, index) => (
                    <div key={index} className="border border-brintelli-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-brand-500" />
                          <span className="font-medium text-text">{item.criterion}</span>
                          {item.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                          )}
                          <span className="text-sm text-brand-500 font-semibold">{item.marks} marks</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRubricItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {item.description && (
                        <p className="text-sm text-textMuted">{item.description}</p>
                      )}
                    </div>
                  ))}
                  <div className="border border-brintelli-border rounded-lg p-3 space-y-2">
                    <div>
                      <label className="block text-xs text-textMuted mb-1">Criterion/Checkpoint <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={newRubricItem.criterion}
                        onChange={(e) => setNewRubricItem({ ...newRubricItem, criterion: e.target.value })}
                        placeholder="e.g., Implemented feature X, Code follows best practices, Documentation provided"
                        className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-textMuted mb-1">Description (Optional)</label>
                      <textarea
                        value={newRubricItem.description}
                        onChange={(e) => setNewRubricItem({ ...newRubricItem, description: e.target.value })}
                        placeholder="Detailed description of what needs to be checked"
                        className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-textMuted mb-1">Marks <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={newRubricItem.marks}
                          onChange={(e) => setNewRubricItem({ ...newRubricItem, marks: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.5"
                          className="w-full px-3 py-1 border border-brintelli-border rounded bg-brintelli-card text-text text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newRubricItem.required}
                            onChange={(e) => setNewRubricItem({ ...newRubricItem, required: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-xs text-textMuted">Required (must be completed)</span>
                        </label>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={addRubricItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Checklist Item
                    </Button>
                    {scoringRubric.length > 0 && (
                      <div className="text-sm text-textMuted pt-2 border-t border-brintelli-border">
                        Total Marks from Rubric: <span className="font-semibold text-text">
                          {scoringRubric.reduce((sum, item) => sum + (item.marks || 0), 0)} / {formData.maxMarks}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowAssignmentModal(false);
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

export default Assignments;

