import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Presentation, Plus, Search, RefreshCw, Calendar, Users, Clock, Edit2, Trash2, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import workshopAPI from '../../api/workshop';
import programAPI from '../../api/program';
import { apiRequest } from '../../api/apiClient';

const Workshops = () => {
  const [loading, setLoading] = useState(true);
  const [workshops, setWorkshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [formData, setFormData] = useState({
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
  });
  const [tutors, setTutors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);

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
        setFormData({
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
        });
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
              setFormData({
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
              });
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
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-textMuted">Date & Time</th>
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-textMuted">{workshop.tutorName || '—'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px] text-textMuted">
                          <Users className="h-3 w-3" />
                          {workshop.participantsCount || workshop.participants?.length || 0} / {workshop.maxParticipants || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
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
          setFormData({
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
          });
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
            <select
              value={formData.tutorId}
              onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Tutor</option>
              {tutors.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>
                  {t.name || t.fullName}
                </option>
              ))}
            </select>
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
    </>
  );
};

export default Workshops;








