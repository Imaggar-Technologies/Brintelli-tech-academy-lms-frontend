import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X, Calendar, User, Video, FileText, Link as LinkIcon, BookOpen, Edit2, ChevronDown, ChevronUp, MoreVertical, Archive, Trash2, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Table from '../../components/Table';
import { apiRequest } from '../../api/apiClient';
import programAPI from '../../api/program';
import lsmAPI from '../../api/lsm';

// Component for 3-dot menu with session actions
const SessionActionsMenu = ({ session, moduleId, onEdit, onArchive, onDelete, onReschedule, isOpen, onToggle }) => {
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-brintelli-border bg-brintelli-card shadow-lg">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                onToggle();
              }}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReschedule(session);
                onToggle();
              }}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Reschedule
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(session);
                onToggle();
              }}
              className="w-full px-4 py-2 text-left text-sm text-text hover:bg-brintelli-baseAlt flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session);
                onToggle();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to render sessions with objective names
const ModuleSessionsList = ({ moduleId, sessions, onEditSession, onArchiveSession = null, onDeleteSession = null, onOpenRescheduleModal = null, openMenuId = null, setOpenMenuId = null }) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const response = await programAPI.getObjectivesByModule(moduleId);
        if (response.success && response.data.objectives) {
          setObjectives(response.data.objectives);
        }
      } catch (error) {
        console.error('Error fetching objectives:', error);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchObjectives();
    }
  }, [moduleId]);

  // Create columns with objective names and edit action
  const columns = [
    { key: 'name', title: 'Session Name' },
    {
      key: 'objectiveIds',
      title: 'Learning Objectives',
      render: (value, row) => {
        if (!row) return 'Not assigned';
        
        // Get objectiveIds array (support both new array format and legacy single objectiveId)
        const objectiveIdsArray = row.objectiveIds || (row.objectiveId ? [row.objectiveId] : []);
        
        if (objectiveIdsArray.length === 0) return 'Not assigned';
        
        // Find matching objectives
        const matchedObjectives = objectiveIdsArray
          .map(objId => {
            const normalizedObjId = typeof objId === 'string' 
              ? objId 
              : (objId?.toString ? objId.toString() : String(objId));
            
            const objective = objectives.find(obj => {
              const objId = obj.id || obj._id;
              const normalizedAvailableId = typeof objId === 'string' 
                ? objId 
                : (objId?.toString ? objId.toString() : String(objId));
              return normalizedAvailableId === normalizedObjId;
            });
            
            return objective ? (objective.title || objective.text || 'N/A') : null;
          })
          .filter(Boolean);
        
        if (matchedObjectives.length === 0) {
          return `(${objectiveIdsArray.length} objective${objectiveIdsArray.length > 1 ? 's' : ''})`;
        }
        
        if (matchedObjectives.length <= 2) {
          return matchedObjectives.join(', ');
        }
        
        return `${matchedObjectives.slice(0, 2).join(', ')} +${matchedObjectives.length - 2} more`;
      },
    },
    {
      key: 'type',
      title: 'Type',
      render: (value, row) => {
        if (!row) return <span>N/A</span>;
        const getTypeIcon = (type) => {
          switch (type) {
            case 'LIVE':
              return <Video className="h-4 w-4" />;
            case 'RECORDED':
              return <FileText className="h-4 w-4" />;
            case 'HYBRID':
              return <Calendar className="h-4 w-4" />;
            default:
              return <Calendar className="h-4 w-4" />;
          }
        };
        const sessionType = row.type || value;
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(sessionType)}
            <span>{sessionType || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      key: 'scheduledDate',
      title: 'Scheduled Date',
      render: (value, row) => {
        if (!row) return 'Not scheduled';
        const dateValue = row.scheduledDate || value;
        if (!dateValue) return 'Not scheduled';
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return 'Not scheduled';
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch (e) {
          console.error('Error formatting date:', e, dateValue);
          return 'Not scheduled';
        }
      },
    },
    {
      key: 'duration',
      title: 'Duration (min)',
      render: (value, row) => {
        if (!row) return '0 min';
        const duration = row.duration || value || 0;
        return `${duration} min`;
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => {
        const getStatusColor = (status) => {
          switch (status) {
            case 'SCHEDULED':
              return 'bg-blue-100 text-blue-800';
            case 'ONGOING':
              return 'bg-green-100 text-green-800';
            case 'COMPLETED':
              return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
              return 'bg-red-100 text-red-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        if (!row) return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">N/A</span>;
        const status = row.status || value || 'N/A';
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => {
        if (!row) return null;
        const sessionId = row.id || row._id;
        return (
          <div className="flex items-center gap-2 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditSession(moduleId, row)}
              title="Edit session"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {onArchiveSession && onDeleteSession && onOpenRescheduleModal && typeof openMenuId !== 'undefined' && setOpenMenuId ? (
              <SessionActionsMenu
                session={row}
                moduleId={moduleId}
                onEdit={() => onEditSession(moduleId, row)}
                onArchive={onArchiveSession}
                onDelete={onDeleteSession}
                onReschedule={onOpenRescheduleModal}
                isOpen={openMenuId === sessionId}
                onToggle={() => {
                  if (setOpenMenuId && sessionId) {
                    setOpenMenuId(openMenuId === sessionId ? null : sessionId);
                  }
                }}
              />
            ) : null}
          </div>
        );
      },
    },
  ];

  return <Table columns={columns} data={sessions} minRows={5} />;
};

const BatchSessions = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState(null);
  const [programModules, setProgramModules] = useState([]); // Program Modules from the batch's program
  const [moduleOfferings, setModuleOfferings] = useState([]); // Module Offerings: { moduleId, moduleName, tutorId, tutorName }
  const [sessions, setSessions] = useState([]); // All sessions for this batch
  const [tutors, setTutors] = useState([]);
  const [expandedModules, setExpandedModules] = useState(new Set()); // Track which modules are expanded
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showModuleOfferingModal, setShowModuleOfferingModal] = useState(false);
  const [editingModuleOffering, setEditingModuleOffering] = useState(null);
  const [editingSession, setEditingSession] = useState(null); // Track which session is being edited
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'LIVE',
    status: 'SCHEDULED',
    scheduledDate: '',
    duration: 60,
    tutorId: '',
    moduleId: '', // Module Offering's moduleId
    objectiveIds: [], // Array of Learning Objective IDs from the Program Module
  });
  const [availableObjectives, setAvailableObjectives] = useState([]);
  const [subModules, setSubModules] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which session's menu is open
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails();
      fetchTutors();
    }
  }, [batchId]);

  useEffect(() => {
    if (batch?.courseId) {
      fetchProgramModules();
      fetchSessions();
    }
  }, [batch]);

  // Fetch module offerings after program modules are loaded
  useEffect(() => {
    if (programModules.length > 0 && batchId) {
      fetchModuleOfferings();
    }
  }, [programModules, batchId]);

  const fetchBatchDetails = async () => {
    try {
      const response = await apiRequest(`/api/lsm/batches`).catch(() => null);
      if (response?.success) {
        const foundBatch = response.data.batches?.find(b => (b.id || b._id) === batchId);
        if (foundBatch) {
          setBatch(foundBatch);
        }
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      toast.error('Failed to load batch details');
    }
  };

  const fetchProgramModules = async () => {
    try {
      if (!batch?.courseId) return;
      const response = await programAPI.getModulesByProgram(batch.courseId);
      if (response.success && response.data.modules) {
        setProgramModules(response.data.modules);
      }
    } catch (error) {
      console.error('Error fetching program modules:', error);
      toast.error('Failed to load program modules');
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/lsm/batches/${batchId}/sessions`);
      if (response.success) {
        const sessionsData = response.data.sessions || [];
        // Ensure all IDs are properly formatted and preserve all fields
        const normalizedSessions = sessionsData.map(s => {
          const normalized = {
            ...s,
            id: s.id || s._id,
            _id: s._id || s.id,
            moduleId: s.moduleId || null,
            objectiveId: s.objectiveId || null,
            type: s.type || null,
            status: s.status || null,
            scheduledDate: s.scheduledDate || null,
            duration: s.duration || null,
            name: s.name || '',
            description: s.description || null,
            tutorId: s.tutorId || null,
            meetingLink: s.meetingLink || null,
            recordingUrl: s.recordingUrl || null,
            materials: s.materials || [],
          };
          return normalized;
        });
        setSessions(normalizedSessions);
      } else {
        toast.error(response.message || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
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

  const fetchObjectives = async (moduleId) => {
    if (!moduleId) {
      setAvailableObjectives([]);
      setSubModules([]);
      return;
    }
    try {
      // Fetch sub-modules first
      const subModulesResponse = await programAPI.getSubModulesByModule(moduleId);
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
        const response = await programAPI.getObjectivesByModule(moduleId);
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
        const response = await programAPI.getObjectivesByModule(moduleId);
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

  const fetchModuleOfferings = async () => {
    try {
      const response = await lsmAPI.getBatchModuleOfferings(batchId);
      if (response.success && response.data.moduleOfferings) {
        // Map backend offerings to frontend format
        const offerings = response.data.moduleOfferings.map(offering => ({
          moduleId: offering.moduleId,
          moduleName: offering.module?.name || '',
          moduleDescription: offering.module?.description || '',
          tutorId: offering.tutorId || null,
          tutorName: offering.tutor ? (offering.tutor.fullName || offering.tutor.email) : null,
        }));
        setModuleOfferings(offerings);
      } else {
        // If no offerings returned, initialize from program modules
        if (programModules.length > 0) {
          initializeModuleOfferingsFromModules();
        }
      }
    } catch (error) {
      console.error('Error fetching module offerings:', error);
      // If error (e.g., 404), initialize from program modules
      if (programModules.length > 0) {
        initializeModuleOfferingsFromModules();
      }
    }
  };

  // Initialize Module Offerings from Program Modules (fallback when no backend data)
  const initializeModuleOfferingsFromModules = () => {
    const offerings = programModules.map(module => ({
      moduleId: module.id || module._id,
      moduleName: module.name,
      moduleDescription: module.description,
      tutorId: null,
      tutorName: null,
    }));
    setModuleOfferings(offerings);
  };

  const handleAssignTutor = (moduleId) => {
    const module = programModules.find(m => (m.id || m._id) === moduleId);
    const existingOffering = moduleOfferings.find(mo => mo.moduleId === moduleId);
    setEditingModuleOffering({
      moduleId,
      moduleName: module?.name || '',
      tutorId: existingOffering?.tutorId || '',
    });
    setShowModuleOfferingModal(true);
  };

  const handleSaveModuleOffering = async () => {
    if (!editingModuleOffering.tutorId) {
      toast.error('Please select a tutor');
      return;
    }

    try {
      const response = await lsmAPI.assignTutorToModule(
        batchId,
        editingModuleOffering.moduleId,
        editingModuleOffering.tutorId
      );

      if (response.success) {
        const tutor = tutors.find(t => (t.id || t._id) === editingModuleOffering.tutorId);
        const updatedOfferings = moduleOfferings.map(offering =>
          offering.moduleId === editingModuleOffering.moduleId
            ? {
                ...offering,
                tutorId: editingModuleOffering.tutorId,
                tutorName: tutor ? (tutor.fullName || tutor.email) : null,
              }
            : offering
        );

        // If this is a new offering, add it
        if (!updatedOfferings.find(o => o.moduleId === editingModuleOffering.moduleId)) {
          const module = programModules.find(m => (m.id || m._id) === editingModuleOffering.moduleId);
          updatedOfferings.push({
            moduleId: editingModuleOffering.moduleId,
            moduleName: module?.name || '',
            moduleDescription: module?.description,
            tutorId: editingModuleOffering.tutorId,
            tutorName: tutor ? (tutor.fullName || tutor.email) : null,
          });
        }

        setModuleOfferings(updatedOfferings);
        setShowModuleOfferingModal(false);
        setEditingModuleOffering(null);
        toast.success('Tutor assigned to module successfully');
      } else {
        toast.error(response.message || 'Failed to assign tutor');
      }
    } catch (error) {
      console.error('Error assigning tutor:', error);
      toast.error(error.message || 'Failed to assign tutor to module');
    }
  };

  const toggleModuleExpansion = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getSessionsForModule = (moduleId) => {
    const targetModuleId = moduleId?.toString() || String(moduleId);
    return sessions.filter(s => {
      // Handle both string and ObjectId formats
      const sessionModuleId = s.moduleId 
        ? (typeof s.moduleId === 'string' ? s.moduleId : (s.moduleId.toString ? s.moduleId.toString() : String(s.moduleId)))
        : null;
      return sessionModuleId && sessionModuleId === targetModuleId;
    });
  };

  const handleOpenSessionModal = (moduleId, session = null) => {
    console.log('handleOpenSessionModal called with:', { moduleId, session, hasId: !!(session?.id || session?._id) });
    
    // Check if we're editing - session must have an ID
    const hasSessionId = session && (session.id || session._id);
    
    // If editing, use the session's moduleId if available
    const targetModuleId = session?.moduleId 
      ? (typeof session.moduleId === 'string' ? session.moduleId : (session.moduleId.toString() || session.moduleId))
      : moduleId;
    
    if (!targetModuleId) {
      toast.error('Module ID is required');
      return;
    }

    const offering = moduleOfferings.find(mo => {
      const moId = mo.moduleId?.toString() || mo.moduleId;
      const tgtId = targetModuleId?.toString() || targetModuleId;
      return moId === tgtId;
    });
    
    if (!offering || !offering.tutorId) {
      toast.error('Please assign a tutor to this module before creating sessions');
      return;
    }

    if (hasSessionId) {
      // Editing existing session - ensure we have a valid session ID
      console.log('Editing session:', session);
      // Make sure we store the full session object with all fields
      const sessionToEdit = {
        ...session,
        id: session.id || session._id?.toString() || session._id,
        _id: session._id || session.id,
      };
      console.log('Session to edit (normalized):', sessionToEdit);
      setEditingSession(sessionToEdit);
      
      // Format scheduledDate for datetime-local input (YYYY-MM-DDTHH:mm)
      let scheduledDate = '';
      if (session.scheduledDate) {
        try {
          const date = new Date(session.scheduledDate);
          if (!isNaN(date.getTime())) {
            // Convert to local time and format for datetime-local
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            scheduledDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          }
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }
      
      // Get the moduleId from session or use the passed one
      const sessionModuleId = session.moduleId 
        ? (session.moduleId.toString() || session.moduleId)
        : targetModuleId;
      
      // Get objectiveIds - handle both array and single value (legacy)
      let objectiveIds = [];
      if (session.objectiveIds && Array.isArray(session.objectiveIds)) {
        objectiveIds = session.objectiveIds.map(id => {
          if (typeof id === 'string') return id;
          if (id?.toString) return id.toString();
          return String(id);
        });
      } else if (session.objectiveId) {
        // Legacy: convert single objectiveId to array
        if (typeof session.objectiveId === 'string') {
          objectiveIds = [session.objectiveId];
        } else if (session.objectiveId.toString) {
          objectiveIds = [session.objectiveId.toString()];
        } else {
          objectiveIds = [String(session.objectiveId)];
        }
      }
      
      // Get tutorId - handle both ObjectId and string formats
      let tutorId = offering.tutorId;
      if (session.tutorId) {
        if (typeof session.tutorId === 'string') {
          tutorId = session.tutorId;
        } else if (session.tutorId.toString) {
          tutorId = session.tutorId.toString();
        } else {
          tutorId = String(session.tutorId);
        }
      }
      
      setFormData({
        name: session.name || '',
        description: session.description || '',
        type: session.type || 'LIVE',
        status: session.status || 'SCHEDULED',
        scheduledDate: scheduledDate,
        duration: session.duration || 60,
        tutorId: tutorId,
        moduleId: sessionModuleId,
        objectiveIds: objectiveIds,
      });
      fetchObjectives(sessionModuleId);
    } else {
      // Creating new session
      console.log('Creating new session for module:', targetModuleId);
      setEditingSession(null);
      setFormData({
        name: '',
        description: '',
        type: 'LIVE',
        status: 'SCHEDULED',
        scheduledDate: '',
        duration: 60,
        tutorId: offering.tutorId, // Pre-fill with assigned tutor
        moduleId: targetModuleId,
        objectiveIds: [],
      });
      fetchObjectives(targetModuleId);
    }
    setShowSessionModal(true);
  };

  const handleCreateSession = async () => {
    if (!formData.name.trim()) {
      toast.error('Session name is required');
      return;
    }

    if (!formData.moduleId) {
      toast.error('Module is required');
      return;
    }

    if (!formData.objectiveIds || formData.objectiveIds.length === 0) {
      toast.error('Please select at least one learning objective');
      return;
    }

    if (!formData.scheduledDate) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    if (!formData.tutorId) {
      toast.error('Tutor is required');
      return;
    }

    try {
      const sessionData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        scheduledDate: formData.scheduledDate,
        duration: formData.duration,
        tutorId: formData.tutorId,
        // meetingLink will be auto-generated by backend
        moduleId: formData.moduleId, // Program Module ID
        objectiveIds: formData.objectiveIds, // Array of Learning Objective IDs
      };

      let response;
      const isEditing = editingSession && (editingSession.id || editingSession._id);
      
      if (isEditing) {
        // Update existing session
        const sessionId = editingSession.id || editingSession._id?.toString() || editingSession._id;
        console.log('Updating session:', { sessionId, editingSession, sessionData });
        
        if (!sessionId) {
          toast.error('Session ID is missing. Cannot update session.');
          return;
        }
        
        response = await lsmAPI.updateSession(sessionId, sessionData);
        if (response.success) {
          toast.success('Session updated successfully');
        } else {
          toast.error(response.message || 'Failed to update session');
          return;
        }
      } else {
        // Create new session
        console.log('Creating new session:', { batchId, sessionData, objectiveIds: formData.objectiveIds, moduleId: formData.moduleId });
        response = await lsmAPI.createSession(batchId, sessionData);
        if (response.success) {
          toast.success('Session created successfully');
        } else {
          toast.error(response.message || 'Failed to create session');
          return;
        }
      }

      if (response.success) {
        setShowSessionModal(false);
        resetForm();
        fetchSessions();
      } else {
        toast.error(response.message || `Failed to ${editingSession ? 'update' : 'create'} session`);
      }
    } catch (error) {
      console.error(`Error ${editingSession ? 'updating' : 'creating'} session:`, error);
      toast.error(error.message || `Failed to ${editingSession ? 'update' : 'create'} session`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'LIVE',
      status: 'SCHEDULED',
      scheduledDate: '',
      duration: 60,
      tutorId: '',
            moduleId: '',
            objectiveIds: [],
          });
          setAvailableObjectives([]);
          setSubModules([]);
    setEditingSession(null);
  };

  const handleArchiveSession = async (session) => {
    if (!window.confirm(`Are you sure you want to archive the session "${session.name}"?`)) {
      return;
    }

    try {
      const sessionId = session.id || session._id;
      const response = await lsmAPI.updateSession(sessionId, { status: 'ARCHIVED' });
      
      if (response.success) {
        toast.success('Session archived successfully');
        fetchSessions();
      } else {
        toast.error(response.message || 'Failed to archive session');
      }
    } catch (error) {
      console.error('Error archiving session:', error);
      toast.error(error.message || 'Failed to archive session');
    }
  };

  const handleDeleteSession = async (session) => {
    if (!window.confirm(`Are you sure you want to delete the session "${session.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const sessionId = session.id || session._id;
      const response = await lsmAPI.deleteSession(sessionId);
      
      if (response.success) {
        toast.success('Session deleted successfully');
        fetchSessions();
      } else {
        toast.error(response.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error(error.message || 'Failed to delete session');
    }
  };

  const handleOpenRescheduleModal = (session) => {
    setSessionToReschedule(session);
    if (session.scheduledDate) {
      const date = new Date(session.scheduledDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setRescheduleDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setRescheduleDate('');
    }
    setShowRescheduleModal(true);
  };

  const handleRescheduleSession = async () => {
    if (!rescheduleDate) {
      toast.error('Please select a new date and time');
      return;
    }

    try {
      const sessionId = sessionToReschedule.id || sessionToReschedule._id;
      const response = await lsmAPI.updateSession(sessionId, { scheduledDate: rescheduleDate });
      
      if (response.success) {
        toast.success('Session rescheduled successfully');
        setShowRescheduleModal(false);
        setSessionToReschedule(null);
        setRescheduleDate('');
        fetchSessions();
      } else {
        toast.error(response.message || 'Failed to reschedule session');
      }
    } catch (error) {
      console.error('Error rescheduling session:', error);
      toast.error(error.message || 'Failed to reschedule session');
    }
  };


  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'ONGOING':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'LIVE':
        return <Video className="h-4 w-4" />;
      case 'RECORDED':
        return <FileText className="h-4 w-4" />;
      case 'HYBRID':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <>
      <PageHeader
        title={batch ? `Sessions - ${batch.name}` : 'Sessions'}
        description="Manage module offerings and sessions for this batch"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/program-manager/batches')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </div>
        }
      />

      {/* Module Offerings Section */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Module Offerings</h3>
            <p className="text-sm text-textMuted mt-1">
              Program modules assigned to tutors for this batch. Create sessions under each module offering.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-textMuted">Loading...</p>
          </div>
        ) : programModules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">No modules found for this program.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {programModules.map((module) => {
              const moduleId = module.id || module._id;
              const moduleIdStr = typeof moduleId === 'string' ? moduleId : (moduleId?.toString ? moduleId.toString() : String(moduleId));
              
              const offering = moduleOfferings.find(mo => {
                const moId = typeof mo.moduleId === 'string' ? mo.moduleId : (mo.moduleId?.toString ? mo.moduleId.toString() : String(mo.moduleId));
                return moId === moduleIdStr;
              });
              
              const moduleSessions = getSessionsForModule(moduleIdStr);
              const isExpanded = expandedModules.has(moduleIdStr);
              const hasTutor = offering && offering.tutorId;
              
              // Debug logging (commented out to reduce console noise)
              // if (moduleSessions.length > 0) {
              //   console.log(`Module ${module.name} (${moduleIdStr}) has ${moduleSessions.length} sessions:`, moduleSessions);
              // }

              return (
                <div key={moduleIdStr} className="border border-brintelli-border rounded-lg bg-brintelli-baseAlt">
                  {/* Module Offering Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleModuleExpansion(moduleIdStr)}
                        className="text-textMuted hover:text-text"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <BookOpen className="h-5 w-5 text-brand-500" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-text">{module.name}</h4>
                        {module.description && (
                          <p className="text-sm text-textMuted mt-1">{module.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          {hasTutor ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-textMuted" />
                              <span className="text-sm text-text">
                                Tutor: <span className="font-medium">{offering.tutorName}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-textMuted">No tutor assigned</span>
                          )}
                          <span className="text-sm text-textMuted">
                            {moduleSessions.length} session{moduleSessions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAssignTutor(moduleIdStr)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {hasTutor ? 'Change Tutor' : 'Assign Tutor'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenSessionModal(moduleIdStr)}
                        disabled={!hasTutor}
                        title={!hasTutor ? 'Please assign a tutor first' : 'Create session for this module'}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Session
                      </Button>
                    </div>
                  </div>

                  {/* Sessions List (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-brintelli-border bg-brintelli-card">
                      {moduleSessions.length === 0 ? (
                        <div className="p-8 text-center">
                          <Calendar className="h-8 w-8 text-textMuted mx-auto mb-2" />
                          <p className="text-sm text-textMuted">No sessions created for this module yet</p>
                        </div>
                      ) : (
                        <div className="p-4">
                          {/* Fetch objectives for this module when expanded to show names */}
                          <ModuleSessionsList 
                            moduleId={moduleIdStr}
                            sessions={moduleSessions}
                            onEditSession={handleOpenSessionModal}
                            onArchiveSession={handleArchiveSession}
                            onDeleteSession={handleDeleteSession}
                            onOpenRescheduleModal={handleOpenRescheduleModal}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Tutor to Module Offering Modal */}
      {showModuleOfferingModal && editingModuleOffering && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Assign Tutor to Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Module</label>
                <input
                  type="text"
                  value={editingModuleOffering.moduleName}
                  disabled
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Assign Tutor <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingModuleOffering.tutorId || ''}
                  onChange={(e) => setEditingModuleOffering({ ...editingModuleOffering, tutorId: e.target.value })}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
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
                  This tutor will teach all sessions for this module
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleSaveModuleOffering}>
                Assign Tutor
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowModuleOfferingModal(false);
                setEditingModuleOffering(null);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                {editingSession ? 'Edit Session' : 'Create Session'}
              </h3>
              {editingSession && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  Editing: {editingSession.name || 'Session'}
                </span>
              )}
            </div>
            <div className="space-y-4">
              {/* Module Info (Read-only) */}
              {formData.moduleId && (
                <div className="bg-brintelli-baseAlt p-3 rounded-lg border border-brintelli-border">
                  <div className="text-sm text-textMuted mb-1">Module</div>
                  <div className="font-medium text-text">
                    {programModules.find(m => (m.id || m._id) === formData.moduleId)?.name || 'N/A'}
                  </div>
                  {moduleOfferings.find(mo => mo.moduleId === formData.moduleId)?.tutorName && (
                    <div className="text-sm text-textMuted mt-1">
                      Tutor: {moduleOfferings.find(mo => mo.moduleId === formData.moduleId)?.tutorName}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Fields */}
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Session Name <span className="text-red-500">*</span>
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
                />
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
                  Learning Objectives <span className="text-red-500">*</span>
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
                                  const isSelected = formData.objectiveIds?.includes(obj.id || obj._id);
                                  return (
                                    <label
                                      key={obj.id || obj._id}
                                      className="flex items-start gap-2 p-2 rounded hover:bg-brintelli-card cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          const currentIds = formData.objectiveIds || [];
                                          if (e.target.checked) {
                                            setFormData({
                                              ...formData,
                                              objectiveIds: [...currentIds, obj.id || obj._id],
                                            });
                                          } else {
                                            setFormData({
                                              ...formData,
                                              objectiveIds: currentIds.filter(id => id !== (obj.id || obj._id)),
                                            });
                                          }
                                        }}
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
                          const isSelected = formData.objectiveIds?.includes(obj.id || obj._id);
                          return (
                            <label
                              key={obj.id || obj._id}
                              className="flex items-start gap-2 p-2 rounded hover:bg-brintelli-card cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const currentIds = formData.objectiveIds || [];
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      objectiveIds: [...currentIds, obj.id || obj._id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      objectiveIds: currentIds.filter(id => id !== (obj.id || obj._id)),
                                    });
                                  }
                                }}
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
                <p className="text-xs text-textMuted mt-1">
                  {formData.objectiveIds?.length || 0} objective{formData.objectiveIds?.length !== 1 ? 's' : ''} selected.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type || 'LIVE'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  <label className="block text-sm font-medium text-text mb-2">
                    Scheduled Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || 60}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  />
                </div>
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleCreateSession}>
                {editingSession ? 'Update Session' : 'Create Session'}
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowSessionModal(false);
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Session Modal */}
      {showRescheduleModal && sessionToReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-brintelli-card rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Reschedule Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={sessionToReschedule.name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-baseAlt text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  New Scheduled Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleRescheduleSession}>
                Reschedule
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowRescheduleModal(false);
                setSessionToReschedule(null);
                setRescheduleDate('');
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

export default BatchSessions;
