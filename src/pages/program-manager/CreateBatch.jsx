import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';
import lsmAPI from '../../api/lsm';

const CreateBatch = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    courseId: programId || '',
    startDate: '',
    endDate: '',
    capacity: 30,
    status: 'UPCOMING',
    description: '',
  });

  useEffect(() => {
    if (!programId) {
      fetchPrograms();
    }
  }, [programId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await lsmAPI.createBatch(formData);
      if (response.success) {
        toast.success('Batch created successfully');
        navigate('/program-manager/programs');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <PageHeader
        title="Create Batch"
        description="Create a new batch for a program"
        actions={
          <Button
            variant="ghost"
            onClick={() => navigate('/program-manager/programs')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        }
      />

      <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Batch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
              required
            />
          </div>

          {!programId && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Program/Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                required
              >
                <option value="">Select Program</option>
                {programs.map((program) => (
                  <option key={program.id || program._id} value={program.id || program._id}>
                    {program.name} ({program.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
                required
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-brintelli-border rounded-lg bg-brintelli-card text-text"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Batch'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/program-manager/programs')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateBatch;

