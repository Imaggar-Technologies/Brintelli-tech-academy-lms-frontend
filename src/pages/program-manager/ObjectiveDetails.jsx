import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, Plus, X, FileText, BookOpen, Target, Users, User, FileCheck, Upload, Loader2, Edit2, ExternalLink, Link2, Video, File, Database, Image as ImageIcon, Code, GitBranch, Folder, HelpCircle, Calendar } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import programAPI from '../../api/program';
import uploadAPI from '../../api/upload';
import { getProxyUrl } from '../../utils/s3Helper';
import { apiRequest } from '../../api/apiClient';
import lsmAPI from '../../api/lsm';

const ObjectiveDetails = () => {
  const navigate = useNavigate();
  const { programId, moduleId, objectiveIndex } = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [objectiveId, setObjectiveId] = useState(null); // Store the actual objective ID for updates
  const [objective, setObjective] = useState({
    title: '',
    description: '',
    text: '', // Keep for backward compatibility
    minDuration: 0,
    resources: [],
    assignments: [],
    practiceTasks: [],
    practiceCodes: [],
    mcqQuestions: [],
  });
  const [activeTab, setActiveTab] = useState('details'); // 'details' only now
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track upload progress per resource
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showUnifiedContentModal, setShowUnifiedContentModal] = useState(false);
  const [unifiedContentType, setUnifiedContentType] = useState(null); // 'resource', 'assignment', 'caseStudy', 'mcq', 'practiceCode'
  const [showPracticeCodeModal, setShowPracticeCodeModal] = useState(false);
  const [editingPracticeCodeIndex, setEditingPracticeCodeIndex] = useState(null);
  const [practiceCodeFormData, setPracticeCodeFormData] = useState({
    problem: '',
    description: '',
    testCases: [],
    instructions: '',
    difficulty: 'BEGINNER',
    language: '',
    starterCode: '',
    solution: '',
  });
  const [editingResourceIndex, setEditingResourceIndex] = useState(null);
  const [resourceFormData, setResourceFormData] = useState({
    type: 'DOCUMENT',
    forWhom: 'LEARNER',
    title: '',
    url: '',
    content: '',
    file: null,
  });
  const [viewingResource, setViewingResource] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showAssignmentResourceModal, setShowAssignmentResourceModal] = useState(false);
  const [editingAssignmentIndex, setEditingAssignmentIndex] = useState(null);
  const [editingAssignmentResourceIndex, setEditingAssignmentResourceIndex] = useState(null);
  const [assignmentResourceFormData, setAssignmentResourceFormData] = useState({
    type: 'DATASET',
    name: '',
    url: '',
    file: null,
  });

  // Session creation state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    name: '',
    description: '',
    type: 'LIVE',
    status: 'SCHEDULED',
    scheduledDate: '',
    duration: 60,
    tutorId: '',
    batchId: '',
    moduleId: '',
    objectiveId: '',
  });
  const [availableBatches, setAvailableBatches] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [availableObjectives, setAvailableObjectives] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  // Auto-save functionality
  useEffect(() => {
    if (module && objective.text && objectiveIndex !== 'new') {
      const autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 2000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [objective, module, objectiveIndex]);

  const loadModule = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getModulesByProgram(programId);
      console.log('Load module response:', response);
      if (response.success && response.data.modules) {
        const foundModule = response.data.modules.find(m => 
          (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
        );
        if (foundModule) {
          console.log('Found module:', {
            id: foundModule.id,
            name: foundModule.name,
            objectivesCount: foundModule.objectives ? foundModule.objectives.length : 0,
            objectives: foundModule.objectives
          });
          setModule(foundModule);
          // Determine if we're editing an existing objective
          const isNew = !objectiveIndex || objectiveIndex === 'new' || objectiveIndex === 'undefined';
          if (!isNew && foundModule.objectives && foundModule.objectives.length > 0) {
            // Try to find objective by index first
            const index = parseInt(objectiveIndex);
            let loadedObjective = foundModule.objectives[index];
            
            // If not found by index, try to find by ID (in case objectives were reordered)
            if (!loadedObjective && objectiveIndex) {
              loadedObjective = foundModule.objectives.find(obj => 
                (obj.id || obj._id) === objectiveIndex || 
                String(obj.id || obj._id) === String(objectiveIndex)
              );
            }
            
            if (loadedObjective) {
              console.log('Loading objective:', loadedObjective);
              // Store the objective ID for updates
              setObjectiveId(loadedObjective.id || loadedObjective._id);
              // Ensure all fields are initialized
              setObjective({
                title: loadedObjective.title || loadedObjective.text || '',
                description: loadedObjective.description || '',
                text: loadedObjective.text || loadedObjective.title || '',
                minDuration: loadedObjective.minDuration || 0,
                resources: loadedObjective.resources || [],
                assignments: loadedObjective.assignments || [],
                practiceTasks: loadedObjective.practiceTasks || [],
                practiceCodes: loadedObjective.practiceCodes || [],
                mcqQuestions: loadedObjective.mcqQuestions || [],
              });
            } else {
              console.warn('Objective not found at index:', objectiveIndex, 'Available objectives:', foundModule.objectives.length);
            }
          } else if (isNew) {
            // Reset for new objective
            setObjectiveId(null);
          }
        } else {
          console.error('Module not found:', { moduleId, availableModules: response.data.modules.map(m => m.id || m._id) });
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!module || objectiveIndex === 'new') return;
    
    setSaving(true);
    try {
      const updatedObjectives = [...(module.objectives || [])];
      updatedObjectives[parseInt(objectiveIndex)] = objective;
      
      await programAPI.updateModule(moduleId, {
        ...module,
        objectives: updatedObjectives
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleObjectiveChange = (field, value) => {
    setObjective({ ...objective, [field]: value });
  };

  const handleSave = async () => {
    if (!objective.title.trim()) {
      toast.error('Objective title is required');
      return;
    }

    setSaving(true);
    try {
      // Prepare objective data with all fields
      const objectiveData = {
        title: objective.title || '',
        description: objective.description || '',
        text: objective.text || objective.title || '', // Keep for backward compatibility
        minDuration: objective.minDuration || 0,
        order: objectiveIndex === 'new' ? (module?.objectives?.length || 0) : parseInt(objectiveIndex),
        resources: objective.resources || [],
        assignments: objective.assignments || [],
        practiceTasks: objective.practiceTasks || [],
        practiceCodes: objective.practiceCodes || [],
        mcqQuestions: objective.mcqQuestions || [],
      };

      // Determine if we're creating a new objective
      const isNew = !objectiveIndex || objectiveIndex === 'new' || objectiveIndex === 'undefined' || !objectiveId;
      
      console.log('Saving objective:', {
        moduleId,
        objectiveIndex,
        objectiveId,
        isNew,
        objectiveData,
      });

      let response;
      if (isNew) {
        // Create new objective in Objective collection
        response = await programAPI.createObjective(moduleId, objectiveData);
        console.log('Create objective response:', response);
        if (response.success && response.data?.objective?.id) {
          setObjectiveId(response.data.objective.id);
        }
      } else {
        // Update existing objective using stored objectiveId
        if (!objectiveId) {
          // Try to get it from module objectives as fallback
          const currentObjective = module?.objectives?.find(obj => 
            (obj.id || obj._id) === objectiveIndex || 
            String(obj.id || obj._id) === String(objectiveIndex)
          ) || module?.objectives?.[parseInt(objectiveIndex)];
          
          if (!currentObjective || !(currentObjective.id || currentObjective._id)) {
            throw new Error('Objective not found. Please reload the page and try again.');
          }
          setObjectiveId(currentObjective.id || currentObjective._id);
        }
        
        response = await programAPI.updateObjective(objectiveId, objectiveData);
        console.log('Update objective response:', response);
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to save objective');
      }

      toast.success(objectiveIndex === 'new' ? 'Objective created successfully' : 'Objective updated successfully');
      
      // Reload module to get updated data
      await loadModule();
      
      if (objectiveIndex === 'new') {
        // Navigate to the objectives list to see the new objective
        navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`, { replace: true });
      } else {
        // Reload the current objective with updated data
        const objectivesResponse = await programAPI.getObjectivesByModule(moduleId);
        if (objectivesResponse.success && objectivesResponse.data.objectives) {
          const foundObjective = objectivesResponse.data.objectives[parseInt(objectiveIndex)];
          if (foundObjective) {
            console.log('Reloaded objective:', foundObjective);
            setObjective({
              title: foundObjective.title || foundObjective.text || '',
              description: foundObjective.description || '',
              text: foundObjective.text || foundObjective.title || '',
              minDuration: foundObjective.minDuration || 0,
              resources: foundObjective.resources || [],
              assignments: foundObjective.assignments || [],
              practiceTasks: foundObjective.practiceTasks || [],
              practiceCodes: foundObjective.practiceCodes || [],
              mcqQuestions: foundObjective.mcqQuestions || [],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving objective:', error);
      toast.error(error.message || 'Failed to save objective');
    } finally {
      setSaving(false);
    }
  };

  const handleAddResource = () => {
    setResourceFormData({
      type: 'DOCUMENT',
      forWhom: 'LEARNER',
      title: '',
      url: '',
      content: '',
      file: null,
    });
    setEditingResourceIndex(null);
    setShowResourceModal(true);
  };

  const handleEditResource = (index) => {
    const resource = objective.resources[index];
    setResourceFormData({
      type: resource.type || 'DOCUMENT',
      forWhom: resource.forWhom || 'LEARNER',
      title: resource.title || '',
      url: resource.url || '',
      content: resource.content || '',
      file: null,
    });
    setEditingResourceIndex(index);
    setShowResourceModal(true);
  };

  const handleSaveResource = async () => {
    if (!resourceFormData.title.trim()) {
      toast.error('Resource title is required');
      return;
    }

    let resourceData = {
      type: resourceFormData.type,
      forWhom: resourceFormData.forWhom,
      title: resourceFormData.title,
    };

    // Handle file upload if it's a document/video and file is selected
    if ((resourceFormData.type === 'DOCUMENT' || resourceFormData.type === 'VIDEO') && resourceFormData.file) {
      try {
        setUploadingFiles(prev => ({ ...prev, modal: true }));
        const response = await uploadAPI.uploadFile(resourceFormData.file, 'program-resources');
        if (response.success && response.data) {
          resourceData.url = response.data.url;
          resourceData.fileKey = response.data.key;
          resourceData.fileName = response.data.originalName;
          resourceData.fileSize = response.data.size;
          resourceData.mimeType = response.data.mimeType;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(error.message || 'Failed to upload file');
        setUploadingFiles(prev => ({ ...prev, modal: false }));
        return;
      } finally {
        setUploadingFiles(prev => ({ ...prev, modal: false }));
      }
    } else if (resourceFormData.type === 'DOCUMENT' || resourceFormData.type === 'VIDEO') {
      // If editing and file already exists, keep existing file data
      if (editingResourceIndex !== null && objective.resources[editingResourceIndex]?.url) {
        resourceData.url = objective.resources[editingResourceIndex].url;
        resourceData.fileKey = objective.resources[editingResourceIndex].fileKey;
        resourceData.fileName = objective.resources[editingResourceIndex].fileName;
        resourceData.fileSize = objective.resources[editingResourceIndex].fileSize;
        resourceData.mimeType = objective.resources[editingResourceIndex].mimeType;
      } else if (!resourceFormData.file) {
        toast.error('Please upload a file for document/video resources');
        return;
      }
    } else if (resourceFormData.type === 'LINK') {
      if (!resourceFormData.url.trim()) {
        toast.error('URL is required for link resources');
        return;
      }
      resourceData.url = resourceFormData.url;
    } else if (resourceFormData.type === 'NOTE') {
      resourceData.content = resourceFormData.content || '';
    }

    const updated = [...(objective.resources || [])];
    if (editingResourceIndex !== null) {
      // Update existing resource
      updated[editingResourceIndex] = {
        ...updated[editingResourceIndex],
        ...resourceData,
      };
    } else {
      // Add new resource
      updated.push(resourceData);
    }

    setObjective({ ...objective, resources: updated });
    setShowResourceModal(false);
    setResourceFormData({
      type: 'DOCUMENT',
      forWhom: 'LEARNER',
      title: '',
      url: '',
      content: '',
      file: null,
    });
    setEditingResourceIndex(null);
    toast.success(editingResourceIndex !== null ? 'Resource updated' : 'Resource added');
  };


  const handleFileUpload = async (index, file) => {
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [index]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'program-resources');
      
      if (response.success) {
        const updated = [...(objective.resources || [])];
        updated[index] = {
          ...updated[index],
          url: response.data.url,
          fileKey: response.data.key,
          fileName: response.data.originalName,
          fileSize: response.data.size,
          mimeType: response.data.mimeType,
        };
        setObjective({ ...objective, resources: updated });
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleDeleteUploadedFile = async (index) => {
    const resource = objective.resources[index];
    if (resource.fileKey) {
      try {
        await uploadAPI.deleteFile(resource.fileKey);
        const updated = [...(objective.resources || [])];
        updated[index] = {
          ...updated[index],
          url: '',
          fileKey: '',
          fileName: '',
          fileSize: '',
          mimeType: '',
        };
        setObjective({ ...objective, resources: updated });
        toast.success('File deleted successfully');
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      }
    }
  };

  const handleDeleteResource = (index) => {
    const updated = objective.resources.filter((_, i) => i !== index);
    setObjective({ ...objective, resources: updated });
  };

  const handleAddAssignment = () => {
    const newAssignment = {
      name: '',
      description: '',
      difficulty: 'BEGINNER', // BEGINNER, INTERMEDIATE, ADVANCED
      maxMarks: 100,
      passingMarks: 50,
      dueDate: '',
      assignmentResources: [], // Array to store datasets, images, source files, git repos, etc.
    };
    setObjective({
      ...objective,
      assignments: [...(objective.assignments || []), newAssignment]
    });
  };

  const handleAddAssignmentResource = (assignmentIndex) => {
    setAssignmentResourceFormData({
      type: 'DATASET',
      name: '',
      url: '',
      file: null,
    });
    setEditingAssignmentIndex(assignmentIndex);
    setEditingAssignmentResourceIndex(null);
    setShowAssignmentResourceModal(true);
  };

  const handleEditAssignmentResource = (assignmentIndex, resourceIndex) => {
    const resource = objective.assignments[assignmentIndex].assignmentResources?.[resourceIndex];
    setAssignmentResourceFormData({
      type: resource.type || 'DATASET',
      name: resource.name || '',
      url: resource.url || '',
      file: null,
    });
    setEditingAssignmentIndex(assignmentIndex);
    setEditingAssignmentResourceIndex(resourceIndex);
    setShowAssignmentResourceModal(true);
  };

  const handleSaveAssignmentResource = async () => {
    if (!assignmentResourceFormData.name.trim()) {
      toast.error('Resource name is required');
      return;
    }

    let resourceData = {
      type: assignmentResourceFormData.type,
      name: assignmentResourceFormData.name,
    };

    // Handle file upload for DATASET, IMAGE, SOURCE_FILE
    if (['DATASET', 'IMAGE', 'SOURCE_FILE'].includes(assignmentResourceFormData.type) && assignmentResourceFormData.file) {
      try {
        setUploadingFiles(prev => ({ ...prev, assignmentResource: true }));
        const response = await uploadAPI.uploadFile(assignmentResourceFormData.file, 'assignment-resources');
        if (response.success && response.data) {
          resourceData.url = response.data.url;
          resourceData.fileKey = response.data.key;
          resourceData.fileName = assignmentResourceFormData.file.name;
          resourceData.fileSize = assignmentResourceFormData.file.size;
          resourceData.mimeType = assignmentResourceFormData.file.type;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(error.message || 'Failed to upload file');
        setUploadingFiles(prev => ({ ...prev, assignmentResource: false }));
        return;
      } finally {
        setUploadingFiles(prev => ({ ...prev, assignmentResource: false }));
      }
    } else if (assignmentResourceFormData.type === 'GIT_REPO') {
      if (!assignmentResourceFormData.url.trim()) {
        toast.error('Git repository URL is required');
        return;
      }
      resourceData.url = assignmentResourceFormData.url;
    } else if (['DATASET', 'IMAGE', 'SOURCE_FILE'].includes(assignmentResourceFormData.type)) {
      // If editing and file already exists, keep existing file data
      if (editingAssignmentResourceIndex !== null && 
          objective.assignments[editingAssignmentIndex].assignmentResources?.[editingAssignmentResourceIndex]?.url) {
        const existing = objective.assignments[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex];
        resourceData.url = existing.url;
        resourceData.fileKey = existing.fileKey;
        resourceData.fileName = existing.fileName;
        resourceData.fileSize = existing.fileSize;
        resourceData.mimeType = existing.mimeType;
      } else if (!assignmentResourceFormData.file) {
        toast.error('Please upload a file for this resource type');
        return;
      }
    }

    const updated = [...(objective.assignments || [])];
    if (!updated[editingAssignmentIndex].assignmentResources) {
      updated[editingAssignmentIndex].assignmentResources = [];
    }

    if (editingAssignmentResourceIndex !== null) {
      // Update existing resource
      updated[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex] = {
        ...updated[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex],
        ...resourceData,
      };
    } else {
      // Add new resource
      updated[editingAssignmentIndex].assignmentResources.push(resourceData);
    }

    setObjective({ ...objective, assignments: updated });
    setShowAssignmentResourceModal(false);
    setAssignmentResourceFormData({
      type: 'DATASET',
      name: '',
      url: '',
      file: null,
    });
    setEditingAssignmentIndex(null);
    setEditingAssignmentResourceIndex(null);
    toast.success(editingAssignmentResourceIndex !== null ? 'Assignment resource updated' : 'Assignment resource added');
  };

  const handleDeleteAssignmentResource = (assignmentIndex, resourceIndex) => {
    const updated = [...(objective.assignments || [])];
    updated[assignmentIndex].assignmentResources = updated[assignmentIndex].assignmentResources.filter((_, i) => i !== resourceIndex);
    setObjective({ ...objective, assignments: updated });
  };

  const handleUpdateAssignment = (index, field, value) => {
    const updated = [...(objective.assignments || [])];
    updated[index] = { ...updated[index], [field]: value };
    setObjective({ ...objective, assignments: updated });
  };

  const handleDeleteAssignment = (index) => {
    const updated = objective.assignments.filter((_, i) => i !== index);
    setObjective({ ...objective, assignments: updated });
  };

  const handleAddPracticeTask = () => {
    const newCaseStudy = {
      title: '',
      caseDescription: '',
      scenario: '',
      questions: [],
      difficulty: 'BEGINNER',
      estimatedTime: 0,
      learningOutcomes: '',
    };
    setObjective({
      ...objective,
      practiceTasks: [...(objective.practiceTasks || []), newCaseStudy]
    });
  };

  const handleUpdatePracticeTask = (index, field, value) => {
    const updated = [...(objective.practiceTasks || [])];
    updated[index] = { ...updated[index], [field]: value };
    setObjective({ ...objective, practiceTasks: updated });
  };

  const handleDeletePracticeTask = (index) => {
    const updated = objective.practiceTasks.filter((_, i) => i !== index);
    setObjective({ ...objective, practiceTasks: updated });
  };

  // Practice Codes handlers
  const handleAddPracticeCode = () => {
    const newPracticeCode = {
      problem: '',
      description: '',
      testCases: [],
      instructions: '',
      difficulty: 'BEGINNER',
      language: '',
      starterCode: '',
      solution: '',
    };
    setObjective({
      ...objective,
      practiceCodes: [...(objective.practiceCodes || []), newPracticeCode]
    });
  };

  const handleUpdatePracticeCode = (index, field, value) => {
    const updated = [...(objective.practiceCodes || [])];
    updated[index] = { ...updated[index], [field]: value };
    setObjective({ ...objective, practiceCodes: updated });
  };

  const handleDeletePracticeCode = (index) => {
    const updated = objective.practiceCodes.filter((_, i) => i !== index);
    setObjective({ ...objective, practiceCodes: updated });
  };

  const handleAddTestCase = (practiceCodeIndex) => {
    const updated = [...(objective.practiceCodes || [])];
    if (!updated[practiceCodeIndex].testCases) {
      updated[practiceCodeIndex].testCases = [];
    }
    updated[practiceCodeIndex].testCases.push({
      input: '',
      expectedOutput: '',
      description: '',
      isPublic: true,
    });
    setObjective({ ...objective, practiceCodes: updated });
  };

  const handleUpdateTestCase = (practiceCodeIndex, testCaseIndex, field, value) => {
    const updated = [...(objective.practiceCodes || [])];
    updated[practiceCodeIndex].testCases[testCaseIndex] = {
      ...updated[practiceCodeIndex].testCases[testCaseIndex],
      [field]: value
    };
    setObjective({ ...objective, practiceCodes: updated });
  };

  const handleDeleteTestCase = (practiceCodeIndex, testCaseIndex) => {
    const updated = [...(objective.practiceCodes || [])];
    updated[practiceCodeIndex].testCases = updated[practiceCodeIndex].testCases.filter((_, i) => i !== testCaseIndex);
    setObjective({ ...objective, practiceCodes: updated });
  };

  // MCQ Questions handlers
  const parseMCQFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const fileName = file.name.toLowerCase();
          
          if (fileName.endsWith('.json')) {
            // Parse JSON file
            const data = JSON.parse(content);
            if (Array.isArray(data)) {
              resolve(data);
            } else if (data.questions && Array.isArray(data.questions)) {
              resolve(data.questions);
            } else {
              reject(new Error('Invalid JSON format. Expected an array of questions or an object with a "questions" array.'));
            }
          } else if (fileName.endsWith('.csv')) {
            // Parse CSV file
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              reject(new Error('CSV file must have at least a header row and one data row.'));
              return;
            }
            
            // Parse header
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const questionIndex = headers.findIndex(h => h.includes('question') || h.includes('q'));
            const optionsIndex = headers.findIndex(h => h.includes('option') || h.includes('options'));
            const answerIndex = headers.findIndex(h => h.includes('answer') || h.includes('correct'));
            
            if (questionIndex === -1) {
              reject(new Error('CSV must have a "question" column.'));
              return;
            }
            
            const questions = [];
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim());
              if (values[questionIndex]) {
                const question = {
                  question: values[questionIndex],
                  options: [],
                  correctAnswer: '',
                };
                
                // Extract options (option1, option2, etc. or options column)
                if (optionsIndex !== -1 && values[optionsIndex]) {
                  // If options are in a single column, split by semicolon or newline
                  question.options = values[optionsIndex].split(/[;|]/).map(opt => opt.trim()).filter(opt => opt);
                } else {
                  // Look for option1, option2, etc. columns
                  headers.forEach((header, idx) => {
                    if (header.includes('option') && values[idx]) {
                      question.options.push(values[idx]);
                    }
                  });
                }
                
                // Extract correct answer
                if (answerIndex !== -1 && values[answerIndex]) {
                  question.correctAnswer = values[answerIndex];
                }
                
                if (question.options.length > 0) {
                  questions.push(question);
                }
              }
            }
            
            resolve(questions);
          } else {
            reject(new Error('Unsupported file format. Please upload a JSON or CSV file.'));
          }
        } catch (error) {
          reject(new Error(`Error parsing file: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleUploadMCQFile = async (file) => {
    if (!file) return;
    
    // Validate file size (10MB limit for MCQ files)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json') && !fileName.endsWith('.csv')) {
      toast.error('Please upload a JSON or CSV file');
      return;
    }
    
    try {
      setUploadingFiles(prev => ({ ...prev, mcq: true }));
      const questions = await parseMCQFile(file);
      
      if (questions.length === 0) {
        toast.error('No valid questions found in the file');
        setUploadingFiles(prev => ({ ...prev, mcq: false }));
        return;
      }
      
      // Validate question structure
      const validQuestions = questions.filter(q => {
        if (!q.question || typeof q.question !== 'string') return false;
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) return false;
        if (!q.correctAnswer || typeof q.correctAnswer !== 'string') return false;
        return true;
      });
      
      if (validQuestions.length === 0) {
        toast.error('No valid questions found. Each question must have: question, options (array), and correctAnswer');
        setUploadingFiles(prev => ({ ...prev, mcq: false }));
        return;
      }
      
      // Add questions to objective
      setObjective({
        ...objective,
        mcqQuestions: [...(objective.mcqQuestions || []), ...validQuestions]
      });
      
      toast.success(`Successfully uploaded ${validQuestions.length} MCQ question(s)`);
    } catch (error) {
      console.error('Error parsing MCQ file:', error);
      toast.error(error.message || 'Failed to parse MCQ file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, mcq: false }));
    }
  };

  const handleAddMCQQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      imageUrl: '',
      imageKey: '',
      explanation: '',
    };
    setObjective({
      ...objective,
      mcqQuestions: [...(objective.mcqQuestions || []), newQuestion]
    });
  };

  const handleUpdateMCQQuestion = (index, field, value) => {
    const updated = [...(objective.mcqQuestions || [])];
    updated[index] = { ...updated[index], [field]: value };
    setObjective({ ...objective, mcqQuestions: updated });
  };

  const handleUploadMCQImage = async (questionIndex, file) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    
    setUploadingFiles(prev => ({ ...prev, [`mcq-image-${questionIndex}`]: true }));
    
    try {
      const response = await uploadAPI.uploadFile(file, 'program-resources');
      if (response.success) {
        const updated = [...(objective.mcqQuestions || [])];
        updated[questionIndex] = {
          ...updated[questionIndex],
          imageUrl: response.data.url,
          imageKey: response.data.key,
        };
        setObjective({ ...objective, mcqQuestions: updated });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading MCQ image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [`mcq-image-${questionIndex}`]: false }));
    }
  };

  const handleUpdateMCQOption = (questionIndex, optionIndex, value) => {
    const updated = [...(objective.mcqQuestions || [])];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = ['', '', '', ''];
    }
    updated[questionIndex].options[optionIndex] = value;
    setObjective({ ...objective, mcqQuestions: updated });
  };

  const handleAddMCQOption = (questionIndex) => {
    const updated = [...(objective.mcqQuestions || [])];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options.push('');
    setObjective({ ...objective, mcqQuestions: updated });
  };

  const handleDeleteMCQOption = (questionIndex, optionIndex) => {
    const updated = [...(objective.mcqQuestions || [])];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setObjective({ ...objective, mcqQuestions: updated });
  };

  const handleDeleteMCQQuestion = (index) => {
    const updated = objective.mcqQuestions.filter((_, i) => i !== index);
    setObjective({ ...objective, mcqQuestions: updated });
  };

  // Session creation functions
  const fetchBatches = async () => {
    try {
      // Fetch batches for the current program
      const response = await lsmAPI.getAllBatches({ courseId: programId });
      if (response.success && response.data.batches) {
        setAvailableBatches(response.data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    }
  };

  const fetchModules = async (selectedProgramId) => {
    try {
      const programIdToUse = selectedProgramId || programId;
      const response = await programAPI.getModulesByProgram(programIdToUse);
      if (response.success && response.data.modules) {
        setAvailableModules(response.data.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    }
  };

  const fetchObjectives = async (selectedModuleId) => {
    if (!selectedModuleId) {
      setAvailableObjectives([]);
      setSubModules([]);
      return;
    }
    try {
      // Fetch sub-modules first
      const subModulesResponse = await programAPI.getSubModulesByModule(selectedModuleId);
      if (subModulesResponse.success && subModulesResponse.data?.subModules) {
        setSubModules(subModulesResponse.data.subModules);
        
        // Collect all objectives from all sub-modules
        const allObjectives = [];
        for (const subModule of subModulesResponse.data.subModules) {
          if (subModule.objectives && subModule.objectives.length > 0) {
            allObjectives.push(...subModule.objectives.map(obj => ({
              ...obj,
              subModuleId: subModule.id || subModule._id,
              subModuleName: subModule.name,
            })));
          }
        }
        setAvailableObjectives(allObjectives);
      } else {
        // Fallback: try fetching objectives directly from module (for backward compatibility)
        const response = await programAPI.getObjectivesByModule(selectedModuleId);
        if (response.success && response.data.objectives) {
          setAvailableObjectives(response.data.objectives);
          setSubModules([]);
        } else {
          setAvailableObjectives([]);
          setSubModules([]);
        }
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
      // Try fallback
      try {
        const response = await programAPI.getObjectivesByModule(selectedModuleId);
        if (response.success && response.data.objectives) {
          setAvailableObjectives(response.data.objectives);
          setSubModules([]);
        } else {
          setAvailableObjectives([]);
          setSubModules([]);
        }
      } catch (fallbackError) {
        console.error('Error fetching objectives (fallback):', fallbackError);
        toast.error('Failed to load learning objectives');
        setAvailableObjectives([]);
        setSubModules([]);
      }
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

  const handleOpenSessionModal = () => {
    setShowSessionModal(true);
    fetchBatches();
    fetchTutors();
    // Reset form
    setSessionFormData({
      name: '',
      description: '',
      type: 'LIVE',
      status: 'SCHEDULED',
      scheduledDate: '',
      duration: 60,
      tutorId: '',
      meetingLink: '',
      recordingUrl: '',
      batchId: '',
      moduleId: '',
      objectiveId: '',
    });
    setAvailableModules([]);
    setAvailableObjectives([]);
    setSubModules([]);
  };

  const handleBatchChange = (batchId) => {
    const selectedBatch = availableBatches.find(b => (b.id || b._id) === batchId);
    const batchProgramId = selectedBatch?.courseId || programId;
    
    setSessionFormData({ 
      ...sessionFormData, 
      batchId, 
      moduleId: '', 
      objectiveId: '' 
    });
    setAvailableObjectives([]);
    
    // Fetch modules for the batch's program
    if (batchProgramId) {
      fetchModules(batchProgramId);
    }
  };

  const handleModuleChange = (moduleId) => {
    setSessionFormData({ ...sessionFormData, moduleId, objectiveId: '' });
    fetchObjectives(moduleId);
  };

  const handleCreateSession = async () => {
    if (!sessionFormData.name.trim()) {
      toast.error('Session name is required');
      return;
    }

    if (!sessionFormData.batchId) {
      toast.error('Please select a batch');
      return;
    }

    if (!sessionFormData.moduleId) {
      toast.error('Please select a module');
      return;
    }

    if (!sessionFormData.objectiveId) {
      toast.error('Please select a learning objective');
      return;
    }

    if (!sessionFormData.scheduledDate) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    if (!sessionFormData.tutorId) {
      toast.error('Please assign a tutor to the session');
      return;
    }

    try {
      const sessionData = {
        name: sessionFormData.name,
        description: sessionFormData.description,
        type: sessionFormData.type,
        status: sessionFormData.status,
        scheduledDate: sessionFormData.scheduledDate,
        duration: sessionFormData.duration,
        tutorId: sessionFormData.tutorId,
        // meetingLink will be auto-generated by backend
        objectiveId: sessionFormData.objectiveId,
        moduleId: sessionFormData.moduleId,
      };
      
      const response = await lsmAPI.createSession(sessionFormData.batchId, sessionData);

      if (response.success) {
        toast.success('Session created successfully');
        setShowSessionModal(false);
        // Reset form
        setSessionFormData({
          name: '',
          description: '',
          type: 'LIVE',
          status: 'SCHEDULED',
          scheduledDate: '',
          duration: 60,
          tutorId: '',
          batchId: '',
          moduleId: '',
          objectiveId: '',
        });
        setAvailableObjectives([]);
        setSubModules([]);
      } else {
        toast.error(response.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error.message || 'Failed to create session');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading objective...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={objectiveIndex === 'new' ? 'Create Learning Objective' : 'Edit Learning Objective'}
        description="Define the learning objective and add resources, assignments, practice tasks, and MCQ questions"
        actions={
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-textMuted flex items-center gap-1">
                <Save className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            )}
            <Button
              variant="secondary"
              onClick={handleOpenSessionModal}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Create Session
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Objective
            </Button>
          </div>
        }
      />

      {/* No tabs - only Details page with unified content management */}

      <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
        {/* Details Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-text">Objective Information</h3>
              <p className="mt-1 text-sm text-textMuted">Define the learning objective details</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowUnifiedContentModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Content
            </Button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Objective Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={objective.title || ''}
              onChange={(e) => handleObjectiveChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="Enter objective title..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Description
            </label>
            <textarea
              value={objective.description || ''}
              onChange={(e) => handleObjectiveChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
              rows={4}
              placeholder="Enter objective description..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">Minimum Duration (hours)</label>
            <input
              type="number"
              value={objective.minDuration}
              onChange={(e) => handleObjectiveChange('minDuration', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              min="0"
              step="0.5"
            />
          </div>
        </div>
      </div>

      {/* Unified Content Management Modal */}
      <Modal
        isOpen={showUnifiedContentModal}
        onClose={() => setShowUnifiedContentModal(false)}
        title="Manage Content"
        size="xl"
      >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Content Type Selector */}
            <div className="flex gap-2 border-b pb-4">
              <Button
                variant={unifiedContentType === 'resource' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setUnifiedContentType('resource')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Resources ({objective.resources?.length || 0})
              </Button>
              <Button
                variant={unifiedContentType === 'assignment' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setUnifiedContentType('assignment')}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Assignments ({objective.assignments?.length || 0})
              </Button>
              <Button
                variant={unifiedContentType === 'caseStudy' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setUnifiedContentType('caseStudy')}
              >
                <Target className="h-4 w-4 mr-2" />
                Case Studies ({objective.practiceTasks?.length || 0})
              </Button>
              <Button
                variant={unifiedContentType === 'mcq' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setUnifiedContentType('mcq')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                MCQ ({objective.mcqQuestions?.length || 0})
              </Button>
            </div>

            {/* Resources Section */}
            {unifiedContentType === 'resource' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resources</h3>
                  <Button variant="primary" size="sm" onClick={handleAddResource}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>
                {(!objective.resources || objective.resources.length === 0) ? (
                  <p className="text-textMuted text-center py-8">No resources added yet</p>
                ) : (
                  <div className="space-y-3">
                    {objective.resources.map((resource, index) => (
                      <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {resource.type === 'DOCUMENT' && <File className="h-5 w-5 text-blue-600" />}
                          {resource.type === 'VIDEO' && <Video className="h-5 w-5 text-red-600" />}
                          {resource.type === 'LINK' && <Link2 className="h-5 w-5 text-green-600" />}
                          {resource.type === 'NOTE' && <FileText className="h-5 w-5 text-purple-600" />}
                          <div className="flex-1">
                            <h4 className="font-semibold">{resource.title || 'Untitled'}</h4>
                            <p className="text-sm text-textMuted">{resource.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditResource(index)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(index)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Assignments Section */}
            {unifiedContentType === 'assignment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Assignments</h3>
                  <Button variant="primary" size="sm" onClick={handleAddAssignment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </div>
                {(!objective.assignments || objective.assignments.length === 0) ? (
                  <p className="text-textMuted text-center py-8">No assignments added yet</p>
                ) : (
                  <div className="space-y-3">
                    {objective.assignments.map((assignment, index) => (
                      <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{assignment.name || 'Untitled Assignment'}</h4>
                          <p className="text-sm text-textMuted">{assignment.difficulty} • {assignment.maxMarks || 0} marks</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            // Edit assignment logic
                            const updated = [...(objective.assignments || [])];
                            // Open edit modal or inline edit
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(index)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Case Studies Section */}
            {unifiedContentType === 'caseStudy' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Case Studies</h3>
                  <Button variant="primary" size="sm" onClick={handleAddPracticeTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Case Study
                  </Button>
                </div>
                {(!objective.practiceTasks || objective.practiceTasks.length === 0) ? (
                  <p className="text-textMuted text-center py-8">No case studies added yet</p>
                ) : (
                  <div className="space-y-3">
                    {objective.practiceTasks.map((caseStudy, index) => (
                      <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{caseStudy.title || caseStudy.name || 'Untitled Case Study'}</h4>
                          <p className="text-sm text-textMuted">{caseStudy.difficulty || 'BEGINNER'} • {caseStudy.estimatedTime || 0} min</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            // Edit case study logic
                          }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePracticeTask(index)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Practice Codes Section */}
            {unifiedContentType === 'practiceCode' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Practice Codes</h3>
                  <Button variant="primary" size="sm" onClick={() => {
                    setPracticeCodeFormData({
                      problem: '',
                      description: '',
                      testCases: [],
                      instructions: '',
                      difficulty: 'BEGINNER',
                      language: '',
                      starterCode: '',
                      solution: '',
                    });
                    setEditingPracticeCodeIndex(null);
                    setShowPracticeCodeModal(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Practice Code
                  </Button>
                </div>
                {(!objective.practiceCodes || objective.practiceCodes.length === 0) ? (
                  <p className="text-textMuted text-center py-8">No practice codes added yet</p>
                ) : (
                  <div className="space-y-4">
                    {objective.practiceCodes.map((practiceCode, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{practiceCode.problem || 'Untitled Practice Code'}</h4>
                            <p className="text-sm text-textMuted">{practiceCode.difficulty || 'BEGINNER'} • {practiceCode.language || 'Any Language'}</p>
                            {practiceCode.testCases && practiceCode.testCases.length > 0 && (
                              <p className="text-xs text-textMuted mt-1">{practiceCode.testCases.length} Test Case{practiceCode.testCases.length !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setPracticeCodeFormData({
                                problem: practiceCode.problem || '',
                                description: practiceCode.description || '',
                                testCases: practiceCode.testCases || [],
                                instructions: practiceCode.instructions || '',
                                difficulty: practiceCode.difficulty || 'BEGINNER',
                                language: practiceCode.language || '',
                                starterCode: practiceCode.starterCode || '',
                                solution: practiceCode.solution || '',
                              });
                              setEditingPracticeCodeIndex(index);
                              setShowPracticeCodeModal(true);
                            }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePracticeCode(index)}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MCQ Section */}
            {unifiedContentType === 'mcq' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">MCQ Questions</h3>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="mcq-file-upload-modal"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleUploadMCQFile(file);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      accept=".json,.csv"
                    />
                    <label htmlFor="mcq-file-upload-modal">
                      <Button variant="ghost" size="sm" as="span">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </label>
                    <Button variant="primary" size="sm" onClick={handleAddMCQQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>
                {(!objective.mcqQuestions || objective.mcqQuestions.length === 0) ? (
                  <p className="text-textMuted text-center py-8">No MCQ questions added yet</p>
                ) : (
                  <div className="space-y-3">
                    {objective.mcqQuestions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">Q{index + 1}: {question.question || 'Untitled Question'}</h4>
                            {question.imageUrl && (
                              <img 
                                src={getProxyUrl(question.imageUrl, question.imageKey)} 
                                alt="Question" 
                                className="max-w-xs rounded-lg mb-2"
                              />
                            )}
                            <div className="space-y-1 mt-2">
                              {question.options?.map((opt, optIdx) => (
                                <div key={optIdx} className={`text-sm p-2 rounded ${opt === question.correctAnswer ? 'bg-green-50 text-green-700 font-semibold' : 'bg-gray-50'}`}>
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                  {opt === question.correctAnswer && ' ✓'}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => {
                              // Edit MCQ logic
                            }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              const updated = objective.mcqQuestions.filter((_, i) => i !== index);
                              setObjective({ ...objective, mcqQuestions: updated });
                            }}>
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

      {/* OLD TABS - REMOVED - These are disabled but kept for reference */}
      {false && (
        <>
        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Resources</h3>
                <p className="mt-1 text-sm text-textMuted">Upload documents, videos, or add links for this objective</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddResource}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {(!objective.resources || objective.resources.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No resources added yet</p>
                <Button variant="ghost" size="sm" onClick={handleAddResource}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Resource
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {objective.resources.map((resource, index) => {
                  const getResourceIcon = () => {
                    switch (resource.type) {
                      case 'DOCUMENT':
                        return <File className="h-5 w-5 text-blue-600" />;
                      case 'VIDEO':
                        return <Video className="h-5 w-5 text-red-600" />;
                      case 'LINK':
                        return <Link2 className="h-5 w-5 text-green-600" />;
                      case 'NOTE':
                        return <FileText className="h-5 w-5 text-purple-600" />;
                      default:
                        return <FileText className="h-5 w-5 text-gray-600" />;
                    }
                  };

                  const getResourceTypeLabel = () => {
                    switch (resource.type) {
                      case 'DOCUMENT':
                        return 'Document';
                      case 'VIDEO':
                        return 'Video';
                      case 'LINK':
                        return 'Link';
                      case 'NOTE':
                        return 'Note';
                      default:
                        return resource.type;
                    }
                  };

                  return (
                    <div key={index} className="border border-gray-200 rounded-2xl p-5 bg-white hover:border-brand-500 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getResourceIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-base font-semibold text-text">{resource.title || 'Untitled Resource'}</h4>
                              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                {getResourceTypeLabel()}
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                resource.forWhom === 'LEARNER' 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}>
                                {resource.forWhom === 'LEARNER' ? 'Learner' : 'Tutor'}
                              </span>
                            </div>
                            {resource.type === 'NOTE' && resource.content && (
                              <p className="text-sm text-textMuted line-clamp-2 mb-2">{resource.content}</p>
                            )}
                            {resource.type === 'LINK' && resource.url && (
                              <button
                                onClick={() => {
                                  setImageError(false);
                                  setViewingResource(resource);
                                }}
                                className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-2 cursor-pointer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {resource.url}
                              </button>
                            )}
                            {resource.fileName && (
                              <div className="flex items-center gap-2 text-sm text-textMuted">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium">{resource.fileName}</span>
                                {resource.fileSize && (
                                  <span className="text-xs">
                                    ({(resource.fileSize / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.url && resource.type !== 'NOTE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImageError(false);
                                setViewingResource(resource);
                              }}
                              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                              title="View Resource"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {resource.type === 'NOTE' && resource.content && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImageError(false);
                                setViewingResource(resource);
                              }}
                              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                              title="View Note"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditResource(index)}
                            className="text-text hover:text-brand-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResource(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Assignments</h3>
                <p className="mt-1 text-sm text-textMuted">Create assignments with difficulty levels and grading criteria</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </div>

            {(!objective.assignments || objective.assignments.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No assignments added yet</p>
                <Button variant="ghost" size="sm" onClick={handleAddAssignment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {objective.assignments.map((assignment, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Name</label>
                            <input
                              type="text"
                              value={assignment.name || ''}
                              onChange={(e) => handleUpdateAssignment(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              placeholder="Assignment name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Difficulty</label>
                            <select
                              value={assignment.difficulty}
                              onChange={(e) => handleUpdateAssignment(index, 'difficulty', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                            >
                              <option value="BEGINNER">Beginner</option>
                              <option value="INTERMEDIATE">Intermediate</option>
                              <option value="ADVANCED">Advanced</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">Description</label>
                          <textarea
                            value={assignment.description || ''}
                            onChange={(e) => handleUpdateAssignment(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={3}
                            placeholder="Assignment description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Max Marks</label>
                            <input
                              type="number"
                              value={assignment.maxMarks || 100}
                              onChange={(e) => handleUpdateAssignment(index, 'maxMarks', parseInt(e.target.value) || 100)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Passing Marks</label>
                            <input
                              type="number"
                              value={assignment.passingMarks || 50}
                              onChange={(e) => handleUpdateAssignment(index, 'passingMarks', parseInt(e.target.value) || 50)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Due Date</label>
                            <input
                              type="date"
                              value={assignment.dueDate || ''}
                              onChange={(e) => handleUpdateAssignment(index, 'dueDate', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                            />
                          </div>
                        </div>

                        {/* Assignment Resources Section */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-sm font-semibold text-text mb-1">Assignment Resources</h4>
                              <p className="text-xs text-textMuted">Add datasets, images, source files, or git repositories</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddAssignmentResource(index)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Resource
                            </Button>
                          </div>

                          {assignment.assignmentResources && assignment.assignmentResources.length > 0 ? (
                            <div className="space-y-2">
                              {assignment.assignmentResources.map((resource, resourceIndex) => {
                                const getResourceIcon = () => {
                                  switch (resource.type) {
                                    case 'DATASET':
                                      return <Database className="h-4 w-4 text-blue-600" />;
                                    case 'IMAGE':
                                      return <ImageIcon className="h-4 w-4 text-green-600" />;
                                    case 'SOURCE_FILE':
                                      return <Code className="h-4 w-4 text-purple-600" />;
                                    case 'GIT_REPO':
                                      return <GitBranch className="h-4 w-4 text-orange-600" />;
                                    default:
                                      return <File className="h-4 w-4 text-gray-600" />;
                                  }
                                };

                                const getResourceTypeLabel = () => {
                                  switch (resource.type) {
                                    case 'DATASET':
                                      return 'Dataset';
                                    case 'IMAGE':
                                      return 'Image';
                                    case 'SOURCE_FILE':
                                      return 'Source File';
                                    case 'GIT_REPO':
                                      return 'Git Repo';
                                    default:
                                      return resource.type;
                                  }
                                };

                                return (
                                  <div key={resourceIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex-shrink-0">
                                        {getResourceIcon()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm font-semibold text-text">{resource.name}</span>
                                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                                            {getResourceTypeLabel()}
                                          </span>
                                        </div>
                                        {resource.fileName && (
                                          <p className="text-xs text-textMuted">{resource.fileName}</p>
                                        )}
                                        {resource.url && resource.type === 'GIT_REPO' && (
                                          <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                            {resource.url}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditAssignmentResource(index, resourceIndex)}
                                        className="text-text hover:text-brand-600"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteAssignmentResource(index, resourceIndex)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                              <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-textMuted mb-3">No resources added yet</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddAssignmentResource(index)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add First Resource
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssignment(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Practice Tasks Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">Practice Tasks</h3>
                <p className="mt-1 text-sm text-textMuted">Create practice tasks with difficulty levels and time estimates</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddPracticeTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add Practice Task
              </Button>
            </div>

            {(!objective.practiceTasks || objective.practiceTasks.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No practice tasks added yet</p>
                <Button variant="ghost" size="sm" onClick={handleAddPracticeTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Practice Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {objective.practiceTasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Name</label>
                            <input
                              type="text"
                              value={task.name || ''}
                              onChange={(e) => handleUpdatePracticeTask(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              placeholder="Task name"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Difficulty</label>
                            <select
                              value={task.difficulty}
                              onChange={(e) => handleUpdatePracticeTask(index, 'difficulty', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                            >
                              <option value="BEGINNER">Beginner</option>
                              <option value="INTERMEDIATE">Intermediate</option>
                              <option value="ADVANCED">Advanced</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">Description</label>
                          <textarea
                            value={task.description || ''}
                            onChange={(e) => handleUpdatePracticeTask(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={3}
                            placeholder="Task description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">Estimated Time (hours)</label>
                            <input
                              type="number"
                              value={task.estimatedTime || 0}
                              onChange={(e) => handleUpdatePracticeTask(index, 'estimatedTime', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                              min="0"
                              step="0.5"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">Instructions</label>
                          <textarea
                            value={task.instructions || ''}
                            onChange={(e) => handleUpdatePracticeTask(index, 'instructions', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={4}
                            placeholder="Task instructions"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePracticeTask(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MCQ Questions Tab */}
        {activeTab === 'mcq' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-text">MCQ Questions</h3>
                <p className="mt-1 text-sm text-textMuted">Upload questions with options and answers in a single file (JSON or CSV)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="file"
                    id="mcq-file-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleUploadMCQFile(file);
                        e.target.value = ''; // Reset input
                      }
                    }}
                    className="hidden"
                    accept=".json,.csv"
                    disabled={uploadingFiles.mcq}
                  />
                  <label htmlFor="mcq-file-upload" className="cursor-pointer">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      uploadingFiles.mcq
                        ? 'bg-brand-400 text-white cursor-wait'
                        : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-sm'
                    }`}>
                      {uploadingFiles.mcq ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload MCQ File
                        </>
                      )}
                    </div>
                  </label>
                </div>
                <Button variant="primary" size="sm" onClick={handleAddMCQQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            {/* File Format Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">File Format Instructions:</h4>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>JSON Format:</strong> Array of objects with "question", "options" (array), and "correctAnswer" fields.</p>
                <p><strong>CSV Format:</strong> Columns: question, option1, option2, option3, option4, answer (or similar variations)</p>
                <p className="mt-2 text-blue-700">Example JSON: <code className="bg-blue-100 px-1 rounded">{`[{"question": "What is...?", "options": ["A", "B", "C", "D"], "correctAnswer": "A"}]`}</code></p>
              </div>
            </div>

            {(!objective.mcqQuestions || objective.mcqQuestions.length === 0) ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-textMuted mb-4 font-medium">No MCQ questions added yet</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      id="mcq-file-upload-empty"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleUploadMCQFile(file);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      accept=".json,.csv"
                      disabled={uploadingFiles.mcq}
                    />
                    <label htmlFor="mcq-file-upload-empty" className="cursor-pointer">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        uploadingFiles.mcq
                          ? 'bg-gray-200 text-gray-500 cursor-wait'
                          : 'bg-white text-text border border-gray-300 hover:bg-gray-50'
                      }`}>
                        {uploadingFiles.mcq ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload MCQ File
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleAddMCQQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {objective.mcqQuestions.map((mcq, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">
                            Question {index + 1} <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={mcq.question || ''}
                            onChange={(e) => handleUpdateMCQQuestion(index, 'question', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                            rows={3}
                            placeholder="Enter the question..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-text uppercase tracking-wide">
                              Options <span className="text-red-500">*</span>
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddMCQOption(index)}
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(mcq.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-textMuted w-8 flex-shrink-0">
                                  {String.fromCharCode(65 + optionIndex)}:
                                </span>
                                <input
                                  type="text"
                                  value={option || ''}
                                  onChange={(e) => handleUpdateMCQOption(index, optionIndex, e.target.value)}
                                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                />
                                {mcq.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMCQOption(index, optionIndex)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-text uppercase tracking-wide">
                            Correct Answer <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={mcq.correctAnswer || ''}
                            onChange={(e) => handleUpdateMCQQuestion(index, 'correctAnswer', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-text text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                          >
                            <option value="">Select correct answer</option>
                            {(mcq.options || []).map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {String.fromCharCode(65 + optionIndex)}: {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMCQQuestion(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      )}

      {/* Resource Modal */}
      <Modal
        isOpen={showResourceModal}
        onClose={() => {
          setShowResourceModal(false);
          setEditingResourceIndex(null);
          setResourceFormData({
            type: 'DOCUMENT',
            forWhom: 'LEARNER',
            title: '',
            url: '',
            content: '',
            file: null,
          });
        }}
        title={editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                Resource Type <span className="text-red-500">*</span>
              </label>
              <select
                value={resourceFormData.type}
                onChange={(e) => setResourceFormData({ ...resourceFormData, type: e.target.value, file: null, url: '', content: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              >
                <option value="DOCUMENT">Document</option>
                <option value="VIDEO">Video</option>
                <option value="LINK">Link</option>
                <option value="NOTE">Note</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                For Whom <span className="text-red-500">*</span>
              </label>
              <select
                value={resourceFormData.forWhom}
                onChange={(e) => setResourceFormData({ ...resourceFormData, forWhom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              >
                <option value="LEARNER">Learner</option>
                <option value="TUTOR">Tutor</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={resourceFormData.title}
              onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="Resource title"
            />
          </div>

          {resourceFormData.type === 'NOTE' ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Content</label>
              <textarea
                value={resourceFormData.content}
                onChange={(e) => setResourceFormData({ ...resourceFormData, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
                rows={6}
                placeholder="Note content..."
              />
            </div>
          ) : resourceFormData.type === 'LINK' ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={resourceFormData.url}
                onChange={(e) => setResourceFormData({ ...resourceFormData, url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                placeholder="https://example.com/resource"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                {editingResourceIndex !== null && objective.resources[editingResourceIndex]?.fileName 
                  ? 'Uploaded File' 
                  : 'Upload File'}
              </label>
              {editingResourceIndex !== null && objective.resources[editingResourceIndex]?.fileName ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-900 truncate">
                      {objective.resources[editingResourceIndex].fileName}
                    </p>
                    {objective.resources[editingResourceIndex].fileSize && (
                      <p className="text-xs text-green-700 mt-0.5">
                        {(objective.resources[editingResourceIndex].fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = [...(objective.resources || [])];
                      updated[editingResourceIndex] = {
                        ...updated[editingResourceIndex],
                        url: '',
                        fileKey: '',
                        fileName: '',
                        fileSize: '',
                        mimeType: '',
                      };
                      setObjective({ ...objective, resources: updated });
                      setResourceFormData({ ...resourceFormData, file: null });
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="resource-file-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) {
                          toast.error('File size must be less than 50MB');
                          return;
                        }
                        setResourceFormData({ ...resourceFormData, file });
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip"
                    disabled={uploadingFiles.modal}
                  />
                  <label
                    htmlFor="resource-file-upload"
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploadingFiles.modal
                        ? 'border-brand-300 bg-brand-50 cursor-wait'
                        : resourceFormData.file
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50'
                    }`}
                  >
                    {uploadingFiles.modal ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                        <span className="text-sm font-medium text-brand-600">Uploading...</span>
                      </>
                    ) : resourceFormData.file ? (
                      <>
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{resourceFormData.file.name}</span>
                        <span className="text-xs text-green-600">
                          ({(resourceFormData.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-textMuted" />
                        <span className="text-sm font-medium text-text">Choose file or drag & drop</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-textMuted mt-2 text-center">
                    PDF, DOC, XLS, PPT, Images, Videos, ZIP (Max 50MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowResourceModal(false);
                setEditingResourceIndex(null);
                setResourceFormData({
                  type: 'DOCUMENT',
                  forWhom: 'LEARNER',
                  title: '',
                  url: '',
                  content: '',
                  file: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveResource}
              disabled={uploadingFiles.modal || !resourceFormData.title.trim()}
            >
              {uploadingFiles.modal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingResourceIndex !== null ? 'Update' : 'Add'} Resource
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Resource Modal */}
      <Modal
        isOpen={viewingResource !== null}
        onClose={() => {
          setViewingResource(null);
          setImageError(false);
        }}
        title={viewingResource?.title || 'View Resource'}
        size="xl"
      >
        {viewingResource && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className={`p-2 rounded-lg ${
                viewingResource.type === 'DOCUMENT' ? 'bg-blue-100 text-blue-600' :
                viewingResource.type === 'VIDEO' ? 'bg-red-100 text-red-600' :
                viewingResource.type === 'LINK' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {viewingResource.type === 'DOCUMENT' ? <File className="h-5 w-5" /> :
                 viewingResource.type === 'VIDEO' ? <Video className="h-5 w-5" /> :
                 viewingResource.type === 'LINK' ? <Link2 className="h-5 w-5" /> :
                 <FileText className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">{viewingResource.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    viewingResource.forWhom === 'LEARNER' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {viewingResource.forWhom === 'LEARNER' ? 'Learner' : 'Tutor'}
                  </span>
                  {viewingResource.fileName && (
                    <span className="text-xs text-textMuted">
                      {viewingResource.fileName}
                      {viewingResource.fileSize && ` (${(viewingResource.fileSize / 1024 / 1024).toFixed(2)} MB)`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[400px] max-h-[70vh] overflow-auto">
              {viewingResource.type === 'NOTE' ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-text font-sans">
                    {viewingResource.content || 'No content available'}
                  </pre>
                </div>
              ) : viewingResource.type === 'VIDEO' ? (
                <div className="w-full">
                  {viewingResource.url ? (
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={getProxyUrl(viewingResource.url, viewingResource.fileKey)}
                      crossOrigin="anonymous"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-center py-16 text-textMuted">
                      <Video className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Video URL not available</p>
                    </div>
                  )}
                </div>
              ) : viewingResource.type === 'LINK' ? (
                <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                  {viewingResource.url ? (
                    <iframe
                      src={viewingResource.url}
                      className="w-full h-full"
                      title={viewingResource.title}
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  ) : (
                    <div className="text-center py-16 text-textMuted">
                      <Link2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Link URL not available</p>
                    </div>
                  )}
                </div>
              ) : (
                // DOCUMENT type
                <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {viewingResource.url ? (
                    <>
                      {viewingResource.url.match(/\.(pdf)$/i) || viewingResource.mimeType?.includes('pdf') ? (
                        <iframe
                          src={getProxyUrl(viewingResource.url, viewingResource.fileKey)}
                          className="w-full h-full bg-white"
                          title={viewingResource.title}
                          onError={(e) => {
                            console.error('PDF load error:', e);
                          }}
                        />
                      ) : viewingResource.url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) || 
                            viewingResource.mimeType?.match(/^image\//) ? (
                        <div className="flex items-center justify-center h-full bg-gray-50 p-4 relative">
                          {!imageError ? (
                            <>
                              <img
                                src={getProxyUrl(viewingResource.url, viewingResource.fileKey)}
                                alt={viewingResource.title || 'Resource image'}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.error('Image load error:', viewingResource.url);
                                  setImageError(true);
                                }}
                                onLoad={() => {
                                  setImageError(false);
                                }}
                                style={{ maxHeight: 'calc(70vh - 100px)' }}
                              />
                              <div className="absolute top-2 right-2 z-10">
                                <a
                                  href={viewingResource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors"
                                  title="Open in new tab"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4 text-brand-600" />
                                </a>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <File className="h-16 w-16 text-gray-400 mb-4" />
                              <p className="text-textMuted mb-2">Failed to load image</p>
                              <p className="text-xs text-textMuted mb-4">The image may be blocked by CORS or the URL may be invalid</p>
                              <a
                                href={viewingResource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors inline-flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open in New Tab
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
                          <File className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-textMuted mb-4">Preview not available for this file type</p>
                          <a
                            href={viewingResource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors inline-flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open in New Tab
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 text-textMuted">
                      <File className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Document URL not available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {viewingResource.url && viewingResource.type !== 'NOTE' && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <a
                  href={viewingResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assignment Resource Modal */}
      <Modal
        isOpen={showAssignmentResourceModal}
        onClose={() => {
          setShowAssignmentResourceModal(false);
          setEditingAssignmentIndex(null);
          setEditingAssignmentResourceIndex(null);
          setAssignmentResourceFormData({
            type: 'DATASET',
            name: '',
            url: '',
            file: null,
          });
        }}
        title={editingAssignmentResourceIndex !== null ? 'Edit Assignment Resource' : 'Add Assignment Resource'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Resource Type <span className="text-red-500">*</span>
            </label>
            <select
              value={assignmentResourceFormData.type}
              onChange={(e) => setAssignmentResourceFormData({ ...assignmentResourceFormData, type: e.target.value, file: null, url: '' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
            >
              <option value="DATASET">Dataset</option>
              <option value="IMAGE">Image</option>
              <option value="SOURCE_FILE">Source File</option>
              <option value="GIT_REPO">Git Repository</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assignmentResourceFormData.name}
              onChange={(e) => setAssignmentResourceFormData({ ...assignmentResourceFormData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="Resource name"
            />
          </div>

          {assignmentResourceFormData.type === 'GIT_REPO' ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                Git Repository URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={assignmentResourceFormData.url}
                onChange={(e) => setAssignmentResourceFormData({ ...assignmentResourceFormData, url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                placeholder="https://github.com/username/repository"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">
                {editingAssignmentResourceIndex !== null && 
                 objective.assignments[editingAssignmentIndex]?.assignmentResources?.[editingAssignmentResourceIndex]?.fileName 
                  ? 'Uploaded File' 
                  : 'Upload File'}
              </label>
              {editingAssignmentResourceIndex !== null && 
               objective.assignments[editingAssignmentIndex]?.assignmentResources?.[editingAssignmentResourceIndex]?.fileName ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-900 truncate">
                      {objective.assignments[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex].fileName}
                    </p>
                    {objective.assignments[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex].fileSize && (
                      <p className="text-xs text-green-700 mt-0.5">
                        {(objective.assignments[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex].fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = [...(objective.assignments || [])];
                      updated[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex] = {
                        ...updated[editingAssignmentIndex].assignmentResources[editingAssignmentResourceIndex],
                        url: '',
                        fileKey: '',
                        fileName: '',
                        fileSize: '',
                        mimeType: '',
                      };
                      setObjective({ ...objective, assignments: updated });
                      setAssignmentResourceFormData({ ...assignmentResourceFormData, file: null });
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="assignment-resource-file-upload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) {
                          toast.error('File size must be less than 50MB');
                          return;
                        }
                        setAssignmentResourceFormData({ ...assignmentResourceFormData, file });
                      }
                    }}
                    className="hidden"
                    accept={
                      assignmentResourceFormData.type === 'IMAGE' 
                        ? '.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg'
                        : assignmentResourceFormData.type === 'SOURCE_FILE'
                        ? '.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.r,.sql,.html,.css,.json,.xml,.yaml,.yml'
                        : '.csv,.xlsx,.xls,.json,.xml,.sql,.db,.sqlite'
                    }
                    disabled={uploadingFiles.assignmentResource}
                  />
                  <label
                    htmlFor="assignment-resource-file-upload"
                    className={`flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      uploadingFiles.assignmentResource
                        ? 'border-brand-300 bg-brand-50 cursor-wait'
                        : assignmentResourceFormData.file
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-brand-50'
                    }`}
                  >
                    {uploadingFiles.assignmentResource ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                        <span className="text-sm font-medium text-brand-600">Uploading...</span>
                      </>
                    ) : assignmentResourceFormData.file ? (
                      <>
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{assignmentResourceFormData.file.name}</span>
                        <span className="text-xs text-green-600">
                          ({(assignmentResourceFormData.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-textMuted" />
                        <span className="text-sm font-medium text-text">Choose file or drag & drop</span>
                      </>
                    )}
                  </label>
                  <p className="text-xs text-textMuted mt-2 text-center">
                    {assignmentResourceFormData.type === 'IMAGE' 
                      ? 'Images: JPG, PNG, GIF, WEBP, BMP, SVG (Max 50MB)'
                      : assignmentResourceFormData.type === 'SOURCE_FILE'
                      ? 'Source Files: JS, TS, PY, Java, C++, etc. (Max 50MB)'
                      : 'Datasets: CSV, XLSX, JSON, SQL, etc. (Max 50MB)'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => {
                setShowAssignmentResourceModal(false);
                setEditingAssignmentIndex(null);
                setEditingAssignmentResourceIndex(null);
                setAssignmentResourceFormData({
                  type: 'DATASET',
                  name: '',
                  url: '',
                  file: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAssignmentResource}
              disabled={uploadingFiles.assignmentResource || !assignmentResourceFormData.name.trim()}
            >
              {uploadingFiles.assignmentResource ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingAssignmentResourceIndex !== null ? 'Update' : 'Add'} Resource
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

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
                  value={sessionFormData.name || ''}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Description</label>
                <textarea
                  name="description"
                  value={sessionFormData.description || ''}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Select Batch <span className="text-red-500">*</span>
                </label>
                <select
                  name="batchId"
                  value={sessionFormData.batchId || ''}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  required
                >
                  <option value="">Select Batch</option>
                  {availableBatches.map((batch) => (
                    <option key={batch.id || batch._id} value={batch.id || batch._id}>
                      {batch.name} {batch.startDate && batch.endDate ? 
                        `(${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()})` 
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Type</label>
                  <select
                    name="type"
                    value={sessionFormData.type || 'LIVE'}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, type: e.target.value })}
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
                    value={sessionFormData.status || 'SCHEDULED'}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Select Module <span className="text-red-500">*</span>
                </label>
                <select
                  name="moduleId"
                  value={sessionFormData.moduleId || ''}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  disabled={!sessionFormData.batchId}
                  required
                >
                  <option value="">Select Module</option>
                  {availableModules.map((mod) => (
                    <option key={mod.id || mod._id} value={mod.id || mod._id}>
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Modules List */}
              {subModules.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Sub-Modules
                  </label>
                  <div className="border border-brintelli-border rounded-lg p-3 bg-brintelli-baseAlt max-h-48 overflow-y-auto">
                    {subModules.map((subModule) => (
                      <div key={subModule.id || subModule._id} className="mb-3 last:mb-0">
                        <div className="font-medium text-sm text-text mb-1">{subModule.name}</div>
                        {subModule.description && (
                          <div className="text-xs text-textMuted mb-2">{subModule.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives List */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Select Learning Objective <span className="text-red-500">*</span>
                </label>
                <div className="border border-brintelli-border rounded-lg p-3 bg-brintelli-baseAlt max-h-64 overflow-y-auto">
                  {availableObjectives.length === 0 ? (
                    <div className="text-sm text-textMuted text-center py-4">
                      No learning objectives available for this module
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {subModules.length > 0 ? (
                        // Group by sub-module if sub-modules exist
                        subModules.map((subModule) => {
                          const subModuleObjectives = availableObjectives.filter(
                            obj => (obj.subModuleId) === (subModule.id || subModule._id)
                          );
                          if (subModuleObjectives.length === 0) return null;
                          
                          return (
                            <div key={subModule.id || subModule._id} className="mb-4 last:mb-0">
                              <div className="font-medium text-sm text-text mb-2">{subModule.name}</div>
                              <div className="space-y-1 pl-4">
                                {subModuleObjectives.map((obj) => {
                                  const isSelected = sessionFormData.objectiveId === (obj.id || obj._id);
                                  return (
                                    <label
                                      key={obj.id || obj._id}
                                      className="flex items-start gap-2 p-2 rounded hover:bg-brintelli-card cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name="objectiveId"
                                        value={obj.id || obj._id}
                                        checked={isSelected}
                                        onChange={(e) => setSessionFormData({ ...sessionFormData, objectiveId: e.target.value })}
                                        className="mt-1"
                                      />
                                      <div className="flex-1">
                                        <div className="text-sm text-text font-medium">
                                          {obj.title || obj.text}
                                        </div>
                                        {obj.description && (
                                          <div className="text-xs text-textMuted mt-0.5">
                                            {obj.description}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Flat list if no sub-modules
                        availableObjectives.map((obj) => {
                          const isSelected = sessionFormData.objectiveId === (obj.id || obj._id);
                          return (
                            <label
                              key={obj.id || obj._id}
                              className="flex items-start gap-2 p-2 rounded hover:bg-brintelli-card cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="objectiveId"
                                value={obj.id || obj._id}
                                checked={isSelected}
                                onChange={(e) => setSessionFormData({ ...sessionFormData, objectiveId: e.target.value })}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="text-sm text-text font-medium">
                                  {obj.title || obj.text}
                                </div>
                                {obj.description && (
                                  <div className="text-xs text-textMuted mt-0.5">
                                    {obj.description}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Scheduled Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={sessionFormData.scheduledDate || ''}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, scheduledDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={sessionFormData.duration || 60}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Assign Tutor <span className="text-red-500">*</span>
                </label>
                <select
                  name="tutorId"
                  value={sessionFormData.tutorId || ''}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, tutorId: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  disabled={!sessionFormData.moduleId}
                  required
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id || tutor._id} value={tutor.id || tutor._id}>
                      {tutor.fullName || tutor.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-textMuted mt-1">
                  Each module should be assigned to a tutor who will teach the learning objectives
                </p>
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleCreateSession}>
                Create Session
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowSessionModal(false);
                // Reset form
                setSessionFormData({
                  name: '',
                  description: '',
                  type: 'LIVE',
                  status: 'SCHEDULED',
                  scheduledDate: '',
                  duration: 60,
                  tutorId: '',
                  meetingLink: '',
                  recordingUrl: '',
                  batchId: '',
                  moduleId: '',
                  objectiveId: '',
                });
                setSessionMaterials([]);
                setNewMaterial({ type: '', url: '', title: '' });
                setAvailableModules([]);
                setAvailableObjectives([]);
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

export default ObjectiveDetails;

