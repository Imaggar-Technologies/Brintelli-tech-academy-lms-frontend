import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Presentation, Plus, Search, RefreshCw, Calendar, Users, Clock, Edit2, Trash2, X, Settings, Mail, FileText, UserCircle, Trophy, Gift, MessageSquare, Award } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import workshopAPI from '../../api/workshop';
import programAPI from '../../api/program';
import { apiRequest } from '../../api/apiClient';
import { SUBJECTS, CURRENCIES } from '../../config/domainConstants';

const DELIVERY_MODES = [{ value: 'LIVE', label: 'Live' }, { value: 'OFFLINE', label: 'Offline' }];

const defaultFormData = () => ({
  title: '',
  description: '',
  date: '',
  time: '',
  duration: '',
  maxParticipants: '',
  tutorId: '',
  programId: '',
  moduleId: '',
  meetingLink: '',
  subject: '',
  topics: [],
  resources: [],
  deliveryMode: 'LIVE',
  venue: '',
  coverImage: '',
  thumbnailImage: '',
  heroImages: [],
  icon: '',
  feeCurrency: 'INR',
  feeAmount: 0,
});

const Workshops = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [formData, setFormData] = useState(defaultFormData());
  const [topicInput, setTopicInput] = useState('');
  const [resourceLabel, setResourceLabel] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [tutors, setTutors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  // Manage workshop modal
  const [manageWorkshop, setManageWorkshop] = useState(null);
  const [manageParticipants, setManageParticipants] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageResources, setManageResources] = useState([]);
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [savingResources, setSavingResources] = useState(false);
  const [emailForm, setEmailForm] = useState({ type: 'reminder', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  // View registered people modal (from table count click)
  const [viewRegisteredWorkshop, setViewRegisteredWorkshop] = useState(null);
  const [viewRegisteredList, setViewRegisteredList] = useState([]);
  const [showViewRegisteredModal, setShowViewRegisteredModal] = useState(false);
  const [loadingRegistered, setLoadingRegistered] = useState(false);
  // PM: assignments, feedback, quiz, vouchers
  const [manageAssignments, setManageAssignments] = useState([]);
  const [manageFeedback, setManageFeedback] = useState([]);
  const [manageQuiz, setManageQuiz] = useState(null);
  const [manageVouchers, setManageVouchers] = useState([]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherExpiry, setNewVoucherExpiry] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [savingVoucher, setSavingVoucher] = useState(false);
  const [manageLeaderboard, setManageLeaderboard] = useState([]);
  const [manageCertificates, setManageCertificates] = useState([]);
  const [notifyParticipantsOnSave, setNotifyParticipantsOnSave] = useState(false);
  const [quizPublishing, setQuizPublishing] = useState(false);
  const [certsGenerating, setCertsGenerating] = useState(false);
  const [certsSending, setCertsSending] = useState(false);

  useEffect(() => {
    fetchWorkshops();
    fetchTutors();
    fetchPrograms();
  }, []);

  // Refetch workshops when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWorkshops();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (formData.programId) {
      fetchModules();
    }
  }, [formData.programId]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await workshopAPI.getAllWorkshops({ search: searchTerm });
      if (response.success) {
        setWorkshops(response.data.workshops || []);
      } else {
        toast.error(response.message || 'Failed to load workshops');
        setWorkshops([]);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
      toast.error(error.message || 'Failed to load workshops');
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await apiRequest('/api/users/role/tutor');
      if (response.success && response.data?.users) {
        const normalizedTutors = response.data.users.map((tutor) => ({
          ...tutor,
          id: tutor.id || tutor._id?.toString(),
          _id: tutor._id?.toString() || tutor.id,
          name: tutor.fullName || tutor.name || tutor.email?.split('@')[0] || 'Unknown',
        }));
        setTutors(normalizedTutors);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setTutors([]);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchModules = async () => {
    try {
      if (formData.programId) {
        const response = await programAPI.getModulesByProgram(formData.programId);
        if (response.success) {
          setModules(response.data.modules || []);
        }
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const addTopic = () => {
    const t = topicInput.trim();
    if (!t) return;
    if (formData.topics.includes(t)) return;
    setFormData({ ...formData, topics: [...formData.topics, t] });
    setTopicInput('');
  };

  const removeTopic = (idx) => {
    setFormData({ ...formData, topics: formData.topics.filter((_, i) => i !== idx) });
  };

  const addResource = () => {
    const label = resourceLabel.trim();
    const url = resourceUrl.trim();
    if (!label || !url) return;
    setFormData({ ...formData, resources: [...formData.resources, { label, url }] });
    setResourceLabel('');
    setResourceUrl('');
  };

  const removeResource = (idx) => {
    setFormData({ ...formData, resources: formData.resources.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.title) {
        toast.error('Title is required');
        return;
      }
      if (!formData.date) {
        toast.error('Date is required');
        return;
      }
      if (!formData.time) {
        toast.error('Time is required');
        return;
      }

      const workshopData = {
        title: formData.title,
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        duration: formData.duration || 60,
        maxParticipants: formData.maxParticipants || 50,
        tutorId: formData.tutorId || null,
        programId: formData.programId || null,
        moduleId: formData.moduleId || null,
        meetingLink: formData.meetingLink || null,
        subject: formData.subject || null,
        topics: formData.topics || [],
        resources: formData.resources || [],
        deliveryMode: formData.deliveryMode || 'LIVE',
        venue: formData.venue || null,
        coverImage: formData.coverImage || null,
        thumbnailImage: formData.thumbnailImage || null,
        heroImages: Array.isArray(formData.heroImages) ? formData.heroImages : [],
        icon: formData.icon || null,
        feeCurrency: formData.feeCurrency || 'INR',
        feeAmount: formData.feeAmount ?? 0,
      };

      let response;
      if (editingWorkshop) {
        response = await workshopAPI.updateWorkshop(editingWorkshop.id || editingWorkshop._id, workshopData);
      } else {
        response = await workshopAPI.createWorkshop(workshopData);
      }

      if (response.success) {
        toast.success(editingWorkshop ? 'Workshop updated successfully' : 'Workshop created successfully');
        setShowModal(false);
        setEditingWorkshop(null);
        setFormData(defaultFormData());
        fetchWorkshops();
      } else {
        toast.error(response.message || 'Failed to save workshop');
      }
    } catch (error) {
      console.error('Error saving workshop:', error);
      toast.error(error.message || 'Failed to save workshop');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    try {
      const response = await workshopAPI.deleteWorkshop(id);
      if (response.success) {
        toast.success('Workshop deleted successfully');
        fetchWorkshops();
      } else {
        toast.error(response.message || 'Failed to delete workshop');
      }
    } catch (error) {
      console.error('Error deleting workshop:', error);
      toast.error(error.message || 'Failed to delete workshop');
    }
  };

  const openManage = async (workshop) => {
    const id = workshop.id || workshop._id;
    setManageWorkshop(workshop);
    setManageResources(Array.isArray(workshop.resources) ? workshop.resources.map((r) => ({ label: r.label || '', url: r.url || '' })) : []);
    setEmailForm({ type: 'reminder', subject: '', body: '' });
    setShowManageModal(true);
    setManageParticipants([]);
    setManageAssignments([]);
    setManageFeedback([]);
    setManageQuiz(null);
    setManageVouchers([]);
    setManageLeaderboard([]);
    setManageCertificates([]);
    try {
      const [pRes, aRes, fRes, qRes, vRes, lbRes, certRes] = await Promise.all([
        workshopAPI.getParticipants(id),
        workshopAPI.getAssignments(id),
        workshopAPI.getFeedback(id),
        workshopAPI.getQuiz(id),
        workshopAPI.getVouchers(id),
        workshopAPI.getLeaderboard(id),
        workshopAPI.getCertificates(id),
      ]);
      if (pRes.success && pRes.data?.participants) setManageParticipants(pRes.data.participants);
      if (aRes.success && aRes.data?.assignments) setManageAssignments(aRes.data.assignments);
      if (fRes.success && fRes.data?.feedback) setManageFeedback(fRes.data.feedback);
      if (qRes.success && qRes.data?.quiz) setManageQuiz(qRes.data.quiz);
      if (vRes.success && vRes.data?.vouchers) setManageVouchers(vRes.data.vouchers);
      if (lbRes.success && lbRes.data?.leaderboard) setManageLeaderboard(lbRes.data.leaderboard);
      if (certRes.success && certRes.data?.certificates) setManageCertificates(certRes.data.certificates);
    } catch (e) {
      console.error('Error fetching manage data:', e);
      toast.error('Failed to load some data');
    }
  };

  const closeManage = () => {
    setShowManageModal(false);
    setManageWorkshop(null);
    setManageParticipants([]);
    setManageLeaderboard([]);
    setManageCertificates([]);
    setShowAllUsersModal(false);
  };

  const addManageResource = () => {
    if (!newResourceLabel.trim() || !newResourceUrl.trim()) return;
    setManageResources((r) => [...r, { label: newResourceLabel.trim(), url: newResourceUrl.trim() }]);
    setNewResourceLabel('');
    setNewResourceUrl('');
  };

  const removeManageResource = (idx) => {
    setManageResources((r) => r.filter((_, i) => i !== idx));
  };

  const saveManageResources = async () => {
    if (!manageWorkshop) return;
    setSavingResources(true);
    try {
      const id = manageWorkshop.id || manageWorkshop._id;
      await workshopAPI.updateWorkshop(id, { ...manageWorkshop, resources: manageResources });
      toast.success('Resources updated');
      setManageWorkshop((w) => (w ? { ...w, resources: manageResources } : null));
      fetchWorkshops();
    } catch (e) {
      toast.error(e.message || 'Failed to save resources');
    } finally {
      setSavingResources(false);
    }
  };

  const openViewRegistered = async (workshop) => {
    setViewRegisteredWorkshop(workshop);
    setViewRegisteredList([]);
    setShowViewRegisteredModal(true);
    setLoadingRegistered(true);
    try {
      const id = workshop.id || workshop._id;
      const res = await workshopAPI.getParticipants(id);
      if (res.success && res.data?.participants) setViewRegisteredList(res.data.participants);
    } catch (e) {
      console.error('Error fetching participants:', e);
      toast.error('Failed to load registered people');
    } finally {
      setLoadingRegistered(false);
    }
  };

  const addAssignment = async () => {
    if (!manageWorkshop || !newAssignmentTitle.trim()) return;
    setSavingAssignment(true);
    try {
      const res = await workshopAPI.createAssignment(manageWorkshop.id || manageWorkshop._id, { title: newAssignmentTitle.trim(), description: '' });
      if (res.success) {
        setManageAssignments((a) => [res.data.assignment, ...a]);
        setNewAssignmentTitle('');
        toast.success('Assignment added');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to add assignment');
    } finally {
      setSavingAssignment(false);
    }
  };

  const createVoucherAndSend = async () => {
    if (!manageWorkshop) return;
    setSavingVoucher(true);
    try {
      const res = await workshopAPI.createVoucher(manageWorkshop.id || manageWorkshop._id, {
        code: newVoucherCode.trim() || undefined,
        type: 'ATTENDANCE',
        expiresAt: newVoucherExpiry.trim() ? new Date(newVoucherExpiry).toISOString() : undefined,
      });
      if (res.success && res.data?.voucher) {
        await workshopAPI.sendVoucherToAttendees(manageWorkshop.id || manageWorkshop._id, res.data.voucher.id);
        setManageVouchers((v) => [res.data.voucher, ...v]);
        setNewVoucherCode('');
        setNewVoucherExpiry('');
        toast.success('Voucher created and sent to attendees');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to create/send voucher');
    } finally {
      setSavingVoucher(false);
    }
  };

  const sendEmailToParticipants = async () => {
    if (!manageWorkshop) return;
    setSendingEmail(true);
    try {
      const id = manageWorkshop.id || manageWorkshop._id;
      await workshopAPI.sendEmailToEnrolled(id, {
        type: emailForm.type,
        subject: emailForm.subject || undefined,
        body: emailForm.body || undefined,
      });
      toast.success('Email sent to enrolled participants');
      setEmailForm({ type: 'reminder', subject: '', body: '' });
    } catch (e) {
      toast.error(e.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Workshops are already filtered by search term from API
  const filteredWorkshops = workshops;

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkshops = filteredWorkshops.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <PageHeader
        title="Workshops"
        description="Manage workshops and special sessions"
        actions={
          <>
            <Button variant="primary" size="sm" onClick={() => {
              setEditingWorkshop(null);
              setFormData(defaultFormData());
              setShowModal(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workshop
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchWorkshops}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search workshops..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-brintelli-border bg-brintelli-baseAlt text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Workshops Table */}
      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-500 mx-auto mb-4" />
            <p className="text-textMuted">Loading workshops...</p>
          </div>
        ) : paginatedWorkshops.length === 0 ? (
          <div className="text-center py-12">
            <Presentation className="h-12 w-12 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted">
              {searchTerm ? 'No workshops match your search.' : 'No workshops found. Create your first workshop!'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-brintelli-border">
                <thead className="bg-brintelli-baseAlt/50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Title</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Subject</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Date & Time</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Delivery</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Venue</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Tutor</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Participants</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brintelli-border/30">
                  {paginatedWorkshops.map((workshop) => (
                    <tr key={workshop.id || workshop._id} className="transition-colors duration-150 hover:bg-brintelli-baseAlt/30">
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-[11px] font-medium text-text">{workshop.title || 'Untitled'}</span>
                          {workshop.description && (
                            <p className="text-[10px] text-textMuted mt-1 line-clamp-1">{workshop.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-textMuted">{workshop.subject || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[11px] text-text">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {workshop.date || '—'}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {workshop.time || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-textMuted">{workshop.deliveryMode || '—'}</td>
                      <td className="px-4 py-3 text-[11px] text-textMuted max-w-[120px] truncate" title={workshop.venue}>{workshop.venue || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{workshop.tutorName || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openViewRegistered(workshop)}
                          className="flex items-center gap-1 text-[11px] text-textMuted hover:text-brand-600 hover:underline"
                          title="View all registered people"
                        >
                          <Users className="h-3 w-3" />
                          {workshop.participantsCount ?? workshop.participants?.length ?? 0} / {workshop.maxParticipants || '—'}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/program-manager/workshops/${workshop.id || workshop._id}/manage`)}
                            className="px-2 py-1 text-[10px]"
                            title="Manage resources, tutor, participants, email"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingWorkshop(workshop);
                            setFormData({
                              title: workshop.title || '',
                              description: workshop.description || '',
                              date: workshop.date || '',
                              time: workshop.time || '',
                              duration: workshop.duration || '',
                              maxParticipants: workshop.maxParticipants || '',
                              tutorId: workshop.tutorId?.toString() || workshop.tutorId || '',
                              programId: workshop.programId?.toString() || workshop.programId || '',
                              moduleId: workshop.moduleId?.toString() || workshop.moduleId || '',
                              meetingLink: workshop.meetingLink || '',
                              subject: workshop.subject || '',
                              topics: Array.isArray(workshop.topics) ? [...workshop.topics] : [],
                              resources: Array.isArray(workshop.resources) ? workshop.resources.map((r) => ({ label: r.label || '', url: r.url || '' })) : [],
                              deliveryMode: workshop.deliveryMode || 'LIVE',
                              venue: workshop.venue || '',
                              coverImage: workshop.coverImage || '',
                              thumbnailImage: workshop.thumbnailImage || '',
                              heroImages: Array.isArray(workshop.heroImages) ? [...workshop.heroImages] : [],
                              icon: workshop.icon || '',
                              feeCurrency: workshop.feeCurrency || 'INR',
                              feeAmount: workshop.feeAmount ?? 0,
                            });
                            setShowModal(true);
                          }} className="px-2 py-1 text-[10px]">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(workshop.id || workshop._id)} className="px-2 py-1 text-[10px] text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
                  totalItems={filteredWorkshops.length}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingWorkshop(null);
          setFormData(defaultFormData());
        }}
        title={editingWorkshop ? 'Edit Workshop' : 'Create Workshop'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Workshop title..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Workshop description..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Subject / Domain</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Cover image URL</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnailImage}
                onChange={(e) => setFormData({ ...formData, thumbnailImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Icon / logo URL</label>
              <input
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Hero images (19:6) – one URL per line</label>
              <textarea
                value={(formData.heroImages || []).join('\n')}
                onChange={(e) => setFormData({ ...formData, heroImages: e.target.value.split('\n').map(u => u.trim()).filter(Boolean) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Course fee – Currency</label>
              <select
                value={formData.feeCurrency}
                onChange={(e) => setFormData({ ...formData, feeCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[140px]"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Amount</label>
              <input
                type="number"
                value={formData.feeAmount ?? ''}
                onChange={(e) => setFormData({ ...formData, feeAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[120px]"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Topics</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.topics.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-500/10 text-brand-600 text-xs">
                  {t} <button type="button" onClick={() => removeTopic(i)} className="hover:text-red-600"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Add topic..."
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTopic}>Add</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Resources (label + URL)</label>
            <ul className="mb-2 space-y-1">
              {formData.resources.map((r, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 truncate max-w-[200px]">{r.label}</a>
                  <button type="button" onClick={() => removeResource(i)} className="text-red-600 hover:underline"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={resourceLabel}
                onChange={(e) => setResourceLabel(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Label"
              />
              <input
                type="url"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://..."
              />
              <Button type="button" variant="secondary" size="sm" onClick={addResource}>Add</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Delivery</label>
              <select
                value={formData.deliveryMode}
                onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DELIVERY_MODES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Address or Online"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Max Participants</label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Program</label>
            <select
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value, moduleId: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {formData.programId && (
            <div>
              <label className="block text-sm font-semibold mb-1">Module</label>
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select Module</option>
                {modules.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1">Tutor</label>
            <div className="flex gap-2">
              <select
                value={formData.tutorId}
                onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select Tutor</option>
                {tutors.map((t) => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.name || t.fullName} {t.email ? `(${t.email})` : ''}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAllUsersModal(true)} title="View all users and activity">
                <UserCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Meeting Link</label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => {
              setShowModal(false);
              setEditingWorkshop(null);
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingWorkshop ? 'Update' : 'Create'} Workshop
            </Button>
          </div>
        </div>
      </Modal>

      {/* View all registered people for a workshop */}
      <Modal
        isOpen={showViewRegisteredModal}
        onClose={() => { setShowViewRegisteredModal(false); setViewRegisteredWorkshop(null); setViewRegisteredList([]); }}
        title={viewRegisteredWorkshop ? `Registered people – ${viewRegisteredWorkshop.title}` : 'Registered people'}
        size="md"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {loadingRegistered ? (
            <div className="flex items-center justify-center py-8 text-textMuted">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Loading...
            </div>
          ) : viewRegisteredList.length === 0 ? (
            <p className="text-sm text-textMuted py-4">No one registered yet for this workshop.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 font-medium">Phone</th>
                </tr>
              </thead>
              <tbody>
                {viewRegisteredList.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3">{p.fullName || '—'}</td>
                    <td className="py-2 pr-3">{p.email || '—'}</td>
                    <td className="py-2">{p.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loadingRegistered && viewRegisteredList.length > 0 && (
            <p className="text-xs text-textMuted mt-3">Total: {viewRegisteredList.length} registered</p>
          )}
        </div>
      </Modal>

      {/* View all users (tutors) - name, email, role as activity */}
      <Modal isOpen={showAllUsersModal} onClose={() => setShowAllUsersModal(false)} title="All users (Tutors)" size="md">
        <div className="max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-textMuted mb-3">Tutors available for workshops. Role shown as activity.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {tutors.map((u) => (
                <tr key={u.id || u._id} className="border-b border-gray-100">
                  <td className="py-2 pr-2">{u.fullName || u.name || '—'}</td>
                  <td className="py-2 pr-2">{u.email || '—'}</td>
                  <td className="py-2">{u.role || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tutors.length === 0 && <p className="text-textMuted py-4">No tutors found.</p>}
        </div>
      </Modal>

      {/* Manage workshop: resources, tutor, participants, send email */}
      <Modal isOpen={showManageModal} onClose={closeManage} title={manageWorkshop ? `Manage: ${manageWorkshop.title}` : 'Manage workshop'} size="lg">
        {manageWorkshop && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Resources - add anytime */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" /> Resources
              </h3>
              <ul className="mb-2 space-y-1">
                {manageResources.map((r, i) => (
                  <li key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 truncate max-w-[200px]">{r.label || r.url}</a>
                    <button type="button" onClick={() => removeManageResource(i)} className="text-red-600 hover:underline"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 flex-wrap items-end">
                <input
                  type="text"
                  value={newResourceLabel}
                  onChange={(e) => setNewResourceLabel(e.target.value)}
                  placeholder="Label"
                  className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <input
                  type="url"
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 min-w-[160px] px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addManageResource}>Add</Button>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={notifyParticipantsOnSave} onChange={(e) => setNotifyParticipantsOnSave(e.target.checked)} className="rounded border-gray-300" />
                  Notify participants when saving
                </label>
                <Button type="button" variant="primary" size="sm" onClick={saveManageResources} disabled={savingResources}>{savingResources ? 'Saving...' : 'Save resources'}</Button>
              </div>
            </div>

            {/* Tutor - change and save */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <UserCircle className="h-4 w-4" /> Tutor
              </h3>
              <div className="flex gap-2 items-center">
                <select
                  value={manageWorkshop.tutorId?.toString() || ''}
                  onChange={async (e) => {
                    const tutorId = e.target.value;
                    try {
                      await workshopAPI.updateWorkshop(manageWorkshop.id || manageWorkshop._id, { ...manageWorkshop, tutorId: tutorId || null });
                      setManageWorkshop((w) => w ? { ...w, tutorId: tutorId || null } : null);
                      toast.success('Tutor updated');
                      fetchWorkshops();
                    } catch (err) {
                      toast.error(err.message || 'Failed to update tutor');
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">No tutor</option>
                  {tutors.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id}>{t.name || t.fullName} ({t.email})</option>
                  ))}
                </select>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAllUsersModal(true)}>View all users</Button>
              </div>
            </div>

            {/* Registered participants */}
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" /> Registered ({manageParticipants.length})
              </h3>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 mb-2">
                {manageParticipants.length === 0 ? (
                  <p className="text-sm text-textMuted">No one enrolled yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-textMuted">
                        <th className="py-1">Name</th>
                        <th className="py-1">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manageParticipants.map((p) => (
                        <tr key={p.id}>
                          <td className="py-1">{p.fullName || '—'}</td>
                          <td className="py-1">{p.email || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Send email to enrolled */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1"><Mail className="h-4 w-4" /> Send email to enrolled</h4>
                <div className="space-y-2">
                  <select
                    value={emailForm.type}
                    onChange={(e) => setEmailForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="reminder">Reminder (date, time, link)</option>
                    <option value="custom">Custom message</option>
                  </select>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Subject (optional for reminder)"
                  />
                  <textarea
                    value={emailForm.body}
                    onChange={(e) => setEmailForm((f) => ({ ...f, body: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={3}
                    placeholder="Body (optional for reminder – uses default reminder text)"
                  />
                  <Button type="button" variant="primary" size="sm" onClick={sendEmailToParticipants} disabled={sendingEmail || manageParticipants.length === 0}>
                    {sendingEmail ? 'Sending...' : `Send to ${manageParticipants.length} participant(s)`}
                  </Button>
                </div>
              </div>
            </div>

            {/* PM: Assignments */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" /> Assignments
              </h3>
              <ul className="mb-2 text-sm space-y-1">
                {manageAssignments.map((a) => (
                  <li key={a.id || a._id} className="flex justify-between items-center">
                    <span>{a.title || 'Untitled'}</span>
                    <a href="#" onClick={(e) => { e.preventDefault(); workshopAPI.getSubmissions(manageWorkshop.id, a.id || a._id).then((r) => r.success && toast.success(`${(r.data?.submissions || []).length} submission(s)`)); }} className="text-brand-600 text-xs">View submissions</a>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="Assignment title"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addAssignment} disabled={savingAssignment}>{savingAssignment ? 'Adding...' : 'Add assignment'}</Button>
              </div>
            </div>

            {/* PM: Feedback */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4" /> Feedback ({manageFeedback.length})
              </h3>
              <div className="max-h-32 overflow-y-auto text-sm space-y-1">
                {manageFeedback.length === 0 ? <p className="text-textMuted">No feedback yet.</p> : manageFeedback.map((f) => (
                  <div key={f.id || f._id} className="border-b border-gray-100 py-1">
                    <span className="font-medium">{f.userName || '—'}</span> · {f.rating != null ? `${f.rating}/5` : ''} {f.comment && `· ${f.comment.slice(0, 60)}${f.comment.length > 60 ? '…' : ''}`}
                  </div>
                ))}
              </div>
            </div>

            {/* PM: Quiz, Publish & Leaderboard */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4" /> Quiz
              </h3>
              {manageQuiz ? (
                <div className="space-y-2">
                  <p className="text-sm text-textMuted">
                    Quiz &quot;{manageQuiz.title}&quot;. When published, learners see it and can answer; when closed, they cannot.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    disabled={quizPublishing}
                    className={manageQuiz.published ? 'bg-amber-600 hover:bg-amber-700 border-0' : 'bg-gradient-to-r from-brintelli-primary to-brintelli-primaryDark border-0'}
                    onClick={async () => {
                      setQuizPublishing(true);
                      try {
                        const res = await workshopAPI.publishQuiz(manageWorkshop.id || manageWorkshop._id, !manageQuiz.published);
                        if (res?.success && res?.data?.quiz) setManageQuiz(res.data.quiz);
                        toast.success(res?.message || (manageQuiz.published ? 'Quiz closed' : 'Quiz published'));
                      } catch (e) {
                        toast.error(e.message || 'Failed');
                      } finally {
                        setQuizPublishing(false);
                      }
                    }}
                  >
                    {manageQuiz.published ? 'Close quiz' : 'Publish quiz'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-textMuted">No quiz yet. Create one via API (POST /api/workshops/:id/quiz).</p>
              )}
              <h4 className="text-sm font-medium mt-3 mb-1">Leaderboard</h4>
              {manageLeaderboard.length === 0 ? (
                <p className="text-sm text-textMuted">No attempts yet.</p>
              ) : (
                <ul className="max-h-32 overflow-y-auto text-sm space-y-1">
                  {manageLeaderboard.map((r, i) => (
                    <li key={r.userId || i} className="flex justify-between py-0.5">
                      <span>#{r.rank} {r.userName}</span>
                      <span className="font-medium">{r.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* PM: Vouchers – create and send to attendees */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4" /> Vouchers
              </h3>
              <ul className="mb-2 text-sm">
                {manageVouchers.map((v) => (
                  <li key={v.id || v._id} className="flex justify-between items-center py-1">
                    <span className="font-mono">{v.code}</span>
                    <span className="text-textMuted text-xs">Sent to {Array.isArray(v.sentTo) ? v.sentTo.length : 0}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value)}
                  placeholder="Code (optional, auto-generated)"
                  className="flex-1 min-w-[120px] max-w-[140px] px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <label className="text-xs text-textMuted flex items-center gap-1">
                  Expires:
                  <input
                    type="date"
                    value={newVoucherExpiry}
                    onChange={(e) => setNewVoucherExpiry(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </label>
                <Button type="button" variant="primary" size="sm" onClick={createVoucherAndSend} disabled={savingVoucher}>
                  {savingVoucher ? 'Creating...' : 'Create voucher & send to attendees'}
                </Button>
              </div>
            </div>

            {/* Certificates */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Award className="h-4 w-4" /> Certificates
              </h3>
              <p className="text-sm text-textMuted mb-2">Generate certificates for participants, then send by email.</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={certsGenerating}
                  onClick={async () => {
                    setCertsGenerating(true);
                    try {
                      const res = await workshopAPI.generateCertificates(manageWorkshop.id || manageWorkshop._id);
                      if (res?.success) {
                        toast.success(`Generated ${(res.data?.certificates || []).length} certificate(s)`);
                        const cRes = await workshopAPI.getCertificates(manageWorkshop.id || manageWorkshop._id);
                        if (cRes?.success && cRes.data?.certificates) setManageCertificates(cRes.data.certificates);
                      }
                    } catch (e) {
                      toast.error(e.message || 'Failed to generate');
                    } finally {
                      setCertsGenerating(false);
                    }
                  }}
                >
                  {certsGenerating ? 'Generating...' : 'Generate certificates'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={certsSending || manageCertificates.length === 0}
                  onClick={async () => {
                    setCertsSending(true);
                    try {
                      await workshopAPI.sendCertificatesToParticipants(manageWorkshop.id || manageWorkshop._id);
                      toast.success('Certificates sent to participants');
                    } catch (e) {
                      toast.error(e.message || 'Failed to send');
                    } finally {
                      setCertsSending(false);
                    }
                  }}
                >
                  {certsSending ? 'Sending...' : 'Send to participants'}
                </Button>
              </div>
              {manageCertificates.length === 0 ? (
                <p className="text-sm text-textMuted">No certificates yet.</p>
              ) : (
                <ul className="max-h-28 overflow-y-auto text-sm space-y-1">
                  {manageCertificates.map((c) => (
                    <li key={c.id} className="flex justify-between py-0.5 border-b border-gray-100">
                      <span>{c.userName} – {c.certificateNumber}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Workshops;








