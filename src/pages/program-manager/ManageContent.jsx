import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Plus, BookOpen, Edit2, X, FileCheck, Code, HelpCircle, Eye, Save, File as FileIcon, FileText, Video, Link2, ExternalLink, Upload, Loader2, Image as ImageIcon, Grid3x3, List } from 'lucide-react';
import { getProxyUrl } from '../../utils/s3Helper';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import programAPI from '../../api/program';
import uploadAPI from '../../api/upload';

const ManageContent = () => {
  const navigate = useNavigate();
  const { programId, moduleId, subModuleId, objectiveId } = useParams();
  const [activeTab, setActiveTab] = useState('resources'); // 'resources', 'assignments', 'practiceCodes', 'mcq'
  const [loading, setLoading] = useState(true);
  const [objective, setObjective] = useState(null);
  const [content, setContent] = useState({
    resources: [],
    assignments: [],
    practiceCodes: [],
    mcqQuestions: [],
  });
  const [viewingItem, setViewingItem] = useState(null); // { type, index, data }
  const [editingItem, setEditingItem] = useState(null); // { type, index, data }
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [viewingFile, setViewingFile] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    loadObjective();
  }, [objectiveId, moduleId, subModuleId, programId]);

  const loadObjective = async () => {
    try {
      setLoading(true);
      
      // First, load the objective to get its details
      let objectiveResponse;
      if (subModuleId) {
        objectiveResponse = await programAPI.getSubModuleObjectives(subModuleId);
      } else {
        objectiveResponse = await programAPI.getObjectivesByModule(moduleId);
      }
      
      if (objectiveResponse.success && objectiveResponse.data) {
        const objectives = objectiveResponse.data.objectives || objectiveResponse.data || [];
        const foundObjective = objectives.find(obj => {
          const objId = String(obj.id || obj._id);
          const targetId = String(objectiveId);
          return objId === targetId;
        });
        
        if (foundObjective) {
          setObjective(foundObjective);
        } else {
          console.error('Objective not found');
          toast.error('Objective not found');
          return;
        }
      } else {
        toast.error('Failed to load objective');
        return;
      }

      // Now fetch content from separate collections
      try {
        const [resourcesRes, assignmentsRes, practiceCodesRes, mcqsRes] = await Promise.all([
          programAPI.getResourcesByObjective(objectiveId).catch((err) => {
            console.error('Error fetching resources:', err);
            return { success: false, data: { resources: [] } };
          }),
          programAPI.getAssignmentsByObjective(objectiveId).catch((err) => {
            console.error('Error fetching assignments:', err);
            return { success: false, data: { assignments: [] } };
          }),
          programAPI.getPracticeCodesByObjective(objectiveId).catch((err) => {
            console.error('Error fetching practice codes:', err);
            return { success: false, data: { practiceCodes: [] } };
          }),
          programAPI.getMCQsByObjective(objectiveId).catch((err) => {
            console.error('Error fetching MCQs:', err);
            return { success: false, data: { mcqs: [] } };
          }),
        ]);

        console.log('Resources response:', resourcesRes);
        console.log('Assignments response:', assignmentsRes);
        console.log('Practice Codes response:', practiceCodesRes);
        console.log('MCQs response:', mcqsRes);

        const resources = resourcesRes.success && resourcesRes.data ? (resourcesRes.data.resources || []) : [];
        const assignments = assignmentsRes.success && assignmentsRes.data ? (assignmentsRes.data.assignments || []) : [];
        const practiceCodes = practiceCodesRes.success && practiceCodesRes.data ? (practiceCodesRes.data.practiceCodes || []) : [];
        const mcqQuestions = mcqsRes.success && mcqsRes.data ? (mcqsRes.data.mcqs || []) : [];

        console.log('Setting content:', { resources, assignments, practiceCodes, mcqQuestions });

        setContent({
          resources,
          assignments,
          practiceCodes,
          mcqQuestions,
        });
      } catch (error) {
        console.error('Error loading content:', error);
        toast.error('Failed to load some content');
        // Set empty arrays as fallback
        setContent({
          resources: [],
          assignments: [],
          practiceCodes: [],
          mcqQuestions: [],
        });
      }
    } catch (error) {
      console.error('Error loading objective:', error);
      toast.error('Failed to load objective');
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (type, index) => {
    const contentKey = type === 'mcq' ? 'mcqQuestions' : type;
    setViewingItem({ type, index, data: content[contentKey][index] });
    setEditingItem(null);
  };

  const handleEditItem = (type, index) => {
    const contentKey = type === 'mcq' ? 'mcqQuestions' : type;
    setEditingItem({ type, index, data: { ...content[contentKey][index] } });
    setViewingItem(null);
  };

  const handleCloseView = () => {
    setViewingItem(null);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    const newItem = getDefaultItem(activeTab);
    setEditingItem({ type: activeTab, index: -1, data: newItem });
    setViewingItem(null);
  };

  const getDefaultItem = (type) => {
    switch (type) {
      case 'resources':
        return {
          type: 'DOCUMENT',
          forWhom: 'LEARNER',
          title: '',
          description: '',
          url: '',
          content: '',
          fileKey: '',
          fileName: '',
          fileSize: 0,
          mimeType: '',
        };
      case 'assignments':
        return {
          name: '',
          description: '',
          problemStatement: '',
          instructions: '',
          difficulty: 'BEGINNER',
          maxMarks: 100,
          passingMarks: 50,
          resources: [],
          scoringRubric: [],
        };
      case 'practiceCodes':
        return {
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
          timeLimit: 0,
          memoryLimit: 0,
          starterCode: '',
          solution: '',
        };
      case 'mcq':
        return {
          question: '',
          questionType: 'SINGLE_CHOICE',
          options: [
            { text: '', type: 'text', imageUrl: '', imageKey: '' },
            { text: '', type: 'text', imageUrl: '', imageKey: '' },
            { text: '', type: 'text', imageUrl: '', imageKey: '' },
            { text: '', type: 'text', imageUrl: '', imageKey: '' },
          ],
          correctAnswer: '',
          correctAnswers: [],
          questionImageUrl: '',
          questionImageKey: '',
          explanation: '',
        };
      default:
        return {};
    }
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;

    // Validate required fields
    if (editingItem.type === 'resources' && !editingItem.data.title?.trim()) {
      toast.error('Resource title is required');
      return;
    }
    
    if (editingItem.type === 'assignments' && !editingItem.data.name?.trim()) {
      toast.error('Assignment name is required');
      return;
    }

    try {
      const isNew = editingItem.index === -1;
      
      // Clean up the data before sending (remove file objects, keep only metadata)
      const cleanedData = { ...editingItem.data };
      
      // For resources, clean up and ensure proper structure
      if (editingItem.type === 'resources') {
        // Remove file object if present (keep only metadata)
        delete cleanedData.file;
        
        // Ensure proper field mapping
        if (cleanedData.fileUrl && !cleanedData.url) {
          cleanedData.url = cleanedData.fileUrl;
        }
        if (cleanedData.originalName && !cleanedData.fileName) {
          cleanedData.fileName = cleanedData.originalName;
        }
        
        // Ensure type and forWhom have defaults
        if (!cleanedData.type) cleanedData.type = 'DOCUMENT';
        if (!cleanedData.forWhom) cleanedData.forWhom = 'LEARNER';
      }
      
      // For assignments, clean up resources array and ensure proper structure
      if (editingItem.type === 'assignments') {
        // Clean resources array
        if (cleanedData.resources && Array.isArray(cleanedData.resources)) {
          cleanedData.resources = cleanedData.resources.map(res => ({
            type: res.type || 'DATASET',
            title: res.title || '',
            url: res.url || '',
            fileKey: res.fileKey || '',
            fileName: res.fileName || '',
            fileSize: res.fileSize || 0,
            mimeType: res.mimeType || '',
            description: res.description || '',
          })).filter(res => res.title || res.url || res.fileKey); // Remove empty resources
        }
        
        // Ensure required fields have defaults
        if (!cleanedData.name) cleanedData.name = 'Untitled Assignment';
        if (!cleanedData.difficulty) cleanedData.difficulty = 'BEGINNER';
        if (!cleanedData.maxMarks) cleanedData.maxMarks = 100;
        if (!cleanedData.passingMarks) cleanedData.passingMarks = 50;
        
        // Remove instructions if it exists (backend doesn't use it, only problemStatement)
        // But keep it if user wants to store it separately
        // For now, we'll keep both fields
      }
      
      // Remove any file objects or functions
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] && typeof cleanedData[key] === 'object' && !Array.isArray(cleanedData[key])) {
          if (cleanedData[key] instanceof File) {
            delete cleanedData[key];
          }
        }
      });
      
      console.log('Saving assignment with cleaned data:', cleanedData);
      await saveContentToBackend(cleanedData, editingItem.type, isNew);
      
      setEditingItem(null);
      toast.success('Content saved successfully');
      loadObjective(); // Reload to get latest data
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error(error.message || 'Failed to save content');
    }
  };

  const saveContentToBackend = async (itemData, type, isNew) => {
    if (!objectiveId) {
      toast.error('Objective ID not found');
      return;
    }

    try {
      console.log(`Saving ${type} (${isNew ? 'new' : 'update'}):`, { objectiveId, itemData });
      
      if (isNew) {
        // Create new item
        let response;
        switch (type) {
          case 'resources':
            response = await programAPI.createResource(objectiveId, itemData);
            break;
          case 'assignments':
            console.log('Creating assignment with data:', itemData);
            response = await programAPI.createObjectiveAssignment(objectiveId, itemData);
            console.log('Assignment creation response:', response);
            if (!response.success) {
              throw new Error(response.message || 'Failed to create assignment');
            }
            break;
          case 'practiceCodes':
            response = await programAPI.createPracticeCode(objectiveId, itemData);
            break;
          case 'mcq':
            response = await programAPI.createMCQ(objectiveId, itemData);
            break;
        }
        return response;
      } else {
        // Update existing item
        const itemId = itemData.id || itemData._id;
        if (!itemId) {
          toast.error('Item ID not found');
          return;
        }
        let response;
        switch (type) {
          case 'resources':
            response = await programAPI.updateResource(itemId, itemData);
            break;
          case 'assignments':
            console.log('Updating assignment with data:', itemData);
            response = await programAPI.updateObjectiveAssignment(itemId, itemData);
            console.log('Assignment update response:', response);
            if (!response.success) {
              throw new Error(response.message || 'Failed to update assignment');
            }
            break;
          case 'practiceCodes':
            response = await programAPI.updatePracticeCode(itemId, itemData);
            break;
          case 'mcq':
            response = await programAPI.updateMCQ(itemId, itemData);
            break;
        }
        return response;
      }
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.data,
      });
      throw error;
    }
  };

  const handleDeleteItem = async (type, index) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const contentKey = type === 'mcq' ? 'mcqQuestions' : type;
      const item = content[contentKey][index];
      const itemId = item.id || item._id;
      
      if (!itemId) {
        toast.error('Item ID not found');
        return;
      }

      // Delete from backend
      switch (type) {
        case 'resources':
          await programAPI.deleteResource(itemId);
          break;
        case 'assignments':
          await programAPI.deleteObjectiveAssignment(itemId);
          break;
        case 'practiceCodes':
          await programAPI.deletePracticeCode(itemId);
          break;
        case 'mcq':
          await programAPI.deleteMCQ(itemId);
          break;
      }

      toast.success('Item deleted successfully');
      loadObjective();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const renderTable = () => {
    // Map activeTab to content key
    const contentKey = activeTab === 'mcq' ? 'mcqQuestions' : activeTab;
    const items = content[contentKey] || [];
    const headers = getTableHeaders(activeTab);

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brintelli-baseAlt/50">
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-text uppercase tracking-wider">
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-text uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-brintelli-card divide-y divide-brintelli-border/30">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className="px-4 py-8 text-center text-textMuted">
                    No {activeTab} found. Click "Add New" to create one.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-brintelli-baseAlt/40 cursor-pointer"
                    onClick={() => handleViewItem(activeTab, index)}
                  >
                    {renderTableRow(activeTab, item, index)}
                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(activeTab, index)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(activeTab, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGridView = () => {
    const contentKey = activeTab === 'mcq' ? 'mcqQuestions' : activeTab;
    const items = content[contentKey] || [];

    if (items.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-textMuted mb-4">No {activeTab === 'practiceCodes' ? 'practice codes' : activeTab === 'mcq' ? 'MCQ questions' : activeTab} found.</p>
          <Button variant="primary" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handleViewItem(activeTab, index)}
          >
            {renderGridCard(activeTab, item, index)}
          </div>
        ))}
      </div>
    );
  };

  const renderGridCard = (type, item, index) => {
    switch (type) {
      case 'resources':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {item.type === 'DOCUMENT' && <FileIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                {item.type === 'VIDEO' && <Video className="h-5 w-5 text-red-600 flex-shrink-0" />}
                {item.type === 'LINK' && <Link2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                {item.type === 'NOTE' && <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" />}
                <h3 className="font-semibold text-text truncate">{item.title || 'Untitled'}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEditItem(type, index)} className="text-blue-600">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(type, index)} className="text-red-600">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {item.description && <p className="text-sm text-textMuted line-clamp-2">{item.description}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{item.type || 'DOCUMENT'}</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{item.forWhom || 'LEARNER'}</span>
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                <h3 className="font-semibold text-text truncate">{item.name || 'Untitled Assignment'}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEditItem(type, index)} className="text-blue-600">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(type, index)} className="text-red-600">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {item.description && <p className="text-sm text-textMuted line-clamp-2">{item.description}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{item.difficulty || 'BEGINNER'}</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{item.maxMarks || 0} marks</span>
            </div>
          </div>
        );
      case 'practiceCodes':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Code className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <h3 className="font-semibold text-text truncate">{item.problem || 'Untitled Problem'}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEditItem(type, index)} className="text-blue-600">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(type, index)} className="text-red-600">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {item.problemStatement && <p className="text-sm text-textMuted line-clamp-3">{item.problemStatement}</p>}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{item.difficulty || 'BEGINNER'}</span>
              {item.language && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{item.language}</span>}
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{item.testCases?.length || 0} test cases</span>
            </div>
          </div>
        );
      case 'mcq':
        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <HelpCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <h3 className="font-semibold text-text line-clamp-2">{item.question || 'Untitled Question'}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" onClick={() => handleEditItem(type, index)} className="text-blue-600">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(type, index)} className="text-red-600">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {item.questionImageUrl && (
              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                <img src={item.questionImageUrl} alt="Question" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{item.questionType || 'SINGLE_CHOICE'}</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">{item.options?.length || 0} options</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTableHeaders = (type) => {
    switch (type) {
      case 'resources':
        return ['Title', 'Type', 'For', 'File', 'Size'];
      case 'assignments':
        return ['Name', 'Difficulty', 'Max Marks', 'Status'];
      case 'practiceCodes':
        return ['Problem', 'Difficulty', 'Language', 'Test Cases'];
      case 'mcq':
        return ['Question', 'Type', 'Options'];
      default:
        return [];
    }
  };

  const renderTableRow = (type, item, index) => {
    switch (type) {
      case 'resources':
        return (
          <>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-text">{item.title || 'Untitled'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.type || 'DOCUMENT'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.forWhom || 'LEARNER'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">
              {item.fileName ? (
                <span className="flex items-center gap-1">
                  <FileIcon className="h-3 w-3" />
                  {item.fileName}
                </span>
              ) : item.url ? (
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Link
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">
              {item.fileSize ? `${(item.fileSize / 1024).toFixed(2)} KB` : '-'}
            </td>
          </>
        );
      case 'assignments':
        return (
          <>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-text">{item.name || 'Untitled'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.difficulty || 'BEGINNER'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.maxMarks || 0}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">Active</td>
          </>
        );
      case 'practiceCodes':
        return (
          <>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-text">{item.problem || 'Untitled'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.difficulty || 'BEGINNER'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.language || '-'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">
              {item.testCases?.length || 0} test case(s)
            </td>
          </>
        );
      case 'mcq':
        return (
          <>
            <td className="px-4 py-3 text-sm text-text">
              <div className="max-w-md truncate">{item.question || 'Untitled Question'}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">{item.questionType || 'SINGLE_CHOICE'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-textMuted">
              {item.options?.length || 0} option(s)
            </td>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Content"
        breadcrumbs={[
          { label: 'Programs', path: '/program-manager/programs' },
          { label: 'Modules', path: `/program-manager/programs/${programId}/modules` },
          { label: subModuleId ? 'Sub-Modules' : 'Objectives', path: subModuleId 
            ? `/program-manager/programs/${programId}/modules/${moduleId}/submodules`
            : `/program-manager/programs/${programId}/modules/${moduleId}/objectives` 
          },
          { label: 'Objectives', path: subModuleId 
            ? `/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}/objectives`
            : `/program-manager/programs/${programId}/modules/${moduleId}/objectives` 
          },
          { label: 'Manage Content' },
        ]}
        actions={
          <Button
            variant="ghost"
            onClick={() => {
              if (subModuleId) {
                navigate(`/program-manager/programs/${programId}/modules/${moduleId}/submodules/${subModuleId}/objectives`);
              } else {
                navigate(`/program-manager/programs/${programId}/modules/${moduleId}/objectives`);
              }
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'resources', label: 'Resources', icon: BookOpen, count: content.resources?.length || 0 },
              { id: 'assignments', label: 'Assignments', icon: FileCheck, count: content.assignments?.length || 0 },
              { id: 'practiceCodes', label: 'Practice Codes', icon: Code, count: content.practiceCodes?.length || 0 },
              { id: 'mcq', label: 'MCQ Questions', icon: HelpCircle, count: content.mcqQuestions?.length || 0 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-textMuted hover:text-text hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${activeTab === tab.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text capitalize">
              {activeTab === 'practiceCodes' ? 'Practice Codes' : activeTab === 'mcq' ? 'MCQ Questions' : activeTab}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-brand-100 text-brand-600' 
                      : 'text-textMuted hover:text-text'
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-brand-100 text-brand-600' 
                      : 'text-textMuted hover:text-text'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
              </div>
              <Button variant="primary" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>

          {viewMode === 'table' ? renderTable() : renderGridView()}
        </div>
      </div>

      {/* View Modal */}
      {viewingItem && (
        <Modal
          isOpen={!!viewingItem}
          onClose={handleCloseView}
          title={`View ${activeTab === 'practiceCodes' ? 'Practice Code' : activeTab === 'mcq' ? 'MCQ Question' : activeTab.slice(0, -1)}`}
          size="lg"
        >
          {renderViewContent(viewingItem)}
        </Modal>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={handleCloseView}
          title={`${editingItem.index === -1 ? 'Create' : 'Edit'} ${activeTab === 'practiceCodes' ? 'Practice Code' : activeTab === 'mcq' ? 'MCQ Question' : activeTab.slice(0, -1)}`}
          size="xl"
        >
          {renderEditContent(editingItem)}
        </Modal>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
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
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );

  // Upload handlers
  const handleUploadResourceFile = async (file, resourceIndex) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    if (!editingItem || !editingItem.data) {
      toast.error('Please create a resource first');
      return;
    }

    const key = `resource-${resourceIndex}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'program-resources');
      console.log('Upload response:', response);
      
      if (response && (response.success || response.url)) {
        const updated = { ...editingItem.data };
        // Handle different response structures
        if (response.data) {
          updated.url = response.data.url || response.data.fileUrl || response.url;
          updated.fileKey = response.data.key || response.data.fileKey || response.key;
          updated.fileName = response.data.originalName || response.data.fileName || response.data.name || file.name;
          updated.fileSize = response.data.size || response.data.fileSize || file.size;
          updated.mimeType = response.data.mimeType || response.data.contentType || file.type;
        } else {
          // Direct response structure
          updated.url = response.url || '';
          updated.fileKey = response.key || '';
          updated.fileName = response.originalName || response.fileName || file.name;
          updated.fileSize = response.size || file.size;
          updated.mimeType = response.mimeType || response.contentType || file.type;
        }
        
        setEditingItem({ ...editingItem, data: updated });
        toast.success('File uploaded successfully');
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleUploadMCQImage = async (imageType, file, optionIndex = null) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const key = optionIndex !== null ? `mcq-option-${optionIndex}` : `mcq-${imageType}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'mcq-images');
      if (response.success) {
        const updated = { ...editingItem.data };
        if (imageType === 'question') {
          updated.questionImageUrl = response.data.url;
          updated.questionImageKey = response.data.key;
        } else if (imageType === 'answer') {
          updated.answerImageUrl = response.data.url;
          updated.answerImageKey = response.data.key;
        } else if (imageType === 'option' && optionIndex !== null) {
          // Handle option image upload
          if (!updated.options) updated.options = [];
          if (typeof updated.options[optionIndex] === 'string') {
            updated.options[optionIndex] = { text: updated.options[optionIndex], type: 'image', imageUrl: response.data.url, imageKey: response.data.key };
          } else {
            updated.options[optionIndex] = {
              ...updated.options[optionIndex],
              type: 'image',
              imageUrl: response.data.url,
              imageKey: response.data.key
            };
          }
        }
        setEditingItem({ ...editingItem, data: updated });
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAddTestCase = () => {
    const updated = { ...editingItem.data };
    if (!updated.testCases) updated.testCases = [];
    updated.testCases.push({
      input: '',
      expectedOutput: '',
      explanation: '',
      isSample: false,
      isHidden: false,
      marks: 0,
    });
    setEditingItem({ ...editingItem, data: updated });
  };

  const handleDeleteTestCase = (testIndex) => {
    const updated = { ...editingItem.data };
    updated.testCases = updated.testCases.filter((_, i) => i !== testIndex);
    setEditingItem({ ...editingItem, data: updated });
  };

  const handleUploadAssignmentResource = async (resourceIndex, file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const key = `assignment-resource-${resourceIndex}`;
    setUploadingFiles(prev => ({ ...prev, [key]: true }));

    try {
      const response = await uploadAPI.uploadFile(file, 'assignment-resources');
      if (response.success) {
        const updated = { ...editingItem.data };
        updated.resources[resourceIndex] = {
          ...updated.resources[resourceIndex],
          url: response.data.url,
          fileKey: response.data.key,
          fileName: response.data.originalName,
          fileSize: response.data.size,
          mimeType: response.data.mimeType,
        };
        setEditingItem({ ...editingItem, data: updated });
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteAssignmentResource = (resourceIndex) => {
    const updated = { ...editingItem.data };
    const resource = updated.resources[resourceIndex];
    if (resource.fileKey) {
      uploadAPI.deleteFile(resource.fileKey).catch(err => console.error('Error deleting file:', err));
    }
    updated.resources = updated.resources.filter((_, i) => i !== resourceIndex);
    setEditingItem({ ...editingItem, data: updated });
  };

  // Render view content (read-only)
  function renderViewContent(item) {
    if (!item || !item.data) return <div>No data to display</div>;

    const data = item.data;
    
    switch (item.type) {
      case 'resources':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-textMuted">Title</label>
              <p className="text-text mt-1">{data.title || 'Untitled'}</p>
            </div>
            {data.description && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Description</label>
                <p className="text-text mt-1">{data.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-textMuted">Type</label>
              <p className="text-text mt-1">{data.type || 'DOCUMENT'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-textMuted">For</label>
              <p className="text-text mt-1">{data.forWhom || 'LEARNER'}</p>
            </div>
            {data.fileName && (
              <div>
                <label className="text-sm font-semibold text-textMuted">File</label>
                <div className="flex items-center gap-2 mt-1">
                  <FileIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-text">{data.fileName}</span>
                  <span className="text-textMuted text-sm">({(data.fileSize / 1024).toFixed(2)} KB)</span>
                  {(data.url || data.fileKey) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const fileUrl = data.fileKey 
                          ? getProxyUrl(null, data.fileKey)
                          : (data.url || getProxyUrl(data.url));
                        setViewingFile({
                          url: fileUrl,
                          fileName: data.fileName || 'File',
                          mimeType: data.mimeType || ''
                        });
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            )}
            {data.url && data.type === 'LINK' && (
              <div>
                <label className="text-sm font-semibold text-textMuted">URL</label>
                <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
                  {data.url}
                </a>
              </div>
            )}
            {data.content && data.type === 'NOTE' && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Content</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.content}</p>
              </div>
            )}
          </div>
        );
      
      case 'assignments':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-textMuted">Name</label>
              <p className="text-text mt-1">{data.name || 'Untitled'}</p>
            </div>
            {data.description && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Description</label>
                <p className="text-text mt-1">{data.description}</p>
              </div>
            )}
            {data.problemStatement && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Problem Statement</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.problemStatement}</p>
              </div>
            )}
            {data.instructions && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Instructions</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.instructions}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-textMuted">Difficulty</label>
                <p className="text-text mt-1">{data.difficulty || 'BEGINNER'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-textMuted">Max Marks</label>
                <p className="text-text mt-1">{data.maxMarks || 0}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-textMuted">Passing Marks</label>
                <p className="text-text mt-1">{data.passingMarks || 0}</p>
              </div>
            </div>
            {data.resources && data.resources.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Supporting Data</label>
                <div className="space-y-2 mt-2">
                  {data.resources.map((res, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded border">
                      <p className="text-sm font-medium">{res.title || 'Untitled'}</p>
                      <p className="text-xs text-textMuted">{res.type}</p>
                      {res.fileName && (
                        <p className="text-xs text-textMuted">{res.fileName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'practiceCodes':
        return (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-sm font-semibold text-textMuted">Problem</label>
              <p className="text-text mt-1 font-semibold">{data.problem || 'Untitled'}</p>
            </div>
            {data.problemStatement && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Problem Statement</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.problemStatement}</p>
              </div>
            )}
            {data.instructions && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Instructions</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.instructions}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {data.inputFormat && (
                <div>
                  <label className="text-sm font-semibold text-textMuted">Input Format</label>
                  <p className="text-text mt-1 font-mono text-sm whitespace-pre-wrap">{data.inputFormat}</p>
                </div>
              )}
              {data.outputFormat && (
                <div>
                  <label className="text-sm font-semibold text-textMuted">Output Format</label>
                  <p className="text-text mt-1 font-mono text-sm whitespace-pre-wrap">{data.outputFormat}</p>
                </div>
              )}
            </div>
            {data.constraints && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Constraints</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.constraints}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {data.sampleInput && (
                <div>
                  <label className="text-sm font-semibold text-textMuted">Sample Input</label>
                  <pre className="text-text mt-1 font-mono text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap">{data.sampleInput}</pre>
                </div>
              )}
              {data.sampleOutput && (
                <div>
                  <label className="text-sm font-semibold text-textMuted">Sample Output</label>
                  <pre className="text-text mt-1 font-mono text-sm bg-gray-50 p-2 rounded whitespace-pre-wrap">{data.sampleOutput}</pre>
                </div>
              )}
            </div>
            {data.explanation && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Explanation</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.explanation}</p>
              </div>
            )}
            {data.testCases && data.testCases.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Test Cases ({data.testCases.length})</label>
                <div className="space-y-2 mt-2">
                  {data.testCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold">Test Case {idx + 1}</span>
                        {tc.isSample && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Sample</span>}
                        {tc.isHidden && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Hidden</span>}
                        {tc.marks > 0 && <span className="text-xs text-textMuted">({tc.marks} marks)</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-textMuted">Input</label>
                          <pre className="text-xs font-mono bg-white p-2 rounded mt-1 whitespace-pre-wrap">{tc.input || '-'}</pre>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-textMuted">Expected Output</label>
                          <pre className="text-xs font-mono bg-white p-2 rounded mt-1 whitespace-pre-wrap">{tc.expectedOutput || '-'}</pre>
                        </div>
                      </div>
                      {tc.explanation && (
                        <div className="mt-2">
                          <label className="text-xs font-medium text-textMuted">Explanation</label>
                          <p className="text-xs text-text mt-1">{tc.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-textMuted">Difficulty</label>
                <p className="text-text mt-1">{data.difficulty || 'BEGINNER'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-textMuted">Language</label>
                <p className="text-text mt-1">{data.language || '-'}</p>
              </div>
            </div>
            {(data.timeLimit > 0 || data.memoryLimit > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {data.timeLimit > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-textMuted">Time Limit</label>
                    <p className="text-text mt-1">{data.timeLimit} seconds</p>
                  </div>
                )}
                {data.memoryLimit > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-textMuted">Memory Limit</label>
                    <p className="text-text mt-1">{data.memoryLimit} MB</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'mcq':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-textMuted">Question</label>
              <p className="text-text mt-1">{data.question || 'Untitled Question'}</p>
            </div>
            {data.questionImageUrl && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Question Image</label>
                <img src={data.questionImageUrl} alt="Question" className="mt-2 max-w-md rounded border" />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-textMuted">Type</label>
              <p className="text-text mt-1">{data.questionType || 'SINGLE_CHOICE'}</p>
            </div>
            {data.options && data.options.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Options</label>
                <div className="space-y-2 mt-2">
                  {data.options.map((opt, idx) => {
                    const optObj = typeof opt === 'object' ? opt : { text: opt, type: 'text', imageUrl: '', imageKey: '' };
                    const optType = optObj.type || 'text';
                    const optText = optObj.text || '';
                    const optImageUrl = optObj.imageUrl || '';
                    const optImageKey = optObj.imageKey || '';
                    const optValue = optType === 'image' ? optImageUrl : optText;
                    
                    const isCorrect = data.questionType === 'SINGLE_CHOICE'
                      ? (data.correctAnswer === optText || data.correctAnswer === optImageUrl)
                      : (data.correctAnswers && (data.correctAnswers.includes(optText) || data.correctAnswers.includes(optImageUrl)));
                    
                    return (
                      <div key={idx} className="p-2 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{String.fromCharCode(65 + idx)}.</span>
                          {optType === 'image' && optImageUrl ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={getProxyUrl(optImageUrl, optImageKey)} 
                                alt={`Option ${String.fromCharCode(65 + idx)}`} 
                                className="h-20 w-auto object-contain rounded border"
                                onError={(e) => {
                                  e.target.src = optImageUrl;
                                }}
                              />
                              <span className="text-xs text-textMuted">(Image)</span>
                            </div>
                          ) : (
                            <span className="text-text">{optText || 'Empty option'}</span>
                          )}
                          {isCorrect && (
                            <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">✓ Correct</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {data.explanation && (
              <div>
                <label className="text-sm font-semibold text-textMuted">Explanation</label>
                <p className="text-text mt-1 whitespace-pre-wrap">{data.explanation}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return <div>Unknown content type</div>;
    }
  }

  const handleAddAssignmentResource = () => {
    const updated = { ...editingItem.data };
    if (!updated.resources) updated.resources = [];
    updated.resources.push({
      type: 'DATASET',
      title: '',
      description: '',
      url: '',
      file: null,
      fileKey: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
    });
    setEditingItem({ ...editingItem, data: updated });
  };

  // Render edit content (editable form)
  function renderEditContent(item) {
    if (!item || !item.data) return <div>No data to edit</div>;

    const data = item.data;
    const updateData = (updates) => {
      setEditingItem({ ...item, data: { ...data, ...updates } });
    };

    switch (item.type) {
      case 'resources':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Title *</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Resource title..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => updateData({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Type</label>
                <select
                  value={data.type || 'DOCUMENT'}
                  onChange={(e) => updateData({ type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="DOCUMENT">Document</option>
                  <option value="VIDEO">Video</option>
                  <option value="LINK">Link</option>
                  <option value="NOTE">Note</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">For</label>
                <select
                  value={data.forWhom || 'LEARNER'}
                  onChange={(e) => updateData({ forWhom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="LEARNER">Learner</option>
                  <option value="TUTOR">Tutor</option>
                </select>
              </div>
            </div>

            {(data.type === 'DOCUMENT' || data.type === 'VIDEO') && (
              <div>
                <label className="text-sm font-semibold mb-1 block">File</label>
                {data.fileName ? (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2 flex-1">
                      <FileIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{data.fileName}</span>
                      <span className="text-xs text-textMuted">({(data.fileSize / 1024).toFixed(2)} KB)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {(data.url || data.fileKey) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const fileUrl = data.fileKey 
                              ? getProxyUrl(null, data.fileKey)
                              : (data.url || getProxyUrl(data.url));
                            setViewingFile({
                              url: fileUrl,
                              fileName: data.fileName || 'File',
                              mimeType: data.mimeType || ''
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateData({ fileName: '', fileKey: '', url: '', fileSize: 0, mimeType: '' })}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="resource-file-upload"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleUploadResourceFile(file, 0);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      accept={data.type === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip'}
                      disabled={uploadingFiles['resource-0']}
                    />
                    <label
                      htmlFor="resource-file-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                    >
                      {uploadingFiles['resource-0'] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload {data.type === 'VIDEO' ? 'Video' : 'Document'}
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            )}

            {data.type === 'LINK' && (
              <div>
                <label className="text-sm font-semibold mb-1 block">URL</label>
                <input
                  type="url"
                  value={data.url || ''}
                  onChange={(e) => updateData({ url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Enter URL..."
                />
              </div>
            )}

            {data.type === 'NOTE' && (
              <div>
                <label className="text-sm font-semibold mb-1 block">Content</label>
                <textarea
                  value={data.content || ''}
                  onChange={(e) => updateData({ content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={6}
                  placeholder="Note content..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={handleCloseView}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveItem}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        );

      case 'assignments':
        return (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-sm font-semibold mb-1 block">Name *</label>
              <input
                type="text"
                value={data.name || ''}
                onChange={(e) => updateData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Assignment name..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => updateData({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Description..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Problem Statement</label>
              <textarea
                value={data.problemStatement || ''}
                onChange={(e) => updateData({ problemStatement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="Problem statement..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Instructions</label>
              <textarea
                value={data.instructions || ''}
                onChange={(e) => updateData({ instructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Instructions..."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Difficulty</label>
                <select
                  value={data.difficulty || 'BEGINNER'}
                  onChange={(e) => updateData({ difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Max Marks</label>
                <input
                  type="number"
                  value={data.maxMarks || 100}
                  onChange={(e) => updateData({ maxMarks: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Passing Marks</label>
                <input
                  type="number"
                  value={data.passingMarks || 50}
                  onChange={(e) => updateData({ passingMarks: parseInt(e.target.value) || 50 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Supporting Data</label>
                <Button variant="ghost" size="sm" onClick={handleAddAssignmentResource}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {data.resources && data.resources.length > 0 ? (
                <div className="space-y-2">
                  {data.resources.map((res, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <select
                        value={res.type || 'DATASET'}
                        onChange={(e) => {
                          const updated = { ...data };
                          updated.resources[idx].type = e.target.value;
                          setEditingItem({ ...item, data: updated });
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
                        value={res.title || ''}
                        onChange={(e) => {
                          const updated = { ...data };
                          updated.resources[idx].title = e.target.value;
                          setEditingItem({ ...item, data: updated });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Title..."
                      />
                      {res.type === 'GIT_REPO' ? (
                        <input
                          type="url"
                          value={res.url || ''}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.resources[idx].url = e.target.value;
                            setEditingItem({ ...item, data: updated });
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          placeholder="Git URL..."
                        />
                      ) : (
                        <>
                          {res.fileName ? (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xs text-textMuted flex-1">{res.fileName}</span>
                              {(res.url || res.fileKey) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const fileUrl = res.fileKey 
                                      ? getProxyUrl(null, res.fileKey)
                                      : (res.url || getProxyUrl(res.url));
                                    setViewingFile({
                                      url: fileUrl,
                                      fileName: res.fileName || 'File',
                                      mimeType: res.mimeType || ''
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                id={`assignment-resource-${idx}`}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleUploadAssignmentResource(idx, file);
                                    e.target.value = '';
                                  }
                                }}
                                className="hidden"
                                accept={res.type === 'IMAGE' ? 'image/*' : '*'}
                              />
                              <label
                                htmlFor={`assignment-resource-${idx}`}
                                className="px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-100"
                              >
                                {uploadingFiles[`assignment-resource-${idx}`] ? (
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
                        onClick={() => handleDeleteAssignmentResource(idx)}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textMuted text-center py-4">No supporting data added</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={handleCloseView}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveItem}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        );

      case 'practiceCodes':
        return (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-sm font-semibold mb-1 block">Problem Title *</label>
              <input
                type="text"
                value={data.problem || ''}
                onChange={(e) => updateData({ problem: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Problem title..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Problem Statement</label>
              <textarea
                value={data.problemStatement || data.description || ''}
                onChange={(e) => updateData({ problemStatement: e.target.value, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={4}
                placeholder="Describe the problem..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Instructions</label>
              <textarea
                value={data.instructions || ''}
                onChange={(e) => updateData({ instructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Instructions..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Input Format</label>
                <textarea
                  value={data.inputFormat || ''}
                  onChange={(e) => updateData({ inputFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={2}
                  placeholder="Input format..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Output Format</label>
                <textarea
                  value={data.outputFormat || ''}
                  onChange={(e) => updateData({ outputFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={2}
                  placeholder="Output format..."
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Constraints</label>
              <textarea
                value={data.constraints || ''}
                onChange={(e) => updateData({ constraints: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="e.g., 1 ≤ n ≤ 100..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Sample Input</label>
                <textarea
                  value={data.sampleInput || ''}
                  onChange={(e) => updateData({ sampleInput: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={3}
                  placeholder="5 6 7&#10;3 6 10"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Sample Output</label>
                <textarea
                  value={data.sampleOutput || ''}
                  onChange={(e) => updateData({ sampleOutput: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={3}
                  placeholder="1 1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Sample Explanation</label>
              <textarea
                value={data.explanation || data.sampleExplanation || ''}
                onChange={(e) => updateData({ explanation: e.target.value, sampleExplanation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="Explanation..."
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Difficulty</label>
                <select
                  value={data.difficulty || 'BEGINNER'}
                  onChange={(e) => updateData({ difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Language</label>
                <input
                  type="text"
                  value={data.language || ''}
                  onChange={(e) => updateData({ language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Python, Java..."
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Time Limit (s)</label>
                <input
                  type="number"
                  value={data.timeLimit || ''}
                  onChange={(e) => updateData({ timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="2"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Memory Limit (MB)</label>
                <input
                  type="number"
                  value={data.memoryLimit || ''}
                  onChange={(e) => updateData({ memoryLimit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="256"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Test Cases</label>
                <Button variant="ghost" size="sm" onClick={handleAddTestCase} className="text-blue-600">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Test Case
                </Button>
              </div>
              {data.testCases && data.testCases.length > 0 ? (
                <div className="space-y-3">
                  {data.testCases.map((tc, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">Test Case {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.isSample || false}
                              onChange={(e) => {
                                const updated = { ...data };
                                updated.testCases[idx].isSample = e.target.checked;
                                setEditingItem({ ...item, data: updated });
                              }}
                              className="rounded"
                            />
                            Sample
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.isHidden || false}
                              onChange={(e) => {
                                const updated = { ...data };
                                updated.testCases[idx].isHidden = e.target.checked;
                                setEditingItem({ ...item, data: updated });
                              }}
                              className="rounded"
                            />
                            Hidden
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTestCase(idx)}
                            className="text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Input</label>
                          <textarea
                            value={tc.input || ''}
                            onChange={(e) => {
                              const updated = { ...data };
                              updated.testCases[idx].input = e.target.value;
                              setEditingItem({ ...item, data: updated });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                            rows={3}
                            placeholder="Test input..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Expected Output</label>
                          <textarea
                            value={tc.expectedOutput || ''}
                            onChange={(e) => {
                              const updated = { ...data };
                              updated.testCases[idx].expectedOutput = e.target.value;
                              setEditingItem({ ...item, data: updated });
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
                            value={tc.marks || 0}
                            onChange={(e) => {
                              const updated = { ...data };
                              updated.testCases[idx].marks = parseInt(e.target.value) || 0;
                              setEditingItem({ ...item, data: updated });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Explanation</label>
                          <input
                            type="text"
                            value={tc.explanation || ''}
                            onChange={(e) => {
                              const updated = { ...data };
                              updated.testCases[idx].explanation = e.target.value;
                              setEditingItem({ ...item, data: updated });
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="Brief explanation..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-textMuted text-center py-4 bg-gray-50 rounded">No test cases added</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Starter Code (Optional)</label>
                <textarea
                  value={data.starterCode || ''}
                  onChange={(e) => updateData({ starterCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={6}
                  placeholder="def function_name():\n    # Your code here\n    pass"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Solution (Optional)</label>
                <textarea
                  value={data.solution || ''}
                  onChange={(e) => updateData({ solution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  rows={6}
                  placeholder="# Solution code..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={handleCloseView}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveItem}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        );

      case 'mcq':
        return (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-sm font-semibold mb-1 block">Question *</label>
              <textarea
                value={data.question || ''}
                onChange={(e) => updateData({ question: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Question..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Question Image (Optional)</label>
              {data.questionImageUrl ? (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs flex-1">Image uploaded</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateData({ questionImageUrl: '', questionImageKey: '' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="mcq-question-image"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleUploadMCQImage('question', file);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                    disabled={uploadingFiles['mcq-question']}
                  />
                  <label
                    htmlFor="mcq-question-image"
                    className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50"
                  >
                    {uploadingFiles['mcq-question'] ? (
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
            <div>
              <label className="text-sm font-semibold mb-1 block">Question Type</label>
              <select
                value={data.questionType || 'SINGLE_CHOICE'}
                onChange={(e) => updateData({ 
                  questionType: e.target.value,
                  correctAnswer: e.target.value === 'ONE_WORD' ? '' : (data.correctAnswer || ''),
                  correctAnswers: e.target.value === 'MULTIPLE_CHOICE' ? [] : [],
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="SINGLE_CHOICE">Single Choice</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="ONE_WORD">One Word Answer</option>
              </select>
            </div>

            {(data.questionType === 'SINGLE_CHOICE' || data.questionType === 'MULTIPLE_CHOICE') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Options</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = { ...data };
                      if (!updated.options) updated.options = [];
                      updated.options.push({ text: '', type: 'text', imageUrl: '', imageKey: '' });
                      setEditingItem({ ...item, data: updated });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>
                {(data.options || []).map((opt, idx) => {
                  const optObj = typeof opt === 'object' ? opt : { text: opt, type: 'text', imageUrl: '', imageKey: '' };
                  const optText = optObj.text || '';
                  const optType = optObj.type || 'text';
                  const optImageUrl = optObj.imageUrl || '';
                  const optImageKey = optObj.imageKey || '';
                  
                  // For correct answer matching, use text or imageUrl
                  const optValue = optType === 'image' ? optImageUrl : optText;
                  const isCorrect = data.questionType === 'SINGLE_CHOICE'
                    ? (data.correctAnswer === optText || data.correctAnswer === optImageUrl)
                    : ((data.correctAnswers || []).includes(optText) || (data.correctAnswers || []).includes(optImageUrl));
                  
                  return (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold w-6">{String.fromCharCode(65 + idx)}</span>
                        
                        {/* Option Type Toggle */}
                        <select
                          value={optType}
                          onChange={(e) => {
                            const updated = { ...data };
                            if (!updated.options) updated.options = [];
                            updated.options[idx] = {
                              ...optObj,
                              type: e.target.value,
                              text: e.target.value === 'text' ? optText : '',
                              imageUrl: e.target.value === 'image' ? optImageUrl : '',
                              imageKey: e.target.value === 'image' ? optImageKey : ''
                            };
                            setEditingItem({ ...item, data: updated });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="text">Text</option>
                          <option value="image">Image</option>
                        </select>

                        {/* Text Input (shown when type is text) */}
                        {optType === 'text' && (
                          <input
                            type="text"
                            value={optText}
                            onChange={(e) => {
                              const updated = { ...data };
                              if (!updated.options) updated.options = [];
                              updated.options[idx] = {
                                ...optObj,
                                text: e.target.value
                              };
                              setEditingItem({ ...item, data: updated });
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          />
                        )}

                        {/* Image Upload (shown when type is image) */}
                        {optType === 'image' && (
                          <div className="flex-1">
                            {optImageUrl ? (
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                <img 
                                  src={getProxyUrl(optImageUrl, optImageKey)} 
                                  alt={`Option ${String.fromCharCode(65 + idx)}`}
                                  className="h-12 w-auto rounded"
                                  onError={(e) => {
                                    e.target.src = optImageUrl;
                                  }}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = { ...data };
                                    if (!updated.options) updated.options = [];
                                    updated.options[idx] = {
                                      ...optObj,
                                      imageUrl: '',
                                      imageKey: ''
                                    };
                                    setEditingItem({ ...item, data: updated });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  id={`mcq-option-image-${idx}`}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleUploadMCQImage('option', file, idx);
                                      e.target.value = '';
                                    }
                                  }}
                                  className="hidden"
                                  accept="image/*"
                                  disabled={uploadingFiles[`mcq-option-${idx}`]}
                                />
                                <label
                                  htmlFor={`mcq-option-image-${idx}`}
                                  className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50"
                                >
                                  {uploadingFiles[`mcq-option-${idx}`] ? (
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
                        )}

                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type={data.questionType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                            name="correct-answer"
                            checked={isCorrect}
                            onChange={(e) => {
                              const updated = { ...data };
                              if (data.questionType === 'SINGLE_CHOICE') {
                                updated.correctAnswer = optValue;
                              } else {
                                if (!updated.correctAnswers) updated.correctAnswers = [];
                                if (e.target.checked) {
                                  updated.correctAnswers.push(optValue);
                                } else {
                                  updated.correctAnswers = updated.correctAnswers.filter(a => a !== optValue);
                                }
                              }
                              setEditingItem({ ...item, data: updated });
                            }}
                          />
                          Correct
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = { ...data };
                            updated.options = updated.options.filter((_, i) => i !== idx);
                            setEditingItem({ ...item, data: updated });
                          }}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {data.questionType === 'ONE_WORD' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Correct Answer</label>
                  <input
                    type="text"
                    value={data.correctAnswer || ''}
                    onChange={(e) => updateData({ correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Enter correct answer..."
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Answer Image (Optional)</label>
                  {data.answerImageUrl ? (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <ImageIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-xs flex-1">Image uploaded</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateData({ answerImageUrl: '', answerImageKey: '' })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="mcq-answer-image"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleUploadMCQImage('answer', file);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                        accept="image/*"
                        disabled={uploadingFiles['mcq-answer']}
                      />
                      <label
                        htmlFor="mcq-answer-image"
                        className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50"
                      >
                        {uploadingFiles['mcq-answer'] ? (
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
              </div>
            )}

            <div>
              <label className="text-sm font-semibold mb-1 block">Explanation (Optional)</label>
              <textarea
                value={data.explanation || ''}
                onChange={(e) => updateData({ explanation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="Explanation..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={handleCloseView}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveItem}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Unknown content type</div>;
    }
  }
};

export default ManageContent;

