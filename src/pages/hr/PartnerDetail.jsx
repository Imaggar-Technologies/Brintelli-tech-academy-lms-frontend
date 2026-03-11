import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Globe, Upload } from 'lucide-react';
import { partnersAPI } from '../../api/partners';
import { toast } from 'react-hot-toast';
import Button from '../../components/Button';
import Breadcrumb from '../../components/Breadcrumb';

const PartnerDetail = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  const loadPartner = () => {
    if (!partnerId) return;
    partnersAPI.getById(partnerId).then((res) => {
      if (res.success && res.data?.partner) setPartner(res.data.partner);
      else setPartner(null);
    }).catch(() => setPartner(null)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (partnerId) {
      setLoading(true);
      loadPartner();
    }
  }, [partnerId]);

  const handleLogoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file || !partnerId) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await partnersAPI.update(partnerId, fd);
      if (res.success && res.data?.partner) {
        setPartner((p) => (p ? { ...p, logoUrl: res.data.partner.logoUrl } : null));
        toast.success('Logo uploaded');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>;
  if (!partner) return <div><Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Partner Directory', path: '/hr/partners' }]} /><p className="text-textMuted mb-4">Partner not found.</p><Button onClick={() => navigate('/hr/partners')}>Back to partners</Button></div>;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'HR', path: '/hr/dashboard' }, { label: 'Partner Directory', path: '/hr/partners' }, { label: partner.name }]} />
      <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-6 flex flex-wrap gap-6">
        <div className="relative">
          {partner.logoUrl ? (
            <img src={partner.logoUrl} alt="" className="h-24 w-24 object-contain rounded-xl border border-brintelli-border" />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Building2 className="h-12 w-12 text-brand-500" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <Button
            type="button"
            variant="secondary"
            className="mt-2 text-sm"
            disabled={uploadingLogo}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            {partner.logoUrl ? 'Change logo' : 'Upload logo'}
          </Button>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text">{partner.name}</h1>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium bg-brand-500/10 text-brand-600">{partner.type}</span>
          {(partner.address || partner.city) && (
            <p className="mt-2 text-textMuted flex items-center gap-1"><MapPin className="h-4 w-4" />{[partner.address, partner.city, partner.state, partner.country].filter(Boolean).join(', ')}</p>
          )}
          {partner.phone && <p className="mt-1 text-textMuted flex items-center gap-1"><Phone className="h-4 w-4" />{partner.phone}</p>}
          {partner.email && <p className="mt-1 text-textMuted flex items-center gap-1"><Mail className="h-4 w-4" />{partner.email}</p>}
          {partner.website && <p className="mt-1 text-textMuted flex items-center gap-1"><Globe className="h-4 w-4" /><a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">{partner.website}</a></p>}
        </div>
      </div>
      {(partner.contactPersonName || partner.contactPersonEmail) && (
        <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4">
          <p className="text-sm font-medium text-text mb-2">Contact person</p>
          <p className="text-textMuted">{partner.contactPersonName}{partner.contactPersonEmail && ` • ${partner.contactPersonEmail}`}</p>
        </div>
      )}
      {partner.notes && <div className="rounded-xl border border-brintelli-border bg-brintelli-card p-4"><p className="text-sm text-textMuted whitespace-pre-wrap">{partner.notes}</p></div>}
    </div>
  );
};

export default PartnerDetail;
