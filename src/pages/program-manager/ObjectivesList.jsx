import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Plus, BookOpen, ArrowRight, Edit2, X, FileCheck, Target, HelpCircle, Eye, ChevronDown, ChevronUp, Code, Save, File as FileIcon, FileText, Video, Link2, ExternalLink, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { getProxyUrl } from '../../utils/s3Helper';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import programAPI from '../../api/program';
import uploadAPI from '../../api/upload';

const ObjectivesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { programId, moduleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [expandedObjectives, setExpandedObjectives] = useState(new Set());
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingObjective, setReviewingObjective] = useState(null);
  const [editingObjective, setEditingObjective] = useState(null);
  const [currentObjectiveData, setCurrentObjectiveData] = useState(null);
  const [objectiveFormData, setObjectiveFormData] = useState({
    title: '',
    description: '',
    minDuration: 0,
  });
  const [objectiveContent, setObjectiveContent] = useState({
    resources: [],
    assignments: [],
    practiceCodes: [],
    mcqQuestions: [],
  });
  const [savingObjective, setSavingObjective] = useState(false);
  const [unifiedContentType, setUnifiedContentType] = useState('resource');
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track upload progress per file
  const [viewingFile, setViewingFile] = useState(null); // Track which file is being viewed: { url, fileName, mimeType }

  useEffect(() => {
    loadModule();
  }, [moduleId, programId, location.key]);

  const loadModule = async () => {
    try {
      setLoading(true);
      // Load module details
      const moduleResponse = await programAPI.getModulesByProgram(programId);
      if (moduleResponse.success && moduleResponse.data.modules) {
        const foundModule = moduleResponse.data.modules.find(m => 
          (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
        );
        if (foundModule) {
          setModule(foundModule);
        }
      }
      
      // Load objectives from Objective collection
      try {
        const objectivesResponse = await programAPI.getObjectivesByModule(moduleId);
        if (objectivesResponse.success && objectivesResponse.data.objectives) {
          setObjectives(objectivesResponse.data.objectives);
          console.log('Loaded objectives from Objective collection:', objectivesResponse.data.objectives.length);
          objectivesResponse.data.objectives.forEach((obj, idx) => {
            console.log(`Objective ${idx + 1}:`, {
              id: obj.id,
              title: obj.title,
              description: obj.description,
              minDuration: obj.minDuration,
              resources: obj.resources?.length || 0,
              assignments: obj.assignments?.length || 0,
              practiceCodes: obj.practiceCodes?.length || 0,
              mcqQuestions: obj.mcqQuestions?.length || 0,
              resourcesData: obj.resources, // Log actual resources data
            });
          });
        } else {
          // Fallback to module objectives for backward compatibility
          if (moduleResponse.success && moduleResponse.data.modules) {
            const foundModule = moduleResponse.data.modules.find(m => 
              (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
            );
            if (foundModule && foundModule.objectives) {
              setObjectives(foundModule.objectives);
              console.log('Loaded objectives from module (fallback):', foundModule.objectives.length);
            }
          }
        }
      } catch (objError) {
        console.warn('Error loading objectives from Objective collection, using fallback:', objError);
        // Fallback to module objectives
        if (moduleResponse.success && moduleResponse.data.modules) {
          const foundModule = moduleResponse.data.modules.find(m => 
            (m.id || m._id) === moduleId || String(m.id || m._id) === String(moduleId)
          );
          if (foundModule && foundModule.objectives) {
            setObjectives(foundModule.objectives);
          }
        }
      }
    } catch (error) {
      console.error('Error loading module:', error);
      toast.error('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObjective = async (index) => {
    if (!window.confirm('Are you sure you want to delete this objective?')) return;

    const objectiveToDelete = objectives[index];
    if (!objectiveToDelete || !objectiveToDelete.id) {
      toast.error('Objective ID not found');
      return;
    }

    try {
      await programAPI.deleteObjective(objectiveToDelete.id);
      toast.success('Objective deleted');
      loadModule();
    } catch (error) {
      console.error('Error deleting objective:', error);
      toast.error('Failed to delete objective');
      loadModule(); // Reload on error
    }
  };

  const handleOpenObjectiveModal = (objective = null) => {
    if (objective) {
      setEditingObjective(objective);
      setCurrentObjectiveData(objective);
      setObjectiveFormData({
        title: objective.title || objective.text || '',
        description: objective.description || '',
        minDuration: objective.minDuration || 0,
      });
      setObjectiveContent({
        resources: objective.resources || [],
        assignments: objective.assignments || [],
        practiceCodes: objective.practiceCodes || [],
        mcqQuestions: objective.mcqQuestions || [],
      });
    } else {
      setEditingObjective(null);
      setCurrentObjectiveData(null);
      setObjectiveFormData({
        title: '',
        description: '',
        minDuration: 0,
      });
      setObjectiveContent({
        resources: [],
        assignments: [],
        practiceCodes: [],
        mcqQuestions: [],
      });
    }
    setShowObjectiveModal(true);
  };

  const handleOpenContentModal = (objective = null) => {
    // If objective is passed, use it; otherwise use editingObjective
    const objectiveToUse = objective || editingObjective;
    
    if (!objectiveToUse) {
      toast.error('Please select an objective first');
      return;
    }
    
    const objectiveId = objectiveToUse.id || objectiveToUse._id;
    if (!objectiveId) {
      toast.error('Please save the objective first before adding content');
      return;
    }
    
    // Set editingObjective if it wasn't already set
    if (!editingObjective || (editingObjective.id !== objectiveId && editingObjective._id !== objectiveId)) {
      setEditingObjective(objectiveToUse);
      setObjectiveContent({
        resources: objectiveToUse.resources || [],
        assignments: objectiveToUse.assignments || [],
        practiceCodes: objectiveToUse.practiceCodes || [],
        mcqQuestions: objectiveToUse.mcqQuestions || [],
      });
    }
    
    setShowContentModal(true);
  };

  const handleCloseContentModal = () => {
    setShowContentModal(false);
    setUnifiedContentType('resource');
  };

  // Content management handlers
  const handleAddResource = () => {
    const newResource = {
      type: 'DOCUMENT',
      forWhom: 'LEARNER',
      title: '',
      description: '',
      url: '',
      content: '',
      file: null,
      fileKey: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
    };
    setObjectiveContent({
      ...objectiveContent,
      resources: [...objectiveContent.resources, newResource]
    });
  };

  const handleDeleteResource = (index) => {
    const updated = objectiveContent.resources.filter((_, i) => i !== index);
    setObjectiveContent({ ...objectiveContent, resources: updated });
  };

  const handleUploadResourceFile = async (index, file) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const key = `resource-${index}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'program-resources');
      
      if (response.success) {
        const updated = [...objectiveContent.resources];
        updated[index] = {
          ...updated[index],
          url: response.data.url,
          fileKey: response.data.key,
          fileName: response.data.originalName,
          fileSize: response.data.size,
          mimeType: response.data.mimeType,
          file: null,
        };
        setObjectiveContent({ ...objectiveContent, resources: updated });
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAddAssignment = () => {
    const newAssignment = {
      name: '',
      description: '',
      problemStatement: '',
      instructions: '',
      difficulty: 'BEGINNER',
      maxMarks: 100,
      passingMarks: 50,
      resources: [], // Supporting data: datasets, images, etc.
      scoringRubric: [],
    };
    setObjectiveContent({
      ...objectiveContent,
      assignments: [...objectiveContent.assignments, newAssignment]
    });
  };

  const handleAddAssignmentResource = (assignmentIndex) => {
    const updated = [...objectiveContent.assignments];
    if (!updated[assignmentIndex].resources) {
      updated[assignmentIndex].resources = [];
    }
    updated[assignmentIndex].resources.push({
      type: 'DATASET', // DATASET, IMAGE, SOURCE_FILE, GIT_REPO
      title: '',
      description: '',
      url: '',
      file: null,
      fileKey: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
    });
    setObjectiveContent({ ...objectiveContent, assignments: updated });
  };

  const handleUploadAssignmentResource = async (assignmentIndex, resourceIndex, file) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const key = `assignment-${assignmentIndex}-resource-${resourceIndex}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'assignment-resources');
      
      if (response.success) {
        const updated = [...objectiveContent.assignments];
        updated[assignmentIndex].resources[resourceIndex] = {
          ...updated[assignmentIndex].resources[resourceIndex],
          url: response.data.url,
          fileKey: response.data.key,
          fileName: response.data.originalName,
          fileSize: response.data.size,
          mimeType: response.data.mimeType,
          file: null,
        };
        setObjectiveContent({ ...objectiveContent, assignments: updated });
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteAssignmentResource = (assignmentIndex, resourceIndex) => {
    const updated = [...objectiveContent.assignments];
    const resource = updated[assignmentIndex].resources[resourceIndex];
    if (resource.fileKey) {
      uploadAPI.deleteFile(resource.fileKey).catch(err => console.error('Error deleting file:', err));
    }
    updated[assignmentIndex].resources = updated[assignmentIndex].resources.filter((_, i) => i !== resourceIndex);
    setObjectiveContent({ ...objectiveContent, assignments: updated });
  };

  const handleDeleteAssignment = (index) => {
    const updated = objectiveContent.assignments.filter((_, i) => i !== index);
    setObjectiveContent({ ...objectiveContent, assignments: updated });
  };

  const handleAddPracticeCode = () => {
    const newPracticeCode = {
      problem: '',
      description: '',
      problemStatement: '',
      instructions: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      sampleInput: '',
      sampleOutput: '',
      explanation: '',
      testCases: [],
      difficulty: 'BEGINNER',
      language: '',
      timeLimit: 0, // seconds
      memoryLimit: 0, // MB
      starterCode: '',
      solution: '',
      tags: [],
    };
    setObjectiveContent({
      ...objectiveContent,
      practiceCodes: [...objectiveContent.practiceCodes, newPracticeCode]
    });
  };

  const handleAddTestCase = (practiceCodeIndex) => {
    const updated = [...objectiveContent.practiceCodes];
    if (!updated[practiceCodeIndex].testCases) {
      updated[practiceCodeIndex].testCases = [];
    }
    updated[practiceCodeIndex].testCases.push({
      input: '',
      expectedOutput: '',
      explanation: '',
      isSample: false,
      isHidden: false,
      marks: 0,
    });
    setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
  };

  const handleDeleteTestCase = (practiceCodeIndex, testCaseIndex) => {
    const updated = [...objectiveContent.practiceCodes];
    updated[practiceCodeIndex].testCases = updated[practiceCodeIndex].testCases.filter((_, i) => i !== testCaseIndex);
    setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
  };

  const handleDeletePracticeCode = (index) => {
    const updated = objectiveContent.practiceCodes.filter((_, i) => i !== index);
    setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
  };

  const handleAddMCQQuestion = () => {
    const newQuestion = {
      question: '',
      questionType: 'SINGLE_CHOICE', // SINGLE_CHOICE, MULTIPLE_CHOICE, ONE_WORD
      options: [
        { text: '', type: 'text', imageUrl: '', imageKey: '' },
        { text: '', type: 'text', imageUrl: '', imageKey: '' },
        { text: '', type: 'text', imageUrl: '', imageKey: '' },
        { text: '', type: 'text', imageUrl: '', imageKey: '' },
      ],
      correctAnswer: '', // For SINGLE_CHOICE
      correctAnswers: [], // For MULTIPLE_CHOICE
      questionImage: null, // For image questions
      questionImageUrl: '',
      questionImageKey: '',
      explanation: '',
    };
    setObjectiveContent({
      ...objectiveContent,
      mcqQuestions: [...objectiveContent.mcqQuestions, newQuestion]
    });
  };

  const handleUploadMCQImage = async (mcqIndex, imageType, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const key = `mcq-${mcqIndex}-${imageType}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'mcq-images');
      
      if (response.success) {
        const updated = [...objectiveContent.mcqQuestions];
        if (imageType === 'question') {
          updated[mcqIndex].questionImageUrl = response.data.url;
          updated[mcqIndex].questionImageKey = response.data.key;
          updated[mcqIndex].questionImage = null;
        } else if (imageType === 'answer') {
          updated[mcqIndex].correctAnswerImageUrl = response.data.url;
          updated[mcqIndex].correctAnswerImageKey = response.data.key;
          updated[mcqIndex].correctAnswerImage = null;
        }
        setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleUploadMCQOptionImage = async (mcqIndex, optionIndex, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const optionId = `${mcqIndex}-${optionIndex}`;
    const key = `mcq-option-${optionId}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'mcq-images');
      
      if (response.success) {
        const updated = [...objectiveContent.mcqQuestions];
        if (!updated[mcqIndex].options) updated[mcqIndex].options = [];
        if (typeof updated[mcqIndex].options[optionIndex] !== 'object') {
          updated[mcqIndex].options[optionIndex] = { 
            text: updated[mcqIndex].options[optionIndex] || '', 
            type: 'image', 
            imageUrl: '', 
            imageKey: '' 
          };
        }
        updated[mcqIndex].options[optionIndex].imageUrl = response.data.url;
        updated[mcqIndex].options[optionIndex].imageKey = response.data.key;
        updated[mcqIndex].options[optionIndex].type = 'image';
        setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
        toast.success('Option image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading option image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteMCQQuestion = (index) => {
    const updated = objectiveContent.mcqQuestions.filter((_, i) => i !== index);
    setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
  };

  const handleSaveContent = async () => {
    // Try to get objective ID from editingObjective first
    let objectiveId = editingObjective?.id || editingObjective?._id;
    
    // If not found, try to find it in the objectives list
    if (!objectiveId && editingObjective) {
      const foundObjective = objectives.find(obj => 
        (obj.id === editingObjective.id || obj._id === editingObjective._id) ||
        (obj.title === editingObjective.title && obj.text === editingObjective.text)
      );
      if (foundObjective) {
        objectiveId = foundObjective.id || foundObjective._id;
        // Update editingObjective with the found objective
        setEditingObjective(foundObjective);
      }
    }
    
    // Debug logging
    console.log('Saving content for objective:', {
      editingObjective,
      objectiveId,
      hasId: !!editingObjective?.id,
      has_id: !!editingObjective?._id,
      resourcesCount: objectiveContent.resources?.length || 0,
      objectivesListLength: objectives.length,
    });
    
    if (!editingObjective || !objectiveId) {
      console.error('Cannot save content: objective or ID missing', {
        editingObjective,
        objectiveId,
        availableObjectives: objectives.map(obj => ({ id: obj.id, _id: obj._id, title: obj.title })),
      });
      toast.error('Please save the objective first before adding content. Make sure the objective has been saved.');
      return;
    }

    setSavingObjective(true);
    try {

      // Save resources
      for (const resource of objectiveContent.resources || []) {
        try {
          if (resource.id || resource._id) {
            // Update existing resource
            await programAPI.updateResource(resource.id || resource._id, {
              type: resource.type,
              forWhom: resource.forWhom,
              title: resource.title,
              url: resource.url || '',
              content: resource.content || '',
              fileKey: resource.fileKey || '',
              fileName: resource.fileName || '',
              fileSize: resource.fileSize || 0,
              mimeType: resource.mimeType || '',
            });
          } else {
            // Create new resource
            await programAPI.createResource(objectiveId, {
              type: resource.type,
              forWhom: resource.forWhom,
              title: resource.title,
              url: resource.url || '',
              content: resource.content || '',
              fileKey: resource.fileKey || '',
              fileName: resource.fileName || '',
              fileSize: resource.fileSize || 0,
              mimeType: resource.mimeType || '',
            });
          }
        } catch (error) {
          console.error('Error saving resource:', error);
          // Continue with other resources even if one fails
        }
      }

      // Save assignments
      for (const assignment of objectiveContent.assignments || []) {
        try {
          if (assignment.id || assignment._id) {
            // Update existing assignment
            await programAPI.updateObjectiveAssignment(assignment.id || assignment._id, {
              name: assignment.name,
              description: assignment.description,
              problemStatement: assignment.problemStatement,
              instructions: assignment.instructions,
              difficulty: assignment.difficulty,
              maxMarks: assignment.maxMarks,
              passingMarks: assignment.passingMarks,
              resources: assignment.resources || [],
              scoringRubric: assignment.scoringRubric || [],
            });
          } else {
            // Create new assignment
            await programAPI.createObjectiveAssignment(objectiveId, {
              name: assignment.name,
              description: assignment.description,
              problemStatement: assignment.problemStatement,
              instructions: assignment.instructions,
              difficulty: assignment.difficulty,
              maxMarks: assignment.maxMarks,
              passingMarks: assignment.passingMarks,
              resources: assignment.resources || [],
              scoringRubric: assignment.scoringRubric || [],
            });
          }
        } catch (error) {
          console.error('Error saving assignment:', error);
          // Continue with other assignments even if one fails
        }
      }

      // Save practice codes
      for (const practiceCode of objectiveContent.practiceCodes || []) {
        try {
          if (practiceCode.id || practiceCode._id) {
            // Update existing practice code
            await programAPI.updatePracticeCode(practiceCode.id || practiceCode._id, {
              problem: practiceCode.problem,
              description: practiceCode.description,
              testCases: practiceCode.testCases || [],
              instructions: practiceCode.instructions,
              difficulty: practiceCode.difficulty,
              language: practiceCode.language,
              starterCode: practiceCode.starterCode,
              solution: practiceCode.solution,
            });
          } else {
            // Create new practice code
            await programAPI.createPracticeCode(objectiveId, {
              problem: practiceCode.problem,
              description: practiceCode.description,
              testCases: practiceCode.testCases || [],
              instructions: practiceCode.instructions,
              difficulty: practiceCode.difficulty,
              language: practiceCode.language,
              starterCode: practiceCode.starterCode,
              solution: practiceCode.solution,
            });
          }
        } catch (error) {
          console.error('Error saving practice code:', error);
          // Continue with other practice codes even if one fails
        }
      }

      // Save MCQs
      for (const mcq of objectiveContent.mcqQuestions || []) {
        try {
          // Normalize options - convert to array of objects if needed
          let normalizedOptions = [];
          if (mcq.options && Array.isArray(mcq.options)) {
            normalizedOptions = mcq.options.map(opt => {
              if (typeof opt === 'string') {
                return { text: opt, type: 'text', imageUrl: '', imageKey: '' };
              }
              return {
                text: opt.text || '',
                type: opt.type || 'text',
                imageUrl: opt.imageUrl || '',
                imageKey: opt.imageKey || '',
              };
            });
          }

          const mcqData = {
            question: mcq.question || '',
            questionType: mcq.questionType || 'SINGLE_CHOICE',
            options: normalizedOptions,
            correctAnswer: mcq.questionType === 'MULTIPLE_CHOICE' ? '' : (mcq.correctAnswer || ''),
            correctAnswers: mcq.questionType === 'MULTIPLE_CHOICE' ? (mcq.correctAnswers || []) : [],
            imageUrl: mcq.questionImageUrl || '',
            imageKey: mcq.questionImageKey || '',
            explanation: mcq.explanation || '',
          };

          if (mcq.id || mcq._id) {
            // Update existing MCQ
            await programAPI.updateMCQ(mcq.id || mcq._id, mcqData);
          } else {
            // Create new MCQ
            await programAPI.createMCQ(objectiveId, mcqData);
          }
        } catch (error) {
          console.error('Error saving MCQ:', error);
          // Continue with other MCQs even if one fails
        }
      }

      toast.success('Content saved successfully');
      
      // Reload objectives to show updated content
      await loadModule();
      
      // Update editingObjective with fresh data if it exists
      if (editingObjective) {
        const refreshedObjectives = await programAPI.getObjectivesByModule(moduleId);
        if (refreshedObjectives.success && refreshedObjectives.data.objectives) {
          const refreshedObjective = refreshedObjectives.data.objectives.find(
            obj => (obj.id || obj._id) === objectiveId
          );
          if (refreshedObjective) {
            setEditingObjective(refreshedObjective);
            setObjectiveContent({
              resources: refreshedObjective.resources || [],
              assignments: refreshedObjective.assignments || [],
              practiceCodes: refreshedObjective.practiceCodes || [],
              mcqQuestions: refreshedObjective.mcqQuestions || [],
            });
          }
        }
      }
      
      handleCloseContentModal();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save some content. Please try again.');
    } finally {
      setSavingObjective(false);
    }
  };

  const handleCloseObjectiveModal = () => {
    setShowObjectiveModal(false);
    // Don't clear editingObjective if content modal is open or might be opened
    // This allows users to save objective and then manage content
    if (!showContentModal) {
      setEditingObjective(null);
      setCurrentObjectiveData(null);
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingObjective(null);
    setObjectiveFormData({
      title: '',
      description: '',
      minDuration: 0,
    });
      setObjectiveContent({
        resources: [],
        assignments: [],
        practiceCodes: [],
        mcqQuestions: [],
      });
  };

  const handleSaveObjective = async () => {
    if (!objectiveFormData.title.trim()) {
      toast.error('Objective title is required');
      return;
    }

    setSavingObjective(true);
    try {
      const objectiveData = {
        title: objectiveFormData.title,
        description: objectiveFormData.description,
        text: objectiveFormData.title, // Keep for backward compatibility
        minDuration: parseFloat(objectiveFormData.minDuration) || 0,
        order: editingObjective ? editingObjective.order : objectives.length,
        // Note: resources, assignments, practiceCodes, and mcqQuestions are now managed
        // separately via the content modal and saved through their respective API endpoints
      };

      const objectiveId = editingObjective?.id || editingObjective?._id;
      let savedObjective = null;
      
      if (editingObjective && objectiveId) {
        // Update existing objective
        const response = await programAPI.updateObjective(objectiveId, objectiveData);
        if (response.success && response.data?.objective) {
          savedObjective = response.data.objective;
          // Update editingObjective with the saved objective data (preserve for content modal)
          setEditingObjective({
            ...savedObjective,
            id: savedObjective.id || savedObjective._id,
            _id: savedObjective._id || savedObjective.id,
          });
        }
        toast.success('Objective updated successfully');
      } else {
        // Create new objective
        const response = await programAPI.createObjective(moduleId, objectiveData);
        if (response.success && response.data?.objective) {
          savedObjective = response.data.objective;
          // Set editingObjective with the newly created objective (including its ID)
          setEditingObjective({
            ...savedObjective,
            id: savedObjective.id || savedObjective._id,
            _id: savedObjective._id || savedObjective.id,
          });
        }
        toast.success('Objective created successfully');
      }

      // Don't close modal immediately - let user manage content if they want
      // handleCloseObjectiveModal();
      // await loadModule();
      
      // Instead, just reload the objectives list but keep modal open
      await loadModule();
      
      // If objective was saved, update the form with the saved data
      if (savedObjective) {
        setObjectiveFormData({
          title: savedObjective.title || savedObjective.text || '',
          description: savedObjective.description || '',
          minDuration: savedObjective.minDuration || 0,
        });
      }
    } catch (error) {
      console.error('Error saving objective:', error);
      toast.error(error.message || 'Failed to save objective');
    } finally {
      setSavingObjective(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-textMuted">Loading objectives...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={`Learning Objectives - ${module?.name || 'Module'}`}
        description="Manage learning objectives for this module"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(`/program-manager/programs/${programId}/modules/${moduleId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
            <Button
              variant="primary"
              onClick={() => handleOpenObjectiveModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Objective
            </Button>
          </div>
        }
      />

      <div className="rounded-3xl border border-gray-200 bg-white shadow-card p-8">
        {objectives.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-text mb-2">No learning objectives yet</p>
            <p className="text-sm text-textMuted mb-6">
              Start by adding your first learning objective
            </p>
            <Button
              variant="primary"
              onClick={() => handleOpenObjectiveModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Objective
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {objectives.map((objective, index) => (
              <div
                key={objective.id || objective._id || index}
                className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 hover:border-brand-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-bold shadow-sm">
                        Objective {index + 1}
                      </span>
                      {objective.minDuration > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          ⏱️ {objective.minDuration}h
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{objective.title || objective.text || 'Untitled Objective'}</h3>
                    {objective.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">{objective.description}</p>
                    )}
                    {!objective.description && objective.text && objective.text !== objective.title && (
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm">{objective.text}</p>
                    )}
                    
                    {/* Content Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className={`p-3 rounded-lg border-2 ${objective.resources?.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className={`h-4 w-4 ${objective.resources?.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-semibold ${objective.resources?.length > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                            Resources
                          </span>
                        </div>
                        <p className={`text-lg font-bold ${objective.resources?.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {objective.resources?.length || 0}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${objective.assignments?.length > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <FileCheck className={`h-4 w-4 ${objective.assignments?.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-semibold ${objective.assignments?.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                            Assignments
                          </span>
                        </div>
                        <p className={`text-lg font-bold ${objective.assignments?.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {objective.assignments?.length || 0}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${objective.practiceCodes?.length > 0 ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Code className={`h-4 w-4 ${objective.practiceCodes?.length > 0 ? 'text-indigo-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-semibold ${objective.practiceCodes?.length > 0 ? 'text-indigo-700' : 'text-gray-500'}`}>
                            Practice Codes
                          </span>
                        </div>
                        <p className={`text-lg font-bold ${objective.practiceCodes?.length > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                          {objective.practiceCodes?.length || 0}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg border-2 ${objective.mcqQuestions?.length > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <HelpCircle className={`h-4 w-4 ${objective.mcqQuestions?.length > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
                          <span className={`text-xs font-semibold ${objective.mcqQuestions?.length > 0 ? 'text-orange-700' : 'text-gray-500'}`}>
                            MCQs
                          </span>
                        </div>
                        <p className={`text-lg font-bold ${objective.mcqQuestions?.length > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {objective.mcqQuestions?.length || 0}
                        </p>
                      </div>
                    </div>
                    {/* Expandable Content View */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newExpanded = new Set(expandedObjectives);
                        if (newExpanded.has(index)) {
                          newExpanded.delete(index);
                        } else {
                          newExpanded.add(index);
                        }
                        setExpandedObjectives(newExpanded);
                      }}
                      className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                    >
                      {expandedObjectives.has(index) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Content
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          View Content
                        </>
                      )}
                    </Button>
                    {expandedObjectives.has(index) && (
                      <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-6">
                        {/* Resources */}
                        {objective.resources && objective.resources.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h5 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                              Resources ({objective.resources.length})
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {objective.resources.map((resource, resIdx) => {
                                const getResourceIcon = () => {
                                  switch (resource.type) {
                                    case 'DOCUMENT':
                                      return <FileIcon className="h-5 w-5 text-blue-600" />;
                                    case 'VIDEO':
                                      return <Video className="h-5 w-5 text-red-600" />;
                                    case 'LINK':
                                      return <Link2 className="h-5 w-5 text-green-600" />;
                                    case 'NOTE':
                                      return <FileText className="h-5 w-5 text-purple-600" />;
                                    default:
                                      return <FileIcon className="h-5 w-5 text-gray-600" />;
                                  }
                                };
                                
                                return (
                                  <div key={resIdx} className="bg-white rounded-lg p-3 border border-blue-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getResourceIcon()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 mb-1 truncate">
                                          {resource.title || resource.fileName || 'Untitled Resource'}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                            {resource.type || 'DOCUMENT'}
                                          </span>
                                          {resource.fileName && (
                                            <span className="text-xs text-gray-500 truncate">
                                              {resource.fileName}
                                            </span>
                                          )}
                                          {resource.fileSize && (
                                            <span className="text-xs text-gray-500">
                                              {(resource.fileSize / 1024).toFixed(1)} KB
                                            </span>
                                          )}
                                        </div>
                                        {resource.url && (
                                          <a 
                                            href={resource.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                                          >
                                            <ExternalLink className="h-3 w-3" />
                                            View Resource
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {/* Assignments */}
                        {objective.assignments && objective.assignments.length > 0 && (
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h5 className="text-base font-bold text-green-900 mb-3 flex items-center gap-2">
                              <FileCheck className="h-5 w-5 text-green-600" />
                              Assignments ({objective.assignments.length})
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {objective.assignments.map((assignment, assIdx) => (
                                <div key={assIdx} className="bg-white rounded-lg p-3 border border-green-200">
                                  <p className="font-semibold text-sm text-gray-900 mb-1">
                                    {assignment.name || 'Untitled Assignment'}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                      {assignment.difficulty || 'N/A'}
                                    </span>
                                    {assignment.maxMarks && (
                                      <span className="text-xs text-gray-600">
                                        Max: {assignment.maxMarks} marks
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Practice Codes */}
                        {objective.practiceCodes && objective.practiceCodes.length > 0 && (
                          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <h5 className="text-base font-bold text-indigo-900 mb-3 flex items-center gap-2">
                              <Code className="h-5 w-5 text-indigo-600" />
                              Practice Codes ({objective.practiceCodes.length})
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {objective.practiceCodes.map((practiceCode, pcIdx) => (
                                <div key={pcIdx} className="bg-white rounded-lg p-3 border border-indigo-200">
                                  <p className="font-semibold text-sm text-gray-900 mb-1">
                                    {practiceCode.problem || 'Untitled Practice Code'}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                      {practiceCode.language || 'Any'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                      {practiceCode.difficulty || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* MCQ Questions */}
                        {objective.mcqQuestions && objective.mcqQuestions.length > 0 && (
                          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <h5 className="text-base font-bold text-orange-900 mb-3 flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-orange-600" />
                              MCQ Questions ({objective.mcqQuestions.length})
                            </h5>
                            <div className="space-y-3">
                              {objective.mcqQuestions.map((mcq, mcqIdx) => (
                                <div key={mcqIdx} className="bg-white rounded-lg p-4 border border-orange-200">
                                  <div className="flex items-start gap-3 mb-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                                      {mcqIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm text-gray-900 mb-2">
                                        {mcq.question || 'Untitled Question'}
                                      </p>
                                      {mcq.questionType && (
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 mr-2">
                                          {mcq.questionType === 'SINGLE_CHOICE' ? 'Single Choice' : 
                                           mcq.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 
                                           'One Word'}
                                        </span>
                                      )}
                                      {mcq.options && mcq.options.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          <p className="text-xs font-medium text-gray-600 mb-1">Options:</p>
                                          {mcq.options.slice(0, 4).map((opt, optIdx) => (
                                            <div key={optIdx} className="text-xs text-gray-600 flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                              {typeof opt === 'object' ? (opt.text || 'Option') : opt}
                                              {typeof opt === 'object' && opt.type === 'image' && opt.imageUrl && (
                                                <span className="text-blue-600">(Image)</span>
                                              )}
                                            </div>
                                          ))}
                                          {mcq.options.length > 4 && (
                                            <p className="text-xs text-gray-500">+{mcq.options.length - 4} more options</p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(!objective.resources || objective.resources.length === 0) &&
                         (!objective.assignments || objective.assignments.length === 0) &&
                         (!objective.practiceCodes || objective.practiceCodes.length === 0) &&
                         (!objective.mcqQuestions || objective.mcqQuestions.length === 0) && (
                          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-600 mb-1">No content added yet</p>
                            <p className="text-xs text-gray-500 mb-4">Click "Content" button to add resources, assignments, practice codes, or MCQs</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenContentModal(objective)}
                              className="text-brand-600 hover:text-brand-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Content
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReviewingObjective(objective);
                        setShowReviewModal(true);
                      }}
                      className="text-text hover:text-brand-600"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenObjectiveModal(objective)}
                      className="text-text hover:text-brand-600"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const objId = objective.id || objective._id;
                        if (objId) {
                          navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives/${objId}/content`);
                        } else {
                          toast.error('Please save the objective first');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Manage Content"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Content
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteObjective(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Objective Modal */}
      <Modal
        isOpen={showObjectiveModal}
        onClose={handleCloseObjectiveModal}
        title={editingObjective ? 'Edit Objective' : 'Add Objective'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Objective Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={objectiveFormData.title}
              onChange={(e) => setObjectiveFormData({ ...objectiveFormData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              placeholder="Enter objective title..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Description
            </label>
            <textarea
              value={objectiveFormData.description}
              onChange={(e) => setObjectiveFormData({ ...objectiveFormData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all resize-none"
              rows={4}
              placeholder="Enter objective description..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-text">
              Duration (hours)
            </label>
            <input
              type="number"
              value={objectiveFormData.minDuration}
              onChange={(e) => setObjectiveFormData({ ...objectiveFormData, minDuration: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
              min="0"
              step="0.5"
              placeholder="0"
            />
            <p className="text-xs text-textMuted">Estimated time to complete this objective</p>
          </div>

          {editingObjective && (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  const objId = editingObjective?.id || editingObjective?._id;
                  if (objId) {
                    navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives/${objId}/content`);
                  } else {
                    toast.error('Please save the objective first');
                  }
                }}
                className="w-full"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Content (Resources, Assignments, Practice Codes, MCQ)
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleCloseObjectiveModal}
              disabled={savingObjective}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveObjective}
              disabled={savingObjective}
            >
              {savingObjective ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingObjective ? 'Update' : 'Create'} Objective
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Content Management Modal */}
      <Modal
        isOpen={showContentModal}
        onClose={handleCloseContentModal}
        title="Manage Content"
        size="xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Content Type Selector */}
          <div className="flex gap-2 border-b pb-4 flex-wrap">
            <Button
              variant={unifiedContentType === 'resource' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUnifiedContentType('resource')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Resources ({objectiveContent.resources?.length || 0})
            </Button>
            <Button
              variant={unifiedContentType === 'assignment' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUnifiedContentType('assignment')}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Assignments ({objectiveContent.assignments?.length || 0})
            </Button>
            <Button
              variant={unifiedContentType === 'practiceCode' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUnifiedContentType('practiceCode')}
            >
              <Code className="h-4 w-4 mr-2" />
              Practice Codes ({objectiveContent.practiceCodes?.length || 0})
            </Button>
            <Button
              variant={unifiedContentType === 'mcq' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUnifiedContentType('mcq')}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              MCQ ({objectiveContent.mcqQuestions?.length || 0})
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
              {(!objectiveContent.resources || objectiveContent.resources.length === 0) ? (
                <p className="text-textMuted text-center py-8">No resources added yet</p>
              ) : (
                <div className="space-y-4">
                  {objectiveContent.resources.map((resource, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {resource.type === 'DOCUMENT' && <FileIcon className="h-5 w-5 text-blue-600" />}
                        {resource.type === 'VIDEO' && <Video className="h-5 w-5 text-red-600" />}
                        {resource.type === 'LINK' && <Link2 className="h-5 w-5 text-green-600" />}
                        {resource.type === 'NOTE' && <FileText className="h-5 w-5 text-purple-600" />}
                        <input
                          type="text"
                          value={resource.title || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.resources];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setObjectiveContent({ ...objectiveContent, resources: updated });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Resource name/title..."
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(index)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <textarea
                        value={resource.description || ''}
                        onChange={(e) => {
                          const updated = [...objectiveContent.resources];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setObjectiveContent({ ...objectiveContent, resources: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                        placeholder="Description..."
                      />

                      <select
                        value={resource.type || 'DOCUMENT'}
                        onChange={(e) => {
                          const updated = [...objectiveContent.resources];
                          updated[index] = { ...updated[index], type: e.target.value };
                          setObjectiveContent({ ...objectiveContent, resources: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="DOCUMENT">Document</option>
                        <option value="VIDEO">Video</option>
                        <option value="LINK">Link</option>
                        <option value="NOTE">Note</option>
                      </select>

                      {/* File Upload for DOCUMENT and VIDEO */}
                      {(resource.type === 'DOCUMENT' || resource.type === 'VIDEO') && (
                        <div className="space-y-2">
                          {resource.fileName ? (
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <div className="flex items-center gap-2 flex-1">
                                <FileIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{resource.fileName}</span>
                                <span className="text-xs text-textMuted">({(resource.fileSize / 1024).toFixed(2)} KB)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {(resource.url || resource.fileKey) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const fileUrl = resource.fileKey 
                                        ? getProxyUrl(null, resource.fileKey)
                                        : (resource.url || getProxyUrl(resource.url));
                                      setViewingFile({
                                        url: fileUrl,
                                        fileName: resource.fileName || 'File',
                                        mimeType: resource.mimeType || ''
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="View file"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...objectiveContent.resources];
                                    updated[index] = {
                                      ...updated[index],
                                      fileName: '',
                                      fileKey: '',
                                      url: '',
                                      fileSize: 0,
                                      mimeType: '',
                                    };
                                    setObjectiveContent({ ...objectiveContent, resources: updated });
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remove file"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                id={`resource-file-${index}`}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleUploadResourceFile(index, file);
                                    e.target.value = '';
                                  }
                                }}
                                className="hidden"
                                accept={resource.type === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip'}
                                disabled={uploadingFiles[`resource-${index}`]}
                              />
                              <label
                                htmlFor={`resource-file-${index}`}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                              >
                                {uploadingFiles[`resource-${index}`] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4" />
                                    Upload {resource.type === 'VIDEO' ? 'Video' : 'Document'}
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {/* URL Input for LINK */}
                      {resource.type === 'LINK' && (
                        <input
                          type="url"
                          value={resource.url || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.resources];
                            updated[index] = { ...updated[index], url: e.target.value };
                            setObjectiveContent({ ...objectiveContent, resources: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Enter URL..."
                        />
                      )}

                      {/* Content Input for NOTE */}
                      {resource.type === 'NOTE' && (
                        <textarea
                          value={resource.content || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.resources];
                            updated[index] = { ...updated[index], content: e.target.value };
                            setObjectiveContent({ ...objectiveContent, resources: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={4}
                          placeholder="Note content..."
                        />
                      )}
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
              {(!objectiveContent.assignments || objectiveContent.assignments.length === 0) ? (
                <p className="text-textMuted text-center py-8">No assignments added yet</p>
              ) : (
                <div className="space-y-4">
                  {objectiveContent.assignments.map((assignment, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={assignment.name || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.assignments];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setObjectiveContent({ ...objectiveContent, assignments: updated });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Assignment name..."
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(index)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <textarea
                        value={assignment.description || ''}
                        onChange={(e) => {
                          const updated = [...objectiveContent.assignments];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setObjectiveContent({ ...objectiveContent, assignments: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                        placeholder="Assignment description..."
                      />

                      <textarea
                        value={assignment.problemStatement || ''}
                        onChange={(e) => {
                          const updated = [...objectiveContent.assignments];
                          updated[index] = { ...updated[index], problemStatement: e.target.value };
                          setObjectiveContent({ ...objectiveContent, assignments: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={4}
                        placeholder="Problem statement..."
                      />

                      <textarea
                        value={assignment.instructions || ''}
                        onChange={(e) => {
                          const updated = [...objectiveContent.assignments];
                          updated[index] = { ...updated[index], instructions: e.target.value };
                          setObjectiveContent({ ...objectiveContent, assignments: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                        placeholder="Instructions..."
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={assignment.difficulty || 'BEGINNER'}
                          onChange={(e) => {
                            const updated = [...objectiveContent.assignments];
                            updated[index] = { ...updated[index], difficulty: e.target.value };
                            setObjectiveContent({ ...objectiveContent, assignments: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                        <input
                          type="number"
                          value={assignment.maxMarks || 100}
                          onChange={(e) => {
                            const updated = [...objectiveContent.assignments];
                            updated[index] = { ...updated[index], maxMarks: parseInt(e.target.value) || 100 };
                            setObjectiveContent({ ...objectiveContent, assignments: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Max marks"
                        />
                      </div>

                      {/* Supporting Data Section */}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold">Supporting Data (Datasets, Images, etc.)</label>
                          <Button variant="ghost" size="sm" onClick={() => handleAddAssignmentResource(index)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        {assignment.resources && assignment.resources.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {assignment.resources.map((resource, resIndex) => (
                              <div key={resIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                <select
                                  value={resource.type || 'DATASET'}
                                  onChange={(e) => {
                                    const updated = [...objectiveContent.assignments];
                                    updated[index].resources[resIndex].type = e.target.value;
                                    setObjectiveContent({ ...objectiveContent, assignments: updated });
                                  }}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                                >
                                  <option value="DATASET">Dataset</option>
                                  <option value="IMAGE">Image</option>
                                  <option value="SOURCE_FILE">Source File</option>
                                  <option value="GIT_REPO">Git Repo</option>
                                </select>
                                <input
                                  type="text"
                                  value={resource.title || ''}
                                  onChange={(e) => {
                                    const updated = [...objectiveContent.assignments];
                                    updated[index].resources[resIndex].title = e.target.value;
                                    setObjectiveContent({ ...objectiveContent, assignments: updated });
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                  placeholder="Title..."
                                />
                                {resource.type === 'GIT_REPO' ? (
                                  <input
                                    type="url"
                                    value={resource.url || ''}
                                    onChange={(e) => {
                                      const updated = [...objectiveContent.assignments];
                                      updated[index].resources[resIndex].url = e.target.value;
                                      setObjectiveContent({ ...objectiveContent, assignments: updated });
                                    }}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="Git URL..."
                                  />
                                ) : (
                                  <>
                                    {resource.fileName ? (
                                      <div className="flex items-center gap-2 flex-1">
                                        <span className="text-xs text-textMuted flex-1">{resource.fileName}</span>
                                        {(resource.url || resource.fileKey) && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const fileUrl = resource.fileKey 
                                                ? getProxyUrl(null, resource.fileKey)
                                                : (resource.url || getProxyUrl(resource.url));
                                              setViewingFile({
                                                url: fileUrl,
                                                fileName: resource.fileName || 'File',
                                                mimeType: resource.mimeType || ''
                                              });
                                            }}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                            title="View file"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      <>
                                        <input
                                          type="file"
                                          id={`assignment-${index}-resource-${resIndex}`}
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              handleUploadAssignmentResource(index, resIndex, file);
                                              e.target.value = '';
                                            }
                                          }}
                                          className="hidden"
                                          accept={resource.type === 'IMAGE' ? 'image/*' : '*'}
                                        />
                                        <label
                                          htmlFor={`assignment-${index}-resource-${resIndex}`}
                                          className="px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-100"
                                        >
                                          {uploadingFiles[`assignment-${index}-resource-${resIndex}`] ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Upload className="h-3 w-3" />
                                          )}
                                        </label>
                                      </>
                                    )}
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAssignmentResource(index, resIndex)}
                                >
                                  <X className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
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
                <Button variant="primary" size="sm" onClick={handleAddPracticeCode}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Practice Code
                </Button>
              </div>
              {(!objectiveContent.practiceCodes || objectiveContent.practiceCodes.length === 0) ? (
                <p className="text-textMuted text-center py-8">No practice codes added yet</p>
              ) : (
                <div className="space-y-3">
                  {objectiveContent.practiceCodes.map((practiceCode, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={practiceCode.problem || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.practiceCodes];
                            updated[index] = { ...updated[index], problem: e.target.value };
                            setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Problem title..."
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePracticeCode(index)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={practiceCode.difficulty || 'BEGINNER'}
                          onChange={(e) => {
                            const updated = [...objectiveContent.practiceCodes];
                            updated[index] = { ...updated[index], difficulty: e.target.value };
                            setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                        <input
                          type="text"
                          value={practiceCode.language || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.practiceCodes];
                            updated[index] = { ...updated[index], language: e.target.value };
                            setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Language (e.g., Python, Java, C++)..."
                        />
                      </div>

                      {/* Problem Description - HackerRank Style */}
                      <div className="space-y-3 mt-4">
                        <div>
                          <label className="text-xs font-semibold mb-1 block">Problem Statement</label>
                          <textarea
                            value={practiceCode.problemStatement || practiceCode.description || ''}
                            onChange={(e) => {
                              const updated = [...objectiveContent.practiceCodes];
                              updated[index] = { 
                                ...updated[index], 
                                problemStatement: e.target.value,
                                description: e.target.value 
                              };
                              setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={4}
                            placeholder="Describe the problem in detail..."
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold mb-1 block">Instructions</label>
                          <textarea
                            value={practiceCode.instructions || ''}
                            onChange={(e) => {
                              const updated = [...objectiveContent.practiceCodes];
                              updated[index] = { ...updated[index], instructions: e.target.value };
                              setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                            placeholder="Provide instructions for solving the problem..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Input Format</label>
                            <textarea
                              value={practiceCode.inputFormat || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], inputFormat: e.target.value };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="Describe input format..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Output Format</label>
                            <textarea
                              value={practiceCode.outputFormat || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], outputFormat: e.target.value };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              rows={2}
                              placeholder="Describe output format..."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold mb-1 block">Constraints</label>
                          <textarea
                            value={practiceCode.constraints || ''}
                            onChange={(e) => {
                              const updated = [...objectiveContent.practiceCodes];
                              updated[index] = { ...updated[index], constraints: e.target.value };
                              setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={2}
                            placeholder="e.g., 1 ≤ n ≤ 100, 1 ≤ arr[i] ≤ 1000..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Time Limit (seconds)</label>
                            <input
                              type="number"
                              value={practiceCode.timeLimit || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], timeLimit: parseInt(e.target.value) || 0 };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="e.g., 2"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Memory Limit (MB)</label>
                            <input
                              type="number"
                              value={practiceCode.memoryLimit || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], memoryLimit: parseInt(e.target.value) || 0 };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="e.g., 256"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Sample Input/Output */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Sample Input</label>
                            <textarea
                              value={practiceCode.sampleInput || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], sampleInput: e.target.value };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                              rows={3}
                              placeholder="5 6 7&#10;3 6 10"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Sample Output</label>
                            <textarea
                              value={practiceCode.sampleOutput || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], sampleOutput: e.target.value };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                              rows={3}
                              placeholder="1 1"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold mb-1 block">Sample Explanation</label>
                          <textarea
                            value={practiceCode.explanation || practiceCode.sampleExplanation || ''}
                            onChange={(e) => {
                              const updated = [...objectiveContent.practiceCodes];
                              updated[index] = { 
                                ...updated[index], 
                                explanation: e.target.value,
                                sampleExplanation: e.target.value 
                              };
                              setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={2}
                            placeholder="Explain the sample input/output..."
                          />
                        </div>

                        {/* Test Cases Section */}
                        <div className="border-t pt-3 mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold">Test Cases</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddTestCase(index)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Test Case
                            </Button>
                          </div>
                          
                          {(!practiceCode.testCases || practiceCode.testCases.length === 0) ? (
                            <p className="text-xs text-textMuted text-center py-4 bg-gray-50 rounded">
                              No test cases added. Click "Add Test Case" to add one.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {practiceCode.testCases.map((testCase, testIndex) => (
                                <div key={testIndex} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold">
                                      Test Case {testIndex + 1}
                                      {testCase.isSample && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                          Sample
                                        </span>
                                      )}
                                      {testCase.isHidden && (
                                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                          Hidden
                                        </span>
                                      )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={testCase.isSample || false}
                                          onChange={(e) => {
                                            const updated = [...objectiveContent.practiceCodes];
                                            updated[index].testCases[testIndex].isSample = e.target.checked;
                                            setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                                          }}
                                          className="rounded"
                                        />
                                        Sample
                                      </label>
                                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={testCase.isHidden || false}
                                          onChange={(e) => {
                                            const updated = [...objectiveContent.practiceCodes];
                                            updated[index].testCases[testIndex].isHidden = e.target.checked;
                                            setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                                          }}
                                          className="rounded"
                                        />
                                        Hidden
                                      </label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteTestCase(index, testIndex)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <label className="text-xs font-medium mb-1 block">Input</label>
                                      <textarea
                                        value={testCase.input || ''}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.practiceCodes];
                                          updated[index].testCases[testIndex].input = e.target.value;
                                          setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                        rows={3}
                                        placeholder="Test input..."
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium mb-1 block">Expected Output</label>
                                      <textarea
                                        value={testCase.expectedOutput || ''}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.practiceCodes];
                                          updated[index].testCases[testIndex].expectedOutput = e.target.value;
                                          setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                        rows={3}
                                        placeholder="Expected output..."
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs font-medium mb-1 block">Marks</label>
                                      <input
                                        type="number"
                                        value={testCase.marks || 0}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.practiceCodes];
                                          updated[index].testCases[testIndex].marks = parseInt(e.target.value) || 0;
                                          setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="0"
                                        min="0"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium mb-1 block">Explanation (Optional)</label>
                                      <input
                                        type="text"
                                        value={testCase.explanation || ''}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.practiceCodes];
                                          updated[index].testCases[testIndex].explanation = e.target.value;
                                          setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                                        }}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="Brief explanation..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Starter Code & Solution */}
                        <div className="grid grid-cols-2 gap-3 border-t pt-3 mt-4">
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Starter Code (Optional)</label>
                            <textarea
                              value={practiceCode.starterCode || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], starterCode: e.target.value };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                              rows={6}
                              placeholder="def function_name():\n    # Your code here\n    pass"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold mb-1 block">Solution (Optional)</label>
                            <textarea
                              value={practiceCode.solution || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.practiceCodes];
                                updated[index] = { ...updated[index], solution: e.target.value };
                                setObjectiveContent({ ...objectiveContent, practiceCodes: updated });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                              rows={6}
                              placeholder="# Solution code..."
                            />
                          </div>
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
                <Button variant="primary" size="sm" onClick={handleAddMCQQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              {(!objectiveContent.mcqQuestions || objectiveContent.mcqQuestions.length === 0) ? (
                <p className="text-textMuted text-center py-8">No MCQ questions added yet</p>
              ) : (
                <div className="space-y-4">
                  {objectiveContent.mcqQuestions.map((mcq, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <textarea
                          value={mcq.question || ''}
                          onChange={(e) => {
                            const updated = [...objectiveContent.mcqQuestions];
                            updated[index] = { ...updated[index], question: e.target.value };
                            setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={2}
                          placeholder="Question..."
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMCQQuestion(index)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      {/* Question Image Upload */}
                      <div>
                        <label className="text-xs font-semibold mb-1 block">Question Image (Optional)</label>
                        {mcq.questionImageUrl ? (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-xs flex-1">Image uploaded</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = [...objectiveContent.mcqQuestions];
                                updated[index].questionImageUrl = '';
                                updated[index].questionImageKey = '';
                                setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              id={`mcq-question-image-${index}`}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleUploadMCQImage(index, 'question', file);
                                  e.target.value = '';
                                }
                              }}
                              className="hidden"
                              accept="image/*"
                              disabled={uploadingFiles[`mcq-${index}-question`]}
                            />
                            <label
                              htmlFor={`mcq-question-image-${index}`}
                              className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50"
                            >
                              {uploadingFiles[`mcq-${index}-question`] ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-3 w-3" />
                                  Upload Image
                                </>
                              )}
                            </label>
                          </>
                        )}
                      </div>

                      {/* Question Type */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Question Type</label>
                        <select
                          value={mcq.questionType || 'SINGLE_CHOICE'}
                          onChange={(e) => {
                            const updated = [...objectiveContent.mcqQuestions];
                            updated[index] = { 
                              ...updated[index], 
                              questionType: e.target.value,
                              // Reset answers when changing type
                              correctAnswer: e.target.value === 'ONE_WORD' ? '' : (updated[index].correctAnswer || ''),
                              correctAnswers: e.target.value === 'MULTIPLE_CHOICE' ? [] : [],
                            };
                            setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="SINGLE_CHOICE">Single Choice (One Answer)</option>
                          <option value="MULTIPLE_CHOICE">Multiple Choice (Multiple Answers)</option>
                          <option value="ONE_WORD">One Word Answer</option>
                        </select>
                      </div>

                      {/* Single/Multiple Choice Options */}
                      {(mcq.questionType === 'SINGLE_CHOICE' || mcq.questionType === 'MULTIPLE_CHOICE') && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold">Options</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = [...objectiveContent.mcqQuestions];
                                if (!updated[index].options) updated[index].options = [];
                                updated[index].options.push({ text: '', type: 'text', imageUrl: '', imageKey: '' });
                                setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          {(mcq.options || []).map((option, optIndex) => {
                            const optionValue = option.text || option || '';
                            const optionId = `${index}-${optIndex}`;
                            const isCorrect = mcq.questionType === 'SINGLE_CHOICE' 
                              ? (mcq.correctAnswer === optionValue || (typeof option === 'object' && mcq.correctAnswer === option.text))
                              : ((mcq.correctAnswers || []).includes(optionValue) || (typeof option === 'object' && (mcq.correctAnswers || []).includes(option.text)));
                            
                            return (
                              <div key={optIndex} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-600 w-6">
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex gap-2 mb-2">
                                      <input
                                        type="text"
                                        value={typeof option === 'object' ? (option.text || '') : option}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.mcqQuestions];
                                          if (!updated[index].options) updated[index].options = [];
                                          if (typeof updated[index].options[optIndex] === 'object') {
                                            updated[index].options[optIndex].text = e.target.value;
                                          } else {
                                            updated[index].options[optIndex] = { text: e.target.value, type: 'text', imageUrl: '', imageKey: '' };
                                          }
                                          setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                        }}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                        placeholder={`Option ${String.fromCharCode(65 + optIndex)} text`}
                                      />
                                      <select
                                        value={typeof option === 'object' ? (option.type || 'text') : 'text'}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.mcqQuestions];
                                          if (!updated[index].options) updated[index].options = [];
                                          if (typeof updated[index].options[optIndex] !== 'object') {
                                            updated[index].options[optIndex] = { text: updated[index].options[optIndex] || '', type: e.target.value, imageUrl: '', imageKey: '' };
                                          } else {
                                            updated[index].options[optIndex].type = e.target.value;
                                          }
                                          setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                        }}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                                      >
                                        <option value="text">Text</option>
                                        <option value="image">Image</option>
                                      </select>
                                    </div>
                                    {typeof option === 'object' && option.type === 'image' && (
                                      <div className="mt-2">
                                        {option.imageUrl ? (
                                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                            <img src={option.imageUrl} alt="Option" className="h-16 w-16 object-cover rounded" />
                                            <span className="text-xs flex-1">Image uploaded</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                const updated = [...objectiveContent.mcqQuestions];
                                                updated[index].options[optIndex].imageUrl = '';
                                                updated[index].options[optIndex].imageKey = '';
                                                setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                              }}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <>
                                            <input
                                              type="file"
                                              id={`mcq-option-image-${optionId}`}
                                              onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                  handleUploadMCQOptionImage(index, optIndex, file);
                                                  e.target.value = '';
                                                }
                                              }}
                                              className="hidden"
                                              accept="image/*"
                                              disabled={uploadingFiles[`mcq-option-${optionId}`]}
                                            />
                                            <label
                                              htmlFor={`mcq-option-image-${optionId}`}
                                              className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50 w-fit"
                                            >
                                              {uploadingFiles[`mcq-option-${optionId}`] ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                <>
                                                  <ImageIcon className="h-3 w-3" />
                                                  Upload Image
                                                </>
                                              )}
                                            </label>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {mcq.questionType === 'SINGLE_CHOICE' ? (
                                      <input
                                        type="radio"
                                        name={`mcq-correct-${index}`}
                                        checked={isCorrect}
                                        onChange={() => {
                                          const updated = [...objectiveContent.mcqQuestions];
                                          const answerValue = typeof option === 'object' ? option.text : option;
                                          updated[index].correctAnswer = answerValue;
                                          setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                        }}
                                      />
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={isCorrect}
                                        onChange={(e) => {
                                          const updated = [...objectiveContent.mcqQuestions];
                                          const answerValue = typeof option === 'object' ? option.text : option;
                                          if (!updated[index].correctAnswers) updated[index].correctAnswers = [];
                                          if (e.target.checked) {
                                            if (!updated[index].correctAnswers.includes(answerValue)) {
                                              updated[index].correctAnswers.push(answerValue);
                                            }
                                          } else {
                                            updated[index].correctAnswers = updated[index].correctAnswers.filter(a => a !== answerValue);
                                          }
                                          setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                        }}
                                      />
                                    )}
                                    <span className="text-xs text-textMuted">Correct</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const updated = [...objectiveContent.mcqQuestions];
                                        updated[index].options = updated[index].options.filter((_, i) => i !== optIndex);
                                        setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                      }}
                                      className="ml-auto text-red-500"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* One Word Answer */}
                      {mcq.questionType === 'ONE_WORD' && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold">Correct Answer</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={mcq.correctAnswer || ''}
                              onChange={(e) => {
                                const updated = [...objectiveContent.mcqQuestions];
                                updated[index] = { ...updated[index], correctAnswer: e.target.value };
                                setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Enter correct answer..."
                            />
                            <span className="text-xs text-textMuted">OR</span>
                            {mcq.correctAnswerImageUrl ? (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                <ImageIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-xs">Image answer</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...objectiveContent.mcqQuestions];
                                    updated[index].correctAnswerImageUrl = '';
                                    updated[index].correctAnswerImageKey = '';
                                    setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  id={`mcq-answer-image-${index}`}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleUploadMCQImage(index, 'answer', file);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="hidden"
                                  accept="image/*"
                                  disabled={uploadingFiles[`mcq-${index}-answer`]}
                                />
                                <label
                                  htmlFor={`mcq-answer-image-${index}`}
                                  className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50"
                                >
                                  {uploadingFiles[`mcq-${index}-answer`] ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <ImageIcon className="h-3 w-3" />
                                      Image
                                    </>
                                  )}
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      <textarea
                        value={mcq.explanation || ''}
                        onChange={(e) => {
                          const updated = [...objectiveContent.mcqQuestions];
                          updated[index] = { ...updated[index], explanation: e.target.value };
                          setObjectiveContent({ ...objectiveContent, mcqQuestions: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                        placeholder="Explanation (optional)..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={handleCloseContentModal} disabled={savingObjective}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveContent} disabled={savingObjective}>
              {savingObjective ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Content
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Objective Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={handleCloseReviewModal}
        title="Review Objective"
        size="lg"
      >
        {reviewingObjective && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{reviewingObjective.title || reviewingObjective.text || 'Untitled Objective'}</h3>
              {reviewingObjective.description && (
                <p className="text-textMuted">{reviewingObjective.description}</p>
              )}
              {reviewingObjective.minDuration > 0 && (
                <p className="text-sm text-textMuted mt-2">Duration: {reviewingObjective.minDuration} hours</p>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Resources ({reviewingObjective.resources?.length || 0})</h4>
                {reviewingObjective.resources && reviewingObjective.resources.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-textMuted">
                    {reviewingObjective.resources.map((r, idx) => (
                      <li key={idx}>{r.title || r.url || 'Untitled Resource'}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-textMuted">No resources</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Assignments ({reviewingObjective.assignments?.length || 0})</h4>
                {reviewingObjective.assignments && reviewingObjective.assignments.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-textMuted">
                    {reviewingObjective.assignments.map((a, idx) => (
                      <li key={idx}>{a.name || 'Untitled Assignment'}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-textMuted">No assignments</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Practice Codes ({reviewingObjective.practiceCodes?.length || 0})</h4>
                {reviewingObjective.practiceCodes && reviewingObjective.practiceCodes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-textMuted">
                    {reviewingObjective.practiceCodes.map((p, idx) => (
                      <li key={idx}>{p.problem || 'Untitled Practice Code'}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-textMuted">No practice codes</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">MCQ Questions ({reviewingObjective.mcqQuestions?.length || 0})</h4>
                {reviewingObjective.mcqQuestions && reviewingObjective.mcqQuestions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-textMuted">
                    {reviewingObjective.mcqQuestions.map((m, idx) => (
                      <li key={idx}>{m.question || 'Untitled Question'}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-textMuted">No MCQ questions</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="ghost" onClick={handleCloseReviewModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* File Viewer Modal */}
      <Modal
        isOpen={!!viewingFile}
        onClose={() => setViewingFile(null)}
        title={viewingFile?.fileName || 'View File'}
        size="xl"
      >
        {viewingFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-textMuted">{viewingFile.fileName}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.open(viewingFile.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = viewingFile.url;
                    link.download = viewingFile.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <FileIcon className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ minHeight: '500px', maxHeight: '70vh' }}>
              {viewingFile.mimeType?.startsWith('image/') ? (
                <img
                  src={viewingFile.url}
                  alt={viewingFile.fileName}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : viewingFile.mimeType === 'application/pdf' || viewingFile.fileName?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewingFile.url}
                  className="w-full h-full"
                  style={{ minHeight: '500px', height: '70vh' }}
                  title={viewingFile.fileName}
                />
              ) : viewingFile.mimeType?.startsWith('video/') ? (
                <video
                  src={viewingFile.url}
                  controls
                  className="w-full h-auto max-h-[70vh]"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{ minHeight: '500px' }}>
                  <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-textMuted mb-4">Preview not available for this file type</p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        window.open(viewingFile.url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = viewingFile.url;
                        link.download = viewingFile.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <FileIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              <div className="hidden flex-col items-center justify-center h-full p-8 text-center" style={{ minHeight: '500px' }}>
                <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-textMuted mb-4">Unable to load file preview</p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      window.open(viewingFile.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = viewingFile.url;
                      link.download = viewingFile.fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <FileIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ObjectivesList;

