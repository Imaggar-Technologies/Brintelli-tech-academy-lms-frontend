import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, MapPin, Building2, ChevronRight } from 'lucide-react';
import { jobDrivesAPI } from '../../api/jobDrives';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const JobDrivesList = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDrives(); }, []);

  const loadDrives = async () => {
    try {
      setLoading(true);
      const res = await jobDrivesAPI.list();
      if (res.success && res.data?.drives) setDrives(res.data.drives);
      else setDrives([]);
    } catch (e) {
      toast.error(e.message || 'Failed to load job drives');
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Job drives</h1>
        <Button variant="primary" onClick={() => navigate('/hr/job-drives/create')}>
          <Plus className="h-4 w-4 mr-2" /> Create job drive
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>
      ) : drives.length === 0 ? (
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
          <Calendar className="h-12 w-12 text-textMuted mx-auto mb-4" />
          <p className="text-textMuted mb-4">No job drives yet.</p>
          <Button variant="primary" onClick={() => navigate('/hr/job-drives/create')}>Create first job drive</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drives.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-brintelli-border bg-brintelli-card p-4 flex flex-wrap items-center justify-between gap-4 hover:border-brand-500/30 cursor-pointer"
              onClick={() => navigate(`/hr/job-drives/${d.id}`)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-text">{d.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-textMuted mt-1">
                  {d.driveDate && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(d.driveDate).toLocaleDateString()}</span>}
                  {d.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{d.location}</span>}
                  {d.partnerName && <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{d.partnerName}</span>}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-textMuted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobDrivesList;
