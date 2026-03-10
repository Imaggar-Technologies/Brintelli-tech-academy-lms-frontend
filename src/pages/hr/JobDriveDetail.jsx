import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Building2 } from 'lucide-react';
import { jobDrivesAPI } from '../../api/jobDrives';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';

const JobDriveDetail = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driveId) jobDrivesAPI.getById(driveId).then((r) => { if (r.success && r.data?.drive) setDrive(r.data.drive); else setDrive(null); }).catch(() => setDrive(null)).finally(() => setLoading(false));
  }, [driveId]);

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  if (!drive) return <div><p className="text-textMuted mb-4">Job drive not found.</p><Button onClick={() => navigate('/hr/job-drives')}>Back to job drives</Button></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-2" onClick={() => navigate('/hr/job-drives')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6">
        <h1 className="text-2xl font-bold text-text">{drive.title}</h1>
        {drive.description && <p className="mt-2 text-textMuted whitespace-pre-wrap">{drive.description}</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-textMuted">
          {drive.driveDate && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(drive.driveDate).toLocaleDateString()}</span>}
          {drive.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{drive.location}</span>}
          {drive.partner?.name && <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{drive.partner.name}</span>}
        </div>
      </div>
    </div>
  );
};

export default JobDriveDetail;
