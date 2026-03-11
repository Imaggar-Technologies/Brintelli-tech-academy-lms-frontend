import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Upload, Trash2 } from 'lucide-react';
import { collegesAPI } from '../../api/partners';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Breadcrumb from '../../components/Breadcrumb';

const CollegeDetail = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const loadCollege = () => {
    if (!collegeId) return;
    collegesAPI.getById(collegeId).then((res) => {
      if (res.success && res.data?.college) setCollege(res.data.college);
      else setCollege(null);
    }).catch(() => setCollege(null)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (collegeId) {
      setLoading(true);
      loadCollege();
    }
  }, [collegeId]);

  const handleLogoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !collegeId) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await collegesAPI.update(collegeId, fd);
      if (res.success && res.data?.college) {
        setCollege((c) => (c ? { ...c, logoUrl: res.data.college.logoUrl } : null));
        toast.success('Logo uploaded');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!collegeId || !window.confirm('Delete this college? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await collegesAPI.delete(collegeId);
      toast.success('College deleted');
      navigate('/hr/partners');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  if (!college) return <div><Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Partner Directory', path: '/hr/partners' }]} /><p className="text-textMuted mb-4">College not found.</p><Button onClick={() => navigate('/hr/partners')}>Back to partners</Button></div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Partner Directory', path: '/hr/partners' }, { label: college.name }]} />
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6 flex flex-wrap gap-6">
        <div className="relative">
          {college.logoUrl ? (
            <img src={college.logoUrl} alt="" className="h-24 w-24 object-contain rounded-xl border border-brintelli-border" />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-brand-500" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleLogoUpload} />
          <Button type="button" variant="secondary" className="mt-2 text-sm" disabled={uploadingLogo} onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            {college.logoUrl ? 'Change logo' : 'Upload logo'}
          </Button>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text">{college.name}</h1>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium bg-brand-500/10 text-brand-600">COLLEGE</span>
          {(college.address || college.district || college.location) && (
            <p className="mt-2 text-textMuted flex items-center gap-1"><MapPin className="h-4 w-4 flex-shrink-0" />{[college.address, college.district, college.location, college.area].filter(Boolean).join(', ')}</p>
          )}
          {college.tierCity && <p className="mt-1 text-sm text-textMuted">Tier: {college.tierCity}</p>}
          {college.phone && <p className="mt-1 text-textMuted flex items-center gap-1"><Phone className="h-4 w-4" />{college.phone}</p>}
          {college.placementCellEmail && <p className="mt-1 text-textMuted flex items-center gap-1"><Mail className="h-4 w-4" />Placement: <a href={`mailto:${college.placementCellEmail}`} className="text-brand-500 hover:underline">{college.placementCellEmail}</a></p>}
          {college.officeEmail && college.officeEmail !== college.placementCellEmail && <p className="mt-1 text-textMuted flex items-center gap-1"><Mail className="h-4 w-4" />Office: <a href={`mailto:${college.officeEmail}`} className="text-brand-500 hover:underline">{college.officeEmail}</a></p>}
          {college.placementCellPhone && <p className="mt-1 text-textMuted flex items-center gap-1"><Phone className="h-4 w-4" />Placement cell: {college.placementCellPhone}</p>}
        </div>
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" disabled={deleting} onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
      {(college.domains?.length > 0 || college.departments?.length > 0) && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
          {college.domains?.length > 0 && <p className="text-sm font-medium text-text mb-1">Domains</p>}
          {college.domains?.length > 0 && <p className="text-textMuted text-sm mb-3">{college.domains.join(', ')}</p>}
          {college.departments?.length > 0 && <p className="text-sm font-medium text-text mb-1">Departments</p>}
          {college.departments?.length > 0 && <p className="text-textMuted text-sm">{college.departments.join(', ')}</p>}
        </div>
      )}
    </div>
  );
};

export default CollegeDetail;
