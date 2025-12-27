import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, Calendar, TrendingUp, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Button from '../../components/Button';
import { apiRequest } from '../../api/apiClient';
import lsmAPI from '../../api/lsm';
import programAPI from '../../api/program';

const TutorAssign = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tutorIdParam = searchParams.get('tutorId');

  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleOfferings, setModuleOfferings] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningModule, setAssigningModule] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tutorIdParam) {
      const tutor = tutors.find(t => (t.id || t._id) === tutorIdParam);
      if (tutor) {
        setSelectedTutor(tutor);
        fetchTutorWorkload(tutorIdParam);
      }
    }
  }, [tutorIdParam, tutors]);

  useEffect(() => {
    if (selectedBatch) {
      fetchBatchModules();
      fetchBatchModuleOfferings();
    }
  }, [selectedBatch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutorsRes, workloadsRes, batchesRes, programsRes] = await Promise.all([
        apiRequest('/api/users/role/tutor'),
        apiRequest('/api/tutors/workload'),
        lsmAPI.getAllBatches({}),
        programAPI.getAllPrograms(),
      ]);

      if (tutorsRes.success) {
        setTutors(tutorsRes.data.users || []);
      }
      if (workloadsRes.success) {
        setWorkloads(workloadsRes.data.workloads || []);
      }
      if (batchesRes.success) {
        setBatches(batchesRes.data.batches || []);
      }
      if (programsRes.success) {
        setPrograms(programsRes.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorWorkload = async (tutorId) => {
    try {
      const response = await apiRequest(`/api/tutors/workload?tutorId=${tutorId}`);
      if (response.success) {
        // Update workload in workloads array
        setWorkloads(prev => {
          const index = prev.findIndex(w => w.tutorId === tutorId);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...response.data.workload };
            return updated;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching tutor workload:', error);
    }
  };

  const fetchBatchModules = async () => {
    if (!selectedBatch?.courseId) return;
    try {
      const response = await programAPI.getModulesByProgram(selectedBatch.courseId);
      if (response.success) {
        setModules(response.data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchBatchModuleOfferings = async () => {
    if (!selectedBatch?.id) return;
    try {
      const response = await lsmAPI.getBatchModuleOfferings(selectedBatch.id || selectedBatch._id);
      if (response.success) {
        setModuleOfferings(response.data.moduleOfferings || []);
      }
    } catch (error) {
      console.error('Error fetching module offerings:', error);
      setModuleOfferings([]);
    }
  };

  const handleAssignTutor = (module) => {
    setAssigningModule(module);
    setShowAssignModal(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedBatch || !assigningModule || !selectedTutor) {
      toast.error('Please select batch, module, and tutor');
      return;
    }

    try {
      const batchId = selectedBatch.id || selectedBatch._id;
      const moduleId = assigningModule.id || assigningModule._id;
      const tutorId = selectedTutor.id || selectedTutor._id;

      const response = await lsmAPI.assignTutorToModule(batchId, moduleId, tutorId);
      if (response.success) {
        toast.success('Tutor assigned successfully');
        setShowAssignModal(false);
        setAssigningModule(null);
        fetchBatchModuleOfferings();
        fetchTutorWorkload(tutorId);
        fetchData(); // Refresh workloads
      } else {
        toast.error(response.message || 'Failed to assign tutor');
      }
    } catch (error) {
      console.error('Error assigning tutor:', error);
      toast.error(error.message || 'Failed to assign tutor');
    }
  };

  const getWorkloadColor = (weeklyHours) => {
    if (weeklyHours >= 30) return 'text-red-600 bg-red-50';
    if (weeklyHours >= 20) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const workloadColumns = [
    {
      key: 'tutor',
      title: 'Tutor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100/50 text-brand-600 ring-1 ring-brand-200/50">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-text">{row.tutorName}</p>
            <p className="text-xs text-textMuted">{row.tutorEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'batches',
      title: 'Batches',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-textSoft">
          <Users className="h-4 w-4" />
          <span className="font-medium">{row.batches}</span>
        </div>
      ),
    },
    {
      key: 'modules',
      title: 'Modules',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-textSoft">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">{row.modules}</span>
        </div>
      ),
    },
    {
      key: 'sessions',
      title: 'Sessions',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-text">{row.activeSessions} active</div>
          <div className="text-xs text-textMuted">{row.upcomingSessions} upcoming</div>
        </div>
      ),
    },
    {
      key: 'weeklyHours',
      title: 'Weekly Hours',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getWorkloadColor(row.weeklyHours)}`}>
          {row.weeklyHours}h/week
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => {
            const tutor = tutors.find(t => (t.id || t._id) === row.tutorId);
            setSelectedTutor(tutor);
          }}
        >
          <Users className="h-3.5 w-3.5" />
          Assign
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Tutor Assignment & Workload Balance"
        description="Assign tutors to modules and monitor their workload distribution."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Workload Overview */}
        <div className="rounded-2xl border border-brintelli-border/60 bg-white shadow-sm">
          <div className="p-6 border-b border-brintelli-border/60">
            <h3 className="text-lg font-bold text-text">Tutor Workload</h3>
            <p className="mt-1 text-sm text-textMuted">Monitor tutor assignments and hours</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <Table
                columns={workloadColumns}
                data={workloads}
                emptyLabel="No tutors found"
                minRows={8}
              />
            )}
          </div>
        </div>

        {/* Assignment Interface */}
        <div className="space-y-6">
          {/* Batch & Program Selection */}
          <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text mb-4">Assign Tutor to Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Select Program</label>
                <select
                  value={selectedProgram?.id || selectedProgram?._id || ''}
                  onChange={(e) => {
                    const program = programs.find(p => (p.id || p._id) === e.target.value);
                    setSelectedProgram(program);
                    setSelectedBatch(null);
                    setModules([]);
                  }}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text"
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program.id || program._id} value={program.id || program._id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Select Batch</label>
                <select
                  value={selectedBatch?.id || selectedBatch?._id || ''}
                  onChange={(e) => {
                    const batch = batches.find(b => (b.id || b._id) === e.target.value);
                    setSelectedBatch(batch);
                  }}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text"
                  disabled={!selectedProgram}
                >
                  <option value="">Select Batch</option>
                  {batches
                    .filter(batch => batch.courseId === (selectedProgram?.id || selectedProgram?._id))
                    .map((batch) => (
                      <option key={batch.id || batch._id} value={batch.id || batch._id}>
                        {batch.name} {batch.code ? `(${batch.code})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Select Tutor</label>
                <select
                  value={selectedTutor?.id || selectedTutor?._id || ''}
                  onChange={(e) => {
                    const tutor = tutors.find(t => (t.id || t._id) === e.target.value);
                    setSelectedTutor(tutor);
                  }}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text"
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => {
                    const workload = workloads.find(w => w.tutorId === (tutor.id || tutor._id));
                    return (
                      <option key={tutor.id || tutor._id} value={tutor.id || tutor._id}>
                        {tutor.fullName || tutor.email} {workload ? `(${workload.weeklyHours}h/week)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Modules List */}
          {selectedBatch && (
            <div className="rounded-2xl border border-brintelli-border/60 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-text mb-4">Available Modules</h3>
              {modules.length === 0 ? (
                <p className="text-sm text-textMuted text-center py-8">No modules available for this batch</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((module) => {
                    const offering = moduleOfferings.find(mo => mo.moduleId === (module.id || module._id));
                    const assignedTutor = offering?.tutorId
                      ? tutors.find(t => (t.id || t._id) === offering.tutorId)
                      : null;

                    return (
                      <div
                        key={module.id || module._id}
                        className="flex items-center justify-between rounded-xl border border-brintelli-border/60 bg-gradient-to-r from-white to-brand-50/20 p-4 hover:border-brand-300/60 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-brand-600" />
                            <h4 className="font-semibold text-text">{module.name}</h4>
                            {module.order && (
                              <span className="px-2 py-0.5 rounded bg-brand-100/50 text-xs font-medium text-brand-700">
                                Order: {module.order}
                              </span>
                            )}
                          </div>
                          {module.description && (
                            <p className="text-xs text-textMuted line-clamp-1">{module.description}</p>
                          )}
                          {assignedTutor && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-textMuted">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Assigned to: {assignedTutor.fullName || assignedTutor.email}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant={assignedTutor ? "secondary" : "primary"}
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleAssignTutor(module)}
                        >
                          {assignedTutor ? (
                            <>
                              <Users className="h-3.5 w-3.5" />
                              Reassign
                            </>
                          ) : (
                            <>
                              <Users className="h-3.5 w-3.5" />
                              Assign
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && assigningModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-text mb-4">Assign Tutor to Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Module</label>
                <input
                  type="text"
                  value={assigningModule.name}
                  disabled
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-gray-50 text-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">Tutor</label>
                <select
                  value={selectedTutor?.id || selectedTutor?._id || ''}
                  onChange={(e) => {
                    const tutor = tutors.find(t => (t.id || t._id) === e.target.value);
                    setSelectedTutor(tutor);
                  }}
                  className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-white text-text"
                >
                  <option value="">Select Tutor</option>
                  {tutors.map((tutor) => {
                    const workload = workloads.find(w => w.tutorId === (tutor.id || tutor._id));
                    return (
                      <option key={tutor.id || tutor._id} value={tutor.id || tutor._id}>
                        {tutor.fullName || tutor.email} {workload ? `(${workload.weeklyHours}h/week)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowAssignModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveAssignment} className="flex-1" disabled={!selectedTutor || !selectedBatch}>
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorAssign;

